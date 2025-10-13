<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Kreait\Firebase\Contract\Messaging;
use Kreait\Firebase\Messaging\CloudMessage;

class JournalController extends Controller
{
    public function index()
    {
        $journals = Journal::where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($journal) {
                return [
                    'id' => $journal->id,
                    'title' => $journal->title,
                    'note' => $journal->note,
                    'illustrator_urls' => $journal->illustrator_urls,
                    'photo_url' => $journal->photo_url,
                    'emotion' => $journal->emotion,
                    'confidence' => $journal->confidence,
                    'tags' => $journal->tags,
                    'chatbot_highlight' => $journal->chatbot_highlight,
                    'chatbot_suggestion' => $journal->chatbot_suggestion,
                    'last_modified' => $journal->last_modified,
                    'created_date' => $journal->created_date,
                ];
            });

        return Inertia::render('Journals/Index', [
            'journals' => $journals,
        ]);
    }

    public function create()
    {
        return Inertia::render('Journals/Create');
    }

    public function edit(Journal $journal)
    {
        abort_if($journal->user_id !== auth()->id(), 403);
        return Inertia::render('Journals/Edit', [
            'journal' => $journal,
        ]);
    }

    public function store(Request $request, Messaging $messaging)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'note' => 'required|string',
            'fcm_token' => 'nullable|string',
        ]);

        $journal = new Journal();
        $journal->title = $request->title;
        $journal->note = $request->note;
        $journal->user_id = auth()->id();

        $plainText = trim(strip_tags(str_replace(['<p>', '</p>'], ["", "\n\n"], $journal->note)));
        $baseUrl = config('services.fastapi.url');
        $apiKey = config('services.fastapi.key');

        $classify = Http::withHeaders([
            'x-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(120)->post("$baseUrl/classify", [
            "entry_data" => [
                "title" => $journal->title,
                "text" => $plainText,
            ],
            "media_context" => [
                "video_emotion" => null,
                "video_emotion_confidence" => 0,
                "images" => [],
            ],
        ]);

        if ($classify->ok()) {
            $resp = $classify->json();
            if (isset($resp['emotion_classification'])) {
                $journal->emotion = $resp['emotion_classification']['emotion'] ?? null;
                if (isset($resp['emotion_classification']['similarity'])) {
                    $journal->confidence = round($resp['emotion_classification']['similarity'] * 100, 1);
                }
            }
            if (isset($resp['emotion_tags'])) {
                $tags = collect($resp['emotion_tags'])
                    ->map(function ($t) {
                        if (is_array($t)) {
                            return $t['tags'] ?? $t['tag'] ?? null;
                        }
                        return $t;
                    })
                    ->filter()
                    ->toArray();
                $journal->tags = implode(', ', $tags);
            }
        }

        $paragraphs = preg_split('/\n+/', $plainText);
        $candidate = null;
        foreach ($paragraphs as $idx => $para) {
            $para = trim($para);
            if ($para === '' || $para === '[image]') continue;
            if (isset($paragraphs[$idx + 1]) && trim($paragraphs[$idx + 1]) === '[image]') continue;
            $candidate = $para;
            break;
        }

        $illustrator = [];
        if ($candidate) {
            $generate = Http::withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(120)->post("$baseUrl/generate-illustration", [
                "journal_text" => $candidate,
                "style_preference" => "digital painting",
                "num_images" => 1,
            ]);
            if ($generate->ok()) {
                $resp = $generate->json();
                if (!empty($resp['images'][0])) {
                    $imageData = base64_decode($resp['images'][0]);
                    $fileName = 'journals/' . uniqid() . '.jpg';
                    Storage::disk('public')->put($fileName, $imageData);
                    $illustrator[] = $fileName;
                }
            }
        }

        $journal->illustrator = $illustrator;
        $journal->save();

        $user = auth()->user();
        $user->update([
            'last_entry_at' => now(),
            'fcm_token' => $request->fcm_token ?? $user->fcm_token,
        ]);

        if ($user->fcm_token) {
            $message = CloudMessage::fromArray([
                'token' => $user->fcm_token,
                'notification' => [
                    'title' => 'New Journal Created',
                    'body' => 'Your new journal entry has been saved successfully.',
                ],
            ]);
            $messaging->send($message);
        }

        return redirect()->route('journals.index')->with('success', 'Journal created.');
    }

    public function update(Request $request, Journal $journal, Messaging $messaging)
    {
        abort_if($journal->user_id !== auth()->id(), 403);

        $request->validate([
            'title' => 'required|string|max:255',
            'note' => 'required|string',
            'fcm_token' => 'nullable|string',
        ]);

        $journal->title = $request->title;
        $journal->note = $request->note;

        $plainText = trim(strip_tags(str_replace(['<p>', '</p>'], ["", "\n\n"], $journal->note)));
        $baseUrl = config('services.fastapi.url');
        $apiKey = config('services.fastapi.key');

        $classify = Http::withHeaders([
            'x-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(120)->post("$baseUrl/classify", [
            "entry_data" => [
                "title" => $journal->title,
                "text" => $plainText,
            ],
            "media_context" => [
                "video_emotion" => null,
                "video_emotion_confidence" => 0,
                "images" => [],
            ],
        ]);

        if ($classify->ok()) {
            $resp = $classify->json();
            if (isset($resp['emotion_classification'])) {
                $journal->emotion = $resp['emotion_classification']['emotion'] ?? null;
                if (isset($resp['emotion_classification']['similarity'])) {
                    $journal->confidence = round($resp['emotion_classification']['similarity'] * 100, 1);
                }
            }
            if (isset($resp['emotion_tags'])) {
                $tags = collect($resp['emotion_tags'])->pluck('tags')->toArray();
                $journal->tags = implode(', ', $tags);
            }
        }

        $paragraphs = preg_split('/\n+/', $plainText);
        $candidate = null;
        foreach ($paragraphs as $idx => $para) {
            $para = trim($para);
            if ($para === '' || $para === '[image]') continue;
            if (isset($paragraphs[$idx + 1]) && trim($paragraphs[$idx + 1]) === '[image]') continue;
            $candidate = $para;
            break;
        }

        $illustrator = [];
        if ($candidate) {
            $generate = Http::withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(120)->post("$baseUrl/generate-illustration", [
                "journal_text" => $candidate,
                "style_preference" => "digital painting",
                "num_images" => 1,
            ]);
            if ($generate->ok()) {
                $resp = $generate->json();
                if (!empty($resp['images'][0])) {
                    $imageData = base64_decode($resp['images'][0]);
                    $fileName = 'journals/' . uniqid() . '.jpg';
                    Storage::disk('public')->put($fileName, $imageData);
                    $illustrator[] = $fileName;
                }
            }
        }

        $journal->illustrator = $illustrator;
        $journal->save();

        $user = auth()->user();
        $user->update([
            'fcm_token' => $request->fcm_token ?? $user->fcm_token,
        ]);

        if ($user->fcm_token) {
            $message = CloudMessage::fromArray([
                'token' => $user->fcm_token,
                'notification' => [
                    'title' => 'Journal Updated',
                    'body' => 'Your journal entry has been successfully updated.',
                ],
            ]);
            $messaging->send($message);
        }

        return redirect()->route('journals.index')->with('success', 'Journal updated.');
    }

    public function destroy(Journal $journal)
    {
        abort_if($journal->user_id !== auth()->id(), 403);
        $journal->delete();
        return redirect()->route('journals.index')->with('success', 'Journal deleted.');
    }

    public function upload(Request $request)
    {
        if (!$request->hasFile('upload')) {
            return response()->json(['error' => 'No file uploaded'], 400);
        }

        $file = $request->file('upload');
        $path = $file->store('journals', 'public');
        $url = asset("storage/{$path}");
        return response()->json(['url' => $url]);
    }

    public function enhance(Journal $journal, Request $request)
    {
        abort_if($journal->user_id !== auth()->id(), 403);

        $baseUrl = config('services.fastapi.url');
        $apiKey = config('services.fastapi.key');
        $cleanText = trim(strip_tags(str_replace(['<p>', '</p>'], ["", "\n\n"], $journal->note)));

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(120)->post("$baseUrl/elaboration-chat", [
            "uuid" => "user-" . auth()->id(),
            "task" => "elaborate",
            "journal_data" => ["text" => $cleanText]
        ]);

        if ($response->ok()) {
            $data = $response->json();
            $journal->chatbot_highlight = $data['highlight'] ?? null;
            if (isset($data['elaborated_text'])) {
                $journal->note = $data['elaborated_text'];
            }
            $journal->save();

            return response()->json([
                'highlight' => $journal->chatbot_highlight,
                'elaborated_text' => $journal->note,
            ]);
        }

        return response()->json(['error' => 'Enhancement failed'], 500);
    }

    public function chatAsk(Request $request, Journal $journal)
    {
        abort_if($journal->user_id !== auth()->id(), 403);

        $request->validate([
            'user_input' => 'required|string',
            'chat_history' => 'nullable|array',
        ]);

        $baseUrl = config('services.fastapi.url');
        $apiKey = config('services.fastapi.key');
        $cleanText = trim(strip_tags(str_replace(['<p>', '</p>'], ["", "\n\n"], $journal->note)));

        $history = collect($request->chat_history ?? [])->map(function ($msg) {
            return [
                'role' => $msg['role'] ?? 'user',
                'content' => $msg['content'] ?? '',
            ];
        })->toArray();

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'Content-Type' => 'application/json',
        ])->timeout(120)->post("$baseUrl/elaboration-chat", [
            "uuid" => "user-" . auth()->id(),
            "task" => "ask",
            "journal_data" => ["text" => $cleanText],
            "prompt" => $request->user_input,
            "chat_history" => $history,
        ]);

        if ($response->ok()) {
            $data = $response->json();
            $reply = $data['assistant_response'] ?? $data['response'] ?? $data['answer'] ?? $data['text'] ?? null;
            return response()->json(['assistant_response' => $reply]);
        }

        return response()->json(['error' => 'Chat failed'], 500);
    }
}

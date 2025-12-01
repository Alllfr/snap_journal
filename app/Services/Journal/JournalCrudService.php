<?php

namespace App\Services\Journal;

use Carbon\Carbon;
use Carbon\CarbonPeriod;
use App\Models\Journal;
use Illuminate\Http\Request;
use App\Http\Requests\StoreJournalRequest;
use Illuminate\Support\Facades\Http;

class JournalCrudService
{
    protected JournalFileService $file;
    protected JournalFastApiService $fastApi;

    protected string $apiKey;
    protected string $textApi;

    public function __construct(JournalFileService $file, JournalFastApiService $fastApi)
    {
        $this->file = $file;
        $this->fastApi = $fastApi;

        $this->apiKey  = env('FASTAPI_KEY');
        $this->textApi = rtrim(env('FASTAPI_TEXT_URL'), '/');
    }

    public function getUserJournals(int $userId)
    {
        return Journal::where('user_id', $userId)
            ->latest()
            ->get()
            ->map(fn($j) => [
                'id' => $j->id,
                'title' => $j->title,
                'note' => $j->note,
                'photo_url' => $j->photo_url,
                'video_url' => $j->video_url,
                'emotion' => $j->emotion,
                'expression' => $j->expression,
                'tags' => $j->tags,
                'confidence' => $j->confidence,
                'similarity' => $j->similarity,
                'illustrator' => $j->illustrator_urls 
                ? (is_array($j->illustrator_urls) 
                    ? $j->illustrator_urls 
                    : [$j->illustrator_urls])
                : [],
                'created_date' => $j->created_at,
                'last_modified' => $j->updated_at->timezone('Asia/Jakarta')->format('d M Y H:i'),
                'last_entry' => $j->updated_at->timezone('Asia/Jakarta')->format('Y-m-d H:i:s')

            ]);
    }

    public function store(StoreJournalRequest $request)
    {
        $journal = Journal::create([
            'user_id' => auth()->id(),
            'title'   => $request->title,
            'note'    => $request->note
        ]);

        $this->handleUploads($request, $journal);

        if ($journal->video_url) {
            $this->handleFastApi($journal);
        }
auth()->user()->update([
    'last_entry' => now()
]);



        return $journal->fresh();
    }

    public function update(Request $request, Journal $journal)
    {
        $journal->update([
            'title' => $request->title,
            'note'  => $request->note
        ]);

        $videoUploaded = $request->hasFile('recorded_video');

        $this->handleUploads($request, $journal);

        if ($videoUploaded && $journal->video_url) {
            $this->handleFastApi($journal);
        }

      auth()->user()->update([
    'last_entry' => now()
]);


        return $journal->fresh();
    }

    public function destroy(Journal $journal)
    {
        $this->file->delete($this->extractPath($journal->photo_url));
        $this->file->delete($this->extractPath($journal->video_url));

        if (is_array($journal->illustrator_urls)) {
            foreach ($journal->illustrator_urls as $url) {
                $this->file->delete($this->extractPath($url));
            }
        }

        return $journal->delete();
    }

    private function handleUploads(Request $request, Journal $journal)
    {
        if ($request->hasFile('image')) {
            $path = $this->file->uploadUploadedFile(
                $request->file('image'),
                'photos',
                auth()->id(),
                $journal->id
            );
            $journal->photo_url = $this->file->publicUrl($path);
        }

        if ($request->hasFile('recorded_video')) {
            $path = $this->file->uploadUploadedFile(
                $request->file('recorded_video'),
                'videos',
                auth()->id(),
                $journal->id
            );
            $journal->video_url = $this->file->publicUrl($path);
        }

        if ($request->filled('note')) {
            preg_match('/<img[^>]+src="([^">]+)"/', $request->note, $match);
            if (!empty($match[1])) {
                $journal->photo_url = $match[1];
            }
        }

        $journal->save();
    }

    private function handleFastApi(Journal $journal)
    {
        $predict  = $this->fastApi->predictVideo($journal->video_url);
        $classify = $this->fastApi->classifyText($journal);

        $journal->expression   = $predict['prediction']  ?? $journal->expression;
        $journal->confidence   = $predict['confidence']  ?? $journal->confidence;
        $journal->similarity   = $classify['emotion_classification']['similarity'] ?? $journal->similarity;
        $journal->emotion      = $classify['emotion_classification']['emotion'] ?? $journal->emotion;
        $journal->tags         = $classify['emotion_tags'] ?? $journal->tags;

        $images = $this->fastApi->generateIllustration($journal);

        if (!empty($images['images'])) {
            $journal->illustrator_urls = $images['images'];
        }

        $journal->save();
    }

    public function uploadPhoto(Request $request)
    {
        $path = $this->file->uploadUploadedFile(
            $request->file('upload'),
            'photos',
            auth()->id(),
            uniqid()
        );

        return response()->json(['url' => $this->file->publicUrl($path)]);
    }

   public function enhance(Journal $journal, Request $req)
{
    $payload = [
        "uuid" => (string) $journal->id,
        "task" => "elaborate",
        "journal_data" => [
            "text" => $journal->note
        ]
    ];

    $url = $this->textApi . '/elaboration-chat';

    $res = Http::withHeaders([
        'x-api-key' => $this->apiKey,
        'Date'      => now()->toRfc7231String(),
    ])->post($url, $payload)->json();

    return [
        "highlight"  => $res["elaboration_suggestion"]["highlight_text"] ?? null,
        "suggestion" => $res["elaboration_suggestion"]["suggestion_text"] ?? null,
        "raw"        => $res
    ];
}

public function chatAsk(Journal $journal, Request $request)
{
    $payload = [
        "uuid" => (string) $journal->id,
        "task" => "ask",
        "journal_data" => [
            "text" => strip_tags($journal->note)
        ],
        "prompt" => $request->user_input
    ];

    $url = $this->textApi . "/elaboration-chat";

    $res = Http::withHeaders([
        "x-api-key" => $this->apiKey,
        "Date"      => now()->toIso8601String()
    ])->post($url, $payload)->json();

   $text =
    $res["assistant_response"]
    ?? $res["elaboration_suggestion"]["suggestion_text"]
    ?? json_encode($res, JSON_PRETTY_PRINT);

    return [
        "assistant_response" => is_string($text) ? $text : json_encode($text, JSON_PRETTY_PRINT)
    ];
    }

    public function getMoodCalendar(string $userId, string $month)
    {
        $start = Carbon::parse($month)->startOfMonth();
        $end   = Carbon::parse($month)->endOfMonth();
        $period = CarbonPeriod::create($start, $end);

        $journals = Journal::where('user_id', $userId)
            ->whereBetween('created_at', [$start, $end])
            ->orderBy('created_at', 'asc')
            ->get()
            ->groupBy(fn($j) => $j->created_at->format('Y-m-d'));

    $calendar = [];

    foreach ($period as $date) {
        $day = $date->format('Y-m-d');

        if (!isset($journals[$day])) {
            $calendar[$day] = [
                "has_entry" => false,
                "expression" => null,
                "expressions" => [],
            ];
            continue;
        }

        $expressions = $journals[$day]->pluck('expression')->toArray();

        $freq = array_count_values($expressions);
        arsort($freq);
        $dominant = array_key_first($freq);

        $calendar[$day] = [
            "has_entry" => true,
            "expression" => strtolower($dominant),
            "expressions" => $expressions,
        ];
    }

    return [
        "month" => $month,
        "calendar" => $calendar
    ];
}

    private function extractPath($url)
    {
        if (!$url) return null;

        $prefix = "https://storage.googleapis.com/" . env('GOOGLE_CLOUD_STORAGE_BUCKET') . "/";
        return str_replace($prefix, "", $url);
    }

}

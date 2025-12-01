<?php

namespace App\Services\Journal;

use Illuminate\Support\Facades\Http;

class JournalFastApiService
{
    protected $videoBaseUrl;
    protected $textBaseUrl;
    protected $apiKey;

    public function __construct()
    {
        $this->videoBaseUrl = env("FASTAPI_VIDEO_URL");
        $this->textBaseUrl  = env("FASTAPI_TEXT_URL");
        $this->apiKey       = env("FASTAPI_KEY");
    }

   private function post($baseUrl, $endpoint, $payload)
{
    $url = rtrim($baseUrl, '/') . '/' . ltrim($endpoint, '/');

    return Http::withHeaders([
        "x-api-key" => $this->apiKey,
        "Date" => now()->toIso8601String()
    ])->post($url, $payload)->json();
}



    public function predictVideo($videoUrl)
    {
        return $this->post($this->videoBaseUrl, "/predict", [
            "url" => $videoUrl,
            "format" => "mp4",
            "fps" => 30
        ]);
    }

    public function classifyText($journal)
    {
        return $this->post($this->textBaseUrl, "/classify", [
            "entry_data" => [
                "title" => $journal->title,
                "text" => $journal->note,
                "created_at" => $journal->created_at
            ],
            "media_context" => [
                "video_emotion" => $journal->expression ?? null,
                "video_emotion_confidence" => $journal->similarity ?? null,
                "images" => $journal->photo_url ? [[
                    "url" => $journal->photo_url,
                    "format" => "jpg",
                    "encoding" => "image/jpeg",
                    "position_after_paragraph" => 1
                ]] : []
            ]
        ]);
    }

    public function generateIllustration($journal)
    {
        return $this->post($this->textBaseUrl, "/generate-illustration", [
            "user_id" => $journal->user_id,
            "journal_id" => $journal->id,
            "journal_text" => $journal->note,
            "num_images" => 1,
            "style_preference" => "sketchbook and watercolor",
            "filled_paragraph" => []
        ]);
    }

   public function elaboration(array $payload)
{
    return $this->post(
        $this->textBaseUrl,
        "/elaboration-chat",
        $payload
    );
}


}

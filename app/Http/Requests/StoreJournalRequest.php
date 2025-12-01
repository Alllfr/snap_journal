<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJournalRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            "title" => "required|string|max:255",
            "note" => "required|string",
             "image"          => "nullable|image|max:5120",
            "recorded_video" => "nullable|file|mimetypes:video/mp4,video/webm|max:20480",
        ];
    }
}

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GcsUploadController extends Controller
{
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:20480',
            'user_id' => 'required',
            'journal_id' => 'required',
        ]);

        $file = $request->file('file');
        $userId = $request->input('user_id');
        $journalId = $request->input('journal_id');
        $filename = $file->getClientOriginalName();

        $mime = $file->getMimeType();
        if (str_starts_with($mime, 'image/')) {
            $type = 'images';
        } elseif (str_starts_with($mime, 'video/')) {
            $type = 'videos';
        } elseif (str_starts_with($mime, 'application/illustration') || str_contains($filename, '.jpg')) {
            $type = 'illustrations';
        } else {
            $type = 'others';
        }
        $path = "snapjournal/uploads/{$type}/{$userId}/{$journalId}/{$filename}";

        Storage::disk('gcs')->put($path, fopen($file->getRealPath(), 'r+'));

        Storage::disk('gcs')->setVisibility($path, 'public');
        $url = Storage::disk('gcs')->url($path);

        return response()->json([
            'message' => 'File uploaded successfully!',
            'detected_type' => $type,
            'mime_type' => $mime,
            'url' => $url,
            'path' => $path,
        ]);
    }
}

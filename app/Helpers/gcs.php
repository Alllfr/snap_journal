<?php

if (! function_exists('gcs_url')) {
    function gcs_url($path)
    {
        $path = ltrim($path, '/');

        return 'https://storage.googleapis.com/' 
            . env('GOOGLE_CLOUD_STORAGE_BUCKET') 
            . '/' 
            . $path;
    }
}

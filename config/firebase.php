<?php

return [
    'credentials' => [
        'file' => env('FIREBASE_CREDENTIALS'),
    ],

    'default_storage_bucket' => env('FIREBASE_STORAGE_BUCKET'),
    'database' => [
        'url' => env('FIREBASE_DATABASE_URL'),
    ],
];

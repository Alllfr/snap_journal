<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\FCMTokenController;

Route::post('/send-fcm', [NotificationController::class, 'sendToToken']);
Route::post('/send-fcm-many', [NotificationController::class, 'sendToMany']);
Route::post('/save-fcm-token', [FCMTokenController::class, 'store']);
Route::get('/journals/mood/calendar', [JournalController::class, 'moodCalendar']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

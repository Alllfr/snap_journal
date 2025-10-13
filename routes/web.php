<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\JournalController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\ResetPassword\NewPasswordController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\UserNotificationController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::post('/journals/upload', [JournalController::class, 'upload'])->name('journals.upload');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/journals', [JournalController::class, 'index'])->name('journals.index');
    Route::get('/journals/create', [JournalController::class, 'create'])->name('journals.create');
    Route::post('/journals', [JournalController::class, 'store'])->name('journals.store');
    Route::get('/journals/{journal}/edit', [JournalController::class, 'edit'])->name('journals.edit');
    Route::put('/journals/{journal}', [JournalController::class, 'update'])->name('journals.update');
    Route::delete('/journals/{journal}', [JournalController::class, 'destroy'])->name('journals.destroy');
    Route::post('/journals/{journal}/enhance', [JournalController::class, 'enhance'])->name('journals.enhance');
    Route::post('/journals/{journal}/chat-ask', [JournalController::class, 'chatAsk'])->name('journals.chatAsk');

   Route::post('/save-fcm-token', function (Request $request) {
    $user = auth()->user();

    if (!$user) {
        return response()->json(['success' => false, 'message' => 'User not authenticated'], 401);
    }

    $request->validate([
        'token' => 'required|string',
    ]);

    $user->fcm_token = $request->token;
    $user->save();

    return response()->json(['success' => true, 'message' => 'Token saved', 'token' => $request->token]);
})->middleware('auth')->name('save-fcm-token');


    Route::post('/send-fcm', [NotificationController::class, 'sendToToken']);
    Route::post('/send-fcm-many', [NotificationController::class, 'sendToMany']);

    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

Route::middleware(['auth'])->group(function () {
    Route::get('/notifications', [UserNotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/mark-as-read', [UserNotificationController::class, 'markAsRead'])
    ->name('notifications.markAsRead');
    Route::delete('/notifications/{id}', [UserNotificationController::class, 'destroy'])
    ->name('notifications.destroy');

});

Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])->name('password.request');
Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])->name('password.reset');
Route::post('reset-password', [NewPasswordController::class, 'store'])->name('password.store');

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

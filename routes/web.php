<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\JournalController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/journals', function () {
    return Inertia::render('index');
})->name('journals.index');

    Route::get('/journals', [JournalController::class, 'index'])->name('journals.index');
    Route::get('/journals/create', [JournalController::class, 'create'])->name('journals.create');
    Route::post('/journals', [JournalController::class, 'store'])->name('journals.store');
    Route::get('/journals/{journal}/edit', [JournalController::class, 'edit'])->name('journals.edit');
    Route::put('/journals/{journal}', [JournalController::class, 'update'])->name('journals.update');
    Route::delete('/journals/{journal}', [JournalController::class, 'destroy'])->name('journals.destroy');

    Route::post('/logout', [\App\Http\Controllers\Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';

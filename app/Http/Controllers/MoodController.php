<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MoodController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->year ?? now()->year;
        $month = $request->month ?? now()->month;

        $journals = Journal::where('user_id', auth()->id())
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get()
            ->mapWithKeys(function ($item) {
                return [
                    intval($item->date->format('j')) => [
                        'mood' => $item->emotion
                    ]
                ];
            });

        return Inertia::render('MoodCalendarPage', [
            'year' => intval($year),
            'month' => intval($month),
            'moods' => $journals,
        ]);
    }

    public function updateEmotion(Request $request)
    {
        $request->validate([
            'year' => 'required',
            'month' => 'required',
            'day' => 'required',
            'emotion' => 'required|string'
        ]);

        $fullDate = sprintf(
            "%04d-%02d-%02d",
            $request->year,
            $request->month,
            $request->day
        );
        Journal::updateOrCreate(
            [
                'user_id' => auth()->id(),
                'created_at' => $fullDate,
            ],
            [
                'emotion' => $request->emotion,
            ]
        );

        return response()->json(['success' => true]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JournalController extends Controller
{
    public function index()
    {
        $journals = Journal::where('user_id', auth()->id())
            ->latest()
            ->get();

        return Inertia::render('Journals/Index', [
            'journals' => $journals
        ]);
    }

    public function create()
    {
        return Inertia::render('Journals/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'note'        => 'required|string',
            'image_path'  => 'required|string', 
        ]);

        $sizeInBytes = (strlen($request->image_path) * 3 / 4) - substr_count($request->image_path, '=');
        if ($sizeInBytes > 10 * 1024 * 1024) {
            return back()->withErrors([
                'image_path' => 'Ukuran video asli melebihi 10MB.'
            ])->withInput();
        }

        Journal::create([
            'title'      => $request->title,
            'note'       => $request->note,
            'image_path' => $request->image_path,
            'user_id'    => auth()->id(),
        ]);

        return redirect()->route('journals.index')->with('success', 'Journal created.');
    }

    public function edit(Journal $journal)
    {
        abort_if($journal->user_id !== auth()->id(), 403);

        return Inertia::render('Journals/Edit', [
            'journal' => $journal
        ]);
    }

    public function update(Request $request, Journal $journal)
    {
        abort_if($journal->user_id !== auth()->id(), 403);

        $request->validate([
            'title'       => 'required|string|max:255',
            'note'        => 'required|string',
            'image_path'  => 'nullable|string', 
        ]);

        if ($request->filled('image_path')) {
            $sizeInBytes = (strlen($request->image_path) * 3 / 4) - substr_count($request->image_path, '=');
            if ($sizeInBytes > 10 * 1024 * 1024) {
                return back()->withErrors([
                    'image_path' => 'Your recording size must be less than 10MB'
                ])->withInput();
            }
            $journal->image_path = $request->image_path;
        }

        $journal->title = $request->title;
        $journal->note  = $request->note;
        $journal->save();

        return redirect()->route('journals.index')->with('success', 'Journal updated.');
    }

    public function destroy(Journal $journal)
    {
        abort_if($journal->user_id !== auth()->id(), 403);

        $journal->delete();

        return redirect()->route('journals.index')->with('success', 'Journal deleted.');
    }
}

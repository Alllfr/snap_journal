<?php

namespace App\Http\Controllers;

use App\Models\Journal;
use App\Services\Journal\JournalCrudService;
use App\Http\Requests\StoreJournalRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JournalController extends Controller
{
    protected JournalCrudService $crud;

    public function __construct(JournalCrudService $crud)
    {
        $this->crud = $crud;
    }

    public function index()
    {
        return Inertia::render("Journals/Index", [
            "journals" => $this->crud->getUserJournals((int) auth()->id())
        ]);
    }

    public function create()
    {
        return Inertia::render("Journals/Create");
    }

    public function store(StoreJournalRequest $request)
    {
        $this->crud->store($request);
        return redirect()->route("journals.index")->with("success", "Journal created.");
    }

    public function edit(Journal $journal)
    {
        return Inertia::render("Journals/Edit", [
            "journal" => $journal
        ]);
    }

    public function update(Request $request, Journal $journal)
    {
        $this->crud->update($request, $journal);
        return redirect()->route("journals.index")->with("success", "Journal updated.");
    }

    public function destroy(Journal $journal)
    {
        $this->crud->destroy($journal);
        return back()->with("success", "Deleted");
    }


    public function uploadPhoto(Request $request)
    {
        return $this->crud->uploadPhoto($request);
    }

    public function enhance(Journal $journal, Request $request)
    {
        return response()->json(
            $this->crud->enhance($journal, $request)
        );
    }

    public function chatAsk(Journal $journal, Request $request)
    {
        return response()->json(
            $this->crud->chatAsk($journal, $request)
        );
    }

    public function moodCalendar(Request $request)
{
    $month = $request->query('month', now()->format('Y-m'));

    $service = app(\App\Services\Journal\JournalCrudService::class);
    $result = $service->getMoodCalendar(auth()->id(), $month);

    return Inertia::render('MoodCalendarPage', [
        'selectedMonth' => $result['month'],
        'calendar'      => $result['calendar'],
    ]);
}


}

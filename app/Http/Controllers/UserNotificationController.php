<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;

class UserNotificationController extends Controller
{
    public function index()
    {
        $notifications = Auth::user()->notifications()
            ->latest()
            ->take(50)
            ->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'title' => $n->data['title'] ?? 'No Title',
                    'message' => $n->data['message'] ?? '',
                    'read_at' => $n->read_at,
                    'created_at' => $n->created_at->diffForHumans(),
                ];
            });

        return inertia('Notifications/Index', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead()
{
    auth()->user()->unreadNotifications->markAsRead();
    return back();
}

public function destroy($id)
{
    $notification = auth()->user()->notifications()->findOrFail($id);
    $notification->delete();

    return back()->with('success', 'Notification deleted');
}


}

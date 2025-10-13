<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    protected $messaging;

    public function __construct()
    {
        $factory = (new Factory)->withServiceAccount(config('services.firebase.credentials.file'));
        $this->messaging = $factory->createMessaging();
    }

    public function sendToToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'title' => 'required|string',
            'body'  => 'required|string',
        ]);

        try {
            $message = CloudMessage::withTarget('token', $request->token)
                ->withNotification(Notification::create($request->title, $request->body))
                ->withData([
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    'sound' => 'default',
                    'type' => 'direct',
                ]);

            $this->messaging->send($message);

            if (Auth::check()) {
                Auth::user()->notifications()->create([
                    'type' => 'App\Notifications\CustomNotification',
                    'data' => [
                        'title' => $request->title,
                        'message' => $request->body,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Notification sent successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('FCM sendToToken error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function sendToMany(Request $request)
    {
        $request->validate([
            'tokens' => 'required|array',
            'title' => 'required|string',
            'body'  => 'required|string',
        ]);

        try {
            $notification = Notification::create($request->title, $request->body);

            $message = CloudMessage::new()
                ->withNotification($notification)
                ->withData(['type' => 'broadcast']);

            $report = $this->messaging->sendMulticast($message, $request->tokens);

            if (Auth::check()) {
                Auth::user()->notifications()->create([
                    'type' => 'App\Notifications\CustomNotification',
                    'data' => [
                        'title' => $request->title,
                        'message' => $request->body,
                    ],
                ]);
            }

            return response()->json([
                'success' => true,
                'sent' => $report->successes()->count(),
                'failed' => $report->failures()->count(),
            ]);
        } catch (\Throwable $e) {
            Log::error('FCM sendToMany error: ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}

<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;
use Kreait\Firebase\Factory;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification as FirebaseNotification;
use Illuminate\Support\Facades\Log;
use App\Notifications\InactiveUserNotification;

class CheckInactiveUsers extends Command
{
    protected $signature = 'reminder:inactive-users';
    protected $description = 'Send FCM reminders to users who have not written a journal in 10 minutes (and save to DB)';

    public function handle()
    {
        $users = User::whereNotNull('fcm_token')
          ->where(function($q) {
        $q->whereNull('last_entry')  
        ->orWhere('last_entry', '<=', now()->subHours(48));
})
->where(function ($query) {
    $query->whereNull('last_reminder_at')
          ->orWhereColumn('last_reminder_at', '<', 'last_entry');
})
            ->get();

        if ($users->isEmpty()) {
            Log::info('No users need reminders at ' . now());
            $this->info('No users need reminders right now.');
            return;
        }

        $factory = (new Factory)->withServiceAccount(config('services.firebase.credentials.file'));
        $messaging = $factory->createMessaging();

        foreach ($users as $user) {
            try {
                $message = CloudMessage::withTarget('token', $user->fcm_token)
                    ->withNotification(
                        FirebaseNotification::create(
                            'We want to hear your story again :(',
                            'Hey ' . $user->name . ', it’s been 10 minutes since your last journal. Want to add a new one?'
                        )
                    )
                    ->withData(['type' => 'reminder']);

                $messaging->send($message);

                $user->notify(new InactiveUserNotification());

                $user->update([
                    'last_reminder_at' => now(),
                ]);

                Log::info("Reminder sent and saved to DB for User ID {$user->id} ({$user->email})");
                $this->info("Reminder sent to {$user->name}");
            } catch (\Throwable $e) {
                Log::error("Failed to send reminder to {$user->email}: " . $e->getMessage());
                $this->error("Failed to send to {$user->name}: " . $e->getMessage());
            }
        }

        $this->info('Done sending reminders.');
    }
}

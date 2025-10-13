<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InactiveUserNotification extends Notification
{
    use Queueable;

    public function via($notifiable)
    {
        return ['database'];
    }

    public function toArray($notifiable)
    {
        return [
            'title' => 'We want to hear your story again :(',
            'message' => 'Hey ' . $notifiable->name . ', it’s been 48 hours since your last journal. Want to add a new one?',
            'type' => 'reminder',
        ];
    }
}

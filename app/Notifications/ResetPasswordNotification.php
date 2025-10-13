<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = config('app.frontend_url') . "/reset-password/{$this->token}?email={$notifiable->getEmailForPasswordReset()}";

        return (new MailMessage)
            ->subject('Reset Your Snap Journal Password')
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("We noticed that you (or someone else) requested to reset the password for your **Snap Journal** account.")
            ->line("Don’t worry — it happens! To keep your account secure, please reset your password using the button below. This link will only be valid for a limited time.")
            ->action('Reset My Password', $url)
            ->line("If you didn’t request a password reset, you can safely ignore this message. Your password will remain unchanged.")
            ->line("Thank you for being part of the Snap Journal community! ✨")
            ->salutation("Warm regards,\nThe Snap Journal Team");
    }
}

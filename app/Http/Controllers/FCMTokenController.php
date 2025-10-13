<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FCMTokenController extends Controller
{
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'token' => 'required|string',
        ]);

        $user->fcm_token = $request->token;
        $user->save();

        return response()->json(['message' => 'FCM token saved successfully']);
    }
}

<?php

namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function signup(Request $request)
{
    try {
        // Validate incoming request
        $validated = $request->validate([
            'username' => 'required|string|unique:users',
            'nickname' => 'required|string',
            'password' => 'required|string|confirmed',
        ]);

        // Create user
        $user = new User();
        $user->username = $validated['username'];
        $user->nickname = $validated['nickname'];
        $user->password = bcrypt($validated['password']);

        if ($user->save()) {
            return response()->json([
                'success' => true,
                'message' => 'User created successfully!',
                'user' => $user
            ], 201);
        } else {
            Log::error('Failed to save user', ['user' => $user]);
            return response()->json(['error' => 'Failed to create user'], 500);
        }
    } catch (\Exception $e) {
        Log::error('Signup error', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'An error occurred'], 500);
    }
}

public function login(Request $request)
{
    try {
        // Validate incoming request
        $validated = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Find user by username
        $user = User::where('username', $validated['username'])->first();

        // Check if user exists and password is correct
        if (!$user || !Hash::check($validated['password'], $user->password)) {
            Log::warning('Invalid login attempt', ['username' => $validated['username']]);
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        // Return success response
        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => $user
        ], 200);
    } catch (\Exception $e) {
        Log::error('Login error', ['error' => $e->getMessage()]);
        return response()->json(['error' => 'An error occurred'], 500);
    }
}
}
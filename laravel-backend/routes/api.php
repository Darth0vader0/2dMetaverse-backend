<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Events\PlayerMoved;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/ping', function () {
    return response()->json(['message' => 'pong']);
});


Route::post('/signup', [AuthController::class, 'signup']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/home', function () {
    return response()->json(['message' => 'Welcome to the API!']);
});
Route::get('/', function () {
    return response()->json(['message' => 'Test route']);
});
Route::get('/test', function () {
    return response()->json(['message' => 'Test route']);
});

Route::post('/move', function (Request $request) {
    broadcast(new PlayerMoved($request->user_id, $request->x, $request->y))->toOthers();
    return response()->json(['status' => 'position broadcasted']);
});
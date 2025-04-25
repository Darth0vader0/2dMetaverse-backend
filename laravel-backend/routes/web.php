<?php

use Illuminate\Support\Facades\Route;
use App\Events\PlayerJoined;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/home', function () {
    return response()->json(['message' => 'Welcome to the API!']);
});

Route::get('/join', function (Request $request) {
    broadcast(new PlayerJoined($request->nickname))->toOthers();
    return response()->json(['status' => 'joined']);
});
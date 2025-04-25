<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Events\PlayerJoined;

class GameRoomController extends Controller
{
    public function join(Request $request)
    {
        $nickname = $request->input('nickname');
        $mapCode = $request->input('map_code');

        // Broadcast the event
        broadcast(new PlayerJoined($nickname, $mapCode))->toOthers();

        return response()->json([
            'status' => 'Player joined event broadcasted!',
            'nickname' => $nickname,
            'map_code' => $mapCode
        ]);
    }
}
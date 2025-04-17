<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlayerMoved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $x;
    public $y;

    public function __construct($userId, $x, $y)
    {
        $this->userId = $userId;
        $this->x = $x;
        $this->y = $y;
    }

    public function broadcastOn()
    {
        return new PresenceChannel('map');
    }

    public function broadcastAs()
    {
        return 'player.moved';
    }
}
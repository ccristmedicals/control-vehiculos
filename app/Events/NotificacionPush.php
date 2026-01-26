<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Queue\SerializesModels;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Broadcasting\InteractsWithSockets;

// class NotificacionPush implements ShouldBroadcast
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public int $usuarioId;

//     public function __construct(int $usuarioId)
//     {
//         $this->usuarioId = $usuarioId;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel("admin.{$this->usuarioId}")];
//     }

//     public function broadcastAs(): string
//     {
//         return 'notificacion.nueva';
//     }

//     public function broadcastWith(): array
//     {
//         return [
//             'usuario_id' => $this->usuarioId,
//         ];
//     }
// }

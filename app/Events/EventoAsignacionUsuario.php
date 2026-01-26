<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Queue\SerializesModels;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Broadcasting\InteractsWithSockets;

// class EventoAsignacionUsuario implements ShouldBroadcast
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public string $placa;
//     public string $adminName;
//     public string $nuevoUsuario;

//     public function __construct(string $placa, string $adminName, string $nuevoUsuario)
//     {
//         $this->placa = $placa;
//         $this->adminName = $adminName;
//         $this->nuevoUsuario = $nuevoUsuario;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs(): string
//     {
//         return 'asignacion.usuario';
//     }
// }

<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Queue\SerializesModels;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

// class ObservacionAgregada implements ShouldBroadcast
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public string $placa;
//     public string $userName;
//     public string $contenido;
//     public string $estado;

//     public function __construct(string $placa, string $userName, string $contenido, string $estado)
//     {
//         $this->placa = $placa;
//         $this->userName = $userName;
//         $this->contenido = $contenido;
//         $this->estado = $estado;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs(): string
//     {
//         return 'observacion.agregada';
//     }

//     public function broadcastWith(): array
//     {
//         return [
//             'placa' => $this->placa,
//             'userName' => $this->userName,
//             'contenido' => $this->contenido,
//             'estado' => $this->estado,
//         ];
//     }
// }

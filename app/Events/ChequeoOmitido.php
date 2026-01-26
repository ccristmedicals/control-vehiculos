<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Queue\SerializesModels;

// class ChequeoOmitido implements ShouldBroadcast
// {
//     use SerializesModels;

//     public string $placa;
//     public string $usuario;
//     public string $fecha;

//     public function __construct(string $placa, string $usuario, string $fecha)
//     {
//         $this->placa = $placa;
//         $this->usuario = $usuario;
//         $this->fecha = $fecha;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs(): string
//     {
//         return 'chequeo.omitido';
//     }
// }

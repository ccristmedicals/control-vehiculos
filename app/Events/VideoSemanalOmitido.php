<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Queue\SerializesModels;

// class VideoSemanalOmitido implements ShouldBroadcast
// {
//     use SerializesModels;

//     public string $placa;
//     public string $usuario;
//     public string $semana;

//     public function __construct(string $placa, string $usuario, string $semana)
//     {
//         $this->placa = $placa;
//         $this->usuario = $usuario;
//         $this->semana = $semana;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs(): string
//     {
//         return 'video.semanal.omitido';
//     }
// }

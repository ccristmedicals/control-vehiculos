<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Queue\SerializesModels;

// class EventoNivelBajo implements ShouldBroadcast
// {
//     use SerializesModels;

//     public string $placa;
//     public string $usuario;
//     public string $campo;
//     public string $formulario;
//     public string $nivel;

//     public function __construct(string $placa, string $usuario, string $campo, string $formulario, string $nivel = 'BAJO')
//     {
//         $this->placa = $placa;
//         $this->usuario = $usuario;
//         $this->campo = $campo;
//         $this->formulario = $formulario;
//         $this->nivel = $nivel;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs(): string
//     {
//         return 'nivel.bajo';
//     }
// }

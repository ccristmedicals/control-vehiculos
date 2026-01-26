<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
// use Illuminate\Queue\SerializesModels;

// class EventoPermisoPorVencer implements ShouldBroadcast
// {
//     use SerializesModels;

//     public string $placa;
//     public string $usuario;
//     public string $permiso;
//     public string $fechaVencimiento;

//     public function __construct(string $placa, string $usuario, string $permiso, string $fechaVencimiento)
//     {
//         $this->placa = $placa;
//         $this->usuario = $usuario;
//         $this->permiso = $permiso;
//         $this->fechaVencimiento = $fechaVencimiento;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs(): string
//     {
//         return 'permiso.por.vencer';
//     }
// }

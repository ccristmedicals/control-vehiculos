<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Queue\SerializesModels;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

// class DocumentoUsuarioPorVencer implements ShouldBroadcast
// {
//     use InteractsWithSockets, SerializesModels;

//     public $usuario;
//     public $userName;
//     public $documento;
//     public $fechaVencimiento;

//     public function __construct($usuario, $userName, $documento, $fechaVencimiento)
//     {
//         $this->usuario = $usuario;
//         $this->userName = $userName;
//         $this->documento = $documento;
//         $this->fechaVencimiento = $fechaVencimiento;
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs()
//     {
//         return 'documento.usuario.por.vencer';
//     }
// }

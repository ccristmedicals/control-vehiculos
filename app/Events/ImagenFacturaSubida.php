<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Queue\SerializesModels;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

// class ImagenFacturaSubida implements ShouldBroadcast
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public string $placa;
//     public string $usuario;
//     public string $factNum;
//     public int $cantidad;

//     public function __construct(string $placa, string $usuario, string $factNum, int $cantidad)
//     {
//         $this->placa = $placa;
//         $this->usuario = $usuario;
//         $this->factNum = $factNum;
//         $this->cantidad = $cantidad;
//     }

//     public function broadcastOn()
//     {
//         return new Channel('admin.dashboard');
//     }

//     public function broadcastAs(): string
//     {
//         return 'imagen.factura.subida';
//     }
// }

<?php

// namespace App\Events;

// use Illuminate\Broadcasting\Channel;
// use Illuminate\Broadcasting\InteractsWithSockets;
// use Illuminate\Foundation\Events\Dispatchable;
// use Illuminate\Queue\SerializesModels;
// use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

// class EventoCambioInputs implements ShouldBroadcast
// {
//     use Dispatchable, InteractsWithSockets, SerializesModels;

//     public string $field;
//     public string|int $value;
//     public string $placa;
//     public string $userName;
//     public ?string $formType;
//     public string $tipoVehiculo;

//     public function __construct(string $field, string|int $value, string $placa, string $userName, string $tipoVehiculo, ?string $formType = null)
//     {
//         $this->field = $field;
//         $this->value = $value;
//         $this->formType = $formType;
//         $this->placa = $placa;
//         $this->userName = $userName;
//         $this->tipoVehiculo = $tipoVehiculo;
//     }

//     public function broadcastWith(): array
//     {
//         return [
//             'field' => $this->field,
//             'value' => $this->value,
//             'placa' => $this->placa,
//             'userName' => $this->userName,
//             'formType' => $this->formType,
//             'tipoVehiculo' => $this->tipoVehiculo,
//         ];
//     }

//     public function broadcastOn(): array
//     {
//         return [new Channel('admin.dashboard')];
//     }

//     public function broadcastAs(): string
//     {
//         return 'input.changed';
//     }
// }

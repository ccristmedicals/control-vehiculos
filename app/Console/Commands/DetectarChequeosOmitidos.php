<?php

// namespace App\Console\Commands;

// use Illuminate\Console\Command;
// use App\Models\Vehiculo;
// use App\Models\User;
// use App\Models\RevisionesDiarias;
// use App\Models\Notificacion;
// use App\Events\ChequeoOmitido;
// use Carbon\Carbon;

// class DetectarChequeosOmitidos extends Command
// {
//     protected $signature = 'app:detectar-chequeos-omitidos';
//     protected $description = 'Detecta vehículos que no fueron revisados antes de las 9am y notifica a los administradores';

//     public function handle()
//     {
//         $hoy = Carbon::now()->locale('es')->dayName;
//         $fechaHoy = Carbon::today()->toDateString();

//         $vehiculos = Vehiculo::with('usuario')->get();

//         foreach ($vehiculos as $vehiculo) {
//             $usuario = $vehiculo->usuario;

//             if (!$usuario) continue;

//             $revisiones = RevisionesDiarias::where('vehiculo_id', $vehiculo->id)
//                 ->where('tipo', '!=', '')
//                 ->whereDate('fecha_creacion', Carbon::today())
//                 ->get();

//             $faltantes = $revisiones->filter(fn($rev) => !$rev->revisado);

//             if ($revisiones->isEmpty() || $faltantes->count() === $revisiones->count()) {
//                 broadcast(new ChequeoOmitido(
//                     $vehiculo->placa,
//                     $usuario->name,
//                     $fechaHoy
//                 ))->toOthers();

//                 $admins = User::role('admin')->get();
//                 foreach ($admins as $admin) {
//                     Notificacion::create([
//                         'titulo' => 'Chequeo diario omitido',
//                         'descripcion' => "El vehículo '{$vehiculo->placa}' no fue revisado el día {$fechaHoy} por el usuario {$usuario->name}.",
//                         'tipo' => 'chequeo_diario',
//                         'usuario_id' => $admin->id,
//                         'solo_admin' => true,
//                     ]);
//                 }

//                 $this->info("Chequeo omitido detectado para {$vehiculo->placa}");
//             }
//         }

//         $this->info('Chequeos omitidos procesados correctamente.');
//     }
// }

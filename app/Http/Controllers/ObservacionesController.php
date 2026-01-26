<?php

namespace App\Http\Controllers;

use App\Helpers\NotificacionHelper;
use App\Models\Observacion;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\FlashHelper;

class ObservacionesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $observaciones = Observacion::with(['vehiculo', 'user', 'admin'])
            // ->join('users', 'observaciones.user_id', '=', 'users.id') // Necesario para comparar columnas
            ->when($user->tipo, function ($query) use ($user) {
                $query->whereHas('vehiculo', function ($qVehiculo) use ($user) {
                    $qVehiculo->where('tipo', $user->tipo);
                });
            }, function ($query) {
                // Si el tipo es null, no filtramos por tipo
                $query->whereHas('vehiculo');
            })
            ->latest('fecha_creacion')
            ->get();


        return Inertia::render('dashboardObservaciones', [
            'observaciones' => $observaciones,
            'isAdmin' => $request->user()->hasRole('admin'),
        ]);
    }


    public function show(Request $request, Vehiculo $vehiculo)
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');

        $observaciones = $vehiculo->observaciones()
            ->with(['user', 'admin'])
            ->latest('fecha_creacion')
            ->get();

        return Inertia::render('observaciones', [
            'vehiculo' => $vehiculo,
            'observaciones' => $observaciones,
            'isAdmin' => $isAdmin,
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function store(Request $request, Vehiculo $vehiculo)
    {
        return FlashHelper::try(function () use ($request, $vehiculo) {
            $validatedData = $request->validate([
                'observacion' => 'required|string'
            ]);

            $respuesta = Observacion::create([
                'user_id' => $request->user()->id,
                'vehiculo_id' => $vehiculo->placa,
                'observacion' => $validatedData['observacion'],
                'resuelto' => false,
            ]);

            if (!$respuesta) {
                throw new \Exception('Error al registrar la observación');
            }

            // Emitir notificación
            // NotificacionHelper::emitirObservacionAgregada(
            //     $vehiculo->placa,
            //     $request->user()->name,
            //     $validatedData['observacion'],
            //     'pendiente'
            // );
        }, 'Observación enviada correctamente.', 'Error al registrar la observación.');
    }

    public function update(Request $request, Vehiculo $vehiculo, Observacion $observacion)
    {
        return FlashHelper::try(function () use ($request, $observacion) {
            $validatedData = $request->validate([
                'resuelto' => 'required|boolean',
            ]);

            $validatedData['fecha_resolucion'] = now();
            $validatedData['admin_id'] = $request->user()->id;

            $respuesta = $observacion->update($validatedData);

            if (!$respuesta) {
                throw new \Exception('Error al resolver la observación');
            }
        }, 'Observación resuelta.', 'Error al resolver la observación.');
    }
}

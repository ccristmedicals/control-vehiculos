<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\Request;
use App\Models\User;
use App\Helpers\NotificacionHelper;
use App\Helpers\FlashHelper;
use App\Models\HistorialAsignaciones;
use App\Services\Multimedia;
use Inertia\Inertia;

class AsignacionesController extends Controller
{
    public function index(Request $request, Vehiculo $vehiculo)
    {
        $historial = HistorialAsignaciones::where('vehiculo_id', $vehiculo->placa)
            ->with(['vehiculo', 'user', 'admin'])
            ->orderByDesc('id')
            ->get();

        foreach ($historial as $historia) {
            if ($historia->foto_kilometraje) {
                $historia->foto_kilometraje = 'uploads/fotos-asignaciones/' . ltrim($historia->foto_kilometraje, '/');
            }
        }

        return Inertia::render('asignaciones', [
            'vehiculo' => $vehiculo,
            'historial' => $historial,
            'isAdmin' => $request->user()->hasRole('admin'),
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
                'user_id' => 'required|exists:users,id',
                'user_id_adicional_1' => 'nullable|exists:users,id',
                'user_id_adicional_2' => 'nullable|exists:users,id',
                'user_id_adicional_3' => 'nullable|exists:users,id',
                'kilometraje' => 'required|numeric',
                'foto_kilometraje' => 'required|image|file|max:5120'
            ]);

            $ultimoKilometraje = HistorialAsignaciones::where('vehiculo_id', $vehiculo->placa)
                ->orderByDesc('fecha_asignacion')
                ->first();

            if ($ultimoKilometraje && $ultimoKilometraje->kilometraje > $validatedData['kilometraje']) {
                throw new \Exception('Kilometraje inválido');
            }

            $nuevoUsuario = User::find($validatedData['user_id']);
            if (!$nuevoUsuario) {
                throw new \Exception('Usuario no encontrado');
            }

            $multimedia = new Multimedia;
            $nombreImagen = $multimedia->guardarImagen($validatedData['foto_kilometraje'], 'asignacion');
            if (!$nombreImagen) {
                throw new \Exception('Error al guardar la imagen');
            }

            $admin = $request->user();
            $respuesta = HistorialAsignaciones::create([
                'vehiculo_id' => $vehiculo->placa,
                'user_id' => $nuevoUsuario->id,
                'admin_id' => $admin->id,
                'kilometraje' => $validatedData['kilometraje'],
                'foto_kilometraje' => $nombreImagen
            ]);

            if (!$respuesta) {
                throw new \Exception('Error al realizar el registro');
            }

            $vehiculo->user_id = $nuevoUsuario->id;
            $vehiculo->user_id_adicional_1 = $validatedData['user_id_adicional_1'] ?? null;
            $vehiculo->user_id_adicional_2 = $validatedData['user_id_adicional_2'] ?? null;
            $vehiculo->user_id_adicional_3 = $validatedData['user_id_adicional_3'] ?? null;
            $vehiculo->save();

            // NotificacionHelper::emitirAsignacionUsuario(
            //     $vehiculo->placa,
            //     $admin->name,
            //     $nuevoUsuario->name
            // );
        }, 'Usuario asignado correctamente.', 'Error al asignar el usuario.');
    }

    public function unassign(Request $request, Vehiculo $vehiculo)
    {
        $vehiculo->user_id = null;
        $vehiculo->user_id_adicional_1 = null;
        $vehiculo->user_id_adicional_2 = null;
        $vehiculo->user_id_adicional_3 = null;
        $vehiculo->save();
    }
}

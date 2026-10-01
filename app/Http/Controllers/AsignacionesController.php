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
                ->orderByDesc('id')
                ->first();

            if ($ultimoKilometraje && $ultimoKilometraje->kilometraje > $validatedData['kilometraje']) {
                throw new \Exception(
                    "El kilometraje ingresado ({$validatedData['kilometraje']}) es menor al último registrado para este vehículo ({$ultimoKilometraje->kilometraje}). "
                    . 'Verifique la lectura del odómetro; si el último registro está mal, un administrador debe corregirlo antes de reasignar.'
                );
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

        return back()->with('success', 'Conductores eliminados correctamente.');
    }

    /**
     * Corregir el kilometraje de un registro del historial de asignaciones.
     * Solo administradores (la ruta está en el grupo 'admin'). Sirve para
     * arreglar lecturas de odómetro mal cargadas que bloquean reasignaciones.
     */
    public function updateHistorial(Request $request, Vehiculo $vehiculo, HistorialAsignaciones $historial)
    {
        abort_unless($historial->vehiculo_id === $vehiculo->placa, 404);

        return FlashHelper::try(function () use ($request, $historial) {
            $data = $request->validate([
                'kilometraje' => 'required|integer|min:0|max:9999999',
            ]);

            $nuevoKm = (int) $data['kilometraje'];

            // La línea de tiempo se ordena por id. La corrección no puede romper
            // la monotonía respecto al registro anterior ni al siguiente.
            $anterior = HistorialAsignaciones::where('vehiculo_id', $historial->vehiculo_id)
                ->where('id', '<', $historial->id)
                ->orderByDesc('id')
                ->first();

            $siguiente = HistorialAsignaciones::where('vehiculo_id', $historial->vehiculo_id)
                ->where('id', '>', $historial->id)
                ->orderBy('id')
                ->first();

            if ($anterior && $nuevoKm < $anterior->kilometraje) {
                throw new \Exception("El kilometraje no puede ser menor al del registro anterior ({$anterior->kilometraje}).");
            }

            if ($siguiente && $nuevoKm > $siguiente->kilometraje) {
                throw new \Exception("El kilometraje no puede ser mayor al del registro siguiente ({$siguiente->kilometraje}).");
            }

            $historial->kilometraje = $nuevoKm;
            $historial->save();
        }, 'Kilometraje corregido correctamente.', 'No se pudo corregir el kilometraje.');
    }
}

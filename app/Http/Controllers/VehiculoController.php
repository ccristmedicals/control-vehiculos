<?php

namespace App\Http\Controllers;

use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Helpers\FlashHelper;
use Inertia\Inertia;

class VehiculoController extends Controller
{
    public function edit(Request $request, Vehiculo $vehiculo)
    {
        return Inertia::render('vehiculoEdit', [
            'vehiculo' => $vehiculo,
        ]);
    }

    public function update(Request $request, Vehiculo $vehiculo)
    {
        return FlashHelper::try(function () use ($request, $vehiculo) {
            $validatedData = $request->validate([
                'placa' => ['sometimes', 'required', 'string', Rule::unique('vehiculos')->ignore($vehiculo)],
                'tipo' => 'sometimes|required|string|in:CARRO,MOTO',
                'modelo' => 'sometimes|required|string',
                'ubicacion' => 'sometimes|required|string'
            ]);

            $vehiculo->update($validatedData);
        }, 'Vehículo actualizado correctamente.', 'Error al actualizar el vehículo.');
    }
}

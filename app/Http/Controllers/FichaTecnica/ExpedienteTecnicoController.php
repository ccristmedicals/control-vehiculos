<?php

declare(strict_types=1);

namespace App\Http\Controllers\FichaTecnica;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\Vehiculo;
use App\Models\VehiculoEspecificaciones;
use App\Helpers\FlashHelper;

class ExpedienteTecnicoController extends Controller
{
    public function store(Request $request, Vehiculo $vehiculo): RedirectResponse
    {
        return FlashHelper::try(function () use ($request, $vehiculo) {
            $campos = $request->except('vehiculo_id');

            foreach ($campos as $especificacionId => $valor) {
                VehiculoEspecificaciones::updateOrCreate(
                    [
                        'user_id' => $request->user()->id,
                        'vehiculo_id' => $vehiculo->placa,
                        'especificacion_id' => $especificacionId,
                    ],
                    [
                        'estado' => $valor,
                        'esta_registrado' => true,
                    ]
                );
            }
        }, 'Expediente técnico guardado correctamente.', 'Error al guardar el expediente técnico.');
    }
}

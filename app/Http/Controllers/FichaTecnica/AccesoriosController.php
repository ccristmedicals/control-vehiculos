<?php

namespace App\Http\Controllers\FichaTecnica;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehiculo;
use App\Models\VehiculoAccesorios;
use App\Helpers\NotificacionHelper;
use App\Helpers\FlashHelper;

class AccesoriosController extends Controller
{
    public function store(Request $request, Vehiculo $vehiculo)
    {
        return FlashHelper::try(function () use ($request, $vehiculo) {
            $data = $request->except('vehiculo_id');
            $userName = $request->user()->name;

            foreach ($data as $accesorioId => $estado) {
                if ($estado === null || $estado === '') continue;

                VehiculoAccesorios::updateOrCreate(
                    [
                        'vehiculo_id' => $vehiculo->placa,
                        'accesorio_id' => $accesorioId,
                    ],
                    [
                        'estado' => $estado,
                        'user_id' => $request->user()->id,
                    ]
                );

                // if (in_array((int) $estado, [1, 2])) {
                //     NotificacionHelper::emitirCambioCritico(
                //         $accesorioId,
                //         (int) $estado,
                //         'accesorios',
                //         $vehiculo->placa,
                //         $userName
                //     );
                // }
            }
        }, 'Accesorios actualizados correctamente.', 'Error al actualizar los accesorios.');
    }
}

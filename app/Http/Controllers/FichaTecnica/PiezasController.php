<?php

namespace App\Http\Controllers\FichaTecnica;

use App\Models\VehiculoPiezas;
use Illuminate\Http\Request;
use App\Helpers\NotificacionHelper;
use App\Helpers\FlashHelper;
use App\Models\Vehiculo;

class PiezasController
{
    public function store(Request $request, Vehiculo $vehiculo)
    {
        return FlashHelper::try(function () use ($request, $vehiculo) {
            $data = $request->except('vehiculo_id');
            $userName = $request->user()->name;

            foreach ($data as $pieza_id => $estado) {
                if ($estado !== null && $estado !== '') {
                    VehiculoPiezas::updateOrCreate(
                        ['vehiculo_id' => $vehiculo->placa, 'pieza_id' => $pieza_id],
                        ['estado' => $estado, 'user_id' => $request->user()->id]
                    );

                    // if (in_array((int) $estado, [1, 2])) {
                    //     NotificacionHelper::emitirCambioCritico(
                    //         $pieza_id,
                    //         (int) $estado,
                    //         'piezas',
                    //         $vehiculo->placa,
                    //         $userName
                    //     );
                    // }
                }
            }
        }, 'Piezas actualizadas correctamente.', 'Error al actualizar las piezas.');
    }
}

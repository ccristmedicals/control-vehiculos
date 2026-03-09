<?php

declare(strict_types=1);

namespace App\Http\Controllers\FichaTecnica;

use App\Helpers\NotificacionHelper;
use App\Helpers\FlashHelper;
use App\Http\Controllers\Controller;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use App\Models\VehiculoPermisos;
use App\Services\Multimedia;
use Carbon\Carbon;

class PermisologiaController extends Controller
{
    public function store(Request $request, Vehiculo $vehiculo): RedirectResponse
    {
        return FlashHelper::try(function () use ($request, $vehiculo) {
            try {
                $usuario = $request->user()->name;
                $userId = $request->user()->id;

                $mapaPermisos = [
                    'titulo' => 1,
                    'seguro' => 3,
                    'roct' => 4,
                    'permisoRotReg' => 5,
                    'permisoRotNac' => 6,
                    'salvoconducto' => 7,
                    'permisoAliMed' => 8,
                    'trimestres' => 9,
                ];

                $multimedia = new Multimedia;

                foreach ($mapaPermisos as $campo => $permisoId) {
                    // Solo procedemos a evaluar / alterar este permiso si existe evidencia de envio en el FormData
                    $hasExpedicion = $request->has("{$campo}_expedicion");
                    $hasVencimiento = $request->has("{$campo}_vencimiento");
                    $hasArchivo = $request->hasFile("{$campo}_archivo");

                    if (!$hasExpedicion && !$hasVencimiento && !$hasArchivo) {
                        continue;
                    }

                    $expedicion = $request->input("{$campo}_expedicion");
                    $vencimiento = $request->input("{$campo}_vencimiento");

                    // Validación de fechas lógicas
                    if ($expedicion && $vencimiento && $vencimiento < $expedicion) {
                        continue;
                    }

                    // Procesamiento de archivo
                    $archivo = $request->file("{$campo}_archivo");
                    $documento = null;

                    if ($archivo) {
                        $mime = $archivo->getClientMimeType();
                        $documento = $mime === 'application/pdf'
                            ? $multimedia->guardarArchivoPdf($archivo, 'pdf')
                            : $multimedia->guardarImagen($archivo, 'documentos');
                    }

                    // Estado del permiso (activos si la fecha de vencimiento es a futuro o si no está vencido)
                    $estado = $vencimiento ? now()->lt($vencimiento) : true;

                    // Datos base a actualizar/insertar
                    $datosUpdate = [
                        'user_id' => $userId,
                        'estado' => $estado,
                        'fecha_expedicion' => $expedicion,
                        'fecha_vencimiento' => $vencimiento,
                        'valor_texto' => null,
                    ];

                    if ($documento) {
                        $datosUpdate['documento'] = $documento;
                    }

                    // Guardar o actualizar permiso
                    VehiculoPermisos::updateOrCreate(
                        [
                            'vehiculo_id' => $vehiculo->placa,
                            'permiso_id' => $permisoId,
                        ],
                        $datosUpdate
                    );

                    // Notificación si el permiso está por vencer
                    if ($vencimiento) {
                        $vencimientoCarbon = Carbon::parse($vencimiento)->startOfDay();
                        $diasRestantes = Carbon::today()->diffInDays($vencimientoCarbon, false);
                        $clave = "permiso_alertado_{$vehiculo->placa}_{$campo}_{$vencimientoCarbon->toDateString()}";

                        if (!session()->has($clave)) {
                            session()->put($clave, true);

                            // if ($diasRestantes <= 15) {
                            //     NotificacionHelper::emitirPermisoPorVencer(
                            //         $vehiculo->placa,
                            //         $usuario,
                            //         ucfirst($campo),
                            //         $vencimientoCarbon->toDateString()
                            //     );
                            // }
                        }
                    }
                }

                // Agrupar permisos actualizados
                $permisosActualizados = VehiculoPermisos::where('vehiculo_id', $vehiculo->placa)
                    ->get()
                    ->groupBy('permiso_id')
                    ->map(function ($items) {
                        $permiso = $items->first();
                        return [
                            'fecha_expedicion' => $permiso->fecha_expedicion,
                            'fecha_vencimiento' => $permiso->fecha_vencimiento,
                            'valor_texto' => null,
                            'estado' => $permiso->estado,
                            'documento' => $permiso->documento,
                        ];
                    });

                session()->flash('permisosGuardados', [$vehiculo->placa => $permisosActualizados]);
            } catch (\Throwable $th) {
                dd($th);
            }
        }, 'Permisología guardada correctamente.', 'Error al guardar la permisología.');
    }
}

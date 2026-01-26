<?php

namespace App\Http\Controllers\FichaTecnica;

use App\Events\EventoPermisoPorVencer;
use App\Helpers\FlashHelper;
use App\Http\Controllers\Controller;
use App\Models\FacturaAuditoria;
use App\Models\Vehiculo;
use App\Models\VehiculoAccesorios;
use App\Models\VehiculoEspecificaciones;
use App\Models\VehiculoPermisos;
use App\Models\VehiculoPiezas;
use App\Models\User;
use App\Services\Multimedia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FichaTecnicaController extends Controller
{
    public function show(Request $request, Vehiculo $vehiculo)
    {
        $user = $request->user();
        $isAdmin = $user->hasRole('admin');

        $vehiculo = Vehiculo::with([
            'usuario',
            'usuarioAdicional1',
            'usuarioAdicional2',
            'usuarioAdicional3',
        ])->where('placa', $vehiculo->placa)->firstOrFail();

        $expediente = VehiculoEspecificaciones::where('vehiculo_id', $vehiculo->placa)->get();
        $expedientesTecnicosPorVehiculo = [
            $vehiculo->placa => $expediente->pluck('estado', 'especificacion_id')->toArray()
        ];

        $accesorios = VehiculoAccesorios::where('vehiculo_id', $vehiculo->placa)->get();
        $accesoriosPorVehiculo[$vehiculo->placa] = $accesorios->pluck('estado', 'accesorio_id')->toArray();

        $piezas = VehiculoPiezas::where('vehiculo_id', $vehiculo->placa)->get();
        $piezasPorVehiculo[$vehiculo->placa] = $piezas->pluck('estado', 'pieza_id')->map(fn($e) => (string) $e)->toArray();

        $permisos = VehiculoPermisos::where('vehiculo_id', $vehiculo->placa)->get();
        $permisosPorVehiculo = [$vehiculo->placa => []];

        foreach ($permisos as $permiso) {
            $config = $this->mapaPermisos()[$permiso->permiso_id] ?? null;
            if (!$config) continue;

            $campo = $config['campo'];

            $permisosPorVehiculo[$vehiculo->placa]["{$campo}_expedicion"] = $permiso->fecha_expedicion;
            $permisosPorVehiculo[$vehiculo->placa]["{$campo}_vencimiento"] = $permiso->fecha_vencimiento;
            if (pathinfo($permiso->documento, PATHINFO_EXTENSION) == 'pdf') {
                $permisosPorVehiculo[$vehiculo->placa]["{$campo}_documento"] = '/storage/uploads/pdf-documentos/' . $permiso->documento;
            } else {
                $permisosPorVehiculo[$vehiculo->placa]["{$campo}_documento"] = '/storage/uploads/fotos-documentos/' . $permiso->documento;
            }
        }

        $auditoriasPendientes = FacturaAuditoria::where('vehiculo_id', $vehiculo->placa)
            ->where(function ($q) {
                $q->whereNull('aprobado')->orWhere('aprobado', false);
            })
            ->whereNull('observaciones_admin')
            ->count();

        $vehiculo->imagenes_factura_pendientes = $auditoriasPendientes;

        $users = User::whereNotIn('email', [29960819, 26686507, 25025870])->select('id', 'name')->get();

        return Inertia::render('fichaTecnica', [
            'vehiculos' => [$vehiculo],
            'expedientesTecnicos' => $expedientesTecnicosPorVehiculo,
            'permisosGuardados' => $permisosPorVehiculo,
            'accesoriosGuardados' => $accesoriosPorVehiculo,
            'piezasGuardadas' => $piezasPorVehiculo,
            'isAdmin' => $isAdmin,
            'users' => $users,
            'modo' => $isAdmin ? 'admin' : 'usuario',
            'flash' => [
                'success' => session('success'),
                'error' => session('error'),
            ],
        ]);
    }

    public function storePermisos(Request $request, string $placa)
    {
        return FlashHelper::try(function () use ($request, $placa) {
            $data = $request->except('vehiculo_id');
            $usuario = $request->user()->name;
            $multimedia = new Multimedia;

            foreach ($this->mapaPermisos() as $permiso_id => $config) {
                $campo = $config['campo'];

                $registro = VehiculoPermisos::firstOrNew([
                    'vehiculo_id' => $placa,
                    'permiso_id' => $permiso_id,
                ]);

                $expedicion = $data["{$campo}_expedicion"] ?? null;
                $vencimiento = $data["{$campo}_vencimiento"] ?? null;

                $registro->fecha_expedicion = $expedicion;
                $registro->fecha_vencimiento = $vencimiento;

                if ($vencimiento) {
                    $vencimientoCarbon = Carbon::parse($vencimiento)->startOfDay();
                    $diasRestantes = Carbon::today()->diffInDays($vencimientoCarbon, false);
                    $clave = "permiso_alertado_{$placa}_{$campo}_{$vencimientoCarbon->toDateString()}";

                    if (!session()->has($clave)) {
                        session()->put($clave, true);

                        // if ($diasRestantes < 0 || $diasRestantes <= 15) {
                        //     broadcast(new EventoPermisoPorVencer(
                        //         $placa,
                        //         $usuario,
                        //         ucfirst($campo),
                        //         $vencimientoCarbon->toDateString()
                        //     ))->toOthers();
                        // }
                    }
                }

                $archivo = $request->file("{$campo}_archivo");
                if ($archivo) {
                    $mime = $archivo->getClientMimeType();
                    $registro->documento = $mime === 'application/pdf'
                        ? $multimedia->guardarArchivoPdf($archivo, 'pdf')
                        : $multimedia->guardarImagen($archivo, 'documento');
                }

                $registro->save();
            }
        }, 'Permisología actualizada correctamente.', 'Error al actualizar la permisología.');
    }

    public function storeExpediente(Request $request, string $placa)
    {
        return FlashHelper::try(function () use ($request, $placa) {
            $data = $request->except('vehiculo_id');
            foreach ($data as $especificacion_id => $estado) {
                VehiculoEspecificaciones::updateOrCreate(
                    ['vehiculo_id' => $placa, 'especificacion_id' => $especificacion_id],
                    ['estado' => $estado]
                );
            }
        }, 'Expediente técnico actualizado correctamente.', 'Error al actualizar el expediente técnico.');
    }

    public function storeAccesorios(Request $request, string $placa)
    {
        return FlashHelper::try(function () use ($request, $placa) {
            $data = $request->except('vehiculo_id');
            $vehiculo = Vehiculo::where('placa', $placa)->firstOrFail();
            foreach ($data as $accesorio_id => $estado) {
                $vehiculo->accesorios()->updateOrCreate(
                    ['accesorio_id' => $accesorio_id],
                    ['estado' => $estado]
                );
            }
        }, 'Accesorios actualizados correctamente.', 'Error al actualizar los accesorios.');
    }

    public function storePiezas(Request $request, string $placa)
    {
        return FlashHelper::try(function () use ($request, $placa) {
            $data = $request->except('vehiculo_id');
            foreach ($data as $pieza_id => $estado) {
                if ($estado !== null && $estado !== '') {
                    VehiculoPiezas::updateOrCreate(
                        [
                            'vehiculo_id' => $placa,
                            'pieza_id' => $pieza_id,
                        ],
                        [
                            'estado' => $estado,
                            'user_id' => $request->user()->id,
                        ]
                    );
                }
            }
        }, 'Piezas actualizadas correctamente.', 'Error al actualizar las piezas.');
    }

    private function mapaPermisos(): array
    {
        return [
            1 => ['campo' => 'titulo', 'tipo' => 'date'],
            3 => ['campo' => 'seguro', 'tipo' => 'date'],
            4 => ['campo' => 'roct', 'tipo' => 'date'],
            5 => ['campo' => 'permisoRotReg', 'tipo' => 'date'],
            6 => ['campo' => 'permisoRotNac', 'tipo' => 'date'],
            7 => ['campo' => 'salvoconducto', 'tipo' => 'date'],
            8 => ['campo' => 'permisoAliMed', 'tipo' => 'date'],
            9 => ['campo' => 'trimestres', 'tipo' => 'date'],
        ];
    }
}

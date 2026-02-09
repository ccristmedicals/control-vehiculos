<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Vehiculo;
use App\Models\Notificacion;
use Illuminate\Http\Request;
use App\Models\FacturaAuditoria;
use App\Models\RevisionesDiarias;
use Illuminate\Support\Facades\DB;
use App\Helpers\NotificacionHelper;
use App\Models\RevisionesSemanales;
use App\Models\Surtido;
use App\Models\User;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $modo = $user->hasRole('admin') ? 'admin' : 'user';

        $vehiculos = $modo === 'admin'
            ? Vehiculo::with([
                'usuario',
                'usuarioAdicional1',
                'usuarioAdicional2',
                'usuarioAdicional3',
            ])
                ->when($user->tipo, function ($query) use ($user) {
                    $query->where('tipo', $user->tipo);
                })
                ->withCount([
                    'observaciones as observaciones_no_resueltas' => function ($query) {
                        $query->where('resuelto', false);
                    },
                    'envios as envios_pendientes' => function ($query) {
                        $query->where('estado', 'pendiente');
                    }
                ])
                ->get()
            : Vehiculo::with([
                'usuario',
                'usuarioAdicional1',
                'usuarioAdicional2',
                'usuarioAdicional3',
            ])
                ->withCount([
                    'observaciones as observaciones_no_resueltas' => function ($query) {
                        $query->where('resuelto', false);
                    },
                    'envios as envios_pendientes' => function ($query) {
                        $query->where('estado', 'pendiente');
                    }
                ])
                ->where(function ($query) use ($user) {
                    $query->where('user_id', $user->id)
                        ->orWhere('user_id_adicional_1', $user->id)
                        ->orWhere('user_id_adicional_2', $user->id)
                        ->orWhere('user_id_adicional_3', $user->id);
                })
                ->get();

        foreach ($vehiculos as $vehiculo) {
            $auditoriasPendientes = FacturaAuditoria::where('vehiculo_id', $vehiculo->placa)
                ->where(function ($q) {
                    $q->whereNull('aprobado')->orWhere('aprobado', 0);
                })
                ->count();

            $vehiculo->imagenes_factura_pendientes = $auditoriasPendientes;

            $facturas = DB::connection('sqlsrv')->select('SELECT fact_num FROM factura WHERE co_cli = ? AND anulada = 0 AND fec_emis >= ? AND co_tran <> ?', [$vehiculo->placa, '2025-06-10', '000003']);

            $factNums = collect($facturas)->pluck('fact_num')->all();

            $auditados = DB::connection('mysql')->select(
                'SELECT fact_num FROM auditoria_facturas WHERE vehiculo_id=?',
                [$vehiculo->placa]
            );
            $factNumsAudit = collect($auditados)->pluck('fact_num')->all();

            $vehiculo->factura_pendiente = count(array_diff($factNums, $factNumsAudit));

            if (!$vehiculo->user_id)
                continue;

            $revisadoHoy = RevisionesDiarias::where('vehiculo_id', $vehiculo->placa)
                ->whereDate('fecha_creacion', Carbon::today())
                ->exists();

            $vehiculo->revision_diaria = $revisadoHoy ?? false;
        }

        // $notificaciones = $modo === 'admin'
        //     ? Notificacion::where('usuario_id', $user->id)
        //     ->where('solo_admin', true)
        //     ->orderByDesc('created_at')
        //     ->get()
        //     : [];

        // $hoy = Carbon::now();
        // $horaActual = $hoy->format('H:i');
        // $fechaHoy = $hoy->toDateString();

        // // Verificación de revisión semanal omitida
        // if ($modo === 'admin' && $hoy->isSaturday() && $horaActual >= '10:00') {
        //     $inicioSemana = $hoy->copy()->startOfWeek(Carbon::MONDAY)->toDateString();
        //     $finalSemana = $hoy->copy()->endOfWeek(Carbon::FRIDAY)->toDateString();

        //     foreach ($vehiculos as $vehiculo) {
        //         $revision = RevisionesSemanales::where('vehiculo_id', $vehiculo->placa)
        //             ->whereBetween('created_at', [$inicioSemana, $finalSemana])
        //             ->first();

        //         $yaAlertado = Notificacion::where('vehiculo_id', $vehiculo->placa)
        //             ->whereDate('created_at', $fechaHoy)
        //             ->where('tipo', 'chequeoOmitido')
        //             ->where('usuario_id', $user->id)
        //             ->exists();

        //         if (!$yaAlertado && !$revision) {
        //             NotificacionHelper::emitirChequeoOmitido(
        //                 $vehiculo->placa,
        //                 $vehiculo->usuario->name ?? 'Desconocido',
        //                 $fechaHoy
        //             );
        //         }
        //     }
        // }

        // // Verificación de revisión diaria omitida
        // if ($modo === 'admin' && $horaActual >= '09:00') {
        //     foreach ($vehiculos as $vehiculo) {
        //         $revisadoHoy = RevisionesDiarias::where('vehiculo_id', $vehiculo->placa)
        //             ->whereDate('fecha_creacion', $fechaHoy)
        //             ->exists();

        //         $yaAlertado = Notificacion::where('vehiculo_id', $vehiculo->placa)
        //             ->whereDate('created_at', $fechaHoy)
        //             ->where('tipo', 'chequeoOmitido')
        //             ->where('usuario_id', $user->id)
        //             ->exists();

        //         if (!$yaAlertado && !$revisadoHoy) {
        //             NotificacionHelper::emitirChequeoOmitido(
        //                 $vehiculo->placa,
        //                 $vehiculo->usuario->name ?? 'Desconocido',
        //                 $fechaHoy
        //             );
        //         }
        //     }
        // }

        // incluir todos los registros de gasolina
        $surtidos = Surtido::latest()->get();

        $registros = $surtidos->map(function ($surtido) {
            $user = User::find($surtido->user_id);
            $admin = User::find($surtido->admin_id);
            $vehiculo = Vehiculo::find($surtido->vehiculo_id);

            return [
                'factura' => $surtido->fact_num,
                'fecha' => $surtido->created_at->format('Y-m-d'),
                'vehiculo' => $vehiculo->modelo ?? $surtido->vehiculo_id,
                'placa' => $surtido->vehiculo_id,
                'precio' => $surtido->precio,
                'km_actual' => $surtido->kilometraje,
                'recorrido' => $surtido->surtido_ideal,
                'litros' => $surtido->cant_litros,
                'total' => $surtido->precio,
                'observaciones' => $surtido->observaciones,
                'diferencia' => $surtido->diferencia,
                'conductor' => $user->name ?? 'Sin conductor',
                'admin' => $admin->name ?? 'Sin supervisor',
            ];
        });
        // dd($registros);
        return Inertia::render('dashboard', [
            'vehiculos' => $vehiculos,
            'registros' => $registros,
            'modo' => $modo,
            'notificaciones' => $notificaciones ?? null,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'is_admin' => $user->hasRole('admin'),
                ],
            ],
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }
}

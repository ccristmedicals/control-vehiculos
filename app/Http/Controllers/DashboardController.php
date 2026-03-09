<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Surtido;

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

        $placas = $vehiculos->pluck('placa')->toArray();

        $todasLasFacturas = DB::connection('sqlsrv')->table('factura')
            ->select('fact_num', 'co_cli')
            ->whereIn('co_cli', $placas)
            ->where('anulada', 0)
            ->whereDate('fec_emis', '>=', '2025-10-06')
            ->where('co_tran', '<>', '000003')
            ->get()
            ->groupBy(fn($item) => trim((string)$item->co_cli));

        $auditoriasLocales = DB::table('auditoria_facturas')
            ->select('vehiculo_id', 'fact_num', 'aprobado')
            ->whereIn('vehiculo_id', $placas)
            ->get()
            ->groupBy('vehiculo_id');

        $revisadoDiarioHoy = DB::table('revisiones_diarias')
            ->whereIn('vehiculo_id', $placas)
            ->whereDate('fecha_creacion', Carbon::today())
            ->pluck('vehiculo_id')
            ->toArray();

        foreach ($vehiculos as $vehiculo) {
            $placaTrimmed = trim((string)$vehiculo->placa);
            $facturasVehiculo = $todasLasFacturas->get($placaTrimmed) ?? collect();
            $factNums = $facturasVehiculo->pluck('fact_num')->map(fn($id) => trim((string) $id))->all();

            $auditoriasVehiculo = $auditoriasLocales->get($vehiculo->placa) ?? collect();

            $auditoriasPendientes = $auditoriasVehiculo
                ->whereIn('fact_num', $factNums)
                ->filter(fn($auditoria) => is_null($auditoria->aprobado) || $auditoria->aprobado == 0)
                ->count();

            $vehiculo->imagenes_factura_pendientes = $auditoriasPendientes;

            $factNumsAuditAprobadas = $auditoriasVehiculo
                ->filter(fn($auditoria) => $auditoria->aprobado == 1)
                ->pluck('fact_num')
                ->map(fn($id) => trim((string) $id))
                ->all();

            $vehiculo->factura_pendiente = count(array_diff($factNums, $factNumsAuditAprobadas));

            if (!$vehiculo->user_id)
                continue;

            $vehiculo->revision_diaria = in_array($vehiculo->placa, $revisadoDiarioHoy);
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

        // incluir todos los registros de gasolina limitados para evitar colapsos de memoria
        $surtidos = Surtido::with(['user:id,name', 'admin:id,name', 'vehiculo:placa,modelo'])
            ->latest()
            ->limit(100)
            ->get();

        $registros = $surtidos->map(function ($surtido) {
            return [
                'factura' => $surtido->fact_num,
                'fecha' => $surtido->created_at->format('Y-m-d'),
                'vehiculo' => $surtido->vehiculo->modelo ?? $surtido->vehiculo_id,
                'placa' => $surtido->vehiculo_id,
                'precio' => $surtido->precio,
                'km_actual' => $surtido->kilometraje,
                'recorrido' => $surtido->surtido_ideal,
                'litros' => $surtido->cant_litros,
                'total' => $surtido->precio,
                'observaciones' => $surtido->observaciones,
                'diferencia' => $surtido->diferencia,
                'conductor' => $surtido->user->name ?? 'Sin conductor',
                'admin' => $surtido->admin->name ?? 'Sin supervisor',
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

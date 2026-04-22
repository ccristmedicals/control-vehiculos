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

        // 1. CONSTRUCCIÓN BASE DE LA CONSULTA
        $query = Vehiculo::with([
            'usuario',
            'usuarioAdicional1',
            'usuarioAdicional2',
            'usuarioAdicional3',
        ])
            ->whereNotNull('origen')
            ->whereNotIn('placa', ['000', '0001']);

        // 2. APLICACIÓN DE FILTROS SEGÚN EL ROL Y EL PERFIL
        if ($modo === 'admin') {
            // Si el admin tiene tipo (ej. MOTO), filtramos. Si es null, lo ve todo.
            $query->when($user->tipo, function ($q) use ($user) {
                $q->where('tipo', $user->tipo);
            });
        } else {
            // Conductor: Ve solo los suyos, filtrados por su perfil de tipo
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('user_id_adicional_1', $user->id)
                    ->orWhere('user_id_adicional_2', $user->id)
                    ->orWhere('user_id_adicional_3', $user->id);
            })->when($user->tipo, function ($q) use ($user) {
                $q->where('tipo', $user->tipo);
            });
        }

        // 3. EJECUCIÓN Y CONTEOS
        $vehiculos = $query->withCount([
            'observaciones as observaciones_no_resueltas' => function ($q) {
                $q->where('resuelto', false);
            },
            'envios as envios_pendientes' => function ($q) {
                $q->where('estado', 'pendiente');
            }
        ])->get();

        $placas = $vehiculos->pluck('placa')->toArray();

        // 4. BÚSQUEDA DE RIF PARA PLACA VISUAL
        $datosClientes = DB::table('clientes')
            ->whereIn('co_cli', $placas)
            ->pluck('rif', 'co_cli');

        $placasMotos = $vehiculos->where('origen', 'sqlsrv_motos')->pluck('placa')->toArray();
        $placasCarros = $vehiculos->where('origen', 'sqlsrv_carros')->pluck('placa')->toArray();

        $facturasMotos = !empty($placasMotos)
            ? DB::connection('sqlsrv_motos')->table('factura')
            ->select('fact_num', 'co_cli')
            ->whereIn('co_cli', $placasMotos)
            ->where('anulada', 0)
            ->whereDate('fec_emis', '>=', '2025-10-06')
            ->where('co_tran', '<>', '03') // Excluir facturas de gasolina
            ->get()
            : collect();

        $facturasCarros = !empty($placasCarros)
            ? DB::connection('sqlsrv_carros')->table('factura')
            ->select('fact_num', 'co_cli')
            ->whereIn('co_cli', $placasCarros)
            ->where('anulada', 0)
            ->whereDate('fec_emis', '>=', '2025-10-06')
            ->where('co_tran', '<>', '03') // Excluir facturas de gasolina
            ->get()
            : collect();

        $todasLasFacturas = $facturasMotos->merge($facturasCarros)->groupBy(fn($item) => trim((string)$item->co_cli));

        $auditoriasLocales = DB::table('auditoria_facturas')
            ->select('vehiculo_id', 'fact_num', 'aprobado')
            ->whereIn('vehiculo_id', $placas)
            ->get()
            ->groupBy(fn($item) => trim((string)$item->vehiculo_id));

        $revisadoDiarioHoy = DB::table('revisiones_diarias')
            ->whereIn('vehiculo_id', $placas)
            ->whereDate('fecha_creacion', Carbon::today())
            ->pluck('vehiculo_id')
            ->map(fn($id) => trim((string)$id))
            ->toArray();

        foreach ($vehiculos as $vehiculo) {
            $placaTrimmed = trim((string)$vehiculo->placa);

            // Asignación de Placa Visual (RIF)
            $rifVehiculo = trim((string)($datosClientes[$placaTrimmed] ?? ''));
            $vehiculo->placa_visual = !empty($rifVehiculo) ? $rifVehiculo : $placaTrimmed;

            $facturasVehiculo = $todasLasFacturas->get($placaTrimmed) ?? collect();
            $normalizeFact = fn($id) => ltrim(trim((string) $id), '0') ?: '0';

            $factNums = $facturasVehiculo->pluck('fact_num')->map($normalizeFact)->all();

            $auditoriasVehiculo = $auditoriasLocales->get($placaTrimmed) ?? collect();

            $auditoriasVehiculoNorm = $auditoriasVehiculo->map(function ($auditoria) use ($normalizeFact) {
                $auditoria->fact_num_norm = $normalizeFact($auditoria->fact_num);
                return $auditoria;
            });

            $auditoriasPendientes = $auditoriasVehiculoNorm
                ->whereIn('fact_num_norm', $factNums)
                ->filter(fn($auditoria) => is_null($auditoria->aprobado) || $auditoria->aprobado == 0)
                ->count();

            $vehiculo->imagenes_factura_pendientes = $auditoriasPendientes;

            $factNumsAuditAprobadas = $auditoriasVehiculoNorm
                ->filter(fn($auditoria) => $auditoria->aprobado == 1)
                ->pluck('fact_num_norm')
                ->all();

            $vehiculo->factura_pendiente = count(array_diff($factNums, $factNumsAuditAprobadas));

            $vehiculo->revision_diaria = in_array($placaTrimmed, $revisadoDiarioHoy);

            if (!$vehiculo->user_id)
                continue;
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
            ->whereNotIn('vehiculo_id', ['000', '0001'])
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

        return Inertia::render('dashboard', [
            'vehiculos' => $vehiculos,
            'registros' => $registros,
            'modo' => $modo,
            'notificaciones' => $notificaciones ?? null,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'tipo' => $user->tipo, // Incluido por si deseas usarlo en React
                    'is_admin' => $user->hasRole('admin'),
                ],
            ],
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }
}

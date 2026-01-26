<?php

namespace App\Http\Controllers;

use App\Helpers\FlashHelper;
use App\Models\RevisionesDiarias;
use App\Models\Vehiculo;
use App\Services\Multimedia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RevisionDiariaController extends Controller
{
    public function index(Request $request, Vehiculo $vehiculo)
    {
        Carbon::setLocale('es');
        $inicioSemana = Carbon::now()->startOfWeek(Carbon::MONDAY)->toImmutable();
        $finalSemana = Carbon::now()->endOfWeek(Carbon::FRIDAY)->toImmutable();

        // 1. OBTENER TODO (Ordenado por fecha descendente)
        $todasLasRevisiones = RevisionesDiarias::where('vehiculo_id', $vehiculo->placa)
            ->orderByDesc('fecha_creacion')
            ->get()
            ->map(function ($revision) {
                if ($revision->imagen) {
                    $revision->imagen = '/storage/uploads/fotos-diarias/' . ltrim($revision->imagen, '/');
                }
                return $revision;
            });

        // 2. DATOS PARA EL FORMULARIO (Solo Semana Actual)
        $revisionesSemanaActual = [];

        // Filtramos para obtener SOLO lo de esta semana
        $revisionesDeEstaSemana = $todasLasRevisiones->filter(function ($rev) use ($inicioSemana, $finalSemana) {
            $fecha = Carbon::parse($rev->fecha_creacion);
            return $fecha->between($inicioSemana, $finalSemana);
        });

        foreach ($revisionesDeEstaSemana as $revision) {
            // Nota: Usamos locale('en') aquí para que coincida con las keys de React (monday, tuesday...)
            $dia = strtolower(Carbon::parse($revision->fecha_creacion)->locale('en')->isoFormat('dddd'));
            if (!isset($revisionesSemanaActual[$dia])) {
                $revisionesSemanaActual[$dia] = [];
            }
            $revisionesSemanaActual[$dia][] = $revision;
        }

        // 3. DATOS PARA EL HISTORIAL (EXCLUYENDO SEMANA ACTUAL)
        $historialAgrupado = $todasLasRevisiones
            // --- NUEVO FILTRO AQUÍ ---
            // "Rechazamos" (excluimos) las revisiones que estén dentro de la semana actual
            // porque esas ya se muestran arriba en el formulario.
            ->reject(function ($rev) use ($inicioSemana, $finalSemana) {
                return Carbon::parse($rev->fecha_creacion)->between($inicioSemana, $finalSemana);
            })
            // -------------------------
            ->groupBy(function ($item) {
                return Carbon::parse($item->fecha_creacion)->format('Y-m-d');
            })
            ->map(function ($items, $fecha) {
                return [
                    'fecha' => $fecha,
                    'fecha_humana' => ucfirst(Carbon::parse($fecha)->locale('es')->isoFormat('dddd D [de] MMMM YYYY')),
                    'items' => $items
                ];
            })
            ->values();

        return Inertia::render('revisionFluidos', [
            'vehiculoId' => $vehiculo->placa,
            'vehiculo' => $vehiculo,
            'revisionDiaria' => $revisionesSemanaActual,
            'historial' => $historialAgrupado,
            'modo' => Auth::user()->hasRole('admin') ? 'admin' : 'normal',
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
                'fluidos' => 'required|array',
                'fluidos.*.tipo' => 'nullable|string',
                'fluidos.*.vehiculo_id' => 'nullable|string',
                'fluidos.*.dia' => 'nullable|string',
                'fluidos.*.nivel_fluido' => 'nullable|string',
                'fluidos.*.revisado' => 'nullable|string',
                'fluidos.*.imagen' => 'nullable|string',
            ]);

            $datos = [];

            foreach ($validatedData['fluidos'] as $revision) {
                if (!$revision['revisado'])
                    continue;
                if ($revision['revisado'] && !array_key_exists('imagen', $revision))
                    continue;

                $datos[] = [
                    'vehiculo_id' => $vehiculo->placa,
                    'user_id' => Auth::id(),
                    'nivel_fluido' => $revision['nivel_fluido'],
                    'imagen' => $revision['imagen'],
                    'revisado' => (bool) $revision['revisado'],
                    'tipo' => $revision['tipo'],
                    'fecha_creacion' => Carbon::now(),
                ];
            }
            RevisionesDiarias::insert($datos);
        }, 'Revisión diaria registrada correctamente.', 'Error al registrar la revisión diaria.');
    }
}
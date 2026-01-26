<?php

namespace App\Http\Controllers;

use App\Exports\GasolinaSelectionExport; // <--- IMPORTANTE: Necesario para exportar
use Maatwebsite\Excel\Facades\Excel;     // <--- IMPORTANTE: Necesario para la fachada Excel
use App\Helpers\FlashHelper;
use App\Models\FacturaAuditoria;
use Inertia\Inertia;
use App\Models\Surtido;
use App\Models\User;
use App\Models\Vehiculo;
use App\Services\Gasolina;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SurtidosController extends Controller
{
    public function index(Request $request, Vehiculo $vehiculo)
    {
        $vehiculo->load('usuario');

        $registros = Surtido::where('vehiculo_id', $vehiculo->placa)
            ->latest()
            ->get();

        return Inertia::render('gasolina', [
            'vehiculo' => [
                'placa' => $vehiculo->placa,
                'modelo' => $vehiculo->modelo,
                'usuario' => [
                    'name' => optional($vehiculo->usuario)->name,
                ],
            ],
            'registros' => $registros->map(function ($surtido) use ($vehiculo) {
                $user = User::find($surtido->user_id);
                $admin = User::find($surtido->admin_id);
                return [
                    'factura' => $surtido->fact_num,
                    'fecha' => $surtido->created_at->format('Y-m-d'),
                    'vehiculo' => $surtido->vehiculo_id,
                    'precio' => 0.5,
                    'km_actual' => $surtido->kilometraje,
                    'recorrido' => $surtido->surtido_ideal,
                    'litros' => $surtido->cant_litros,
                    'total' => $surtido->precio,
                    'observaciones' => $surtido->observaciones,
                    'diferencia' => $surtido->diferencia,
                    'conductor' => $user->name ?? 'Sin conductor',
                    'admin' => $admin->name ?? '-', // Agregado manejo de nulo por si acaso
                ];
            }),
        ]);
    }

    public function exportSelected(Request $request)
    {
        // Validar que lleguen facturas
        $request->validate([
            'facturas' => 'required|array|min:1',
        ]);

        // 1. Obtener los datos
        $facturas = Surtido::whereIn('fact_num', $request->facturas)
            ->orderBy('fact_num')
            ->get();

        if ($facturas->isEmpty()) {
            return response()->json(['error' => 'No hay facturas seleccionadas'], 400);
        }

        // 2. Realizar los cálculos
        $ultimoSurtido = $facturas->last();
        $primerSurtido = $facturas->first();

        // Evitar error si solo hay 1 factura o el km es igual
        $recorrido = ($ultimoSurtido && $primerSurtido)
            ? $ultimoSurtido->kilometraje - $primerSurtido->kilometraje
            : 0;

        // Si el recorrido es 0 o negativo, ponemos 1 para evitar división por cero
        if ($recorrido <= 0) {
            $recorrido = 1;
        }

        $litros = $facturas->sum('cant_litros');
        $valorCarburador = $litros / $recorrido;

        $datosCalculados = [
            'valorCarburador' => $valorCarburador,
            'litros' => $litros,
            'recorrido' => $recorrido,
        ];

        // 3. Generar y descargar el Excel
        // El nombre del archivo se genera dinámicamente
        return Excel::download(
            new GasolinaSelectionExport($facturas, $datosCalculados),
            'Reporte_Gasolina_' . now()->format('Y-m-d_H-i') . '.xlsx'
        );
    }

    public function info(Vehiculo $vehiculo)
    {
        $ids = array_filter([
            $vehiculo->user_id,
            $vehiculo->user_id_adicional_1,
            $vehiculo->user_id_adicional_2,
            $vehiculo->user_id_adicional_3,
        ]);

        $users = User::whereIn('id', $ids)->select('id', 'name')->get();

        $ultimo = Surtido::where('vehiculo_id', $vehiculo->placa)->latest()->first();
        $valorCarburador = $vehiculo->tipo == 'CARRO' ? 0.10 : 0.035;

        return response()->json([
            'kilometraje_anterior' => $ultimo ? $ultimo->kilometraje : null,
            'precio_unitario' => 0.5,
            'valor_carburador' => $valorCarburador,
            'users' => $users
        ]);
    }

    public function store(Request $request, Vehiculo $vehiculo)
    {
        return FlashHelper::try(function () use ($request, $vehiculo) {
            DB::beginTransaction();

            try {
                $validatedData = $request->validate([
                'cant_litros' => 'required|numeric|min:0.1|max:1000',
                'kilometraje' => 'required|numeric|min:0',
                'observaciones' => 'nullable',
                'precio' => 'required|numeric|min:0',
                'user_id' => 'required|exists:users,id'
            ]);

            $valorCarburador = $vehiculo->tipo === 'CARRO' ? 0.10 : 0.035;

                $valorCarburador = $vehiculo->tipo === 'CARRO' ? 0.10 : 0.035;

            if ($UltimoSurtido && (
                $validatedData['kilometraje'] <= $UltimoSurtido->kilometraje
            )) {
                throw new \Exception('Kilometraje inválido: menor o igual al anterior');
            }

            $surtido_ideal = $UltimoSurtido
                ? ($validatedData['kilometraje'] - $UltimoSurtido->kilometraje) * $valorCarburador
                : 0;

            $diferencia = $surtido_ideal - $validatedData['cant_litros'];

            $usuario = User::find($validatedData['user_id']);
            if (!$usuario) throw new \Exception('El vehículo debe tener un conductor asignado');

            $profit = new Gasolina;
            $fact_num = $profit->registrarFacturaConRenglon(
                $validatedData['kilometraje'],
                substr($validatedData['observaciones'], 0, 60),
                $validatedData['precio'],
                $vehiculo->placa,
                $usuario->email,
                substr($request->user()->name, 0, 20),
                $diferencia,
                $validatedData['cant_litros']
            );

            if (!is_numeric($fact_num)) {
                throw new \Exception('No se pudo generar el número de factura');
            }

            Surtido::create([
                'user_id' => $validatedData['user_id'],
                'admin_id' => $request->user()->id,
                'vehiculo_id' => $vehiculo->placa,
                'fact_num' => $fact_num,
                'cant_litros' => $validatedData['cant_litros'],
                'kilometraje' => $validatedData['kilometraje'],
                'surtido_ideal' => $surtido_ideal,
                'observaciones' => $validatedData['observaciones'] ?? null,
                'diferencia' => $diferencia,
                'precio' => $validatedData['precio']
            ]);

            DB::commit();
            } catch (\Throwable $e) {
                DB::rollBack();
                dd($e);
            }
        }, 'Surtido realizado correctamente.', 'Error al registrar el surtido.');
    }
}

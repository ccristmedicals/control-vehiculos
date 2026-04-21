<?php

namespace App\Http\Controllers;

use App\Helpers\NotificacionHelper;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use App\Models\Factura;
use App\Models\Vehiculo;
use App\Services\Multimedia;
use Illuminate\Http\Request;
use App\Models\RenglonFactura;
use App\Models\FacturaAuditoria;
use App\Models\RenglonAuditoria;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Helpers\FlashHelper;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FacturasController extends Controller
{
    /**
     * Listado de facturas para un vehículo.
     */
    public function index(Request $request, Vehiculo $vehiculo)
    {
        // Usamos el origen del vehículo para conectar a la base de datos correcta
        $connection = $vehiculo->origen ?? 'sqlsrv_carros';

        // Filtrar por db_origen evita traer fact_nums de la otra DB que colisionen
        $facturasAuditadasIds = DB::table('auditoria_facturas')
            ->where('vehiculo_id', $vehiculo->placa)
            ->where('db_origen', $connection)
            ->pluck('fact_num')
            ->map(fn($id) => trim($id))
            ->toArray();

        $facturasQuery = DB::connection($connection)->table('factura')
            ->where(function ($query) use ($vehiculo, $facturasAuditadasIds) {
                $query->where('co_cli', $vehiculo->placa);
                if (!empty($facturasAuditadasIds)) {
                    $query->orWhereIn('fact_num', $facturasAuditadasIds);
                }
            })
            ->where('anulada', 0)
            ->whereNotIn('co_tran', ['000003'])
            ->whereDate('fec_emis', '>=', '2025-10-06')
            ->orderByDesc('fact_num')
            ->get();

        $factNums = $facturasQuery->pluck('fact_num')->map(fn($id) => trim((string)$id))->unique()->toArray();

        // Filtrar por db_origen para no mezclar auditorías de distintas bases con mismo fact_num
        $auditoriasLocales = DB::table('auditoria_facturas')
            ->select('fact_num', 'aprobado')
            ->where('db_origen', $connection)
            ->whereIn('fact_num', $factNums)
            ->get()
            ->keyBy(fn($item) => trim((string)$item->fact_num));

        $facturas = $facturasQuery->map(function ($factura) use ($auditoriasLocales) {
            $factNumTrimmed = trim((string)$factura->fact_num);
            $auditoria = $auditoriasLocales->get($factNumTrimmed);

            return [
                'fact_num' => $factura->fact_num,
                'fec_emis' => $factura->fec_emis,
                'co_cli'   => trim($factura->co_cli),
                'tot_bruto'=> $factura->tot_bruto,
                'tot_neto' => $factura->tot_neto,
                'descripcion' => $this->limpiarTexto($factura->descrip ?? ''),
                'aprobado' => $auditoria->aprobado ?? false,
            ];
        });

        $conductor = $vehiculo->load('usuario:id,name')->toArray();
        $user = Auth::user();
        $isAdmin = $user ? $user->hasRole('admin') : false;

        return Inertia::render('facturas', [
            'facturas' => $facturas,
            'vehiculo' => [
                'placa' => $vehiculo->placa,
                'conductor' => $conductor['usuario']['name'] ?? null,
            ],
            'isAdmin' => $isAdmin,
        ]);
    }

    /**
     * Detalle de una factura específica.
     */
    public function show(Request $request, $factura_num)
    {
        // Primero buscamos auditoría local para obtener db_origen y evitar buscar en ambas DBs.
        // Si hay colisión (mismo fact_num en MOTOS y VEHICULO), db_origen discrimina correctamente.
        $facturaAuditada = FacturaAuditoria::where('fact_num', $factura_num)->first();

        $factura = null;
        $connection = $facturaAuditada?->db_origen;

        if ($connection) {
            $factura = DB::connection($connection)->table('factura')->where('fact_num', $factura_num)->first();
        }

        // Sin auditoría previa o no encontrada en la DB registrada: buscar en ambas.
        // Priorizar la DB que coincida con vehiculos.origen para evitar falsos positivos
        // cuando el mismo fact_num existe en MOTOS y VEHICULO.
        if (!$factura) {
            $connection = null;
            $candidatos = [];

            foreach (['sqlsrv_motos', 'sqlsrv_carros'] as $conn) {
                $candidato = DB::connection($conn)->table('factura')->where('fact_num', $factura_num)->first();
                if ($candidato) {
                    $candidatos[$conn] = $candidato;
                }
            }

            if (count($candidatos) === 1) {
                // Solo existe en una DB — sin ambigüedad
                $connection = array_key_first($candidatos);
                $factura = $candidatos[$connection];
            } elseif (count($candidatos) > 1) {
                // Existe en ambas DBs — verificar cada candidato contra vehiculos.origen
                $connection = null;
                foreach ($candidatos as $conn => $candidato) {
                    $vehiculoLocal = Vehiculo::where('placa', trim($candidato->co_cli))->first();
                    if ($vehiculoLocal?->origen === $conn) {
                        $connection = $conn;
                        $factura = $candidato;
                        break;
                    }
                }
                // Sin match en vehiculos local — fallback a sqlsrv_carros
                if (!$connection) {
                    $connection = isset($candidatos['sqlsrv_carros']) ? 'sqlsrv_carros' : array_key_first($candidatos);
                    $factura = $candidatos[$connection];
                }
            }
        }

        if (!$factura) {
            abort(404, 'Factura no encontrada');
        }

        // Re-fetch con db_origen para garantizar que obtenemos la auditoría correcta
        $facturaAuditada = FacturaAuditoria::where('fact_num', $factura->fact_num)
            ->where('db_origen', $connection)
            ->first();

        $renglonesAuditados = RenglonAuditoria::where('fact_num', $factura->fact_num)
            ->where('db_origen', $connection)
            ->get();
        $auditados = $renglonesAuditados->isNotEmpty();

        if ($auditados) {
            // Buscamos las descripciones de los repuestos en Profit para los renglones auditados
            $co_arts = $renglonesAuditados->pluck('co_art')->map(fn($c) => trim($c))->toArray();
            $descripciones = DB::connection($connection)->table('art')
                ->whereIn('co_art', $co_arts)
                ->pluck('art_des', 'co_art')
                ->map(fn($d) => mb_convert_encoding($d, 'UTF-8', 'ISO-8859-1'))
                ->toArray();

            $renglones = $renglonesAuditados->map(function ($r) use ($descripciones) {
                $co_art_trimmed = trim($r->co_art);
                return [
                    'fact_num' => $r->fact_num,
                    'total_art' => $r->total_art,
                    'reng_neto' => $r->reng_neto,
                    'co_art' => $r->co_art,
                    'imagen' => $r->imagen,
                    'imagen_url' => $r->imagen ? Storage::url('uploads/auditorias/' . ltrim($r->imagen, '/')) : null,
                    'repuesto' => [
                        'art_des' => $descripciones[$co_art_trimmed] ?? $descripciones[str_pad($co_art_trimmed, 30)] ?? '—',
                    ],
                ];
            });
        } else {
            $renglones = DB::connection($connection)->table('reng_fac')
                ->leftJoin('art', 'reng_fac.co_art', '=', 'art.co_art')
                ->select('reng_fac.fact_num', 'reng_fac.reng_num', 'reng_fac.co_art', 'reng_fac.total_art', 'reng_fac.reng_neto', 'art.art_des')
                ->where('reng_fac.fact_num', $factura->fact_num)
                ->get()
                ->map(function ($r) {
                    return [
                        'fact_num' => $r->fact_num,
                        'total_art' => $r->total_art,
                        'reng_neto' => $r->reng_neto,
                        'co_art' => $r->co_art,
                        'repuesto' => [
                            'art_des' => isset($r->art_des) ? mb_convert_encoding($r->art_des, 'UTF-8', 'ISO-8859-1') : null,
                        ],
                    ];
                });
        }

        $supervisor = User::find($facturaAuditada?->admin_id)?->name ?? '—';
        $conductor_model = User::find($facturaAuditada?->user_id);
        $conductor = $conductor_model ? $conductor_model->name : '—';
        
        $vehiculo = Vehiculo::where('placa', trim($factura->co_cli))->first();

        $respaldo = [
            'id' => $vehiculo->usuario->id ?? Auth::user()->id,
            'name' => $vehiculo->usuario->name ?? Auth::user()->name
        ];

        $adicionales = [
            User::select('id', 'name')->find($vehiculo?->user_id_adicional_1),
            User::select('id', 'name')->find($vehiculo?->user_id_adicional_2),
            User::select('id', 'name')->find($vehiculo?->user_id_adicional_3)
        ];

        $usuarioQuePaga = $facturaAuditada?->cubre
            ? User::find($facturaAuditada?->cubre_usuario)?->name ?? '—'
            : 'Empresa';

        return Inertia::render('facturas', [
            'factura' => [
                'fact_num' => $factura->fact_num,
                'fec_emis' => $factura->fec_emis,
                'co_cli' => trim($factura->co_cli),
                'tot_bruto' => $factura->tot_bruto,
                'tot_neto' => $factura->tot_neto,
                'descripcion' => $this->limpiarTexto($factura->descrip ?? ''),
                'observaciones_res' => $facturaAuditada->observaciones_res ?? null,
                'observaciones_admin' => $facturaAuditada->observaciones_admin ?? null,
                'aprobado' => (bool) $facturaAuditada?->aprobado,
                'supervisor' => $supervisor,
                'supervisores' => User::role('admin')->whereNotIn('email', [29960819, 26686507, 25025870])->select('id', 'name')->get(),
                'cubre' => (bool) ($facturaAuditada->cubre ?? true),
                'cubre_usuario' => $usuarioQuePaga,
                'kilometraje' => $facturaAuditada->kilometraje ?? null
            ],
            'renglones' => $renglones,
            'auditados' => $auditados,
            'vehiculo' => [
                'placa' => trim($factura->co_cli),
                'conductor' => $conductor,
                'respaldo' => $respaldo,
                'adicionales' => $adicionales
            ],
            'isAdmin' => Auth::user()->hasRole('admin'),
        ]);
    }

    public function storeAuditoria(Request $request, $factura_num)
    {
        // Buscar primero en auditoría local para usar db_origen conocido
        $auditExistente = FacturaAuditoria::where('fact_num', $factura_num)->first();

        $factura = null;
        $connection = $auditExistente?->db_origen;

        if ($connection) {
            $factura = DB::connection($connection)->table('factura')->where('fact_num', $factura_num)->first();
        }

        if (!$factura) {
            $connection = null;
            foreach (['sqlsrv_motos', 'sqlsrv_carros'] as $conn) {
                $factura = DB::connection($conn)->table('factura')->where('fact_num', $factura_num)->first();
                if ($factura) {
                    $connection = $conn;
                    break;
                }
            }
        }

        if (!$factura) {
            return back()->with('error', 'Factura no encontrada');
        }

        return FlashHelper::try(function () use ($request, $factura, $connection) {
            DB::beginTransaction();

            $imagenes = $request->file('imagenes') ?? [];
            if (empty($imagenes)) {
                throw new \Exception('Debes subir al menos una imagen por producto');
            }

            $request->validate([
                'observacion' => 'nullable|string',
                'imagenes.*' => 'image|max:5120',
                'kilometraje' => 'required|numeric'
            ]);

            // db_origen incluido en el lookup para evitar colisión entre MOTOS y VEHICULO
            FacturaAuditoria::updateOrCreate(
                ['fact_num' => trim($factura->fact_num), 'db_origen' => $connection],
                [
                    'vehiculo_id' => trim($factura->co_cli),
                    'user_id' => $request->user()->id,
                    'observaciones_res' => $request->input('observacion'),
                    'kilometraje' => $request->kilometraje,
                    'aprobado' => false
                ]
            );

            $renglonesProfit = DB::connection($connection)->table('reng_fac')
                ->where('fact_num', $factura->fact_num)
                ->get()
                ->keyBy(fn($r) => trim((string)$r->co_art));

            $datos = [];
            $multimedia = new Multimedia;

            foreach ($imagenes as $co_art => $file) {
                $nombre = $multimedia->guardarImagen($file, 'auditorias');

                if (!$nombre) {
                    throw new \Exception("Error al guardar la imagen de {$co_art}");
                }

                $co_art_trimmed = trim((string)$co_art);
                $detalleProfit = $renglonesProfit->get($co_art_trimmed);

                $datos[] = [
                    'fact_num'  => trim($factura->fact_num),
                    'db_origen' => $connection,
                    'co_art'    => $co_art_trimmed,
                    'imagen'    => $nombre,
                    'reng_neto' => $detalleProfit ? $detalleProfit->reng_neto : 0,
                    'total_art' => $detalleProfit ? $detalleProfit->total_art : 0,
                    'reng_num'  => $detalleProfit ? $detalleProfit->reng_num : 0,
                ];
            }

            RenglonAuditoria::insert($datos);
            DB::commit();
        }, 'Auditoría registrada con éxito.', 'Error al registrar la auditoría.');
    }

    public function updateAuditoria(Request $request, FacturaAuditoria $factura)
    {
        $request->merge([
            'aprobado' => filter_var($request->input('aprobado'), FILTER_VALIDATE_BOOLEAN),
            'cubre' => filter_var($request->input('cubre'), FILTER_VALIDATE_BOOLEAN)
        ]);

        return FlashHelper::try(function () use ($request, $factura) {

            $validatedData = $request->validate([
                'aprobado' => 'required|boolean',
                'observaciones_admin' => 'nullable|string',
                'cubre' => 'required|boolean',
                'cubre_usuario' => 'required',
            ]);

            if ($validatedData['cubre_usuario'] == 'Empresa') $validatedData['cubre_usuario'] = null;

            $factura->aprobado = $validatedData['aprobado'];
            $factura->observaciones_admin = $validatedData['observaciones_admin'];
            $factura->admin_id = $request->user()->id;
            $factura->cubre = $validatedData['cubre'];
            $factura->cubre_usuario = $validatedData['cubre_usuario'];

            $factura->save();
        }, 'Auditoría actualizada correctamente.', 'Error al actualizar la auditoría.');
    }

    private function limpiarTexto($texto)
    {
        $limpio = trim(preg_replace('/[\x00-\x1F\x7F].*/u', '', (string)$texto));
        return trim(preg_replace('/D\/.*/u', '', $limpio));
    }
}

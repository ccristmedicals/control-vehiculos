<?php

namespace App\Http\Controllers;

use App\Helpers\FlashHelper;
use Carbon\Carbon;
use Inertia\Inertia;
use App\Models\Vehiculo;
use App\Models\Observacion;
use App\Services\Multimedia;
use Illuminate\Http\Request;
use App\Models\FotoRevisionSemanal;
use App\Models\RevisionesSemanales;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class RevisionSemanalController extends Controller
{
    public function index(Request $request, Vehiculo $vehiculo)
    {
        $vehiculo->load('usuario');

        // Obtener todas las revisiones del vehículo
        $revisiones = RevisionesSemanales::where('vehiculo_id', $vehiculo->placa)
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($revision) {
                // Cargar observación si existe
                $revision->observacion = $revision->observacion_id
                    ? Observacion::find($revision->observacion_id)
                    : null;

                // Cargar imágenes asociadas
                $revision->imagenes = FotoRevisionSemanal::where('revision_semanal_id', $revision->id)
                    ->get()
                    ->map(function ($item) {
                        $basePath = '/storage/uploads/fotos-semanales/';
                        $item->imagen = $basePath . ltrim($item->imagen, '/');
                        return $item;
                    });

                return $revision;
            });
        // dd($revisiones);

        return Inertia::render('revisionSemanal', [
            'vehiculo' => $vehiculo,
            'revisiones' => $revisiones,
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
            DB::beginTransaction();

            $request->validate([
                'semanal' => 'required|array',
                'semanal.*.tipo' => 'required|string',
                'semanal.*.imagen' => 'required|string',
                'observacion' => 'nullable|string',
                'tipo_formulario' => 'required|in:1,2,3'
            ]);

            if ($request->observacion) {
                $observacion = Observacion::create([
                    'user_id' => $request->user()->id,
                    'vehiculo_id' => $vehiculo->placa,
                    'observacion' => $request->observacion,
                    'resuelto' => false
                ]);

                if (!$observacion) throw new \Exception('Error al generar la observación');
            }

            $revision = RevisionesSemanales::create([
                'user_id' => $request->user()->id,
                'vehiculo_id' => $vehiculo->placa,
                'observacion_id' => $observacion->id ?? null,
                'tipo_formulario' => $request->tipo_formulario,
                'revisado' => false,
            ]);

            if (!$revision) throw new \Exception('Error al generar la revisión');

            $datos = [];

            foreach ($request->semanal as $renglon) {
                $datos[] = [
                    'revision_semanal_id' => $revision->id,
                    'imagen' => $renglon['imagen'],
                    'tipo' => $renglon['tipo'],
                    'created_at' => Carbon::today(),
                    'updated_at' => Carbon::today(),
                ];
            }

            FotoRevisionSemanal::insert($datos);
            DB::commit();
        }, 'Revisión semanal realizada correctamente.', 'Error al registrar la revisión semanal.');
    }
}

    // public function store(Request $request, Vehiculo $vehiculo)
    // {
    //     return FlashHelper::try(function () use ($request, $vehiculo) {
    //         $validatedData = $request->validate([
    //             'semanal' => 'required|array',
    //             'semanal.*.tipo' => 'required|string',
    //             'semanal.*.imagen' => 'required|image|max:5120',
    //             'semanal.*.observacion' => 'nullable|string',
    //         ]);

    //         $multimedia = new Multimedia;
    //         $datos = [];

    //         foreach ($validatedData['semanal'] as $revision) {
    //             $imagen = $multimedia->guardarImagen($revision['imagen'], 'semanal');

    //             if (!$imagen) {
    //                 throw new Exception('Error al guardar la imagen');
    //             }

    //             $datos[] = [
    //                 'vehiculo_id' => $vehiculo->placa,
    //                 'user_id' => Auth::id(),
    //                 'imagen' => $imagen,
    //                 'tipo' => $revision['tipo'],
    //                 'observacion' => $revision['observacion'] ?? '',
    //                 'created_at' => Carbon::today(),
    //                 'updated_at' => Carbon::today(),
    //             ];

    //             if (!empty($revision['observacion'])) {
    //                 $observacion = Observacion::create([
    //                     'user_id' => Auth::id(),
    //                     'vehiculo_id' => $vehiculo->placa,
    //                     'observacion' => $revision['observacion'],
    //                     'resuelto' => false,
    //                 ]);

    //                 if (!$observacion) {
    //                     throw new Exception('Error al registrar la observación');
    //                 }

    //                 NotificacionHelper::emitirObservacionAgregada(
    //                     $vehiculo->placa,
    //                     $request->user()->name,
    //                     $revision['observacion'],
    //                     'pendiente'
    //                 );
    //             }
    //         }

    //         RevisionesSemanales::insert($datos);
    //     }, 'Revisión semanal cargada correctamente.', 'Error al registrar la revisión semanal.');
    // }

    // public function store(Request $request, Vehiculo $vehiculo)
    // {
    //     return FlashHelper::try(function () use ($request, $vehiculo) {
    //         if (!$request->hasFile('imagen')) {
    //             throw new \Exception('Debe subir un video a la plataforma');
    //         }

    //         $request->validate([
    //             'video' => 'required|mimes:mp4,ogx,oga,ogv,ogg,webm',
    //         ]);

    //         // $KilometrajeFinal = RevisionesSemanales::select('kilometraje_final')->where('vehiculo_id', $vehiculo->placa)->latest()->first();

    //         // if($KilometrajeFinal && $KilometrajeFinal !== $validatedData['kilometraje_inicial']){
    //         //     return back()->with('error', 'El kilometraje no concuerda con el de la semana pasada, comunicarse con un administrador');   
    //         // }

    //         $videoPath = $request->file('video')->store('uploads/videos-semanales', 'public');
    //         $extension = "." . pathinfo($videoPath, PATHINFO_EXTENSION);
    //         $videoName = pathinfo($videoPath, PATHINFO_FILENAME) . $extension;

    //         RevisionesSemanales::create([
    //             'vehiculo_id' => $vehiculo->placa,
    //             'user_id' => Auth::id(),
    //             'video' => $videoName,
    //         ]);

    //     }, 'Revisión semanal cargada correctamente.', 'Error al registrar la revisión semanal.');
    // }

    // public function update(Request $request, Vehiculo $vehiculo, RevisionesSemanales $revision)
    // {
    //     $validatedData = $request->validate([
    //         'video_final' => 'required|mimes:mp4,ogx,oga,ogv,ogg,webm',
    //         'kilometraje_final' => 'required|numeric'
    //     ]);

    //     if ($validatedData['kilometraje_final'] < $revision->kilometraje_inicial) {
    //         return back()->with('error', 'El kilometraje final no puede ser menor al inicial');
    //     }

    //     $videoPath = $request->file('video_final')->store('uploads/videos-semanales', 'public');
    //     $extension = "." . pathinfo($videoPath, PATHINFO_EXTENSION);
    //     $videoName = pathinfo($videoPath, PATHINFO_FILENAME) . $extension;

    //     $validatedData['video_final'] = $videoName;
    //     $respuesta = $revision->update($validatedData);

    //     if(!$respuesta){
    //         return back()->with('error', 'Error al realizar la revision');
    //     }

    //     return back()->with('success', 'Revision realizada correctamente');
    // }   
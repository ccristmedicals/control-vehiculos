<?php

namespace App\Http\Controllers;

use App\Helpers\NotificacionHelper;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\Multimedia;
use App\Helpers\FlashHelper;
use Carbon\Carbon;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $usuarios = User::whereDoesntHave('roles', function ($query) {
            $query->where('name', 'admin');
        })->get()->map(function ($user) {
            $documentos = [
                'cedula',
                'licencia',
                'certificado_medico',
            ];

            $usuario = $user->toArray();

            // Rutas completas para fotos
            foreach ($documentos as $doc) {
                $foto = "foto_$doc";
                if (!empty($usuario[$foto])) {
                    $usuario[$foto] = '/storage/uploads/fotos-documentos/' . ltrim($usuario[$foto], '/');
                }
            }

            // Verifica si todos los documentos están subidos
            $usuario['documentos_completos'] = collect($documentos)->every(function ($doc) use ($usuario) {
                return !empty($usuario["foto_$doc"]);
            });

            return $usuario;
        });

        return Inertia::render('dashboardUsuarios', [
            'usuarios' => $usuarios
        ]);
    }

    public function show(Request $request, User $user)
    {
        $documentos = [
            'cedula',
            'licencia',
            'certificado_medico',
        ];

        $usuario = $user->toArray();

        foreach ($documentos as $doc) {
            $foto = "foto_$doc";
            if (!empty($usuario[$foto])) {
                $usuario[$foto] = '/storage/uploads/fotos-documentos/' . ltrim($usuario[$foto], '/');
            }
        }

        return Inertia::render('perfilUsuario', [
            'usuario' => $usuario
        ]);
    }

    public function update(Request $request, User $user)
    {
        return FlashHelper::try(function () use ($request, $user) {
            $documentos = [
                'cedula',
                'licencia',
                'certificado_medico',
            ];

            $rules = ['zona' => 'nullable|string'];

            foreach ($documentos as $doc) {
                $rules["foto_$doc"] = 'nullable|file|mimes:jpeg,png,jpg,webp';
                $rules["vencimiento_$doc"] = 'nullable|date';
            }

            $validatedData = $request->validate($rules);
            $multimedia = new Multimedia();

            foreach ($validatedData as $key => $value) {
                if ($value instanceof \Illuminate\Http\UploadedFile) {
                    $nameImage = $multimedia->guardarImagen($value, 'documentos');
                    if (!$nameImage) {
                        throw new \Exception("Error al almacenar el documento: $key");
                    }
                    $validatedData[$key] = $nameImage;
                }
            }

            $user->update($validatedData);

            // Notificación por vencimiento
            foreach ($documentos as $doc) {
                $campoVencimiento = "vencimiento_$doc";
                if (isset($validatedData[$campoVencimiento])) {
                    $fecha = Carbon::parse($validatedData[$campoVencimiento])->startOfDay();
                    $diasRestantes = Carbon::today()->diffInDays($fecha, false);

                    // if ($diasRestantes <= 15) {
                    //     NotificacionHelper::emitirDocumentoUsuarioPorVencer(
                    //         $user->id,
                    //         $user->name,
                    //         ucfirst($doc),
                    //         $fecha->toDateString()
                    //     );
                    // }
                }
            }
        }, 'Documentos actualizados correctamente.', 'Error al actualizar los documentos.');
    }
}

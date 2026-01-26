<?php

namespace App\Http\Controllers;

use App\Helpers\FlashHelper;
use App\Models\User;
use Illuminate\Http\Request;

class TipoUsuarioController extends Controller
{
    public function index()
    {
        return view('asignar-tipo');
    }

    public function assign(Request $request)
    {
        return FlashHelper::try(function () use ($request) {
            $request->validate([
                'email' => 'required|exists:users,email',
                'tipo' => 'required|in:moto,carro'
            ]);

            $user = User::where('email', $request->email)->first();
            if (! $user) {
                throw new \Exception('Usuario no encontrado');
            }

            $user->tipo = strtoupper($request->tipo);
            $user->save();
        }, 'Tipo de usuario asignado correctamente.', 'Error al asignar el tipo de usuario.');
    }
}

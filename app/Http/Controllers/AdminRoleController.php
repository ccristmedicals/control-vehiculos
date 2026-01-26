<?php

namespace App\Http\Controllers;

use App\Helpers\FlashHelper;
use App\Services\AdminRoleAssigner;
use Illuminate\Http\Request;

class AdminRoleController extends Controller
{
    public function index()
    {
        return view('asignar');
    }

    public function assign(Request $request)
    {
        return FlashHelper::try(function () use ($request) {
            $request->validate([
                'email' => 'required|exists:users,email'
            ]);

            $success = AdminRoleAssigner::assignToUser($request->email);

            if (! $success) {
                throw new \Exception('No se encontró el usuario');
            }
        }, 'Rol admin asignado correctamente.', 'No se pudo asignar el rol.');
    }
}

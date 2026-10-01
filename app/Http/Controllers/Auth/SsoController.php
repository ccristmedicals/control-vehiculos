<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Firebase\JWT\ExpiredException;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\SignatureInvalidException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use UnexpectedValueException;

class SsoController extends Controller
{
    /**
     * Recibe el token SSO firmado por el ERP central (pharma-erp), verifica
     * su firma HS256, y autentica (creando el usuario local si hace falta)
     * al usuario correspondiente a `employee_id` (código de empleado en
     * MasterProfit).
     */
    public function callback(Request $request): RedirectResponse
    {
        $token = $request->query('token', '');

        if (! $token) {
            return redirect()->route('login')->with('status', 'No se recibió el token de acceso. Intenta ingresar de nuevo desde el ERP.');
        }

        $secret = config('services.erp_sso.secret');

        if (! $secret) {
            report(new \RuntimeException('ERP_SSO_SECRET no está configurado.'));

            return redirect()->route('login')->with('status', 'El inicio de sesión desde el ERP no está configurado en este servidor.');
        }

        try {
            $payload = JWT::decode($token, new Key($secret, 'HS256'));
        } catch (ExpiredException|SignatureInvalidException|UnexpectedValueException $e) {
            return redirect()->route('login')->with('status', 'El enlace de acceso expiró o no es válido. Vuelve a intentarlo desde el ERP.');
        }

        if (($payload->iss ?? null) !== 'cristmedicals-erp') {
            return redirect()->route('login')->with('status', 'El enlace de acceso no es válido.');
        }

        $employeeId = $payload->employee_id ?? null;

        if (! $employeeId) {
            return redirect()->route('login')->with('status', 'El token de acceso no trae un empleado válido.');
        }

        $user = User::firstWhere('employee_id', $employeeId);

        if ($user) {
            $user->fill([
                'name' => $payload->full_name ?? $user->name,
                'email' => $payload->email ?? $user->email,
            ])->save();
        } else {
            $user = User::create([
                'employee_id' => $employeeId,
                'name' => $payload->full_name ?? $employeeId,
                'email' => $payload->email ?? $employeeId,
                'password' => Hash::make(Str::random(40)),
            ]);
        }

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()->route('dashboard');
    }
}

<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $usuariosPermitidos = [
            '26686507',
            '29960819',
            '25025870',
        ];

        if (in_array($request->user()->email, $usuariosPermitidos)) {
            return $next($request);
        }
        abort(403, 'Que paso papá?');
    }
}

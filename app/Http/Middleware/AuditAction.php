<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuditAction
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $action, $model = null): Response
    {
        $response = $next($request);

        try {
            ActivityLog::create([
                'name' => Auth::user()->name,
                'accion' => $action,
                'modelo' => $model,
                'subject_type' => $request->route()->getController()::class ?? 'Ruta',
                'subject_id' => $request->route('id') ?? null,
                'descripcion' => 'Acción registrada automáticamente desde middleware',
            ]);
        } catch (\Throwable $e) {
            report($e);
        }

        return $response;
    }
}

<?php

namespace App\Helpers;

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class FlashHelper
{
    /**
     * Clases de excepción "de negocio": las lanzan los controladores a propósito
     * con `throw new \Exception('mensaje para el usuario')`. Su mensaje SÍ se le
     * muestra al usuario. Cualquier otra subclase (QueryException, etc.) se trata
     * como error inesperado y se oculta el detalle.
     */
    private const DOMAIN_EXCEPTIONS = [
        \Exception::class,
        \RuntimeException::class,
        \DomainException::class,
        \InvalidArgumentException::class,
        \LogicException::class,
        \UnexpectedValueException::class,
    ];

    /**
     * Ejecuta una acción y retorna un redirect con mensaje flash.
     *
     * - Las excepciones que el framework convierte en respuesta (validación, 404,
     *   403, abort()) se relanzan para que Laravel/Inertia las maneje: así los
     *   errores de validación por campo llegan al formulario.
     * - Las excepciones de negocio (ver DOMAIN_EXCEPTIONS) muestran su propio
     *   mensaje al usuario.
     * - Todo lo demás se registra y se muestra el mensaje genérico.
     */
    public static function try(callable $callback, string $successMsg, string $errorMsg = 'Ocurrió un error inesperado.'): RedirectResponse
    {
        try {
            $callback();
            return back()->with('success', $successMsg);
        } catch (ValidationException | HttpResponseException | HttpExceptionInterface | AuthorizationException | AuthenticationException | ModelNotFoundException $e) {
            throw $e;
        } catch (\Throwable $e) {
            if (in_array(get_class($e), self::DOMAIN_EXCEPTIONS, true)) {
                return back()->with('error', $e->getMessage() ?: $errorMsg);
            }

            report($e);
            return back()->with('error', $errorMsg);
        }
    }
}

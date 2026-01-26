<?php

namespace App\Helpers;

// use App\Events\ChequeoOmitido;
// use App\Events\DocumentoUsuarioPorVencer;
// use App\Events\EventoCambioInputs;
// use App\Events\EventoAsignacionUsuario;
// use App\Events\EventoNivelBajo;
// use App\Events\EventoPermisoPorVencer;
// use App\Events\ImagenFacturaSubida;
// use App\Events\NotificacionPush;
// use App\Events\ObservacionAgregada;
// use App\Events\VideoSemanalOmitido;
use App\Models\Notificacion;
use App\Models\User;
use App\Models\Vehiculo;

class NotificacionHelper
{

    // private static function vehiculoTieneUsuario(string $placa): bool
    // {
    //     $vehiculo = Vehiculo::find($placa);
    //     return $vehiculo && $vehiculo->user_id;
    // }

    // private static function mapCampo(string $formType, string $tipoVehiculo, string $fieldId): string
    // {
    //     $normalized = ucfirst(strtolower($formType));

    //     return match ($normalized) {
    //         'Accesorios' => self::mapAccesorio($tipoVehiculo, $fieldId),
    //         'Piezas' => self::mapPieza($tipoVehiculo, $fieldId),
    //         default => "Campo {$fieldId}",
    //     };
    // }

    // private static function mapAccesorio(string $tipoVehiculo, string $fieldId): string
    // {
    //     $map = [
    //         'CARRO' => [
    //             '1' => 'Caja de Herramienta',
    //             '2' => 'Conos de seguridad',
    //             '3' => 'Cuña',
    //             '4' => 'Extintor',
    //             '5' => 'Gato',
    //             '6' => 'Llave de cruz',
    //             '7' => 'Linterna',
    //             '8' => 'Repuesto',
    //         ],
    //         'MOTO' => [
    //             '1' => 'Caja de Herramienta',
    //             '2' => 'Linterna',
    //         ],
    //     ];

    //     return $map[$tipoVehiculo][$fieldId] ?? "Campo {$fieldId}";
    // }

    // private static function mapEstado(string|int $value): string
    // {
    //     return match ((string) $value) {
    //         '0' => 'BUENO',
    //         '1' => 'MALO',
    //         '2' => 'NO POSEE',
    //         default => "Valor {$value}",
    //     };
    // }

    // private static function mapPieza(string $tipoVehiculo, string $fieldId): string
    // {
    //     $map = [
    //         'CARRO' => [
    //             '1' => 'Aire Acondicionado',
    //             '2' => 'Caucho Delantero Der.',
    //             '3' => 'Caucho Delantero Izq.',
    //             '4' => 'Caucho Tracero Der.',
    //             '5' => 'Caucho Tracero Izq.',
    //             '6' => 'Cepillos Limpia Parabrisas',
    //             '7' => 'Cerraduras de Puertas',
    //             '8' => 'Cinturones de Seguridad',
    //             '9' => 'Espejo Interior de Cabina',
    //             '10' => 'Espejo Retovisor Der.',
    //             '11' => 'Espejo Retovisor Izq.',
    //             '12' => 'Estado de la Batería',
    //             '13' => 'Estado de los Bornes de Batería',
    //             '14' => 'Estado de la Carrocería',
    //             '15' => 'Estado del Parachoques',
    //             '16' => 'Estado de la Pintura',
    //             '17' => 'Estado del Guardapolvos',
    //             '18' => 'Estados de los Recipientes de Fluidos',
    //             '19' => 'Estado del Sistema de Enfriamiento',
    //             '20' => 'Gomas de las Puertas y Ventanas',
    //             '21' => 'Luces de los Cruces Delanteros',
    //             '22' => 'Luces de los Cruces Traceros',
    //             '23' => 'Luces de los Frenos',
    //             '24' => 'Luces de Neblina',
    //             '25' => 'Luces de los Retroceso',
    //             '26' => 'Luces Delanteras Altas',
    //             '27' => 'Luces Delanteras Bajas',
    //             '28' => 'Luces Intermitentes Delanteras',
    //             '29' => 'Luces Intermitentes Traceras',
    //             '30' => 'Luces Internas',
    //             '31' => 'Luces Testigo',
    //             '32' => 'Manijas de las Puertas',
    //             '33' => 'Manijas de las Ventanas',
    //             '34' => 'Vidrios Laterales Delanteros',
    //             '35' => 'Vidrios Laterales Traceros',
    //             '36' => 'Vidrio Parabrisas',
    //             '37' => 'Pito',
    //             '38' => 'Revisión de Esparragos',
    //             '39' => 'Tablero',
    //             '40' => 'Tapetes',
    //             '41' => 'Tapicería',
    //         ],
    //         'MOTO' => [
    //             '1' => 'Caucho Delantero',
    //             '2' => 'Caucho Tracero',
    //             '3' => 'Espejo Retovisor Der.',
    //             '4' => 'Espejo Retovisor Izq.',
    //             '5' => 'Estado de la Batería',
    //             '6' => 'Estado de los Bornes de Batería',
    //             '7' => 'Estado de la Carrocería',
    //             '8' => 'Estado de la Pintura',
    //             '9' => 'Estado del Guardapolvos',
    //             '10' => 'Estados de los Recipientes de Fluidos',
    //             '11' => 'Estado del Sistema de Enfriamiento',
    //             '12' => 'Luces de los Cruces Delanteros',
    //             '13' => 'Luces de los Cruces Traceros',
    //             '14' => 'Luces de los Frenos',
    //             '15' => 'Luces Exploradoras',
    //             '16' => 'Luces Delanteras Altas',
    //             '17' => 'Luces Delanteras Bajas',
    //             '18' => 'Luces Intermitentes Delanteras',
    //             '19' => 'Luces Intermitentes Traceras',
    //             '20' => 'Pito',
    //             '21' => 'Tablero',
    //         ],
    //     ];

    //     return $map[$tipoVehiculo][$fieldId] ?? "Pieza {$fieldId}";
    // }


    /**
     * Emite y guarda una notificación de cambio de inputs
     */

    // public static function emitirCambioCritico(string $field, int|string $value, string $formType, string $placa, string $userName): void
    // {
    //     $vehiculo = Vehiculo::find($placa);
    //     if (!$vehiculo || !$vehiculo->user_id) {
    //         return;
    //     }

    //     $tipoVehiculo = strtoupper($vehiculo->tipo ?? 'CARRO');
    //     $campo = self::mapCampo($formType, $tipoVehiculo, $field);
    //     $estado = self::mapEstado($value);

    //     // broadcast(new EventoCambioInputs($field, $value, $placa, $userName, $tipoVehiculo, $formType))->toOthers();

    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Cambio crítico en formulario',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "{$userName} marcó el campo '{$campo}' como '{$estado}' en el formulario '{$formType}' del vehículo '{$placa}'.",
    //         'tipo' => 'cambioInput',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);

    //     // broadcast(new NotificacionPush($admin->id))->toOthers();
    // }

    /**
     * Emite y guarda una notificación de asignacion de usuario
     */

    // public static function emitirAsignacionUsuario(string $placa, string $adminName, string $nuevoUsuario): void
    // {
    //     // broadcast(new EventoAsignacionUsuario($placa, $adminName, $nuevoUsuario))->toOthers();

    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Reasignación de usuario',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "El administrador {$adminName} reasignó el vehículo '{$placa}' al usuario {$nuevoUsuario}.",
    //         'tipo' => 'reasignacion',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);
    //     // broadcast(new NotificacionPush($admin->id))->toOthers();
    // }

    /**
     * Emite y guarda una notificación de nivel de fluido bajo.
     */
    // public static function emitirNivelBajo(string $placa, string $userName, string $campo, string $formulario): void
    // {
    //     if (!self::vehiculoTieneUsuario($placa)) return;

    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Nivel de Fluido Bajo',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "El vehículo '{$placa}' tiene un nivel bajo en el campo '{$campo}' del formulario '{$formulario}'. Notificado por '{$userName}'.",
    //         'tipo' => 'nivelFluido',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);

    //     // broadcast(new EventoNivelBajo($placa, $userName, $campo, $formulario))->toOthers();
    // }


    /**
     * Emite y guarda una notificación de chequeo omitido.
     */
    // public static function emitirChequeoOmitido(string $placa, string $userName, string $fecha): void
    // {
    //     if (!self::vehiculoTieneUsuario($placa)) return;

    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Chequeo Omitido',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "El vehículo '{$placa}' no realizó el chequeo programado para el {$fecha}. Responsable: '{$userName}'.",
    //         'tipo' => 'chequeoOmitido',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);

    //     // broadcast(new ChequeoOmitido($placa, $userName, $fecha))->toOthers();
    // }


    /**
     * Emite y guarda una notificación de permiso por vencer.
     */
    // public static function emitirPermisoPorVencer(string $placa, string $userName, string $permiso, string $fechaVencimiento): void
    // {
    //     if (!self::vehiculoTieneUsuario($placa)) return;

    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Permiso por Vencer',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "El permiso '{$permiso}' del vehículo '{$placa}' vence pronto, el {$fechaVencimiento}. Responsable: '{$userName}'.",
    //         'tipo' => 'permiso',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);

    //     // broadcast(new EventoPermisoPorVencer($placa, $userName, $permiso, $fechaVencimiento))->toOthers();
    // }


    /**
     * Emite y guarda una notificación de video semanal omitido.
     */
    // public static function emitirVideoSemanalOmitido(string $placa, string $userName, string $semana): void
    // {
    //     if (!self::vehiculoTieneUsuario($placa)) return;

    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Video Semanal Omitido',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "El usuario '{$userName}' ha omitido el video semanal del vehículo '{$placa}' correspondiente a la semana {$semana}.",
    //         'tipo' => 'revisionSemanal',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);

    //     // broadcast(new VideoSemanalOmitido($placa, $userName, $semana))->toOthers();
    // }


    /**
     * Emite y guarda una notificación cuando se agrega una observación.
     */
    // public static function emitirObservacionAgregada(string $placa, string $userName, string $contenido, string $estado): void
    // {
    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Nueva Observación Agregada',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "El usuario '{$userName}' agregó una observación al vehículo '{$placa}' con estado '{$estado}': \"{$contenido}\"",
    //         'tipo' => 'observacion',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);
    //     // broadcast(new ObservacionAgregada($placa, $userName, $contenido, $estado))->toOthers();
    // }

    /**
     * Emite y guarda una notificación de documento personal por vencer.
     */
    // public static function emitirDocumentoUsuarioPorVencer(int $usuario, string $userName, string $documento, string $fechaVencimiento): void
    // {
    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Documento por Vencer',
    //         'descripcion' => "El documento '{$documento}' del usuario '{$userName}' vence el {$fechaVencimiento}.",
    //         'tipo' => 'documentoUsuario',
    //         'usuario_id' => $usuario,
    //         'solo_admin' => true,
    //     ]);

    //     // broadcast(new DocumentoUsuarioPorVencer($usuario, $userName, $documento, $fechaVencimiento))->toOthers();
    // }

    /**
     * Emite y guarda una notificación de Imagen de factura subida por usuario.
     */
    // public static function emitirImagenFacturaSubida(string $placa, string $userName, string $factNum, int $cantidad): void
    // {
    //     $admin = User::role('admin')->first();

    //     Notificacion::create([
    //         'titulo' => 'Imágenes subidas a factura',
    //         'vehiculo_id' => $placa,
    //         'descripcion' => "El usuario '{$userName}' subió la imagen a la factura #{$factNum} del vehículo '{$placa}'.",
    //         'tipo' => 'auditoria',
    //         'usuario_id' => $admin->id,
    //         'solo_admin' => true,
    //     ]);

    //     // broadcast(new ImagenFacturaSubida($placa, $userName, $factNum, $cantidad))->toOthers();
    // }
}

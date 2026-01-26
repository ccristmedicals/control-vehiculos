<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ConsultaSQL
{
    public function obtenerExpediente($userId, $placa)
    {
        // Accesorios
        $accesorios = DB::table('accesorios')->pluck('accesorio');
        $columnasAccesorios = $accesorios->map(function ($accesorio) {
            return "MAX(CASE WHEN a.accesorio = '$accesorio' THEN va.estado ELSE NULL END) AS 'accesorio_estado_$accesorio', MAX(CASE WHEN a.accesorio = '$accesorio' THEN va.observaciones ELSE NULL END) AS 'accesorio_observacion_$accesorio'";
        })->implode(', ');

        // Piezas
        $piezas = DB::table('piezas')->pluck('pieza');
        $columnasPiezas = $piezas->map(function ($pieza) {
            return "MAX(CASE WHEN pz.pieza = '$pieza' THEN vp.estado ELSE NULL END) AS 'pieza_estado_$pieza', MAX(CASE WHEN pz.pieza = '$pieza' THEN vp.observaciones ELSE NULL END) AS 'pieza_observacion_$pieza'";
        })->implode(', ');

        // Permisos
        $permisos = DB::table('permisos')->pluck('permiso');
        $columnasPermisos = $permisos->map(function ($permiso) {
            return "MAX(CASE WHEN pm.permiso = '$permiso' THEN vpms.fecha_vencimiento ELSE NULL END) AS 'permiso_vencimiento_$permiso', MAX(CASE WHEN pm.permiso = '$permiso' THEN vpms.fecha_expedicion ELSE NULL END) AS 'permiso_expedicion_$permiso', MAX(CASE WHEN pm.permiso = '$permiso' THEN vpms.estado ELSE NULL END) AS 'permiso_estado_$permiso'";
        })->implode(', ');

        // Especificaciones
        $especificaciones = DB::table('especificaciones')->pluck('especificacion');
        $columnasEspecificaciones = $especificaciones->map(function ($especificacion) {
            return "MAX(CASE WHEN es.especificacion = '$especificacion' THEN ve.estado ELSE NULL END) AS 'especificacion_$especificacion'";
        })->implode(', ');

        $todasLasColumnas = collect([
            $columnasAccesorios,
            $columnasPiezas,
            $columnasPermisos,
            $columnasEspecificaciones
        ])->filter()->implode(', ');

        $consultaSQL = "WITH ultimos_accesorios AS (
            SELECT va.* FROM vehiculo_accesorios va
            INNER JOIN (
                SELECT vehiculo_id, accesorio_id, MAX(fecha_verificacion) AS max_fecha
                FROM vehiculo_accesorios
                GROUP BY vehiculo_id, accesorio_id
            ) va2 ON va.vehiculo_id = va2.vehiculo_id AND va.accesorio_id = va2.accesorio_id AND (va.fecha_verificacion = va2.max_fecha OR va.fecha_verificacion IS NULL)
        ),
        ultimas_piezas AS (
            SELECT vp.* FROM vehiculo_piezas vp
            INNER JOIN (
                SELECT vehiculo_id, pieza_id, MAX(fecha_verificacion) AS max_fecha
                FROM vehiculo_piezas
                GROUP BY vehiculo_id, pieza_id
            ) vp2 ON vp.vehiculo_id = vp2.vehiculo_id AND vp.pieza_id = vp2.pieza_id AND (vp.fecha_verificacion = vp2.max_fecha OR vp.fecha_verificacion IS NULL)
        ),
        ultimos_permisos AS (
            SELECT vpms.* FROM vehiculo_permisos vpms
            INNER JOIN (
                SELECT vehiculo_id, permiso_id, MAX(fecha_vencimiento) AS max_fecha
                FROM vehiculo_permisos
                GROUP BY vehiculo_id, permiso_id
            ) vpms2 ON vpms.vehiculo_id = vpms2.vehiculo_id AND vpms.permiso_id = vpms2.permiso_id AND (vpms.fecha_vencimiento = vpms2.max_fecha OR vpms.fecha_vencimiento IS NULL)
        ),
        ultimas_especificaciones AS (
            SELECT ve.* FROM vehiculo_especificaciones ve
            INNER JOIN (
                SELECT vehiculo_id, especificacion_id, MAX(fecha_verificacion) AS max_fecha
                FROM vehiculo_especificaciones
                GROUP BY vehiculo_id, especificacion_id
            ) ve2 ON ve.vehiculo_id = ve2.vehiculo_id AND ve.especificacion_id = ve2.especificacion_id AND (ve.fecha_verificacion = ve2.max_fecha OR ve.fecha_verificacion IS NULL)
        )
        SELECT
            v.placa, v.tipo, v.modelo, u.name AS responsable, $todasLasColumnas
        FROM vehiculos v
        JOIN users u ON v.user_id = u.id
        -- Accesorios
        LEFT JOIN ultimos_accesorios va ON v.placa = va.vehiculo_id
        LEFT JOIN accesorios a ON va.accesorio_id = a.id
        -- Piezas
        LEFT JOIN ultimas_piezas vp ON v.placa = vp.vehiculo_id
        LEFT JOIN piezas pz ON vp.pieza_id = pz.id
        -- Permisos
        LEFT JOIN ultimos_permisos vpms ON v.placa = vpms.vehiculo_id
        LEFT JOIN permisos pm ON vpms.permiso_id = pm.id
        -- Especificaciones
        LEFT JOIN ultimas_especificaciones ve ON v.placa = ve.vehiculo_id
        LEFT JOIN especificaciones es ON ve.especificacion_id = es.id
        WHERE v.user_id = ? AND v.placa = ?
        GROUP BY v.placa, v.tipo, v.modelo, u.name";

        return DB::select($consultaSQL, [$userId, $placa]);
    }
}

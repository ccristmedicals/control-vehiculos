<?php

namespace App\Services;

use App\Models\Vehiculo;
use Illuminate\Support\Facades\DB;

class DatabaseConnectionManager
{
    /**
     * Get the external database connection name for a given vehicle.
     *
     * @param Vehiculo|string $vehiculo
     * @return string
     */
    public static function getConnectionForVehiculo($vehiculo): string
    {
        if (is_string($vehiculo)) {
            $vehiculo = Vehiculo::where('placa', $vehiculo)->first();
        }

        if (!$vehiculo || !$vehiculo->origen) {
            // Default to sqlsrv if no origin is found (old records or not found)
            return 'sqlsrv_carros';
        }

        return $vehiculo->origen;
    }

    /**
     * Get a query builder for an external table based on a vehicle.
     *
     * @param string $table
     * @param Vehiculo|string $vehiculo
     * @return \Illuminate\Database\Query\Builder
     */
    public static function externalTable(string $table, $vehiculo)
    {
        $connection = self::getConnectionForVehiculo($vehiculo);
        return DB::connection($connection)->table($table);
    }
}

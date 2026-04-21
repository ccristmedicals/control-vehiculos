<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Repuesto extends Model
{
    // Default connection — controller overrides via DB::connection($vehiculo->origen)
    protected $connection = 'sqlsrv_carros';
    protected $table = 'art';   // o el nombre real de la tabla
    protected $keyType = 'string';
    protected $primaryKey = 'co_art'; // si el código es la clave primaria
}

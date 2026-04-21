<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RenglonFactura extends Model
{
    // Default connection — controller overrides via DB::connection($vehiculo->origen)
    protected $connection = 'sqlsrv_carros';
    protected $table = 'reng_fac';
    protected $keyType = 'string';
    protected $primaryKey = 'fact_num';

    public function repuesto()
    {
        return $this->belongsTo(Repuesto::class, 'co_art', 'co_art');
    }
}

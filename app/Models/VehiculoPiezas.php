<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehiculoPiezas extends Model
{
    protected $table = 'vehiculo_piezas';

    public $timestamps = false;

    protected $fillable = [
        'vehiculo_id',
        'pieza_id',
        'estado',
        'observaciones',
        'user_id',
        'fecha_verificacion',
    ];

    protected $casts = [
        'estado' => 'string',
        'observaciones' => 'string',
    ];

    /**
     * Relación con la pieza.
     */
    public function pieza(): BelongsTo
    {
        return $this->belongsTo(Pieza::class, 'pieza_id');
    }

    /**
     * Relación con el vehículo (por placa).
     */
    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id', 'placa');
    }

    /**
     * Relación con el usuario que registró la revisión.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

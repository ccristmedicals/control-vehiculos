<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehiculoEspecificaciones extends Model
{
    protected $table = 'vehiculo_especificaciones';
    
    protected $fillable = [
        'user_id',
        'vehiculo_id',
        'especificacion_id',
        'estado',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con el vehículo (por placa).
     */
    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id', 'placa');
    }

    /**
     * Relación con la especificación técnica.
     */
    public function especificacion(): BelongsTo
    {
        return $this->belongsTo(Especificacion::class, 'especificacion_id');
    }

    /**
     * Scope para filtrar por vehículo.
     */
    public function scopePorVehiculo($query, string $placa)
    {
        return $query->where('vehiculo_id', $placa);
    }
}

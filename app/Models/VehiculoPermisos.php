<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehiculoPermisos extends Model
{
    protected $table = 'vehiculo_permisos';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'vehiculo_id',
        'permiso_id',
        'estado',
        'documento',
        'fecha_expedicion',
        'fecha_vencimiento',
        'valor_texto',
    ];

    protected $casts = [
        'fecha_expedicion' => 'datetime',
        'fecha_vencimiento' => 'datetime',
        'estado' => 'boolean',
    ];

    /**
     * Asigna automáticamente el estado según la fecha de vencimiento.
     */
    protected static function booted()
    {
        static::saving(function ($permiso) {
            if ($permiso->fecha_vencimiento) {
                $permiso->estado = now()->lt($permiso->fecha_vencimiento);
            }
        });
    }

    /**
     * Relación con el permiso (catálogo).
     */
    public function permiso(): BelongsTo
    {
        return $this->belongsTo(Permiso::class, 'permiso_id');
    }

    /**
     * Relación con el vehículo (por placa).
     */
    public function vehiculo(): BelongsTo
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id', 'placa');
    }

    /**
     * Relación con el usuario que registró el permiso.
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Etiqueta visual del estado (para dashboards o formularios).
     */
    public function getEstadoLabelAttribute(): string
    {
        return match (true) {
            !$this->fecha_vencimiento => 'Sin vencimiento',
            now()->gt($this->fecha_vencimiento) => 'Vencido',
            now()->diffInDays($this->fecha_vencimiento) <= 30 => 'Por vencer',
            default => 'Vigente',
        };
    }

    /**
     * Devuelve el permiso en formato plano para el frontend.
     */
    public function toPlano(): array
    {
        $nombre = $this->permiso->nombre ?? 'permiso_' . $this->permiso_id;

        return $this->valor_texto !== null
            ? [$nombre => $this->valor_texto]
            : [
                "{$nombre}_expedicion" => optional($this->fecha_expedicion)->format('Y-m-d'),
                "{$nombre}_vencimiento" => optional($this->fecha_vencimiento)->format('Y-m-d'),
            ];
    }
}

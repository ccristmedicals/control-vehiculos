<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehiculo extends Model
{
    use HasFactory;

    protected $primaryKey = 'placa';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'placa',
        'modelo',
        'tipo',
        'ubicacion',
        'user_id',
        'user_id_adicional_1',
        'user_id_adicional_2',
        'user_id_adicional_3',
    ];

    /**
     * Relación con el usuario propietario.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function usuarioAdicional1()
    {
        return $this->belongsTo(User::class, 'user_id_adicional_1');
    }

    public function usuarioAdicional2()
    {
        return $this->belongsTo(User::class, 'user_id_adicional_2');
    }

    public function usuarioAdicional3()
    {
        return $this->belongsTo(User::class, 'user_id_adicional_3');
    }

    /**
     * Relación con las especificaciones técnicas.
     */
    public function especificaciones(): HasMany
    {
        return $this->hasMany(VehiculoEspecificaciones::class, 'vehiculo_id', 'placa');
    }

    /**
     * Relación con los permisos del vehículo.
     */
    public function permisos(): HasMany
    {
        return $this->hasMany(VehiculoPermisos::class, 'vehiculo_id', 'placa');
    }

    /**
     * Relación con los accesorios del vehículo.
     */
    public function accesorios(): HasMany
    {
        return $this->hasMany(VehiculoAccesorios::class, 'vehiculo_id', 'placa');
    }

    /**
     * Relación con las piezas revisadas (si tienes esa tabla).
     */
    public function piezas(): HasMany
    {
        return $this->hasMany(VehiculoPiezas::class, 'vehiculo_id', 'placa');
    }

    public function observaciones()
    {
        return $this->hasMany(Observacion::class, 'vehiculo_id', 'placa');
    }

    public function envios()
    {
        return $this->hasMany(Envio::class, 'vehiculo_id', 'placa');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehiculoAccesorios extends Model
{
    public $timestamps = false;

    protected $fillable = ['vehiculo_id', 'accesorio_id', 'estado', 'user_id', 'fecha_verificacion'];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id', 'placa');
    }
}

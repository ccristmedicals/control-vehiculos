<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class Surtido extends Model
{
    protected $table = 'surtidos';

    protected $fillable = [
        'vehiculo_id',
        'user_id',
        'tipo_surtido',
        'cant_litros',
        'kilometraje',
        'surtido_ideal',
        'observaciones',
        'precio',
        'fact_num',
        'diferencia',
        'admin_id'
    ];

    // Relación con el usuario que realizó el surtido
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function admin()
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'vehiculo_id', 'placa');
    }
}

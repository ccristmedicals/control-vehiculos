<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FacturaAuditoria extends Model
{
    protected $table = 'auditoria_facturas';

    protected $fillable = [
        'fact_num',
        'vehiculo_id',
        'user_id',
        'admin_id',
        'observaciones_res',
        'observaciones_admin',
        'aprobado',
        'cubre',
        'cubre_usuario',
        'kilometraje'
    ];

    public function renglones()
    {
        return $this->hasMany(RenglonAuditoria::class, 'fact_num', 'fact_num');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}

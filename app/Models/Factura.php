<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Factura extends Model
{
    protected $connection = 'sqlsrv';
    protected $table = 'factura';
    protected $keyType = 'string';
    protected $primaryKey = 'fact_num';

    protected $appends = ['descripcion_limpia', 'comentario_limpio'];
    protected $hidden = ['descrip', 'comentario'];

    public function renglones()
    {
        return $this->hasMany(RenglonFactura::class, 'fact_num', 'fact_num');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class, 'co_cli', 'placa');
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function auditoria()
    {
        return $this->hasOne(FacturaAuditoria::class, 'fact_num', 'fact_num');
    }

    public function getDescripcionLimpiaAttribute()
    {
        $limpio = trim(preg_replace('/[\x00-\x1F\x7F].*/u', '', $this->descrip));
        return trim(preg_replace('/D\/.*/u', '', $limpio));
    }

    public function getComentarioLimpioAttribute()
    {

        $limpio = trim(preg_replace('/[\x00-\x1F\x7F].*/u', '', $this->comentario));
        return trim(preg_replace('/D\/.*/u', '', $limpio));
    }
}

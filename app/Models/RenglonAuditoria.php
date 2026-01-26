<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RenglonAuditoria extends Model
{
    protected $table = 'auditoria_renglones';

    protected $fillable = [
        'fact_num',
        'reng_num',
        'co_art',
        'reng_neto',
        'total_art',
        'imagen'
    ];


    public function auditoria()
    {
        return $this->belongsTo(FacturaAuditoria::class, 'fact_num', 'fact_num');
    }

    public function repuesto()
    {
        return $this->belongsTo(Repuesto::class, 'co_art', 'co_art');
    }
}

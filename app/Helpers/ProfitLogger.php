<?php

namespace App\Helpers;

use Illuminate\Support\Carbon;

class ProfitLogger
{
    public static function pista(string $tabla, int $numDoc = 0, string $tipoOp = 'I', string $empresa = 'VEHI24', $rowguid, $admin)
    {
        $pista = [
            "usuario_id" => "GAS",
            "usuario" => $admin,
            "fecha" => Carbon::today()->format('d-m-Y H:i:s'),
            "empresa" => $empresa,
            "co_sucu" => "01",
            "tabla" => $tabla,
            "num_doc" => $numDoc,
            "codigo" => "",
            "tipo_op" => $tipoOp,
            "maquina" => gethostname(),
            "campos" => "",
            "rowguid" => $rowguid,
            "trasnfe" => "",
            "AUX01" => "0",
            "AUX02" => ""
        ];
        return $pista;
    }
}

<?php

namespace App\Services;

use App\Helpers\ProfitLogger;
use App\Services\DatabaseConnectionManager;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Ramsey\Uuid\Uuid;

class Gasolina
{
    protected $TASA_GASOLINA = 0.5;

    public function registrarFacturaConRenglon($kilometraje, $descrip, $saldo, $co_cli, $cedula, $admin, $diferencia, $cant_litros)
    {
        $co_cli = trim($co_cli); // Aseguramos que no haya espacios en blanco ocultos
        $connection = $this->getConnection($co_cli);

        // NUEVA VALIDACIÓN: Confirmar que el cliente existe en Profit antes de insertar
        $clienteExiste = DB::connection($connection)->table('clientes')->where('co_cli', $co_cli)->exists();

        if (!$clienteExiste) {
            throw new \Exception("El vehículo con placa {$co_cli} no existe en la base de datos destino ({$connection}). Probablemente fue eliminado de Profit.");
        }

        DB::connection($connection)->beginTransaction();
        try {
            $rowguid = (string) Uuid::uuid4();
            $co_ven = $this->co_ven($cedula, $connection);

            $fact_num = DB::connection($connection)->select("
                SELECT ISNULL(MAX(fact_num), 0) + 1 AS nuevo
                FROM factura WITH (UPDLOCK, HOLDLOCK)
                WHERE fact_num <> 9446
            ")[0]->nuevo;

            $num_doc = DB::connection($connection)->select("
                SELECT ISNULL(MAX(num_doc), 0) + 1 AS nuevo
                FROM reng_fac WITH (UPDLOCK, HOLDLOCK)
            ")[0]->nuevo;

            $datosFactura = $this->construir_factura($kilometraje, $descrip, $saldo, $co_cli, $co_ven, $admin, $diferencia, $fact_num, $rowguid, $connection);
            $datosRenglon = $this->construir_renglon($fact_num, $cant_litros, $num_doc, $saldo, $rowguid, $connection);
            $datosDocumento = $this->construir_documento($fact_num, $co_cli, $co_ven, $saldo, $rowguid);

            DB::connection($connection)->table('factura')->insert($datosFactura);
            DB::connection($connection)->table('reng_fac')->insert($datosRenglon);
            DB::connection($connection)->table('docum_cc')->insert($datosDocumento);
            DB::connection($connection)->table('pistas')->insert(ProfitLogger::pista('FACTURA', $fact_num, 'I', $connection === 'sqlsrv_motos' ? 'MOTOS' : 'VEHICULO', $rowguid, $admin));

            DB::connection($connection)->commit();
            return $datosFactura['fact_num'];
        } catch (\Exception $e) {
            DB::connection($connection)->rollBack();
            Log::error('Error al registrar factura de gasolina', [
                'co_cli' => $co_cli,
                'connection' => $connection,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    public function co_ven($cedula, $connection)
    {
        $co_ven = DB::connection($connection)->select("
            SELECT co_ven FROM vendedor WHERE cedula=?
        ", [$cedula]);
        return $co_ven[0]->co_ven ?? "GAS";
    }

    private function getConnection($co_cli)
    {
        return DatabaseConnectionManager::getConnectionForVehiculo(trim($co_cli));
    }

    public function construir_factura($kilometraje, $descrip, $saldo, $co_cli, $co_ven, $admin, $diferencia, $fact_num, $rowguid, $connection)
    {
        $forma_pag = '01';
        $co_tran = '03';
        $factura = [
            "fact_num" => $fact_num,
            "contrib" => 1,
            "nombre" => "",
            "rif" => "",
            "nit" => "",
            "num_control" => "",
            "status" => 0,
            "comentario" => "",
            "descrip" => $descrip ?? "",
            "saldo" => $saldo,
            "fec_emis" => Carbon::today()->format('d-m-Y H:i:s'),
            "fec_venc" => Carbon::today()->format('d-m-Y H:i:s'),
            "co_cli" => $co_cli,
            "co_ven" => $co_ven,
            "co_tran" => $co_tran,
            "dir_ent" => "",
            "forma_pag" => $forma_pag,
            "tot_bruto" => $saldo,
            "tot_neto" => $saldo,
            "glob_desc" => 0,
            "tot_reca" => 0,
            "porc_gdesc" => "",
            "porc_reca" => "",
            "total_uc" => 0,
            "total_cp" => 0,
            "tot_flete" => 0,
            "monto_dev" => 0,
            "totklu" => 0,
            "anulada" => 0,
            "impresa" => 0,
            "iva" => 0,
            "iva_dev" => 0,
            "feccom" => Carbon::today()->format('d-m-Y H:i:s'),
            "numcom" => 0,
            "tasa" => 1,
            "moneda" => "BS",
            "dis_cen" => "<IVA><E><$saldo><E><IVA>",
            "vuelto" => 0,
            "seriales" => 0,
            "tasag" => 16,
            "tasag10" => 16,
            "tasag20" => 16,
            "campo1" => $diferencia,
            "campo2" => $admin,
            "campo3" => $kilometraje,
            "campo4" => "",
            "campo5" => "",
            "campo6" => "",
            "campo7" => "",
            "campo8" => "",
            "co_us_in" => "GAS",
            "fe_us_in" => Carbon::today()->format('d-m-Y H:i:s'),
            "co_us_mo" => "",
            "fe_us_mo" => Carbon::today()->format('d-m-Y H:i:s'),
            "co_us_el" => "",
            "fe_us_el" => Carbon::today()->format('d-m-Y H:i:s'),
            "revisado" => "",
            "trasnfe" => "",
            "numcon" => 0,
            "co_sucu" => "01",
            "rowguid" => $rowguid,
            "mon_ilc" => 0,
            "otros1" => 0,
            "otros2" => 0,
            "otros3" => 0,
            "num_turno" => 0,
            "aux01" => 0,
            "aux02" => "",
            "ID" => -1,
            "salestax" => "",
            "origen" => "",
            "origen_d" => "",
            "sta_prod" => "",
            "fec_reg" => "",
            "impfis" => "",
            "impfisfac" => "",
            "imp_nro_z" => "",
            "ven_ter" => 0,
            "ptovta" => 0,
            "telefono" => "",
        ];
        return $factura;
    }

    public function construir_renglon($fact_num, $cant_litros, $num_doc, $saldo, $rowguid, $connection)
    {
        $co_art = ($connection === 'sqlsrv_motos') ? 'MT0000' : 'CAR0001';
        $renglon = [
            "fact_num" => $fact_num,
            "reng_num" => 1,
            "dis_cen" => "<IVA><E><$saldo><E><IVA>",
            "tipo_doc" => "E",
            "reng_doc" => 1,
            "num_doc" => $num_doc,
            "co_art" => $co_art,
            "co_alma" => "01",
            "total_art" => $cant_litros,
            "stotal_art" => 0,
            "pendiente" => $cant_litros,
            "uni_venta" => "000001",
            "prec_vta" => $this->TASA_GASOLINA,
            "porc_desc" => 0,
            "tipo_imp" => "6",
            "isv" => 0,
            "reng_neto" => $saldo,
            "cos_pro_un" => $this->TASA_GASOLINA,
            "ult_cos_un" => $this->TASA_GASOLINA,
            "ult_cos_om" => 0,
            "cos_pro_om" => 0,
            "total_dev" => 0,
            "monto_dev" => 0,
            "prec_vta2" => 0,
            "anulado" => 0,
            "des_art" => "",
            "seleccion" => 0,
            "cant_imp" => 0,
            "comentario" => "",
            "rowguid" => $rowguid,
            "total_uni" => 1,
            "mon_ilc" => 0,
            "otros" => 0,
            "nro_lote" => "",
            "fec_lote" => Carbon::today()->format('d-m-Y H:i:s'),
            "pendiente2" => 0,
            "tipo_doc2" => "",
            "reng_doc2" => 0,
            "num_doc2" => 0,
            "tipo_prec" => 1,
            "co_alma2" => "01",
            "aux01" => 0,
            "aux02" => "",
            "cant_prod" => 0,
            "imp_prod" => 0,
        ];
        return $renglon;
    }

    public function construir_documento($fact_num, $co_cli, $co_ven, $saldo, $rowguid)
    {
        $documento = [
            "tipo_doc" => 'FACT',
            "nro_doc" => $fact_num,
            "anulado" => 0,
            "movi" => 0,
            "aut" => 1,
            "num_control" => 0,
            "co_cli" => $co_cli,
            "contrib" => 1,
            "fec_emis" => Carbon::today()->format('d-m-Y H:i:s'),
            "fec_venc" => Carbon::today()->format('d-m-Y H:i:s'),
            "observa" => "",
            "doc_orig" => "",
            "nro_orig" => 0,
            "co_ban" => 0,
            "nro_che" => "",
            "co_ven" => $co_ven,
            "tipo" => 6,
            "tasa" => 1,
            "moneda" => "BS",
            "monto_imp" => 0,
            "monto_gen" => 0,
            "monto_a1" => 0,
            "monto_a2" => 0,
            "monto_bru" => $saldo,
            "descuentos" => "",
            "monto_des" => 0,
            "recargo" => "",
            "monto_rec" => 0,
            "monto_otr" => 0,
            "monto_net" => $saldo,
            "saldo" => $saldo,
            "feccom" => Carbon::today()->format('d-m-Y H:i:s'),
            "numcom" => 0,
            "dis_cen" => "<IVA><E><$saldo><E><IVA>",
            "comis1" => 0,
            "comis2" => 0,
            "comis3" => 0,
            "comis4" => 0,
            "adicional" => 0,
            "campo1" => "",
            "campo2" => "",
            "campo3" => "",
            "campo4" => "",
            "campo5" => "",
            "campo6" => "",
            "campo7" => "",
            "campo8" => "",
            "co_us_in" => "GAS",
            "fe_us_in" => Carbon::today()->format('d-m-Y H:i:s'),
            "co_us_mo" => "",
            "fe_us_mo" => Carbon::today()->format('d-m-Y H:i:s'),
            "co_us_el" => "",
            "fe_us_el" => Carbon::today()->format('d-m-Y H:i:s'),
            "revisado" => "",
            "trasnfe" => "",
            "numcon" => "",
            "co_sucu" => "01",
            "rowguid" => $rowguid,
            "mon_ilc" => 0,
            "otros1" => 0,
            "otros2" => 0,
            "otros3" => 0,
            "reng_si" => 0,
            "comis5" => 0,
            "comis6" => 0,
            "aux01" => 0,
            "aux02" => "",
            "salestax" => "",
            "origen" => "",
            "origen_d" => "",
            "fec_reg" => "",
            "prov_ter" => "",
            "reng_ter" => 0,
            "impfis" => "",
            "impfisfac" => "",
            "imp_nro_z" => "",
            "ven_ter" => 0,
            "fcomproban" => "",
            "PtoVta" => 0,
        ];
        return $documento;
    }
}

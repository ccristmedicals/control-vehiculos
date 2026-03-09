<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$placa = 'A09CF2A';

$todasLasFacturas = \Illuminate\Support\Facades\DB::connection('sqlsrv')->table('factura')
    ->select('fact_num', 'co_cli')
    ->where('co_cli', $placa)
    ->where('anulada', 0)
    ->whereDate('fec_emis', '>=', '2025-10-06')
    ->where('co_tran', '<>', '000003')
    ->get()
    ->groupBy(fn($item) => trim((string)$item->co_cli));

$auditoriasLocales = \Illuminate\Support\Facades\DB::table('auditoria_facturas')
    ->select('vehiculo_id', 'fact_num', 'aprobado')
    ->where('vehiculo_id', $placa)
    ->get()
    ->groupBy(fn($item) => trim((string)$item->vehiculo_id));

$facturasVehiculo = $todasLasFacturas->get($placa) ?? collect();
$normalizeFact = fn($id) => ltrim(trim((string) $id), '0') ?: '0';

$factNums = $facturasVehiculo->pluck('fact_num')->map($normalizeFact)->all();

$auditoriasVehiculo = $auditoriasLocales->get($placa) ?? collect();

$auditoriasVehiculoNorm = $auditoriasVehiculo->map(function ($auditoria) use ($normalizeFact) {
    if (is_array($auditoria)) {
         $auditoria['fact_num_norm'] = $normalizeFact($auditoria['fact_num']);
         return (object)$auditoria;
    }
    $auditoria->fact_num_norm = $normalizeFact($auditoria->fact_num);
    return $auditoria;
});

$factNumsAuditAprobadas = $auditoriasVehiculoNorm
    ->filter(fn($auditoria) => $auditoria->aprobado == 1)
    ->pluck('fact_num_norm')
    ->all();

$diff = array_diff($factNums, $factNumsAuditAprobadas);

echo "Total factNums: " . count($factNums) . "\n";
echo "Total factNumsAuditAprobadas: " . count($factNumsAuditAprobadas) . "\n";
echo "Diff count: " . count($diff) . "\n";

echo "\nDiff:\n";
print_r(array_slice($diff, 0, 5));

echo "\nSample factNums:\n";
print_r(array_slice($factNums, 0, 5));

echo "\nSample factNumsAuditAprobadas:\n";
print_r(array_slice($factNumsAuditAprobadas, 0, 5));


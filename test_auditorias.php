<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$placa = 'A09CF2A';

$auditorias = \Illuminate\Support\Facades\DB::table('auditoria_facturas')
    ->where('vehiculo_id', $placa)
    ->get();

echo "Auditorias for $placa:\n";
echo "Count: " . count($auditorias) . "\n";
print_r(array_slice($auditorias->toArray(), 0, 5));

$todas = \Illuminate\Support\Facades\DB::table('auditoria_facturas')->limit(5)->get();
echo "\nSome other records:\n";
print_r($todas->toArray());

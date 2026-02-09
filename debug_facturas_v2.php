<?php

use Illuminate\Support\Facades\DB;
use App\Models\Vehiculo;

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "DB Connection: " . config('database.default') . "\n";
echo "DB Host: " . config('database.connections.mysql.host') . "\n";
echo "DB Database: " . config('database.connections.mysql.database') . "\n";

$audits = DB::connection('mysql')->table('auditoria_facturas')->get();
$countAudits = DB::connection('mysql')->table('auditoria_facturas')->count();
echo "Audits count: $countAudits\n";

$oneFactura = DB::connection('sqlsrv')->table('factura')->where('fec_emis', '>=', '2025-10-06')->first();
if ($oneFactura) {
    echo "First SQL Factura: " . $oneFactura->fact_num . "\n";
    echo "Hex: " . bin2hex($oneFactura->fact_num) . "\n";
} else {
    echo "No SQL Facturas found.\n";
}

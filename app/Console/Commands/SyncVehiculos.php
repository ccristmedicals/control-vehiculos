<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Vehiculo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncVehiculos extends Command
{
    protected $signature = 'app:sync-vehiculos';

    protected $description = 'Sincroniza datos de Profit y formatea vehículos';

    private const TABLE_PRIMARY_KEYS = [
        'vendedor'  => ['co_ven'],
        'tipo_cli'  => ['tip_cli'],
        'zona'      => ['co_zon'],
        'segmento'  => ['co_seg'],
        'cta_ingr'  => ['co_ingr'],
        'clientes'  => ['co_cli'],
    ];

    private const PLACAS_EXCLUIDAS = ['00002040', 'PLANTA', 'A27BG3S'];

    public function handle(): int
    {
        $this->syncProfitTables();
        $this->formatVehiculos();

        $this->info('Sincronización y formateo completados exitosamente.');

        return Command::SUCCESS;
    }

    private function syncProfitTables(): void
    {
        $this->info('Iniciando sincronización de tablas Profit...');

        foreach (self::TABLE_PRIMARY_KEYS as $tabla => $pks) {
            $registros = 0;

            DB::connection('sqlsrv')
                ->table($tabla)
                ->orderBy($pks[0])
                ->cursor()
                ->each(function (object $row) use ($tabla, $pks, &$registros): void {
                    $data = (array) $row;

                    foreach ($data as &$value) {
                        if (is_string($value)) {
                            $value = mb_convert_encoding($value, 'UTF-8', 'ISO-8859-1');
                        }
                    }
                    unset($value);

                    $where = [];
                    foreach ($pks as $pk) {
                        $where[$pk] = $data[$pk] ?? null;
                    }

                    unset($data['row_id']);

                    DB::connection('mysql')->table($tabla)->updateOrInsert($where, $data);

                    $registros++;
                });

            $this->info("{$tabla}: {$registros} registros procesados.");
        }
    }

    private function formatVehiculos(): void
    {
        $this->info('Formateando vehículos desde clientes...');

        $registros = 0;

        DB::table('clientes')
            ->select('co_cli', 'tipo', 'cli_des')
            ->where(function ($query): void {
                $query->where('tipo', 'CARRO')
                      ->orWhere('tipo', 'MOTO');
            })
            ->whereNotIn('co_cli', self::PLACAS_EXCLUIDAS)
            ->cursor()
            ->each(function (object $vehiculo) use (&$registros): void {
                $placa = trim($vehiculo->co_cli);
                $tipo = trim($vehiculo->tipo);
                $modelo = trim($vehiculo->cli_des);

                Vehiculo::updateOrCreate(
                    ['placa' => $placa],
                    [
                        'tipo'   => $tipo,
                        'modelo' => $modelo,
                    ]
                );

                $registros++;
            });

        $this->info("vehiculos: {$registros} registros procesados.");
    }
}

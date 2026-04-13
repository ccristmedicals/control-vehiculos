<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\Vehiculo;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SyncVehiculos extends Command
{
    protected $signature = 'app:sync-vehiculos';

    protected $description = 'Sincroniza datos de Profit, limpia todos los registros eliminados y formatea vehículos';

    private const TABLE_PRIMARY_KEYS = [
        'vendedor'  => ['co_ven'],
        'tipo_cli'  => ['tip_cli'],
        'zona'      => ['co_zon'],
        'segmento'  => ['co_seg'],
        'cta_ingr'  => ['co_ingr'],
        'clientes'  => ['co_cli'],
    ];

    private const PLACAS_EXCLUIDAS = ['00002040', 'PLANTA', 'A27BG3S'];

    // Propiedad para almacenar dinámicamente TODOS los IDs válidos por tabla
    private array $syncedRecords = [];

    public function handle(): int
    {
        $connections = ['sqlsrv_motos', 'sqlsrv_carros'];

        // Inicializamos los arreglos para cada tabla
        foreach (array_keys(self::TABLE_PRIMARY_KEYS) as $tabla) {
            $this->syncedRecords[$tabla] = [];
        }

        foreach ($connections as $connection) {
            $this->info("Sincronizando desde: {$connection}");
            $this->syncProfitTables($connection);
        }

        // Limpieza Universal de registros fantasma en todas las tablas
        $this->cleanAllGhostRecords();

        $this->syncUsers();

        $this->formatVehiculos();

        $this->info('Sincronización, limpieza integral y formateo completados exitosamente.');

        return Command::SUCCESS;
    }

    private function syncProfitTables(string $connection): void
    {
        $this->info("Iniciando sincronización de tablas Profit ({$connection})...");

        foreach (self::TABLE_PRIMARY_KEYS as $tabla => $pks) {
            $registros = 0;
            $pkField = $pks[0]; // Tomamos el nombre de la llave primaria (ej. co_ven, co_cli)

            DB::connection($connection)
                ->table($tabla)
                ->orderBy($pkField)
                ->cursor()
                ->each(function (object $row) use ($tabla, $pks, $pkField, &$registros, $connection): void {
                    $data = (array) $row;

                    foreach ($data as &$value) {
                        if (is_string($value)) {
                            $value = trim((string)$value);
                        }
                    }

                    // Guardamos el ID válido que vino de Profit para esta tabla
                    if (isset($data[$pkField])) {
                        $this->syncedRecords[$tabla][] = $data[$pkField];
                    }

                    $where = [];
                    foreach ($pks as $pk) {
                        $where[$pk] = $data[$pk] ?? null;
                    }

                    unset($data['row_id']);
                    $data['origen'] = $connection;

                    DB::connection('mysql')->table($tabla)->updateOrInsert($where, $data);

                    $registros++;
                });

            $this->info("{$tabla}: {$registros} registros procesados.");
        }
    }

    /**
     * Limpia TODOS los registros de las tablas maestras locales que ya no están en Profit,
     * respetando aquellos que tengan historial guardado (llaves foráneas).
     */
    private function cleanAllGhostRecords(): void
    {
        $this->info('Buscando y limpiando registros fantasma en todas las tablas maestras...');

        foreach (self::TABLE_PRIMARY_KEYS as $tabla => $pks) {
            $pkField = $pks[0];
            $registrosValidos = array_unique($this->syncedRecords[$tabla]);

            if (empty($registrosValidos)) {
                $this->warn("Advertencia: No se detectaron registros para {$tabla}. Se omite su limpieza.");
                continue;
            }

            // Excepción especial para los clientes (Vehículos)
            if ($tabla === 'clientes') {
                $registrosValidos = array_unique(array_merge($registrosValidos, self::PLACAS_EXCLUIDAS));

                // Buscamos los vehículos fantasma y los intentamos borrar UNO POR UNO
                $vehiculosFantasmas = Vehiculo::whereNotIn('placa', $registrosValidos)->get();
                $vehiculosBorrados = 0;
                $vehiculosProtegidos = 0;

                foreach ($vehiculosFantasmas as $vehiculo) {
                    try {
                        $vehiculo->delete();
                        $vehiculosBorrados++;
                    } catch (\Illuminate\Database\QueryException $e) {
                        // Si hay error de llave foránea (23000), tiene historial y lo conservamos
                        if ($e->getCode() == '23000') {
                            $vehiculosProtegidos++;
                        }
                    }
                }

                if ($vehiculosBorrados > 0) {
                    $this->info("- {$vehiculosBorrados} vehículos locales sin historial fueron eliminados.");
                }
                if ($vehiculosProtegidos > 0) {
                    $this->warn("- {$vehiculosProtegidos} vehículos se conservaron localmente porque poseen historial (auditorías, surtidos, etc).");
                }
            }

            // Borrado para la tabla maestra actual (uno por uno para proteger historiales)
            $registrosFantasmas = DB::table($tabla)->whereNotIn($pkField, $registrosValidos)->pluck($pkField);
            $borrados = 0;
            $protegidos = 0;

            foreach ($registrosFantasmas as $id) {
                try {
                    DB::table($tabla)->where($pkField, $id)->delete();
                    $borrados++;
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($e->getCode() == '23000') {
                        $protegidos++;
                    }
                }
            }

            if ($borrados > 0) {
                $this->info("- {$borrados} registros fantasma eliminados de la tabla '{$tabla}'.");
            }
            if ($protegidos > 0) {
                $this->warn("- {$protegidos} registros en '{$tabla}' conservados por tener historial en el sistema.");
            }
        }
    }

    private function formatVehiculos(): void
    {
        $this->info('Formateando vehículos desde clientes...');

        $registros = 0;

        DB::table('clientes')
            ->select('co_cli', 'cli_des', 'origen')
            ->whereNotIn('co_cli', self::PLACAS_EXCLUIDAS)
            ->cursor()
            ->each(function (object $vehiculo) use (&$registros): void {
                $placa = trim($vehiculo->co_cli);
                $modelo = trim($vehiculo->cli_des);
                $origen = $vehiculo->origen;

                // Definimos el tipo dinámicamente según el origen
                $tipo = ($origen === 'sqlsrv_motos') ? 'MOTO' : 'CARRO';

                Vehiculo::updateOrCreate(
                    ['placa' => $placa],
                    [
                        'tipo'   => $tipo,
                        'modelo' => $modelo,
                        'origen' => $origen,
                    ]
                );

                $registros++;
            });

        $this->info("vehiculos: {$registros} registros procesados.");
    }

    private function syncUsers(): void
    {
        $this->info('Sincronizando conductores desde Profit hacia tabla local users...');

        $vendedores = DB::table('vendedor')
            ->select('ven_des', 'cedula')
            ->whereNotNull('cedula')
            ->where('cedula', '<>', '')
            ->get();

        $registros = 0;
        $nuevos = 0;

        foreach ($vendedores as $vendedor) {
            $nombre = trim($vendedor->ven_des);
            $cedula = trim($vendedor->cedula);

            if (empty($cedula)) continue;

            $existente = \App\Models\User::where('email', $cedula)->first();

            if ($existente) {
                // Usuario existente: solo actualizamos el nombre, NUNCA la contraseña
                $existente->update(['name' => $nombre]);
                $user = $existente;
            } else {
                // Usuario nuevo: creamos con contraseña por defecto (LetraInicial + Cédula)
                $letraInicial = mb_strtoupper(mb_substr($nombre, 0, 1));
                $password = $letraInicial . $cedula;

                $user = \App\Models\User::create([
                    'email'    => $cedula,
                    'name'     => $nombre,
                    'password' => \Illuminate\Support\Facades\Hash::make($password),
                ]);
                $nuevos++;
            }

            // Asignar rol de conductor si falta
            if (!$user->hasRole('conductor')) {
                $user->assignRole('conductor');
            }

            $registros++;
        }

        $this->info("Conductores: {$registros} sincronizados ({$nuevos} nuevos creados).");
    }
}

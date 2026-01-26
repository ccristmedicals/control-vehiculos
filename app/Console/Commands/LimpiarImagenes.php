<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class LimpiarImagenes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'limpiar:imagenes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Elimina imagenes huerfanas y del año 2025 de fotos-diarias y fotos-semanales';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Iniciando limpieza de imágenes...');

        // 1. Limpiar Fotos Diarias
        $this->limpiarFotosDiarias();

        // 2. Limpiar Fotos Semanales
        $this->limpiarFotosSemanales();

        $this->info('Limpieza completada.');

        return 0;
    }

    private function limpiarFotosDiarias()
    {
        $this->info('Procesando fotos-diarias...');
        $disk = Storage::disk('public');
        $directory = 'uploads/fotos-diarias';
        
        // Obtener archivos del disco
        $files = $disk->files($directory);
        
        // Obtener imagenes validas de la BD
        // Pluck solo los nombres de archivo
        $dbImages = DB::table('revisiones_diarias')->pluck('imagen')->toArray();

        $countDeleted = 0;

        foreach ($files as $file) {
            $filename = basename($file);
            if ($filename === '.gitignore') continue;

            // Logica de borrado
            $shouldDelete = false;
            $reason = '';

            // 1. Verificar año 2025
            $lastModified = $disk->lastModified($file);
            $year = Carbon::createFromTimestamp($lastModified)->year;
            
            if ($year === 2025) {
                $shouldDelete = true;
                $reason = 'Año 2025';
            }
            // 2. Verificar si es huerfana (si no se borró ya por año)
            elseif (!in_array($filename, $dbImages)) {
                $shouldDelete = true;
                $reason = 'Huérfana (sin registro en BD)';
            }

            if ($shouldDelete) {
                $disk->delete($file);
                $this->line("Eliminado: $filename ($reason)");
                $countDeleted++;
            }
        }

        $this->info("Total eliminados en fotos-diarias: $countDeleted");
    }

    private function limpiarFotosSemanales()
    {
        $this->info('Procesando fotos-semanales...');
        $disk = Storage::disk('public');
        $directory = 'uploads/fotos-semanales';
        
        // Obtener archivos del disco
        $files = $disk->files($directory);
        
        // Obtener imagenes validas de la BD
        $dbImages = DB::table('fotos_revision_semanal')->pluck('imagen')->toArray();

        $countDeleted = 0;

        foreach ($files as $file) {
            $filename = basename($file);
            if ($filename === '.gitignore') continue;

            // Logica de borrado
            $shouldDelete = false;
            $reason = '';

            // 1. Verificar año 2025
            $lastModified = $disk->lastModified($file);
            $year = Carbon::createFromTimestamp($lastModified)->year;
            
            if ($year === 2025) {
                $shouldDelete = true;
                $reason = 'Año 2025';
            }
            // 2. Verificar si es huerfana
            elseif (!in_array($filename, $dbImages)) {
                $shouldDelete = true;
                $reason = 'Huérfana (sin registro en BD)';
            }

            if ($shouldDelete) {
                $disk->delete($file);
                $this->line("Eliminado: $filename ($reason)");
                $countDeleted++;
            }
        }

        $this->info("Total eliminados en fotos-semanales: $countDeleted");
    }
}

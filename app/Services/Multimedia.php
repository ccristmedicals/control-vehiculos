<?php

namespace App\Services;

use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Illuminate\Support\Facades\Storage;

class Multimedia
{
    protected $rutasGuardado = [
        'diario' => 'uploads/fotos-diarias',
        'asignacion' => 'uploads/fotos-asignaciones',
        'documentos' => 'uploads/fotos-documentos',
        'pdf' => 'uploads/pdf-documentos',
        'auditorias' => 'uploads/auditorias',
        'semanal' => 'uploads/fotos-semanales'
    ];

public function guardarImagen($image, $tipo)
    {
        try {
            if (!array_key_exists($tipo, $this->rutasGuardado)) {
                dd('2. ERROR: El tipo "' . $tipo . '" no existe en el arreglo rutasGuardado.');
                return false;
            }
            $nameImage = Str::uuid() . '.' . $image->extension();
            
            $serverImage = ImageManager::gd()->read($image->getRealPath());

            $targetPath = $this->rutasGuardado[$tipo];
            $encoded = $serverImage->encode();

            if (!$encoded) {
                dd('5. ERROR: No se pudo codificar la imagen.');
                return false;
            }

            $respuesta = Storage::disk('public')->put($targetPath . '/' . $nameImage, $encoded);

            return $respuesta ? $nameImage : false;
            
        } catch (\Throwable $e) {
            
            dd([
                'mensaje' => $e->getMessage(),
                'linea' => $e->getLine(),
                'archivo' => $e->getFile()
            ]);
            
        }
    }

    public function guardarArchivoPdf($archivo, $tipo)
    {
        if ($archivo->getClientMimeType() !== 'application/pdf') {
            return false;
        }

        if (!array_key_exists($tipo, $this->rutasGuardado)) {
            return false;
        }

        $nameFile = Str::uuid() . '.pdf';
        $targetPath = $this->rutasGuardado[$tipo];
        $rutaCompleta = $targetPath . '/' . $nameFile;

        $respuesta = Storage::disk('public')->put($rutaCompleta, file_get_contents($archivo));

        return $respuesta ? $nameFile : false;
    }
}

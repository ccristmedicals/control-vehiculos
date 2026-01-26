<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class GasolinaSelectionExport implements FromView, ShouldAutoSize, WithStyles
{
    protected $facturas;
    protected $calculos;

    public function __construct($facturas, $calculos)
    {
        $this->facturas = $facturas;
        $this->calculos = $calculos;
    }

    public function view(): View
    {
        return view('exports.gasolina_selection', [
            'facturas' => $this->facturas,
            'calculos' => $this->calculos
        ]);
    }

    // Estilos opcionales para negritas en encabezados
    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]], // Título Resumen
            5 => ['font' => ['bold' => true]], // Encabezados de tabla detalle
        ];
    }
}

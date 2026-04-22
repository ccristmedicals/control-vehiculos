import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export async function exportGasolinaGeneralExcel(data) {
    if (!Array.isArray(data)) {
        console.error('No se puede generar el Excel: data no es un array válido.');
        return;
    }

    const workbook = new ExcelJS.Workbook();

    // ═══════════════════════════════════════════
    // HOJA 1: Detalle de Surtidos
    // ═══════════════════════════════════════════
    const worksheet = workbook.addWorksheet('Surtidos Gasolina');

    worksheet.columns = [
        { header: 'Vehículo', key: 'vehiculo', width: 15 },
        { header: 'Placa', key: 'placa', width: 12 },
        { header: 'Tipo', key: 'tipo', width: 10 },
        { header: 'N° Factura', key: 'factura', width: 12 },
        { header: 'Fecha', key: 'fecha', width: 15 },
        { header: 'Precio', key: 'precio', width: 10 },
        { header: 'Km Actual', key: 'km_actual', width: 12 },
        { header: 'Recorrido Km', key: 'recorrido', width: 15 },
        { header: 'Litros', key: 'litros', width: 10 },
        { header: 'Total $', key: 'total', width: 10 },
        { header: 'Observaciones', key: 'observaciones', width: 20 },
        { header: 'Diferencia Litros', key: 'diferencia', width: 12 },
        { header: 'Conductor', key: 'conductor', width: 20 },
        { header: 'Supervisor', key: 'admin', width: 20 },
    ];

    // Estilo del encabezado
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF49AF4E' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    let totalLitros = 0;
    let totalDiferencia = 0;

    data.forEach((registro) => {
        totalLitros += parseFloat(registro.litros || 0);
        totalDiferencia += parseFloat(registro.diferencia || 0);

        const row = worksheet.addRow({
            vehiculo: registro.vehiculo,
            placa: registro.placa,
            tipo: registro.tipo || '-',
            factura: registro.factura,
            fecha: registro.fecha,
            precio: registro.precio,
            km_actual: registro.km_actual,
            recorrido: registro.recorrido,
            litros: registro.litros,
            total: registro.total,
            observaciones: registro.observaciones,
            diferencia: registro.diferencia,
            conductor: registro.conductor,
            admin: registro.admin,
        });

        row.eachCell((cell, colNumber) => {
            const key = worksheet.columns[colNumber - 1].key;

            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };

            if (key === 'precio' || key === 'total') {
                cell.numFmt = '"$"#,##0.00';
            }

            if (key === 'diferencia') {
                const value = parseFloat(cell.value);
                if (!isNaN(value) && value < 0) {
                    cell.font = { color: { argb: 'FFFFFFFF' } };
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFF0000' },
                    };
                }
            }
        });
    });

    // Fila de totales
    const totalRow = worksheet.addRow({
        vehiculo: 'TOTALES',
        litros: totalLitros,
        diferencia: totalDiferencia,
    });

    totalRow.eachCell((cell, colNumber) => {
        const key = worksheet.columns[colNumber - 1].key;

        cell.font = { bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };

        if (key === 'litros' || key === 'diferencia') {
            cell.numFmt = '#,##0.00';
        }

        if (key === 'diferencia' && totalDiferencia < 0) {
            cell.font.color = { argb: 'FFFFFFFF' };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFF0000' },
            };
        }
    });

    worksheet.eachRow((row) => {
        row.height = 20;
    });

    // ═══════════════════════════════════════════
    // HOJA 2: Resumen por Vehículo (Dinero Conductor)
    // ═══════════════════════════════════════════
    const resumenSheet = workbook.addWorksheet('Resumen por Vehículo');

    resumenSheet.columns = [
        { header: 'Placa', key: 'placa', width: 14 },
        { header: 'Vehículo', key: 'vehiculo', width: 18 },
        { header: 'Tipo', key: 'tipo', width: 10 },
        { header: 'Conductor', key: 'conductor', width: 22 },
        { header: 'Km Primer Reporte', key: 'km_primero', width: 18 },
        { header: 'Km Último Reporte', key: 'km_ultimo', width: 18 },
        { header: 'Recorrido Total', key: 'recorrido_total', width: 16 },
        { header: 'Valor Carburador', key: 'valor_carburador', width: 16 },
        { header: 'Dinero Conductor $', key: 'dinero_conductor', width: 18 },
    ];

    // Estilo del encabezado de resumen
    resumenSheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF3B82F6' }, // Azul para distinguir
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };
    });

    // Agrupar registros por placa
    const vehiculosMap = {};
    data.forEach((registro) => {
        const placa = registro.placa;
        if (!vehiculosMap[placa]) {
            vehiculosMap[placa] = {
                vehiculo: registro.vehiculo,
                tipo: registro.tipo || 'MOTO',
                conductor: registro.conductor,
                registros: [],
            };
        }
        vehiculosMap[placa].registros.push(registro);
    });

    let totalDineroConductor = 0;

    // Calcular y agregar filas de resumen por vehículo
    Object.entries(vehiculosMap).forEach(([placa, info]) => {
        // Ordenar registros por km para encontrar el primero y último
        const registrosOrdenados = [...info.registros].sort(
            (a, b) => parseFloat(a.km_actual || 0) - parseFloat(b.km_actual || 0),
        );

        const primerKm = parseFloat(registrosOrdenados[0]?.km_actual || 0);
        const ultimoKm = parseFloat(registrosOrdenados[registrosOrdenados.length - 1]?.km_actual || 0);
        const recorridoTotal = ultimoKm - primerKm;

        // Valor del carburador según tipo
        const valorCarburador = info.tipo === 'CARRO' ? 0.10 : 0.035;

        // Calcular dinero del conductor
        const dineroConductor = recorridoTotal > 0 ? recorridoTotal * valorCarburador : 0;
        totalDineroConductor += dineroConductor;

        const row = resumenSheet.addRow({
            placa,
            vehiculo: info.vehiculo,
            tipo: info.tipo,
            conductor: info.conductor,
            km_primero: primerKm,
            km_ultimo: ultimoKm,
            recorrido_total: recorridoTotal,
            valor_carburador: valorCarburador,
            dinero_conductor: dineroConductor,
        });

        row.eachCell((cell, colNumber) => {
            const key = resumenSheet.columns[colNumber - 1].key;

            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };

            if (key === 'dinero_conductor') {
                cell.numFmt = '"$"#,##0.00';
                cell.font = { bold: true, color: { argb: 'FF16A34A' } }; // Verde
            }

            if (key === 'valor_carburador') {
                cell.numFmt = '0.000';
            }

            if (key === 'km_primero' || key === 'km_ultimo' || key === 'recorrido_total') {
                cell.numFmt = '#,##0';
            }
        });
    });

    // Fila de total general del dinero
    const totalResumenRow = resumenSheet.addRow({
        placa: '',
        vehiculo: '',
        tipo: '',
        conductor: '',
        km_primero: '',
        km_ultimo: '',
        recorrido_total: 'TOTAL',
        valor_carburador: '',
        dinero_conductor: totalDineroConductor,
    });

    totalResumenRow.eachCell((cell, colNumber) => {
        const key = resumenSheet.columns[colNumber - 1].key;

        cell.font = { bold: true, size: 12 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = {
            top: { style: 'medium' },
            left: { style: 'thin' },
            bottom: { style: 'medium' },
            right: { style: 'thin' },
        };

        if (key === 'dinero_conductor') {
            cell.numFmt = '"$"#,##0.00';
            cell.font = { bold: true, size: 13, color: { argb: 'FF16A34A' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF0FDF4' }, // Verde claro de fondo
            };
        }
    });

    resumenSheet.eachRow((row) => {
        row.height = 22;
    });

    // ═══════════════════════════════════════════
    // Generar y descargar
    // ═══════════════════════════════════════════
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const nombreArchivo = `surtidos_gasolina_general_${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(blob, nombreArchivo);
}

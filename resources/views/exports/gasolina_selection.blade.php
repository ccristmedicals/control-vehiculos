<table>
    <thead>
        <tr>
            <th colspan="4" style="text-align: center; font-weight: bold;">RESUMEN DE RENDIMIENTO</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><strong>Total Recorrido (Km):</strong></td>
            <td>{{ $calculos['recorrido'] }}</td>
            <td><strong>Total Litros:</strong></td>
            <td>{{ $calculos['litros'] }}</td>
        </tr>
        <tr>
            <td><strong>Valor Carburador:</strong></td>
            <td>{{ number_format($calculos['valorCarburador'], 4) }}</td>
            <td></td>
            <td></td>
        </tr>
        <tr></tr>
    </tbody>
</table>

<table>
    <thead>
        <tr>
            <th style="background-color: #49af4e; color: white;">N° Factura</th>
            <th style="background-color: #49af4e; color: white;">Fecha</th>
            <th style="background-color: #49af4e; color: white;">Kilometraje</th>
            <th style="background-color: #49af4e; color: white;">Litros</th>
            <th style="background-color: #49af4e; color: white;">Total $</th>
            <th style="background-color: #49af4e; color: white;">Observaciones</th>
        </tr>
    </thead>
    <tbody>
        @foreach($facturas as $factura)
        <tr>
            <td>{{ $factura->fact_num }}</td>
            <td>{{ $factura->created_at->format('Y-m-d') }}</td>
            <td>{{ $factura->kilometraje }}</td>
            <td>{{ $factura->cant_litros }}</td>
            <td>{{ $factura->precio }}</td>
            <td>{{ $factura->observaciones }}</td>
        </tr>
        @endforeach
    </tbody>
</table>
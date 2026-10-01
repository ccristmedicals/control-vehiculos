import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';

type VehiculoEditProps = {
    vehiculo: {
        placa: string;
        tipo: 'CARRO' | 'MOTO';
        modelo: string;
        ubicacion: string;
    };
};

export default function VehiculoEdit() {
    const { vehiculo } = usePage<VehiculoEditProps>().props;

    const { data, setData, patch, processing, errors } = useForm({
        placa: vehiculo.placa,
        tipo: vehiculo.tipo,
        modelo: vehiculo.modelo,
        ubicacion: vehiculo.ubicacion,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/vehiculo/${vehiculo.placa}`, {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout>
            <Head title={`Editar Vehículo ${vehiculo.placa}`} />

            <div className="mx-auto w-full max-w-2xl p-4 md:p-8">
                <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Editar Vehículo</h1>

                <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-gray-100 p-6 shadow-lg dark:bg-gray-800">
                    <div className="grid gap-2">
                        <Label htmlFor="placa">Placa</Label>
                        <Input id="placa" value={data.placa} onChange={(e) => setData('placa', e.target.value)} />
                        {errors.placa && <p className="text-sm text-red-600">{errors.placa}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="tipo">Tipo</Label>
                        <select
                            id="tipo"
                            value={data.tipo}
                            onChange={(e) => setData('tipo', e.target.value as 'CARRO' | 'MOTO')}
                            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                        >
                            <option value="CARRO">CARRO</option>
                            <option value="MOTO">MOTO</option>
                        </select>
                        {errors.tipo && <p className="text-sm text-red-600">{errors.tipo}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="modelo">Modelo</Label>
                        <Input id="modelo" value={data.modelo} onChange={(e) => setData('modelo', e.target.value)} />
                        {errors.modelo && <p className="text-sm text-red-600">{errors.modelo}</p>}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="ubicacion">Ubicación</Label>
                        <Input id="ubicacion" value={data.ubicacion} onChange={(e) => setData('ubicacion', e.target.value)} />
                        {errors.ubicacion && <p className="text-sm text-red-600">{errors.ubicacion}</p>}
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

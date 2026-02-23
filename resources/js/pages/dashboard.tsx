/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import VehiculoCard from '@/components/VehiculoCard';
import AppLayout from '@/layouts/app-layout';
import { exportGasolinaGeneralExcel } from '@/utils/exportGasolinaGeneralExcel';
import { Head, usePage } from '@inertiajs/react';
import { FileDown, Search, FilterX } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Dashboard() {
    const { vehiculos, registros, modo } = usePage<{
        vehiculos: any[];
        registros: any[];
        modo: string;
    }>().props;
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const vehiculosFiltrados = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return vehiculos.filter((v) => {
            const placa = v.placa?.toLowerCase() || '';
            const nombre = v.nombre?.toLowerCase() || '';
            const tipo = v.tipo?.toLowerCase() || '';
            const modelo = v.modelo?.toLowerCase() || '';

            return placa.includes(term) || nombre.includes(term) || modelo.includes(term) || tipo.includes(term);
        });
    }, [searchTerm, vehiculos]);

    const handleExport = () => {
        let registrosFiltrados = registros;

        if (fechaDesde && fechaHasta) {
            const desde = new Date(fechaDesde);
            const hasta = new Date(fechaHasta);

            registrosFiltrados = registros.filter((r) => {
                const fechaRegistro = new Date(r.fecha);
                return fechaRegistro >= desde && fechaRegistro <= hasta;
            });
        }

        exportGasolinaGeneralExcel(registrosFiltrados);
    };

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-background p-4 md:p-8 font-sans dark:bg-gray-950">
                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl dark:text-white">
                            Dashboard de <span className="text-[#49af4e]">Vehículos</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Gestiona y monitorea el estado de tu flota en tiempo real.
                        </p>
                    </div>

                    <Button
                        onClick={handleExport}
                        className="w-full bg-[#49af4e] hover:bg-[#47a84c] text-white shadow-lg shadow-[#49af4e]/20 transition-all hover:translate-y-[-2px] md:w-auto"
                        size="lg"
                    >
                        <FileDown className="mr-2 h-5 w-5" />
                        Reporte General
                    </Button>
                </div>

                {/* Filters Section */}
                <Card className="mb-10 border-none bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:bg-gray-900/50">
                    <div className="flex flex-col gap-6 md:flex-row md:items-end">
                        <div className="relative flex-1">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Buscar Vehículo
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Nombre, placa, modelo o tipo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus:ring-[#49af4e]"
                                />
                            </div>
                        </div>

                        {modo === 'admin' && (
                            <div className="flex flex-col gap-4 sm:flex-row md:flex-[0_0_auto]">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Desde
                                    </label>
                                    <Input
                                        type="date"
                                        value={fechaDesde}
                                        onChange={(e) => setFechaDesde(e.target.value)}
                                        className="h-11 w-full sm:w-44 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        Hasta
                                    </label>
                                    <Input
                                        type="date"
                                        value={fechaHasta}
                                        onChange={(e) => setFechaHasta(e.target.value)}
                                        className="h-11 w-full sm:w-44 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Stats / Results Meta */}
                <div className="mb-6 flex items-center justify-between px-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Mostrando <span className="text-foreground font-bold">{vehiculosFiltrados.length}</span> de {vehiculos.length} vehículos
                    </p>
                </div>

                {/* Grid Section */}
                {vehiculosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {vehiculosFiltrados.map((vehiculo) => (
                            <div
                                key={vehiculo.placa}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                style={{ animationDelay: `${vehiculosFiltrados.indexOf(vehiculo) * 50}ms` }}
                            >
                                <VehiculoCard vehiculo={vehiculo} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-20 dark:border-gray-800">
                        <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-900">
                            <FilterX className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No se encontraron vehículos</h3>
                        <p className="mt-2 text-center text-muted-foreground max-w-xs px-4">
                            No hay resultados que coincidan con "<span className="font-bold">{searchTerm}</span>". Intenta con otro término.
                        </p>
                        <Button
                            variant="link"
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-[#49af4e] hover:text-[#47a84c]"
                        >
                            Limpiar búsqueda
                        </Button>
                    </div>
                )}

                <Toaster />
            </div>
        </AppLayout>
    );
}

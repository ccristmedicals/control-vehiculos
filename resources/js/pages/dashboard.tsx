/* eslint-disable @typescript-eslint/no-explicit-any */
// import NotificacionRealtime from '@/components/NotificacionRealtime';
import { Toaster } from '@/components/ui/sonner';
import VehiculoCard from '@/components/VehiculoCard';
import AppLayout from '@/layouts/app-layout';
import { exportGasolinaGeneralExcel } from '@/utils/exportGasolinaGeneralExcel';
import { Head, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
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
    // const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'moto' | 'carro'>(() => {
    //     return (localStorage.getItem('tipoFiltro') as 'todos' | 'moto' | 'carro') || 'todos';
    // });

    // useEffect(() => {
    //     localStorage.setItem('tipoFiltro', tipoFiltro);
    // }, [tipoFiltro]);

    const vehiculosFiltrados = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return vehiculos.filter((v) => {
            const placa = v.placa?.toLowerCase() || '';
            const nombre = v.nombre?.toLowerCase() || '';
            const tipo = v.tipo?.toLowerCase() || '';
            const modelo = v.modelo?.toLowerCase() || '';

            const coincideBusqueda = placa.includes(term) || nombre.includes(term) || modelo.includes(term) || tipo.includes(term);
            // const coincideTipo = tipoFiltro === 'todos' || tipo === tipoFiltro;

            return coincideBusqueda;
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
            <Head title="Dashboard de Vehículos" />
            <div className="min-h-screen bg-background px-4 py-10 font-sans dark:bg-gray-900">
                {/* <NotificacionRealtime /> */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
                </div>
                <div className="mb-6 flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-end">
                    <div className="relative flex w-full max-w-md items-center gap-2">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, placa o modelo"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm text-gray-800 shadow-sm focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>

                    {/* <select
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value as 'todos' | 'moto' | 'carro')}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="moto">Motos</option>
                        <option value="carro">Carros</option>
                    </select> */}

                    {modo === 'admin' && (
                        <div className="flex w-full flex-row items-center gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-center">
                            <div className="flex w-full flex-col items-center">
                                <div className="pb-2 text-center text-sm font-bold tracking-tight text-gray-900 sm:text-left dark:text-white">
                                    Fecha desde:
                                </div>
                                <input
                                    type="date"
                                    value={fechaDesde}
                                    onChange={(e) => setFechaDesde(e.target.value)}
                                    className="w-44 rounded-md border border-gray-300 p-2 text-center text-sm text-gray-800 shadow-sm focus:border-green-500 focus:outline-none sm:w-auto sm:text-left dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div className="flex w-full flex-col items-center">
                                <div className="pb-2 text-center text-sm font-bold tracking-tight text-gray-900 sm:text-left dark:text-white">
                                    Fecha hasta:
                                </div>
                                <input
                                    type="date"
                                    value={fechaHasta}
                                    onChange={(e) => setFechaHasta(e.target.value)}
                                    className="w-44 rounded-md border border-gray-300 p-2 text-center text-sm text-gray-800 shadow-sm focus:border-green-500 focus:outline-none sm:w-auto sm:text-left dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleExport}
                        className="flex items-center justify-center gap-1 rounded-2xl bg-[#49af4e] p-3 text-sm font-semibold text-white hover:bg-[#47a84c] sm:w-auto sm:justify-start"
                    >
                        Reporte General de Gasolina
                    </button>
                </div>

                <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Mostrando <strong>{vehiculosFiltrados.length}</strong> de {vehiculos.length} vehículos
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {vehiculosFiltrados.map((vehiculo) => (
                        <div key={vehiculo.placa} className="animate-fade-in-up transition-transform duration-300 hover:scale-[1.02]">
                            <VehiculoCard vehiculo={vehiculo} />
                        </div>
                    ))}
                </div>
                <Toaster />
            </div>
        </AppLayout>
    );
}

import ObservacionesCardDashboard from '@/components/ObservacionesCardDashboard';
import AppLayout from '@/layouts/app-layout';
import { Observacion } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Toaster } from 'sonner';

export default function DashboardObservaciones() {
    const { observaciones: rawObservaciones } = usePage<{
        observaciones: Observacion[];
        isAdmin: boolean;
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');
    // const [tipoFiltro, setTipoFiltro] = useState<'todos' | 'moto' | 'carro'>(() => {
    //     return (localStorage.getItem('tipoFiltroObs') as 'todos' | 'moto' | 'carro') || 'todos';
    // });

    // useEffect(() => {
    //     localStorage.setItem('tipoFiltroObs', tipoFiltro);
    // }, [tipoFiltro]);

    const observacionesFiltradas = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return rawObservaciones.filter((obs) => {
            const texto = obs.observacion?.toLowerCase() || '';
            const placa = obs.vehiculo?.placa?.toLowerCase() || '';
            const modelo = obs.vehiculo?.modelo?.toLowerCase() || '';
            // const tipo = obs.vehiculo?.tipo?.toLowerCase() || '';

            const coincideBusqueda = texto.includes(term) || placa.includes(term) || modelo.includes(term);
            // const coincideTipo = tipoFiltro === 'todos' || tipo === tipoFiltro;

            return coincideBusqueda;
        });
    }, [searchTerm, rawObservaciones]);

    return (
        <AppLayout>
            <Head title="Dashboard de Observaciones" />
            <div className="min-h-screen bg-background px-4 py-10 font-sans dark:bg-gray-900">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard de Observaciones</h1>
                </div>

                <div className="mb-6 flex justify-center gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                        <input
                            type="text"
                            placeholder="Buscar por texto, placa o modelo"
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
                        <option value="todos">Todos</option>
                        <option value="moto">Motos</option>
                        <option value="carro">Carros</option>
                    </select> */}
                </div>

                <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Mostrando <strong>{observacionesFiltradas.length}</strong> de {rawObservaciones.length} observaciones
                </div>

                {observacionesFiltradas.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                        {observacionesFiltradas.map((obs) => (
                            <ObservacionesCardDashboard key={obs.id} observacion={obs} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">No se encontraron observaciones que coincidan con la búsqueda.</p>
                )}

                <Toaster />
            </div>
        </AppLayout>
    );
}

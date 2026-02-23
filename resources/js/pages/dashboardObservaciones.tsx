import ObservacionesCardDashboard from '@/components/ObservacionesCardDashboard';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Observacion } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Search, StickyNote, FilterX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Toaster } from 'sonner';

export default function DashboardObservaciones() {
    const { observaciones: rawObservaciones } = usePage<{
        observaciones: Observacion[];
        isAdmin: boolean;
    }>().props;

    const [searchTerm, setSearchTerm] = useState('');

    const observacionesFiltradas = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return rawObservaciones.filter((obs) => {
            const texto = obs.observacion?.toLowerCase() || '';
            const placa = obs.vehiculo?.placa?.toLowerCase() || '';
            const modelo = obs.vehiculo?.modelo?.toLowerCase() || '';

            return texto.includes(term) || placa.includes(term) || modelo.includes(term);
        });
    }, [searchTerm, rawObservaciones]);

    return (
        <AppLayout>
            <Head title="Control de Observaciones" />
            <div className="min-h-screen bg-background p-4 md:p-8 font-sans dark:bg-gray-950">
                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl dark:text-white">
                            Registro de <span className="text-red-600">Observaciones</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Supervisa y resuelve las incidencias reportadas en la flota.
                        </p>
                    </div>

                    <div className="hidden md:block">
                        <StickyNote className="h-12 w-12 text-red-100 dark:text-red-900/40" />
                    </div>
                </div>

                {/* Filters Section */}
                <Card className="mb-10 border-none bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:bg-gray-900/50">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="relative flex-1">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Filtrar Incidencias
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Buscar por texto, placa o modelo..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus:ring-red-500"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between px-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Mostrando <span className="text-foreground font-bold">{observacionesFiltradas.length}</span> de {rawObservaciones.length} reportes
                    </p>
                </div>

                {/* Grid Section */}
                {observacionesFiltradas.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {observacionesFiltradas.map((obs) => (
                            <div
                                key={obs.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                style={{ animationDelay: `${observacionesFiltradas.indexOf(obs) * 50}ms` }}
                            >
                                <ObservacionesCardDashboard observacion={obs} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-24 dark:border-gray-800">
                        <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-900">
                            <FilterX className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">Sin incidencias encontradas</h3>
                        <p className="mt-2 text-center text-muted-foreground max-w-xs px-4">
                            No hay observaciones que coincidan con "<span className="font-bold">{searchTerm}</span>".
                        </p>
                        <Button
                            variant="link"
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-red-600 hover:text-red-700"
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

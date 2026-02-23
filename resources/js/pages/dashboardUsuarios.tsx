/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import UserCard from '@/components/UserCard';
import AppLayout from '@/layouts/app-layout';
import { Head, usePage } from '@inertiajs/react';
import { Search, Users, UserX } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardUsuarios() {
    const { usuarios } = usePage<{ usuarios: any[] }>().props;
    const [searchTerm, setSearchTerm] = useState('');

    const usuariosFiltrados = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return usuarios.filter((u) => {
            const nombre = u.name?.toLowerCase() || '';
            const cedula = u.email?.toLowerCase() || '';
            return nombre.includes(term) || cedula.includes(term);
        });
    }, [searchTerm, usuarios]);

    return (
        <AppLayout>
            <Head title="Control de Empleados" />
            <div className="min-h-screen bg-background p-4 md:p-8 font-sans dark:bg-gray-950">
                {/* Header Section */}
                <div className="mb-10 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
                    <div className="space-y-1 text-center md:text-left">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl dark:text-white">
                            Gestión de <span className="text-blue-600">Empleados</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Administra el personal y verifica el estado de sus expedientes.
                        </p>
                    </div>

                    <div className="hidden md:block">
                        <Users className="h-12 w-12 text-blue-100 dark:text-blue-900/40" />
                    </div>
                </div>

                {/* Filters Section */}
                <Card className="mb-10 border-none bg-white/50 p-4 shadow-sm backdrop-blur-sm dark:bg-gray-900/50">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end">
                        <div className="relative flex-1">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Buscar Personal
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    placeholder="Nombre o cédula..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-11 bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Stats / Results Meta */}
                <div className="mb-6 flex items-center justify-between px-2">
                    <p className="text-sm font-medium text-muted-foreground">
                        Mostrando <span className="text-foreground font-bold">{usuariosFiltrados.length}</span> de {usuarios.length} empleados
                    </p>
                </div>

                {/* Grid Section */}
                {usuariosFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                        {usuariosFiltrados.map((usuario) => (
                            <div
                                key={usuario.id}
                                className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                                style={{ animationDelay: `${usuariosFiltrados.indexOf(usuario) * 50}ms` }}
                            >
                                <UserCard usuario={usuario} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-24 dark:border-gray-800">
                        <div className="rounded-full bg-gray-100 p-6 dark:bg-gray-900">
                            <UserX className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">No se encontró al empleado</h3>
                        <p className="mt-2 text-center text-muted-foreground max-w-xs px-4">
                            No hay resultados para "<span className="font-bold">{searchTerm}</span>". Verifica los datos e intenta de nuevo.
                        </p>
                        <Button
                            variant="link"
                            onClick={() => setSearchTerm('')}
                            className="mt-4 text-blue-600 hover:text-blue-700"
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

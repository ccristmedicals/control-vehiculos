import GrupoNotificaciones from '@/components/GrupoNotificaciones';
// import NotificacionRealtime from '@/components/NotificacionRealtime';
import { Toaster } from '@/components/ui/sonner';
import AppLayout from '@/layouts/app-layout';
import { Notificacion } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export default function DashboardNotificaciones() {
    const { notificaciones: rawNotificaciones = [], modo } = usePage<{
        notificaciones: Notificacion[];
        modo: string;
    }>().props;
    const [searchTerm, setSearchTerm] = useState('');
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>(rawNotificaciones);
    // const [tipoFiltro, setTipoFiltro] = useState<'moto' | 'carro'>(() => {
    //     return (localStorage.getItem('tipoFiltroNoti') as 'moto' | 'carro') || 'carro';
    // });

    const notificacionesFiltradas = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return notificaciones.filter((n) => {
            const titulo = n.titulo?.toLowerCase() || '';
            const descripcion = n.descripcion?.toLowerCase() || '';
            const tipoVehiculo = n.vehiculo?.tipo?.toLowerCase() || '';

            const coincideBusqueda = titulo.includes(term) || descripcion.includes(term);
            const coincideTipo = tipoVehiculo;

            return coincideBusqueda && coincideTipo;
        });
    }, [searchTerm, notificaciones]);

    const notificacionesAgrupadas = useMemo(() => {
        return notificacionesFiltradas.reduce(
            (acc, noti) => {
                if (!acc[noti.tipo]) acc[noti.tipo] = [];
                acc[noti.tipo].push(noti);
                return acc;
            },
            {} as Record<string, Notificacion[]>,
        );
    }, [notificacionesFiltradas]);

    // useEffect(() => {
    //     localStorage.setItem('tipoFiltroNoti', tipoFiltro);
    // }, [tipoFiltro]);

    const marcarYRedirigir = async (notificacion: Notificacion) => {
        const { id, tipo, vehiculo_id } = notificacion;
        try {
            await router.put(
                `/notificaciones/${id}/marcar-leida`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setNotificaciones((prev) => prev.filter((n) => n.id !== id));
                        const destino =
                            tipo === 'documentoUsuario' && notificacion.usuario_id
                                ? `/perfil/${notificacion.usuario_id}`
                                : !vehiculo_id
                                  ? '/dashboard'
                                  : tipo === 'nivelFluido' || tipo === 'chequeoOmitido'
                                    ? `/fichaTecnica/${vehiculo_id}/revisionFluidos`
                                    : tipo === 'revisionSemanal'
                                      ? `/fichaTecnica/${vehiculo_id}/revisionSemanal`
                                      : ['permiso', 'cambioInput', 'estado_item', 'reasignacion'].includes(tipo)
                                        ? `/fichaTecnica/${vehiculo_id}`
                                        : tipo === 'auditoria'
                                          ? `/fichaTecnica/${vehiculo_id}/facturas`
                                          : tipo === 'observacion'
                                            ? `/fichaTecnica/${vehiculo_id}/observaciones`
                                            : '/dashboard';
                        router.visit(destino);
                        router.visit(destino, {
                            preserveScroll: true,
                            onFinish: () => {
                                router.reload({ only: ['notificaciones'] });
                            },
                        });
                    },
                },
            );
        } catch (error) {
            console.error('Error al procesar la notificación:', error);
        }
    };
    console.log(notificaciones);
    return (
        <AppLayout>
            <Head title="Dashboard de Notificaciones" />
            <div className="min-h-screen bg-background px-4 py-10 font-sans dark:bg-gray-900">
                {/* <NotificacionRealtime /> */}

                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard de Notificaciones</h1>
                </div>

                <div className="mb-6 flex justify-center gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400 dark:text-gray-300" />
                        <input
                            type="text"
                            placeholder="Buscar por título o descripción"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-md border border-gray-300 bg-white px-10 py-2 text-sm text-gray-800 shadow-sm focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        />
                    </div>
                    {/* <select
                        value={tipoFiltro}
                        onChange={(e) => setTipoFiltro(e.target.value as 'moto' | 'carro')}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-green-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="moto">Motos</option>
                        <option value="carro">Carros</option>
                    </select> */}
                </div>

                {modo === 'admin' && notificaciones.length > 0 && (
                    <div className="mb-6 text-center">
                        <button
                            onClick={() => {
                                toast('¿Marcar todas como leídas?', {
                                    description: 'Esta acción ocultará todas las notificaciones del dashboard.',
                                    action: {
                                        label: 'Confirmar',
                                        onClick: () => {
                                            router.put(
                                                '/notificaciones/marcar-todas',
                                                {},
                                                {
                                                    preserveScroll: true,
                                                    onSuccess: () => {
                                                        router.visit('/notificaciones', { preserveScroll: true });
                                                    },
                                                },
                                            );
                                        },
                                    },
                                });
                            }}
                            className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                            Marcar todas como leídas
                        </button>
                    </div>
                )}

                <div className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Mostrando <strong>{notificacionesFiltradas.length}</strong> de {notificaciones.length} notificaciones
                </div>

                {Object.entries(notificacionesAgrupadas).length > 0 ? (
                    Object.entries(notificacionesAgrupadas).map(([tipo, grupo]) => (
                        <GrupoNotificaciones
                            key={tipo}
                            tipo={tipo}
                            notificaciones={grupo}
                            modo={modo as 'admin' | 'user'}
                            onMarcarLeida={marcarYRedirigir}
                        />
                    ))
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400">No se encontraron notificaciones que coincidan con la búsqueda.</p>
                )}
                <Toaster />
            </div>
        </AppLayout>
    );
}

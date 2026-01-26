/* eslint-disable @typescript-eslint/no-explicit-any */
import FormCard from '@/components/FormCard';
import AppLayout from '@/layouts/app-layout';
import { Field, PageProps, VehiculoCompleto } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

// --- Interfaces Locales ---
interface Envio {
    id: number;
    descripcion: string;
    estado: 'pendiente' | 'en_camino' | 'recibido' | 'rechazado';
    foto_envio: string | null;
    foto_recibo: string | null;
    created_at: string;
    user: { name: string };
    admin: { name: string } | null;
}

interface PagePropsEnvios extends PageProps {
    vehiculo: VehiculoCompleto;
    envios: Envio[];
    auth: {
        user: { id: number; name: string; roles?: string[] };
    };
    isAdmin: boolean;
}

export default function Envios() {
    const { vehiculo, envios, isAdmin } = usePage<PagePropsEnvios>().props;

    // Estado para el Modal de Imágenes (Igual que en Asignaciones)
    const [imagenModal, setImagenModal] = useState<string | null>(null);

    const fields: Field[] = [
        {
            id: 'descripcion',
            label: 'Descripción del Repuesto / Falla',
            type: 'textarea',
            placeholder: 'Ej: Necesito pastillas de freno delanteras...',
            required: true,
        },
    ];

    const handleCreateSubmit = (formData: any) => {
        router.post(`/fichaTecnica/${vehiculo.placa}/envios`, formData, {
            preserveScroll: true,
            onSuccess: () => console.log("Solicitud creada"),
        });
    };

    return (
        <AppLayout>
            <Head title={`Envíos - ${vehiculo.placa}`} />

            <div className="min-h-screen bg-gray-50 px-4 py-10 font-sans dark:bg-gray-900">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                        Gestión de Repuestos: {vehiculo.modelo}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">{vehiculo.placa}</p>
                </div>

                <div className="mx-auto max-w-5xl space-y-8">
                    {/* SECCIÓN 1: FORMULARIO */}
                    <FormCard
                        title="Solicitar Nuevo Repuesto"
                        fields={fields}
                        buttonText="Crear Solicitud"
                        formType="solicitud"
                        onSubmit={handleCreateSubmit}
                    />

                    {/* SECCIÓN 2: LISTADO DE TARJETAS */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white px-2">
                            Historial de Solicitudes
                        </h2>

                        {envios.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl bg-white p-10 text-center shadow dark:bg-gray-800">
                                <div className="mb-4 rounded-full bg-gray-100 p-3 dark:bg-gray-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-8 w-8 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.75h3.75M12 11.25h-3.75m-4.5-3.75h16.5" />
                                    </svg>
                                </div>
                                <p className="text-gray-500 dark:text-gray-400">No hay solicitudes registradas para este vehículo.</p>
                            </div>
                        ) : (
                            envios.map((envio) => (
                                <EnvioCard
                                    key={envio.id}
                                    envio={envio}
                                    vehiculoPlaca={vehiculo.placa}
                                    isAdmin={isAdmin}
                                    // Pasamos la función para abrir el modal del padre
                                    onViewImage={(url) => setImagenModal(url)}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* MODAL DE IMAGEN (Idéntico a Asignaciones) */}
                {imagenModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity p-4"
                        onClick={() => setImagenModal(null)}
                    >
                        <div className="relative max-w-5xl animate-in zoom-in-95 duration-200">
                            <button
                                className="absolute -right-4 -top-4 rounded-full bg-white p-2 text-gray-900 shadow-lg hover:bg-gray-100 z-10"
                                onClick={() => setImagenModal(null)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                </svg>
                            </button>
                            <img
                                src={imagenModal}
                                alt="Evidencia ampliada"
                                className="max-h-[85vh] w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/20"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

// ==========================================
// COMPONENTE TARJETA (Integrado en el mismo archivo o separado)
// ==========================================

const EnvioCard = ({
    envio,
    vehiculoPlaca,
    isAdmin,
    onViewImage
}: {
    envio: Envio;
    vehiculoPlaca: string;
    isAdmin: boolean;
    onViewImage: (url: string) => void;
}) => {
    const [procesando, setProcesando] = useState(false);
    const [archivo, setArchivo] = useState<File | null>(null);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setArchivo(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const cambiarEstado = (nuevoEstado: string) => {
        if ((nuevoEstado === 'en_camino' || nuevoEstado === 'recibido') && !archivo) {
            alert("Debes subir una foto de evidencia.");
            return;
        }
        if (!confirm("¿Confirmar cambio de estado?")) return;

        setProcesando(true);
        router.post(`/fichaTecnica/${vehiculoPlaca}/envios/${envio.id}`, {
            _method: 'POST',
            estado: nuevoEstado,
            foto_envio: nuevoEstado === 'en_camino' ? archivo : null,
            foto_recibo: nuevoEstado === 'recibido' ? archivo : null,
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setProcesando(false);
                setMostrarInput(false);
                setArchivo(null);
                setPreview(null);
            },
            onError: () => setProcesando(false)
        });
    };

    // Configuración de estilos según estado
    const config = {
        pendiente: {
            color: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20', text: 'Pendiente', icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            )
        },
        en_camino: {
            color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-800 ring-blue-700/10', text: 'En Camino', icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
            )
        },
        recibido: {
            color: 'bg-[#49af4e]', badge: 'bg-[#49af4e]/10 text-[#49af4e] ring-[#49af4e]/20', text: 'Completado', icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )
        },
        rechazado: {
            color: 'bg-red-500', badge: 'bg-red-50 text-red-700 ring-red-600/10', text: 'Rechazado', icon: (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            )
        },
    };

    const currentConfig = config[envio.estado];

    return (
        <div className="group relative flex flex-col gap-6 overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Barra lateral de color (Igual que en Asignaciones) */}
            <div className={`absolute left-0 top-0 h-full w-1.5 ${currentConfig.color}`} />

            {/* Cabecera y Contenido */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col justify-between sm:flex-row sm:items-center">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {new Date(envio.created_at).toLocaleDateString()} • {envio.user.name}
                        </span>
                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${currentConfig.badge}`}>
                            {currentConfig.icon}
                            {currentConfig.text}
                        </span>
                    </div>

                    {/* Botones de Acción Inicial */}
                    <div className="mt-3 flex gap-2 sm:mt-0">
                        {isAdmin && envio.estado === 'pendiente' && !mostrarInput && (
                            <>
                                <button
                                    onClick={() => setMostrarInput(true)}
                                    className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-transform hover:bg-blue-700 active:scale-95"
                                >
                                    Aprobar
                                </button>
                                <button
                                    onClick={() => { if (confirm('¿Rechazar solicitud?')) router.post(`/fichaTecnica/${vehiculoPlaca}/envios/${envio.id}`, { _method: 'POST', estado: 'rechazado' }) }}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-transform hover:bg-gray-50 active:scale-95 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                                >
                                    Rechazar
                                </button>
                            </>
                        )}
                        {envio.estado === 'en_camino' && !mostrarInput && (
                            <button
                                onClick={() => setMostrarInput(true)}
                                className="animate-pulse rounded-lg bg-[#49af4e] px-4 py-1.5 text-xs font-semibold text-white shadow-md transition-transform hover:bg-[#3d9641] active:scale-95"
                            >
                                Confirmar Recepción
                            </button>
                        )}
                    </div>
                </div>

                {/* Descripción */}
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
                    <p className="text-sm text-gray-600 dark:text-gray-300">{envio.descripcion}</p>
                </div>

                {/* Grid de Fotos (Estilo Asignaciones) */}
                {(envio.foto_envio || envio.foto_recibo) && (
                    <div className="flex flex-wrap gap-6 border-t border-gray-100 pt-4 dark:border-gray-700">
                        {/* Foto Envío */}
                        {envio.foto_envio && (
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-gray-500">EVIDENCIA ENVÍO (ADMIN)</span>
                                <div className="flex items-end gap-3">
                                    <div
                                        className="group/img relative h-20 w-32 cursor-zoom-in overflow-hidden rounded-lg border border-gray-200 shadow-sm"
                                        onClick={() => onViewImage(envio.foto_envio!)}
                                    >
                                        <img src={envio.foto_envio} className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                    </div>
                                    <button
                                        onClick={() => onViewImage(envio.foto_envio!)}
                                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-md transition-transform hover:bg-blue-700 active:scale-95"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                        Ver
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Foto Recibo */}
                        {envio.foto_recibo && (
                            <div className="flex flex-col gap-2">
                                <span className="text-xs font-bold text-[#49af4e]">EVIDENCIA RECIBIDO (USUARIO)</span>
                                <div className="flex items-end gap-3">
                                    <div
                                        className="group/img relative h-20 w-32 cursor-zoom-in overflow-hidden rounded-lg border border-gray-200 shadow-sm"
                                        onClick={() => onViewImage(envio.foto_recibo!)}
                                    >
                                        <img src={envio.foto_recibo} className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110" />
                                    </div>
                                    <button
                                        onClick={() => onViewImage(envio.foto_recibo!)}
                                        className="flex items-center gap-1.5 rounded-lg bg-[#49af4e] px-3 py-1.5 text-xs font-bold text-white shadow-md transition-transform hover:bg-[#3d9641] active:scale-95"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                                        Ver
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ZONA DE INPUT (Desplegable) */}
                {mostrarInput && (
                    <div className="mt-2 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-800/50">
                            <p className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isAdmin ? 'Evidencia del envío (Foto/Guía):' : 'Foto del repuesto recibido:'}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-xs text-gray-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-xs file:font-semibold
                                    file:bg-[#49af4e] file:text-white
                                    hover:file:bg-[#3d9641] file:cursor-pointer cursor-pointer"
                                />

                                {preview && (
                                    <img src={preview} alt="Vista previa" className="h-10 w-10 rounded-lg object-cover shadow-sm ring-2 ring-white" />
                                )}
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={() => setMostrarInput(false)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 hover:bg-gray-200 rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => cambiarEstado(isAdmin ? 'en_camino' : 'recibido')}
                                    disabled={procesando || !archivo}
                                    className="flex items-center gap-2 rounded-lg bg-[#49af4e] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-transform hover:bg-[#3d9641] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {procesando ? 'Procesando...' : 'Confirmar y Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Asignaciones() {
    const { vehiculo, historial, isAdmin } = usePage<PageProps>().props;
    const [imagenModal, setImagenModal] = useState<string | null>(null);

    // Corrección de kilometraje (solo admin)
    const [editandoId, setEditandoId] = useState<number | null>(null);
    const [kmValor, setKmValor] = useState<string>('');
    const [guardando, setGuardando] = useState(false);

    const iniciarEdicion = (id: number, kmActual: number) => {
        setEditandoId(id);
        setKmValor(String(kmActual));
    };

    const cancelarEdicion = () => {
        setEditandoId(null);
        setKmValor('');
    };

    const guardarKm = (id: number) => {
        setGuardando(true);
        router.patch(
            `/fichaTecnica/${vehiculo.placa}/asignaciones/${id}`,
            { kilometraje: kmValor },
            {
                preserveScroll: true,
                onSuccess: () => cancelarEdicion(),
                onFinish: () => setGuardando(false),
            },
        );
    };

    return (
        <AppLayout>
            <Head title={`Historial de Asignaciones - ${vehiculo.placa}`} />
            <div className="min-h-screen bg-gray-100 px-4 py-10 dark:bg-gray-900">
                <h1 className="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-gray-100">Historial de Asignaciones</h1>

                <div className="mx-auto max-w-6xl space-y-6">
                    {historial.length > 0 ? (
                        historial.map((registro) => (
                            <div
                                key={registro.id}
                                className="flex flex-row justify-between gap-6 rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800"
                            >
                                <div className="flex-1">
                                    <div className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">Vehículo:</span> {registro.vehiculo?.placa}
                                    </div>

                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">Asignado a:</span> {registro.user?.name}
                                    </div>

                                    <div className="text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">Asignado por:</span> {registro.admin?.name}
                                    </div>

                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                        <span className="font-semibold">Kilometraje:</span>

                                        {editandoId === registro.id ? (
                                            <>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={kmValor}
                                                    onChange={(e) => setKmValor(e.target.value)}
                                                    autoFocus
                                                    className="w-32 rounded-md border border-gray-300 bg-white px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                                />
                                                <button
                                                    type="button"
                                                    disabled={guardando}
                                                    onClick={() => guardarKm(registro.id)}
                                                    className="rounded-md bg-[#49af4e] px-3 py-1 text-xs font-semibold text-white hover:bg-[#3d9641] disabled:opacity-50"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={cancelarEdicion}
                                                    className="rounded-md bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100"
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <span>{registro.kilometraje} km</span>
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => iniciarEdicion(registro.id, registro.kilometraje)}
                                                        className="rounded-md border border-gray-300 px-2 py-0.5 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                                    >
                                                        Corregir
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {registro.fecha_asignacion && (
                                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                            <span className="font-semibold">Fecha:</span> {new Date(registro.fecha_asignacion).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>

                                {registro.foto_kilometraje && (
                                    <div
                                        className="w-48 flex-shrink-0 cursor-pointer"
                                        onClick={() => setImagenModal(`/storage/${registro.foto_kilometraje}`)}
                                    >
                                        <img
                                            src={`/storage/${registro.foto_kilometraje}`}
                                            alt="Foto de kilometraje"
                                            className="w-full rounded-md object-cover shadow-md"
                                        />
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">No hay asignaciones registradas para este vehículo.</div>
                    )}
                    {imagenModal && (
                        <div
                            className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black"
                            onClick={() => setImagenModal(null)}
                        >
                            <img src={imagenModal} alt="Imagen ampliada" className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg" />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

/* eslint-disable react-hooks/exhaustive-deps */
import AppLayout from '@/layouts/app-layout';
import { UsuarioBasico } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function PerfilUsuario() {
    const { usuario } = usePage<{ usuario: UsuarioBasico }>().props;

    const [formData, setFormData] = useState<Record<string, string | File | null>>({});
    const [submitting, setSubmitting] = useState(false); // 1. ESTADO PARA CONTROLAR EL MODAL DE IMAGEN
    const [imagenModal, setImagenModal] = useState<string | null>(null);

    const documentos = [
        { label: 'Cédula', key: 'cedula' },
        { label: 'Licencia', key: 'licencia' },
        { label: 'Certificado Médico', key: 'certificado_medico' },
    ];

    const handleFileChange = (key: string, file: File | null) => {
        setFormData((prev) => ({ ...prev, [`foto_${key}`]: file }));
    };

    const handleDateChange = (key: string, date: string) => {
        setFormData((prev) => ({ ...prev, [`vencimiento_${key}`]: date }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) payload.append(key, value);
        });
        payload.append('_method', 'PATCH');
        router.post(`/perfil/${usuario.id}`, payload, {
            forceFormData: true,
            onFinish: () => setSubmitting(false),
        });
    };

    useEffect(() => {
        const initialData: Record<string, string | File | null> = {};
        documentos.forEach(({ key }) => {
            const vencimiento = usuario[`vencimiento_${key}` as keyof UsuarioBasico] as string | undefined;
            if (vencimiento) initialData[`vencimiento_${key}`] = vencimiento;
        });
        setFormData(initialData);
    }, []);

    return (
        <AppLayout>
            <Head title={`Perfil de ${usuario.name}`} />
            <div className="min-h-screen bg-background px-4 py-10 font-sans dark:bg-gray-900">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Perfil del Empleado</h1>
                </div>

                <div className="mx-auto max-w-5xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    {/* Datos personales */}
                    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="rounded-lg border bg-gray-100 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-700">
                            <h2 className="mb-1 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Nombre completo</h2>
                            <p className="text-center text-lg font-semibold text-gray-900 dark:text-white">{usuario.name}</p>
                        </div>

                        <div className="rounded-lg border bg-gray-100 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-700">
                            <h2 className="mb-1 text-center text-sm font-medium text-gray-500 dark:text-gray-400">Cédula</h2>
                            <p className="text-center text-lg font-semibold text-gray-900 dark:text-white">{usuario.email}</p>{' '}
                        </div>
                    </div>
                    {/* Documentos */}
                    <form onSubmit={handleSubmit} encType="multipart/form-data">
                        <h2 className="mb-6 text-center text-xl font-bold text-gray-800 dark:text-white">Documentación</h2>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {documentos.map(({ label, key }) => {
                                const foto = usuario[`foto_${key}` as keyof UsuarioBasico] as string | undefined;
                                const vencimiento = usuario[`vencimiento_${key}` as keyof UsuarioBasico] as string | undefined;
                                const vencido = vencimiento && new Date(vencimiento) < new Date();
                                return (
                                    <div key={key} className="rounded-lg border bg-gray-50 p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="text-md font-semibold text-gray-900 dark:text-white">{label}</h3>

                                            {vencimiento && (
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-medium ${vencido ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                        }`}
                                                >
                                                    {vencido ? 'Vencido' : 'Vigente'}
                                                </span>
                                            )}
                                        </div>

                                        {foto ? (
                                            <img
                                                // Manejador de clic añadido aquí
                                                onClick={() => setImagenModal(foto)}
                                                src={foto}
                                                alt={`Documento ${label}`}
                                                // Estilos de clic e interacción añadidos
                                                className="mb-3 max-h-40 w-full cursor-pointer rounded object-contain shadow transition-transform hover:scale-[1.02]"
                                            />
                                        ) : (
                                            <p className="mb-3 text-sm text-gray-500 italic dark:text-gray-400">No cargado</p>
                                        )}

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    Reemplazar documento
                                                </label>

                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                                                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    Nueva fecha de vencimiento
                                                </label>

                                                <input
                                                    type="date"
                                                    onChange={(e) => handleDateChange(key, e.target.value)}
                                                    value={
                                                        typeof formData[`vencimiento_${key}`] === 'string'
                                                            ? (formData[`vencimiento_${key}`] as string)
                                                            : vencimiento || ''
                                                    }
                                                    className="mt-1 w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Botón de acción */}
                        <div className="mt-10 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold text-white shadow-md transition-transform duration-200 ${submitting ? 'cursor-not-allowed bg-gray-400' : 'bg-[#49af4e] hover:scale-105 hover:bg-green-700'
                                    }`}
                            >
                                {submitting ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                                        </svg>
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar cambios'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {/* MODAL DE IMAGEN AMPLIADA */}
            {imagenModal && (
                <div
                    className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setImagenModal(null)}
                >
                    <img
                        src={imagenModal}
                        alt="Documento ampliado"
                        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </AppLayout>
    );
}

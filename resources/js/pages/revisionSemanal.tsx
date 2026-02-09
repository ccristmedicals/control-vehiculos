/* eslint-disable @typescript-eslint/no-explicit-any */
import FichaSeccion from '@/components/FichaSeccion';
import UploadProgressBar from '@/components/UploadProgressBar';
import { cheyenneTritonFields } from '@/constants/cheyenneTritonFields';
import { fluidosSemanalFields } from '@/constants/fluidosSemanalFields';
import { sparkPeugeotFields } from '@/constants/sparkPeugeotFields';
import AppLayout from '@/layouts/app-layout';
import type { Field } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

type FormularioGrupo = 'SPARK_PEUGEOT' | 'CHEYENNE_TRITON' | 'MOTO';

export default function RevisionSemanal() {
    const { vehiculo, revisiones, inicio, final } = usePage<{
        vehiculo: { tipo: 'CARRO' | 'MOTO'; modelo: string; placa: string };
        revisiones: {
            id: number;
            tipo_formulario: number;
            observacion?: { observacion: string };
            imagenes: { tipo: string; imagen: string }[];
            created_at: string;
        }[];
        inicio: string;
        final: string;
    }>().props;

    const tipoVehiculo = vehiculo.tipo;
    const placa = vehiculo.placa;

    const [formularioSeleccionado, setFormularioSeleccionado] = useState<FormularioGrupo | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});

    // Estados para la carga y error
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [uploadPercentage, setUploadPercentage] = useState(0);
    const [uploadStats, setUploadStats] = useState({ loaded: 0, total: 0 });

    // 1. NUEVO ESTADO: Controla si vemos todas o solo las recientes
    const [verHistorialCompleto, setVerHistorialCompleto] = useState(false);

    // 2. LÓGICA DE FILTRADO: Muestra todas si el estado es true, sino corta en 3
    const revisionesVisibles = verHistorialCompleto ? revisiones : revisiones.slice(0, 3);

    // Autoasignar tipo de formulario si es moto
    useEffect(() => {
        if (tipoVehiculo === 'MOTO') {
            setFormularioSeleccionado('MOTO');
        }
    }, [tipoVehiculo]);

    const handleFormSubmit = async (formType: string, data: Record<string, any>, placa: string) => {
        setProcessing(true);
        setUploadError(null);

        const semanal: { tipo: string; imagen: string }[] = [];
        const tipoFormulario =
            formularioSeleccionado === 'SPARK_PEUGEOT'
                ? 1
                : formularioSeleccionado === 'CHEYENNE_TRITON'
                  ? 2
                  : formularioSeleccionado === 'MOTO'
                    ? 3
                    : null;

        const baseFields: Field[] =
            formularioSeleccionado === 'MOTO'
                ? fluidosSemanalFields['MOTO']
                : formularioSeleccionado === 'SPARK_PEUGEOT'
                  ? sparkPeugeotFields['CARRO']
                  : cheyenneTritonFields['CARRO'];

        try {
            // 1. Recolectar todos los archivos
            const uploadData = new FormData();
            uploadData.append('tipo', 'fotos-semanales');
            let hasFiles = false;

            baseFields.forEach((field) => {
                if (field.type === 'file') {
                    const imagen = data[field.id];
                    if (imagen instanceof File) {
                        // Usamos el ID del campo como clave para saber cuál es cuál
                        uploadData.append(field.id, imagen);
                        hasFiles = true;
                    }
                }
            });

            // 2. Si hay archivos, hacemos UNA sola petición
            let resultados: Record<string, string> = {};
            if (hasFiles) {
                setUploadPercentage(1); // Force progress bar to show immediately
                const response = await axios.post('http://98.94.185.164:8021/upload', uploadData, {
                    onUploadProgress: (progressEvent) => {
                        const total = progressEvent.total || 0;
                        const validTotal = total > 0 ? total : progressEvent.loaded;
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / validTotal);

                        setUploadPercentage(percentCompleted);
                        setUploadStats({
                            loaded: progressEvent.loaded,
                            total: validTotal,
                        });
                    },
                });

                if (response.data.status === 'success' && response.data.results) {
                    resultados = response.data.results;
                } else {
                    throw new Error('La respuesta del servidor no tiene el formato esperado.');
                }

                // Resetear la barra de carga cuando Go retorna respuesta
                setUploadPercentage(0);
                setUploadStats({ loaded: 0, total: 0 });
            }

            // 3. Mapeamos los resultados a la estructura que espera el backend
            baseFields.forEach((field) => {
                if (field.type === 'file') {
                    // Si se subió ahora, estará en 'resultados'
                    if (resultados[field.id]) {
                        semanal.push({
                            tipo: field.id,
                            imagen: resultados[field.id],
                        });
                    } else if (data[field.id] && !(data[field.id] instanceof File)) {
                        // Caso hipotético: si ya venía como string (ej. modo edición, aunque aquí parece ser create)
                        // En create normal, si no es File, probablemente no sea nada o sea string directo si se manejara así.
                        // Mantengamos la lógica original: solo nos importa si se subió.
                    }
                }
            });

            const observacionGeneral = data['observacion_general'];

            router.post(
                `/fichaTecnica/${placa}/revisionSemanal`,
                {
                    tipo_formulario: tipoFormulario,
                    semanal,
                    observacion: observacionGeneral,
                },
                {
                    preserveScroll: true,
                    forceFormData: true,
                    onSuccess: () => {
                        // Opcional: Resetear la vista al enviar
                        setVerHistorialCompleto(false);
                        setFormData({});
                        router.reload({ only: ['revisiones'] });
                    },
                    onFinish: () => {
                        setProcessing(false);
                        setUploadPercentage(0);
                        setUploadStats({ loaded: 0, total: 0 });
                    },
                },
            );
        } catch (error: any) {
            console.error('Error uploading images:', error);
            setUploadError(
                error.response?.data?.message ||
                    error.message ||
                    'Ocurrió un error al subir las imágenes. Por favor revisa tu conexión e intenta de nuevo.',
            );
            setProcessing(false);
            setUploadPercentage(0);
        }
    };

    // 3. CAMBIO VISUAL: Añadimos un index para saber cuál es la más reciente visualmente
    const renderFichaFromRevision = (revision: any, index: number) => {
        const tipoFormulario = revision.tipo_formulario === 1 ? 'SPARK_PEUGEOT' : revision.tipo_formulario === 2 ? 'CHEYENNE_TRITON' : 'MOTO';

        const baseFields: Field[] =
            tipoFormulario === 'MOTO'
                ? fluidosSemanalFields['MOTO']
                : tipoFormulario === 'SPARK_PEUGEOT'
                  ? sparkPeugeotFields['CARRO']
                  : cheyenneTritonFields['CARRO'];

        const hasObservacion = baseFields.some((f) => f.id === 'observacion_general');
        const fields: Field[] = hasObservacion
            ? baseFields
            : [...baseFields, { id: 'observacion_general', label: 'Observación general', type: 'textarea', required: false }];

        const expediente: Record<string, any> = {};
        revision.imagenes.forEach((img: any) => {
            expediente[img.tipo] = img.imagen;
        });
        if (revision.observacion?.observacion) {
            expediente['observacion_general'] = revision.observacion.observacion;
        }

        // Ajustamos el título para que no diga siempre "Última"
        const titulo =
            index === 0
                ? `Última revisión (${tipoFormulario}) - ${new Date(revision.created_at).toLocaleDateString()}`
                : `Revisión Histórica (${tipoFormulario}) - ${new Date(revision.created_at).toLocaleDateString()}`;

        return (
            <FichaSeccion
                key={revision.id}
                title={titulo}
                fields={fields}
                formType="semanal"
                expediente={expediente}
                onChange={() => {}}
                onSubmit={() => {}}
            />
        );
    };

    const renderFormularioNuevo = () => {
        // ... (Tu renderFormularioNuevo se mantiene igual)
        const baseFields: Field[] =
            formularioSeleccionado === 'MOTO'
                ? fluidosSemanalFields['MOTO']
                : formularioSeleccionado === 'SPARK_PEUGEOT'
                  ? sparkPeugeotFields['CARRO']
                  : cheyenneTritonFields['CARRO'];

        const hasObservacion = baseFields.some((f) => f.id === 'observacion_general');
        const fields: Field[] = hasObservacion
            ? baseFields
            : [...baseFields, { id: 'observacion_general', label: 'Observación general', type: 'textarea', required: false }];

        return (
            <div>
                {uploadError && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/50">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                    <p>{uploadError}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {processing && (
                    <div className="mb-4">
                        {uploadPercentage > 0 ? (
                            <UploadProgressBar percentage={uploadPercentage} loaded={uploadStats.loaded} total={uploadStats.total} />
                        ) : (
                            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/50">
                                <div className="flex">
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Subiendo imágenes y guardando... Por favor espera.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <FichaSeccion
                    title={`Nueva Revisión Semanal (${formularioSeleccionado})`}
                    fields={fields}
                    formType="semanal"
                    expediente={formData}
                    onChange={setFormData}
                    onSubmit={(data) => handleFormSubmit('semanal', data, placa)}
                    loading={processing}
                />
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title={`Revisión Semanal - ${vehiculo.modelo}`} />
            <div className="min-h-screen bg-background px-4 py-6 font-sans md:py-10 dark:bg-gray-900">
                <div className="mb-5 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">Revisión Semanal {vehiculo.modelo}</h1>
                </div>

                <div className="mx-auto mb-10 max-w-5xl">
                    <div className="mb-4 flex justify-end gap-4 text-gray-700 dark:text-gray-200">
                        <p>
                            <span className="font-semibold">Desde:</span> {inicio}
                        </p>
                        <p>
                            <span className="font-semibold">Hasta:</span> {final}
                        </p>
                    </div>

                    {/* 4. RENDERIZADO DINÁMICO: Mapeamos el array visible */}
                    <div className="mb-10 space-y-10">
                        {revisionesVisibles.length > 0 ? (
                            revisionesVisibles.map((revision, index) => <div key={revision.id}>{renderFichaFromRevision(revision, index)}</div>)
                        ) : (
                            <p className="text-center text-gray-500">No hay revisiones registradas.</p>
                        )}
                    </div>

                    {/* 5. BOTÓN VER MÁS: Solo aparece si hay más de 3 revisiones en total */}
                    {revisiones.length > 3 && (
                        <div className="mb-10 flex justify-center">
                            <button
                                onClick={() => setVerHistorialCompleto(!verHistorialCompleto)}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                {verHistorialCompleto ? 'Ocultar historial antiguo' : `Ver ${revisiones.length - 3} revisiones anteriores`}
                            </button>
                        </div>
                    )}

                    <div className="mt-10 border-t pt-10">
                        <h2 className="mb-4 text-xl font-semibold text-gray-800 dark:text-white">Registrar nueva revisión</h2>
                        {tipoVehiculo === 'CARRO' && (
                            <div className="mb-6">
                                <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    Selecciona el tipo de formulario:
                                </label>
                                <select
                                    value={formularioSeleccionado ?? ''}
                                    onChange={(e) => setFormularioSeleccionado(e.target.value as FormularioGrupo)}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="SPARK_PEUGEOT">Spark / Peugeot</option>
                                    <option value="CHEYENNE_TRITON">Cheyenne / Triton</option>
                                </select>
                            </div>
                        )}
                        {formularioSeleccionado && renderFormularioNuevo()}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

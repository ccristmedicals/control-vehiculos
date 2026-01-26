/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import FichaSeccionFluidos from '@/components/FichaSeccionFluidos';
import { fluidosPorRevisarFields } from '@/constants/fluidosPorRevisarFields';
import AppLayout from '@/layouts/app-layout';
import { RevisionFluido, RevisionFluidosProps } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Definimos el tipo para el historial que viene del backend
type HistorialItem = {
    fecha: string;
    fecha_humana: string;
    items: RevisionFluido[];
};

export default function revisionFluidos({ vehiculoId }: RevisionFluidosProps) {
    const diasSemana = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const diasSemanaTexto = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    const { modo, revisionDiaria, historial, vehiculo } = usePage<{
        modo: string;
        revisionDiaria?: Record<string, RevisionFluido[]>; // Datos semana actual
        historial: HistorialItem[]; // Datos históricos completos
        vehiculo: { tipo: 'CARRO' | 'MOTO'; modelo: string };
    }>().props;

    const tipoVehiculo = vehiculo?.tipo === 'MOTO' ? 'MOTO' : 'CARRO';
    const fluidosBase = fluidosPorRevisarFields[tipoVehiculo];

    const esAdmin = modo === 'admin';
    const diaActual = diasSemana[(new Date().getDay() + 6) % 7];
    const diasVisibles = esAdmin ? diasSemana : [diaActual];
    const [validationError, setValidationError] = useState<string | null>(null);

    // Estados para la carga y error de subida (NUEVO)
    const [processing, setProcessing] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // --- LÓGICA DE HISTORIAL (NUEVO) ---
    const [verHistorialCompleto, setVerHistorialCompleto] = useState(false);

    // Si historial existe, cortamos o mostramos todo
    const historialVisible = verHistorialCompleto ? historial : (historial || []).slice(0, 3);
    // -----------------------------------

    // Inicialización del estado del formulario (Semana Actual)
    const [revisiones] = useState(() => {
        const mapa = diasSemana.reduce((diasAcc: any, dia) => {
            diasAcc[dia] = fluidosBase.reduce((acc: any, fluido) => {
                acc[fluido.id] = { nivel: '', foto: null, realizado: false };
                return acc;
            }, {});
            return diasAcc;
        }, {});

        if (revisionDiaria) {
            Object.entries(revisionDiaria).forEach(([diaTexto, revisionesDelDia]) => {
                const diaKey = diaTexto.toLowerCase();
                if (!mapa[diaKey]) return;
                revisionesDelDia.forEach((rev) => {
                    if (mapa[diaKey][rev.tipo]) {
                        mapa[diaKey][rev.tipo] = {
                            nivel: String(rev.nivel_fluido ?? ''),
                            foto: rev.imagen,
                            realizado: !!rev.revisado,
                        };
                    }
                });
            });
        }
        return mapa;
    });

    const fluidosFields = fluidosBase.flatMap((fluido) => [
        {
            id: fluido.id,
            label: fluido.label,
            type: 'select' as const,
            options: fluido.options,
            required: true,
        },
        {
            id: `${fluido.id}_foto`,
            label: `Foto de ${fluido.label}`,
            type: 'file' as const,
            required: true,
        },
    ]);

    const handleSubmitFluidos = async (dia: string, formData: Record<string | number, string | boolean | File | null>) => {
        setValidationError(null);
        setUploadError(null);
        setProcessing(true);

        // ... (validation logic remains same)
        const missingImage = fluidosBase.find((fluido) => {
            const nivel = formData[fluido.id];
            const imagen = formData[`${fluido.id}_foto`];
            return nivel && !imagen;
        });

        if (missingImage) {
            setValidationError(`Por favor, sube la imagen para el nivel de ${missingImage.label}.`);
            setProcessing(false);
            return;
        }

        try {
            // 1. Preparar Batch Upload
            const batchData = new FormData();
            batchData.append('tipo', 'fotos-diarias');
            let hasFiles = false;

            // Recorremos buscando archivos para subir
            fluidosBase.forEach((fluido) => {
                const imagen = formData[`${fluido.id}_foto`];
                if (imagen instanceof File) {
                    // Usamos una clave única: ID del fluido + _foto
                    batchData.append(`${fluido.id}_foto`, imagen);
                    hasFiles = true;
                }
            });

            // 2. Realizar la petición única si hay archivos
            let resultados: Record<string, string> = {};
            if (hasFiles) {
                const response = await fetch('http://98.94.185.164:8021/upload', {
                    method: 'POST',
                    body: batchData,
                });

                if (!response.ok) {
                    throw new Error(`Error al subir imágenes: ${response.status}`);
                }

                const resData = await response.json();
                if (resData.status === 'success' && resData.results) {
                    resultados = resData.results;
                } else {
                    throw new Error('La respuesta del servidor no tiene el formato esperado.');
                }
            }

            // 3. Construir el form final para Laravel
            const form = new FormData();
            fluidosBase.forEach((fluido, index) => {
                const nivel = formData[fluido.id];
                const keyFoto = `${fluido.id}_foto`;

                // Buscar nombre de imagen: o viene del batch result o ya estaba (si no era File)
                let nombreImagen = null;
                if (resultados[keyFoto]) {
                    nombreImagen = resultados[keyFoto];
                } else {
                    // Si no se subió ahora, checkear si es string (no creo que pase en este flujo de "nueva revisión" pero por seguridad)
                    const existingInfo = formData[keyFoto];
                    if (typeof existingInfo === 'string') {
                        nombreImagen = existingInfo;
                    }
                }

                form.append(`fluidos[${index}][tipo]`, fluido.id);
                form.append(`fluidos[${index}][vehiculo_id]`, vehiculoId.toString());
                form.append(`fluidos[${index}][dia]`, dia);

                const revisado = !!nivel || !!nombreImagen ? '1' : '0'; // Corregido: si hay imagen ya subida cuenta como revisado

                if (nivel) form.append(`fluidos[${index}][nivel_fluido]`, nivel as string);
                form.append(`fluidos[${index}][revisado]`, revisado);

                if (nombreImagen) {
                    form.append(`fluidos[${index}][imagen]`, nombreImagen);
                }
            });

            router.post(`/fichaTecnica/${vehiculoId}/revisionFluidos`, form, {
                forceFormData: true,
                onSuccess: () => {
                    setValidationError(null);
                    setVerHistorialCompleto(false); // Colapsar historial al guardar
                },
                onFinish: () => setProcessing(false),
            });
        } catch (error: any) {
            console.error('Error uploading images:', error);
            setUploadError(error.message || 'Ocurrió un error al subir las imágenes. Por favor revisa tu conexión e intenta de nuevo.');
            setProcessing(false);
        }
    };

    // Función auxiliar para renderizar una ficha de historial (Solo lectura)
    const renderHistorialItem = (item: HistorialItem, index: number) => {
        // Convertimos el array de items del día en el formato de expediente
        const expedienteHistorial: Record<string, any> = {};

        item.items.forEach((rev) => {
            expedienteHistorial[rev.tipo] = rev.nivel_fluido;
            expedienteHistorial[`${rev.tipo}_foto`] = rev.imagen;
        });

        const titulo = index === 0 ? `Última revisión registrada - ${item.fecha_humana}` : `Historial - ${item.fecha_humana}`;

        return (
            <FichaSeccionFluidos
                key={item.fecha}
                title={titulo}
                fields={fluidosFields} // Usamos los mismos campos
                expediente={expedienteHistorial}
                // Pasamos una función vacía o controlamos que sea read-only en el componente hijo
                onSubmit={() => {}}
            />
        );
    };

    return (
        <AppLayout>
            <Head title="Revisión Semanal de Fluidos" />
            <div className="min-h-screen bg-background px-4 py-10 font-sans dark:bg-gray-900">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Revisión Fluidos {vehiculo?.modelo}</h1>
                </div>

                {/* SECCIÓN 1: FORMULARIO SEMANA ACTUAL (INPUTS) */}
                <div className="mb-12 border-b pb-12 dark:border-gray-700">
                    <h2 className="mb-6 text-xl font-semibold text-gray-800 dark:text-gray-200">Registrar revisión (Semana Actual)</h2>

                    {/* Mensajes de feedback (Error de validación, Error de subida, Loading) */}
                    {validationError && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/50">
                            <p className="text-sm text-red-700 dark:text-red-200">{validationError}</p>
                        </div>
                    )}
                    {uploadError && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/50">
                            <p className="text-sm text-red-700 dark:text-red-200">{uploadError}</p>
                        </div>
                    )}
                    {processing && (
                        <div className="mb-4 rounded-md bg-blue-50 p-4 dark:bg-blue-900/50">
                            <p className="text-sm text-blue-700 dark:text-blue-200">Subiendo imágenes y guardando... Por favor espera.</p>
                        </div>
                    )}

                    {diasVisibles.map((dia) => {
                        const expediente = Object.fromEntries(
                            fluidosBase.flatMap((fluido) => {
                                const registro = revisiones[dia][fluido.id];
                                return [
                                    [fluido.id, registro.nivel],
                                    [`${fluido.id}_foto`, registro.foto ?? null],
                                ];
                            }),
                        );

                        return (
                            <div key={dia} className="py-2">
                                <FichaSeccionFluidos
                                    title={`Formulario - ${diasSemanaTexto[diasSemana.indexOf(dia)]}`}
                                    fields={fluidosFields}
                                    expediente={expediente}
                                    onSubmit={(formData) => handleSubmitFluidos(dia, formData)}
                                    loading={processing}
                                />
                            </div>
                        );
                    })}
                </div>

                {/* SECCIÓN 2: HISTORIAL (VER MÁS / VER MENOS) */}
                <div className="space-y-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Historial de Revisiones</h2>

                    {historialVisible.length > 0 ? (
                        historialVisible.map((item, index) => <div key={item.fecha}>{renderHistorialItem(item, index)}</div>)
                    ) : (
                        <p className="text-gray-500">No hay historial disponible.</p>
                    )}

                    {/* BOTÓN TOGGLE */}
                    {historial && historial.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <button
                                onClick={() => setVerHistorialCompleto(!verHistorialCompleto)}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                            >
                                {verHistorialCompleto ? 'Ocultar historial antiguo' : `Ver ${historial.length - 3} revisiones anteriores`}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

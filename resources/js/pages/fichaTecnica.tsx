/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import FichaSeccion from '@/components/FichaSeccion';
import ModalAsignacionUser from '@/components/modal/ModalAsignacionUser';
import { accesoriosFields } from '@/constants/accesoriosFields';
import { expedienteTecnicoFields } from '@/constants/expedienteTecnicoFields';
import { permisologiaFields } from '@/constants/permisologiaFields';
import { piezasRevisadasFields } from '@/constants/piezasRevisadasFields';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function fichaTecnica({
    vehiculos,
    expedientesTecnicos,
    permisosGuardados,
    accesoriosGuardados = {},
    piezasGuardadas = {},
    users,
    isAdmin,
}: {
    vehiculos: any[];
    modo: string;
    expedientesTecnicos: Record<string, Record<string, string>>;
    permisosGuardados: Record<string, Record<string, string>>;
    accesoriosGuardados?: Record<string, Record<string, string>>;
    piezasGuardadas?: Record<string, Record<string, string>>;
    users: any[];
    isAdmin: boolean;
}) {
    const [vehiculoActual, setVehiculoActual] = useState(vehiculos[0]);
    const tipoVehiculo = vehiculoActual?.tipo as 'CARRO' | 'MOTO';
    const placa = vehiculoActual?.placa || '';
    const [modalOpen, setModalOpen] = useState(false);
    const [permisosLocal, setPermisosLocal] = useState(permisosGuardados);
    const [, setAccesoriosLocal] = useState(accesoriosGuardados);

    const transformarPermisos = (permisos: Record<string, any>) => {
        const plano: Record<string, string> = {};
        Object.entries(permisos).forEach(([key, value]) => {
            if (value?.fecha_expedicion) plano[`${key}_expedicion`] = value.fecha_expedicion;
            if (value?.fecha_vencimiento) plano[`${key}_vencimiento`] = value.fecha_vencimiento;
            if (value?.documento) plano[`${key}_documento`] = value.documento;
            else if (typeof value === 'string') plano[key] = value;
        });
        return plano;
    };

    const sanitizeFormData = (data: Record<string, string | boolean | File | null>): Record<string, string> => {
        const sanitized: Record<string, string> = {};
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                sanitized[key] = value;
            } else if (typeof value === 'boolean') {
                sanitized[key] = value ? 'true' : 'false';
            } else if (value instanceof File) {
                sanitized[key] = value.name;
            } else {
                sanitized[key] = '';
            }
        }
        return sanitized;
    };

    const handleFormSubmit = (
        tipo: 'expedientes' | 'permisologia' | 'accesorios' | 'piezas',
        rawData: Record<string, string | boolean | File | null>,
        vehiculoId: string,
    ) => {
        const formData = new FormData();
        formData.append('vehiculo_id', vehiculoId);

        Object.entries(rawData).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'boolean') {
                formData.append(key, value ? 'true' : 'false');
            } else if (typeof value === 'string') {
                formData.append(key, value);
            }
        });

        router.post(`/fichaTecnica/${vehiculoId}/${tipo}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                console.log(`${tipo} guardado con éxito`);

                if (tipo === 'permisologia') {
                    const sanitized = sanitizeFormData(rawData);
                    setPermisosLocal((prev) => {
                        const anterior = prev[vehiculoId] || {};
                        return {
                            ...prev,
                            [vehiculoId]: {
                                ...anterior,
                                ...Object.fromEntries(Object.entries(sanitized).filter(([_, v]) => typeof v === 'string')),
                            },
                        };
                    });
                }

                if (tipo === 'accesorios') {
                    const sanitized = sanitizeFormData(rawData);
                    setAccesoriosLocal((prev) => {
                        const anterior = prev[vehiculoId] || {};
                        return {
                            ...prev,
                            [vehiculoId]: {
                                ...anterior,
                                ...Object.fromEntries(Object.entries(sanitized).filter(([_, v]) => typeof v === 'string')),
                            },
                        };
                    });
                }
            },
            onError: (errors) => console.error(`Error al guardar ${tipo}:`, errors),
        });
    };

    return (
        <AppLayout>
            <Head title={`Ficha Técnica / ${vehiculoActual.modelo} (${vehiculoActual.placa})`} />
            <div className="min-h-screen bg-background px-4 py-10 font-sans dark:bg-gray-900">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Ficha Técnica del Vehículo {vehiculoActual.modelo}
                    </h1>
                    <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mb-2 block text-center font-semibold">Encargados actuales:</span>

                        <div className="flex flex-wrap justify-center gap-2">
                            {vehiculoActual.usuario ? (
                                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                    {vehiculoActual.usuario.name} (Principal)
                                </span>
                            ) : (
                                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-500">Sin asignar</span>
                            )}

                            {[vehiculoActual.usuario_adicional1, vehiculoActual.usuario_adicional2, vehiculoActual.usuario_adicional3]
                                .filter(Boolean)
                                .map((usuario) => (
                                    <span
                                        key={usuario.id}
                                        className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-200 dark:text-blue-900"
                                    >
                                        {usuario.name} (Adicional)
                                    </span>
                                ))}
                        </div>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={() => setModalOpen(true)}
                            className="mt-4 rounded-md bg-[#1a9888] px-4 py-2 text-sm font-semibold text-white hover:bg-[#188576]"
                        >
                            Asignar Usuario
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    <FichaSeccion
                        title="Expediente Técnico"
                        fields={expedienteTecnicoFields[tipoVehiculo]}
                        formType="expediente"
                        expediente={expedientesTecnicos[placa] || {}}
                        onSubmit={(data) => handleFormSubmit('expedientes', data, placa)}
                    />

                    <FichaSeccion
                        title="Permisología del Vehículo"
                        fields={permisologiaFields}
                        formType="permisologia"
                        expediente={transformarPermisos(permisosLocal[placa] || {})}
                        onSubmit={(data) => handleFormSubmit('permisologia', data, placa)}
                    />

                    <FichaSeccion
                        title="Accesorios del Vehículo"
                        fields={accesoriosFields[tipoVehiculo]}
                        formType="accesorios"
                        expediente={accesoriosGuardados[placa]}
                        onSubmit={(data) => handleFormSubmit('accesorios', data, placa)}
                    />

                    <FichaSeccion
                        title="Piezas Revisadas del Vehículo"
                        fields={piezasRevisadasFields[tipoVehiculo]}
                        formType="piezas"
                        expediente={piezasGuardadas[placa]}
                        onSubmit={(data) => handleFormSubmit('piezas', data, placa)}
                    />
                    {isAdmin && (
                        <ModalAsignacionUser
                            isOpen={modalOpen}
                            onClose={() => setModalOpen(false)}
                            vehiculo={vehiculoActual}
                            users={users}
                            isAdmin={isAdmin}
                            onSuccess={(payload: any) => {
                                if (payload === null) {
                                    // Caso 1: Se desasignaron todos
                                    setVehiculoActual((prev: any) => ({
                                        ...prev,
                                        usuario: null,
                                        usuario_adicional1: null,
                                        usuario_adicional2: null,
                                        usuario_adicional3: null,
                                    }));
                                } else {
                                    // Caso 2: Se asignaron usuarios
                                    // (payload es { principal, adicional1, adicional2, adicional3 })
                                    setVehiculoActual((prev: any) => ({
                                        ...prev,
                                        usuario: payload.principal,
                                        usuario_adicional1: payload.adicional1,
                                        usuario_adicional2: payload.adicional2,
                                        usuario_adicional3: payload.adicional3,
                                    }));
                                }
                            }}
                        />
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

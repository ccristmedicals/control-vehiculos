/* eslint-disable @typescript-eslint/no-explicit-any */
import FormCard from '@/components/FormCard';
import { getAsignacionFields } from '@/constants/getAsignacionFields';
import type { ModalAsignacionUserProps } from '@/types';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { UserMinus, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

export default function ModalAsignacionUser({ isOpen, onClose, vehiculo, users, onSuccess }: ModalAsignacionUserProps) {
    const fields = getAsignacionFields(users);
    const [adicionalesVisibles, setAdicionalesVisibles] = useState(0);

    const baseFields = fields.filter((f) => !f.id.startsWith('user_id_adicional'));
    const adicionalesFields = fields.filter((f) => f.id.startsWith('user_id_adicional')).slice(0, adicionalesVisibles);
    const visibleFields = [...baseFields, ...adicionalesFields];

    const handleSubmit = (formData: Record<string, string | boolean | File | null>) => {
        const ids = [formData.user_id, formData.user_id_adicional_1, formData.user_id_adicional_2, formData.user_id_adicional_3].filter(Boolean);
        const uniqueIds = new Set(ids);
        if (uniqueIds.size !== ids.length) {
            alert('No puedes asignar el mismo usuario más de una vez.');
            return;
        }

        const form = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) {
                form.append(key, value instanceof File ? value : String(value));
            }
        });

        router.post(`/fichaTecnica/${vehiculo.placa}/assign-user`, form, {
            preserveState: true,
            forceFormData: true,
            // --- INICIO DE LA MODIFICACIÓN ---
            onSuccess: () => {
                // Función helper para buscar el objeto de usuario por ID
                const findUserById = (id: any) => {
                    if (!id) return null;
                    const user = users.find((u) => String(u.id) === String(id));
                    // Devolvemos solo los datos que necesita el componente padre
                    return user ? { id: user.id, name: user.name } : null;
                };

                // Construimos el objeto con todos los usuarios asignados
                const assignedUsers = {
                    principal: findUserById(formData.user_id),
                    adicional1: findUserById(formData.user_id_adicional_1),
                    adicional2: findUserById(formData.user_id_adicional_2),
                    adicional3: findUserById(formData.user_id_adicional_3),
                };

                // Pasamos el objeto completo al padre
                onSuccess?.(assignedUsers);
                onClose();
            },
            // --- FIN DE LA MODIFICACIÓN ---
            onError: (errors) => {
                console.error('Error al asignar usuario:', errors);
            },
        });
    };

    const handleUnassign = () => {
        if (confirm('¿Estás seguro de que quieres quitar todos los conductores asignados a este vehículo?')) {
            router.post(
                `/fichaTecnica/${vehiculo.placa}/unassign-user`,
                {},
                {
                    preserveState: true,
                    onSuccess: () => {
                        onSuccess?.(null);
                        setAdicionalesVisibles(0);
                        onClose();
                    },
                    onError: (errors) => {
                        console.error('Error al quitar conductores:', errors);
                    },
                },
            );
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            {/* Fondo oscuro desenfocado */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300" aria-hidden="true" />

            {/* CONTENEDOR CON SCROLL: Aquí está la magia (overflow-y-auto) */}
            <div className="fixed inset-0 z-10 overflow-y-auto">
                {/* Contenedor para centrar (min-h-full) */}
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel className="animate-fade-in w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl dark:border dark:border-gray-700 dark:bg-gray-900">

                        {/* Encabezado */}
                        <div className="mb-6 flex items-center justify-between border-b pb-3">
                            <DialogTitle className="text-2xl font-bold text-gray-800 dark:text-white">Asignación de Conductores</DialogTitle>
                            <button
                                onClick={onClose}
                                aria-label="Cerrar modal"
                                className="rounded-full p-1 text-gray-500 transition hover:text-gray-700 dark:hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Info del vehículo */}
                        <div className="mb-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                            <p className="text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-white">Placa:</strong> {vehiculo.placa}
                            </p>
                            <p className="text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-white">Modelo:</strong> {vehiculo.modelo}
                            </p>
                        </div>

                        {/* Acciones */}
                        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                            <button
                                type="button"
                                onClick={handleUnassign}
                                className="inline-flex items-center gap-2 rounded-md bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                            >
                                <UserMinus className="h-4 w-4" />
                                Quitar todos los conductores
                            </button>

                            {adicionalesVisibles < 3 && (
                                <button
                                    type="button"
                                    onClick={() => setAdicionalesVisibles((prev) => prev + 1)}
                                    className="inline-flex items-center gap-2 rounded-md bg-green-100 px-4 py-2 text-sm font-medium text-green-700 transition hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Añadir responsable adicional {adicionalesVisibles + 1}
                                </button>
                            )}
                        </div>

                        {/* Formulario */}
                        <FormCard
                            title="Formulario de Asignación"
                            fields={visibleFields}
                            formType="asignacion"
                            buttonText="Asignar Usuario"
                            onSubmit={handleSubmit}
                        />
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
}

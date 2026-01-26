/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AsignacionUserProps, UsuarioAsignado } from '@/types';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function AsignacionUser({ vehiculo, users, onSuccess }: AsignacionUserProps) {
    const [, setAssignedUser] = useState<UsuarioAsignado | null>(vehiculo.usuario || null);
    const [selectedUserId, setSelectedUserId] = useState<string>(String(vehiculo.usuario?.id || ''));
    const [kilometraje, setKilometraje] = useState('');
    const [foto, setFoto] = useState<File | null>(null);
    const [validationError, setValidationError] = useState('');

    const handleUserAssign = () => {
        if (!selectedUserId || !kilometraje || !foto) {
            setValidationError('Todos los campos son obligatorios.');
            return;
        }

        const formData = new FormData();
        formData.append('user_id', selectedUserId);
        formData.append('kilometraje', kilometraje);
        formData.append('foto_kilometraje', foto);

        router.post(`/fichaTecnica/${vehiculo.placa}/assign-user`, formData, {
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                const newUser = users.find((u: { id: any }) => String(u.id) === selectedUserId) || null;
                setAssignedUser(newUser);
                if (newUser) {
                    onSuccess?.(newUser);
                }
            },
            onError: (errors) => {
                console.error('Error al asignar usuario:', errors);
                setValidationError('Error al asignar. Verifica los datos.');
            },
        });
    };

    return (
        <div className="mt-4 flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
                <label htmlFor="user-select" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Usuario:
                </label>
                <select
                    id="user-select"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Seleccionar usuario</option>
                    {users.map((user) => (
                        <option key={user.id} value={String(user.id)}>
                            {user.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center space-x-2">
                <label htmlFor="km" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Kilometraje:
                </label>
                <input
                    id="km"
                    type="number"
                    value={kilometraje}
                    onChange={(e) => setKilometraje(e.target.value)}
                    className="w-32 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>

            <div className="flex items-center space-x-2">
                <label htmlFor="foto" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Foto del Kilometraje:
                </label>
                <input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFoto(e.target.files?.[0] || null)}
                    className="text-sm text-gray-700 dark:text-white"
                />
            </div>

            {validationError && <p className="text-sm text-red-500">{validationError}</p>}

            <button
                onClick={handleUserAssign}
                className="self-start rounded-md bg-[#1a9888] px-4 py-2 text-sm font-semibold text-white hover:bg-[#188576]"
            >
                Asignar
            </button>
        </div>
    );
}

import { Field } from '@/types';

// Fields para asignaciones para mas de 1 conductor
export const getAsignacionFields = (users: { id: string | number; name: string }[]): Field[] => {
    const userOptions = users.map((u) => ({ label: u.name, value: String(u.id) }));

    const additionalUserFields: Field[] = Array.from({ length: 3 }, (_, i) => ({
        id: `user_id_adicional_${i + 1}`,
        label: `Usuario adicional ${i + 1}`,
        type: 'search-select',
        options: userOptions,
        required: false,
    }));

    return [
        {
            id: 'user_id',
            label: 'Usuario principal',
            type: 'search-select',
            options: userOptions,
            required: true,
        },
        ...additionalUserFields,
        {
            id: 'kilometraje',
            label: 'Kilometraje actual',
            type: 'text',
            placeholder: 'Ej. 123456',
            required: false,
        },
        {
            id: 'foto_kilometraje',
            label: 'Foto del Kilometraje',
            type: 'file',
            required: false,
        },
    ];
};

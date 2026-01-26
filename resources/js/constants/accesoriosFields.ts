import { Field } from '@/types';

// Campos para el formulario de Accesorios
export const accesoriosFields: Record<'CARRO' | 'MOTO', Field[]> = {
    CARRO: [
        {
            id: '1',
            label: 'Caja de Herramienta',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '2',
            label: 'Conos de seguridad',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '3',
            label: 'Cuña',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '3', label: 'Malo' },
                { value: '4', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '4',
            label: 'Extintor',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '5',
            label: 'Gato',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '6',
            label: 'Llave de cruz',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '7',
            label: 'Linterna',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '8',
            label: 'Caucho de Repuesto',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
    ],
    MOTO: [
        {
            id: '1',
            label: 'Caja de Herramienta',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
        {
            id: '2',
            label: 'Linterna',
            type: 'select',
            options: [
                { value: '0', label: 'Bueno' },
                { value: '1', label: 'Regular' },
                { value: '2', label: 'Malo' },
                { value: '3', label: 'No posee' },
            ],
            required: false,
        },
    ],
};

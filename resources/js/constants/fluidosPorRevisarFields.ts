import { Field } from '@/types';

// Campos para Fluidos para Revisar y revisionFluidos
export const fluidosPorRevisarFields: Record<'CARRO' | 'MOTO', Field[]> = {
    CARRO: [
        {
            id: 'aceite',
            label: 'Aceite de Motor',
            type: 'select',
            options: [
                { value: '0', label: 'Full' },
                { value: '1', label: 'Normal' },
                { value: '2', label: 'Bajo' },
            ],
            required: false,
        },
        {
            id: 'refrigerante',
            label: 'Refrigerante o Agua',
            type: 'select',
            options: [
                { value: '0', label: 'Full' },
                { value: '1', label: 'Normal' },
                { value: '2', label: 'Bajo' },
            ],
            required: false,
        },
        {
            id: 'direccion',
            label: 'Líquido de Dirección',
            type: 'select',
            options: [
                { value: '0', label: 'Full' },
                { value: '1', label: 'Normal' },
                { value: '2', label: 'Bajo' },
            ],
            required: false,
        },
        {
            id: 'frenos',
            label: 'Liga de Frenos',
            type: 'select',
            options: [
                { value: '0', label: 'Full' },
                { value: '1', label: 'Normal' },
                { value: '2', label: 'Bajo' },
            ],
            required: false,
        },
    ],
    MOTO: [
        {
            id: 'aceite',
            label: 'Aceite',
            type: 'select',
            options: [
                { value: '0', label: 'Full' },
                { value: '1', label: 'Normal' },
                { value: '2', label: 'Bajo' },
            ],
            required: false,
        },
        {
            id: 'tacometro',
            label: 'Tacometro',
            type: 'select',
            options: [
                { value: '0', label: 'Operativo' },
                { value: '1', label: 'Defectuoso' },
            ],
            required: false,
        },
    ],
};

import { Field } from '@/types';

// Campos para el formulario de Permisologia
export const permisologiaFields: Field[] = [
    {
        id: 'titulo_archivo',
        label: 'Título del Vehículo',
        type: 'file',
        required: false,
    },

    {
        id: 'seguro',
        label: 'Seguro RCV',
        type: 'date',
        required: false,
    },
    {
        id: 'seguro_archivo',
        label: 'Documento de Seguro RCV',
        type: 'file',
        required: false,
    },

    {
        id: 'roct',
        label: 'Roct',
        type: 'date',
        required: false,
    },
    {
        id: 'roct_archivo',
        label: 'Documento Roct',
        type: 'file',
        required: false,
    },

    {
        id: 'permisoRotReg',
        label: 'Permiso de Rotulado Regional',
        type: 'date',
        required: false,
    },
    {
        id: 'permisoRotReg_archivo',
        label: 'Documento Rotulado Regional',
        type: 'file',
        required: false,
    },

    {
        id: 'permisoRotNac',
        label: 'Permiso de Rotulado Nacional',
        type: 'date',
        required: false,
    },
    {
        id: 'permisoRotNac_archivo',
        label: 'Documento Rotulado Nacional',
        type: 'file',
        required: false,
    },

    {
        id: 'salvoconducto',
        label: 'Salvoconducto',
        type: 'date',
        required: false,
    },
    {
        id: 'salvoconducto_archivo',
        label: 'Documento Salvoconducto',
        type: 'file',
        required: false,
    },

    {
        id: 'permisoAliMed',
        label: 'Permiso de Alimentos y Medicamentos',
        type: 'date',
        required: false,
    },
    {
        id: 'permisoAliMed_archivo',
        label: 'Documento Alimentos y Medicamentos',
        type: 'file',
        required: false,
    },
];

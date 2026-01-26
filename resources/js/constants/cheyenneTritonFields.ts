import { Field } from '@/types';

const commonFields: Field[] = [
    // MOTOR
    {
        id: 'motor_ct_archivo_1',
        label: 'Correas, Accesorios',
        type: 'file',
        required: true,
    },
    {
        id: 'motor_ct_archivo_2',
        label: 'Tapavalvula Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'motor_ct_archivo_3',
        label: 'Tapavalvula Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'motor_ct_archivo_4',
        label: 'Carter',
        type: 'file',
        required: true,
    },
    // SISTEMA DE INYECCION
    {
        id: 'sistema_ct_inyeccion_archivo_1',
        label: 'Cuerpo de Aceleracion y Cables de Bujia',
        type: 'file',
        required: true,
    },
    // SISTEMA DE ENFRIAMIENTO
    {
        id: 'sistema_ct_enfriamiento_archivo_1',
        label: 'Radiador con Mangueras',
        type: 'file',
        required: true,
    },
    // SISTEMA DE CARGA
    {
        id: 'sistema_ct_carga_archivo_1',
        label: 'Bateria y Bornes',
        type: 'file',
        required: true,
    },
    // SISTEMA DE ESCAPE
    {
        id: 'sistema_ct_escape_archivo_1',
        label: 'Multiple de Escape',
        type: 'file',
        required: true,
    },
    {
        id: 'sistema_ct_escape_archivo_3',
        label: 'Silenciador',
        type: 'file',
        required: true,
    },
    // TRANSMISION
    {
        id: 'transmision_ct_archivo_1',
        label: 'Parte Inferior Caja',
        type: 'file',
        required: true,
    },
    {
        id: 'transmision_ct_archivo_2',
        label: 'Cardan y Crucetas',
        type: 'file',
        required: true,
    },
    {
        id: 'transmision_ct_archivo_3',
        label: 'Diferencial',
        type: 'file',
        required: true,
    },
    // TREN DELANTERO IZQUIERDO
    {
        id: 'tren_ct_delantero_izq_archivo_1',
        label: 'Terminal, Muñon Superior, Tijera Superior',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_ct_delantero_izq_archivo_2',
        label: 'Muñon Inferior, Tijera Inferior',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_ct_delantero_izq_archivo_3',
        label: 'Amortiguador y Espiral Delantero Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_ct_delantero_izq_archivo_4',
        label: 'Barra de la Direccion, Barra Axial',
        type: 'file',
        required: true,
    },
    // TREN DELANTERO DERECHO
    {
        id: 'tren_ct_delantero_der_archivo_1',
        label: 'Terminal, Muñon, Bieleta, Tripode, Bujes',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_ct_delantero_der_archivo_2',
        label: 'Amortiguador y Espiral Delantero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_ct_delantero_der_archivo_3',
        label: 'Brazo Axial, Coca, Triceta',
        type: 'file',
        required: true,
    },
    // TREN TRASERO IZQUIERDO
    {
        id: 'tren_ct_trasero_izq_archivo_1',
        label: 'Amortiguador, Espiral Trasero Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_ct_trasero_izq_archivo_2',
        label: 'Tunel, Gomas de Suspension',
        type: 'file',
        required: true,
    },
    // TREN TRASERO DERECHO
    {
        id: 'tren_ct_trasero_der_archivo_1',
        label: 'Amortiguador, Espiral Trasero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_ct_trasero_der_archivo_2',
        label: 'Tunel, Gomas de Suspension',
        type: 'file',
        required: true,
    },
    // LUCES
    {
        id: 'luces_ct_archivo_1',
        label: 'Luces Frontales',
        type: 'file',
        required: true,
    },
    {
        id: 'luces_ct_archivo_2',
        label: 'Luces Traseras',
        type: 'file',
        required: true,
    },
    // CLUSTER
    {
        id: 'cluster_ct_archivo_1',
        label: 'Tablero',
        type: 'file',
        required: true,
    },
    // CARROCERIA
    {
        id: 'carroceria_ct_archivo_1',
        label: 'Laterla Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'carroceria_ct_archivo_2',
        label: 'Lateral Izquierdo',
        type: 'file',
        required: true,
    },
    // CAUCHOS
    {
        id: 'cauchos_ct_archivo_1',
        label: 'Caucho Delantero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'cauchos_ct_archivo_2',
        label: 'Caucho Delantero Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'cauchos_ct_archivo_3',
        label: 'Caucho Trasero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'cauchos_ct_archivo_4',
        label: 'Caucho Trasero Izquierdo',
        type: 'file',
        required: true,
    },
    // OBSERVACION
    {
        id: 'observacion_general',
        label: 'Observacion General',
        type: 'text',
        required: false,
    },
];

export const cheyenneTritonFields: Record<'CARRO', Field[]> = {
    CARRO: commonFields,
};

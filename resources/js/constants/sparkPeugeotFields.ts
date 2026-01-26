import { Field } from '@/types';

const commonFields: Field[] = [
    // MOTOR
    {
        id: 'motor_sp_archivo_1',
        label: 'Correas, alternador y compresor',
        type: 'file',
        required: true,
    },
    {
        id: 'motor_sp_archivo_2',
        label: 'Tapavalvuas',
        type: 'file',
        required: true,
    },
    {
        id: 'motor_sp_archivo_3',
        label: 'Carter',
        type: 'file',
        required: true,
    },
    // SISTEMA DE INYECCION
    {
        id: 'sistema_sp_inyeccion_archivo_1',
        label: 'Cuerpo de Aceleracion y Cables de Bujia',
        type: 'file',
        required: true,
    },
    // SISTEMA DE ENFRIAMIENTO
    {
        id: 'sistema_sp_enfriamiento_archivo_1',
        label: 'Radiador con Mangueras',
        type: 'file',
        required: true,
    },
    // SISTEMA DE CARGA
    {
        id: 'sistema_sp_carga_archivo_1',
        label: 'Bateria y Bornes',
        type: 'file',
        required: true,
    },
    // SISTEMA DE ESCAPE
    {
        id: 'sistema_sp_escape_archivo_1',
        label: 'Multiple de Escape',
        type: 'file',
        required: true,
    },
    {
        id: 'sistema_sp_escape_archivo_2',
        label: 'Tubo de Escape',
        type: 'file',
        required: true,
    },
    {
        id: 'sistema_sp_escape_archivo_3',
        label: 'Silenciador',
        type: 'file',
        required: true,
    },
    // TRANSMISION
    {
        id: 'transmision_sp_archivo_1',
        label: 'Parte Inferior Caja',
        type: 'file',
        required: true,
    },
    // TREN DELANTERO IZQUIERDO
    {
        id: 'tren_sp_delantero_izq_archivo_1',
        label: 'Terminal, Muñon, Bieleta, Tripode, Bujes Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_sp_delantero_izq_archivo_2',
        label: 'Amortiguador y Espiral Delantero Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_sp_delantero_izq_archivo_3',
        label: 'Brazo Axial, Coca, Triceta Izquierdo',
        type: 'file',
        required: true,
    },
    // TREN DELANTERO DERECHO
    {
        id: 'tren_sp_delantero_der_archivo_1',
        label: 'Terminal, Muñon, Bieleta, Tripode, Bujes Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_sp_delantero_der_archivo_2',
        label: 'Amortiguador y Espiral Delantero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_sp_delantero_der_archivo_3',
        label: 'Brazo Axial, Coca, Triceta Derecho',
        type: 'file',
        required: true,
    },
    // TREN TRASERO IZQUIERDO
    {
        id: 'tren_sp_trasero_izq_archivo_1',
        label: 'Amortiguador, Espiral Trasero Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_sp_trasero_izq_archivo_2',
        label: 'Tunel, Gomas de Suspension',
        type: 'file',
        required: true,
    },
    // TREN TRASERO DERECHO
    {
        id: 'tren_sp_trasero_der_archivo_1',
        label: 'Amortiguador, Espiral Trasero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'tren_sp_trasero_der_archivo_2',
        label: 'Tunel, Gomas de Suspension',
        type: 'file',
        required: true,
    },
    // LUCES
    {
        id: 'luces_sp_archivo_1',
        label: 'Luces Frontales',
        type: 'file',
        required: true,
    },
    {
        id: 'luces_sp_archivo_2',
        label: 'Luces Traseras',
        type: 'file',
        required: true,
    },
    // CLUSTER
    {
        id: 'cluster_sp_archivo_1',
        label: 'Tablero',
        type: 'file',
        required: true,
    },
    // CARROCERIA
    {
        id: 'carroceria_sp_archivo_1',
        label: 'Laterla Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'carroceria_sp_archivo_2',
        label: 'Lateral Izquierdo',
        type: 'file',
        required: true,
    },
    // CAUCHOS
    {
        id: 'cauchos_sp_archivo_1',
        label: 'Caucho Delantero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'cauchos_sp_archivo_2',
        label: 'Caucho Delantero Izquierdo',
        type: 'file',
        required: true,
    },
    {
        id: 'cauchos_sp_archivo_3',
        label: 'Caucho Trasero Derecho',
        type: 'file',
        required: true,
    },
    {
        id: 'cauchos_sp_archivo_4',
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

export const sparkPeugeotFields: Record<'CARRO', Field[]> = {
    CARRO: commonFields,
};

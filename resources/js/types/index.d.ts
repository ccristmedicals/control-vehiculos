/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from '@/hooks/useFormLogic';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: UserInterface;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: any;
}

export interface FlashMessageProps {
    mensaje?: string | null;
    duracion?: number;
    isError?: boolean;
}

export interface FlashPropsCont {
    flash?: {
        success?: string;
        error?: string;
    };
}

export interface PageProps {
    vehiculo: VehiculoData;
    historial: AsignacionHistorial[];
    [key: string]: any;
}

//  Formularios y UI

export interface FileField {
    id: string;
    label: string;
    type: 'file';
    required: boolean;
}

export interface Field {
    id: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'file' | 'checkbox' | 'number' | 'textarea' | 'search-select';
    placeholder?: string;
    options?: { value: string; label: string }[];
    required: boolean;
    files?: FileField[];
}

export interface FichaSeccionFluidosProps {
    title: string;
    fields: Field[];
    expediente: Record<string, string | boolean | File | null>;
    onSubmit: (formData: Record<string, string | boolean | File | null>) => void;
}

export interface FichaSeccionProps {
    title: string;
    fields: Field[];
    options?: string[];
    formType: 'expediente' | 'permisologia' | 'accesorios' | 'piezas' | 'revisionFluidos' | 'semanal';
    expediente: Record<string, string | boolean | File | null>;
    onChange?: (data: Record<string, any>) => void;
    onSubmit: (data: Record<string, string | boolean | File | null>) => void;
}

export interface FormCardProps {
    title?: string;
    fields: Field[];
    buttonText?: string;
    formType?: 'expediente' | 'permisologia' | 'accesorios' | 'piezas' | 'revisionFluidos' | 'asignacion' | 'surtido' | 'semanal' | 'solicitud';
    onChange?: (data: Record<string, any>) => void;
    onSubmit?: (formData: Record<string, string | boolean | File | null>) => void;
    expediente?: Record<string | number, string | boolean | File | null>;
}

interface DateFieldProps {
    id: string;
    label: string;
    expedicion: string | boolean | File | null;
    vencimiento: string | boolean | File | null;
    onChange: (id: string, value: string) => void;
}

interface CheckFieldProps {
    id: string;
    label: string;
    checked: boolean;
    onChange: (id: string, value: boolean) => void;
}

interface FileFieldProps {
    id: string;
    label: string;
    value?: File | string | null;
    onChange: (id: string, file: File | null) => void;
}

interface SelectFieldProps {
    id: string;
    label: string;
    value: string | boolean | File | null;
    options?: { value: string; label: string }[];
    onChange: (id: string, value: string) => void;
}

interface TextFieldProps {
    id: string;
    label: string;
    value: string | boolean | File | null;
    placeholder?: string;
    type?: string;
    onChange: (id: string, value: string) => void;
}

export type AssignedUserPayload = {
    principal: UsuarioAsignado | null;
    adicional1: UsuarioAsignado | null;
    adicional2: UsuarioAsignado | null;
    adicional3: UsuarioAsignado | null;
};

export interface ModalAsignacionUserProps {
    isOpen: boolean;
    onClose: () => void;
    vehiculo: {
        placa: string;
        modelo: string;
    };
    users: {
        id: string | number;
        name: string;
    }[];
    onSuccess?: (payload: AssignedUserPayload | null) => void;
    isAdmin: boolean;
}

export interface ModalRegistroSurtidoProps {
    isOpen: boolean;
    onClose: () => void;
    vehiculo: {
        placa: string;
        modelo: string;
        conductor: string;
    };
}

// Revisiones

export interface RevisionSemanalData {
    forEach(arg0: (item: any) => void): unknown;
    id: number;
    vehiculo_id: string;
    user_id: number;
    video: string;
    kilometraje: number;
    created_at: string;
    updated_at: string;
}

export interface RevisionSemanalProps {
    vehiculo: VehiculoData;
    revisionSemanal?: RevisionSemanalData | null;
    inicio: string;
    final: string;
}

export interface RevisionFluido {
    id: number;
    tipo: string;
    nivel_fluido: string | number;
    imagen: string | null;
    revisado: boolean;
    fecha_creacion: string;
}

export interface RevisionFluidosProps {
    vehiculoId: number | string;
    vehiculo: any;
}

// Notificaciones

export interface Notificacion {
    vehiculo: any;
    id: number;
    titulo: string;
    descripcion: string;
    tipo: string;
    leida: boolean;
    created_at: string;
    vehiculo_id?: number;
    usuario_id?: number;
}

export type PropsNoti = {
    notificacion: Notificacion;
    modo: 'admin' | 'user';
    onMarcarLeida?: (noti: Notificacion) => void;
};

export type PropsGrupoNoti = {
    tipo: string;
    notificaciones: Notificacion[];
    modo: 'admin' | 'user';
    onMarcarLeida: (noti: Notificacion) => void;
};

// Usuarios

export interface UsuarioAsignado {
    id: string | number;
    name: string;
}

export interface UsuarioBasico {
    id: number;
    name: string;
    email: string;
    zona?: string;
    foto_cedula?: string;
    vencimiento_cedula?: string;
    foto_licencia?: string;
    vencimiento_licencia?: string;
    foto_certificado_medico?: string;
    vencimiento_certificado_medico?: string;
}

export interface UserInterface {
    roles: any;
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    is_admin?: boolean;
}

// Vehículos

export type VehiculoBase = {
    placa: string;
    modelo: string;
};

export type VehiculoConductor = VehiculoBase & {
    conductor: string;
};

export type VehiculoCompleto = VehiculoConductor & {
    tipo: 'CARRO' | 'MOTO';
    usuario?: UsuarioAsignado | null;
    usuario_adicional1?: UsuarioAsignado | null;
    usuario_adicional2?: UsuarioAsignado | null;
    usuario_adicional3?: UsuarioAsignado | null;
    revision_diaria?: boolean;
    imagen_url?: string;
    observaciones_no_resueltas?: number;
    imagenes_factura_pendientes?: number;
    factura_pendiente?: number;
    envios_pendientes?: number;
};

export interface VehiculoData {
    tipo: 'CARRO' | 'MOTO';
    placa: string;
    modelo: string;
    usuario?: { name: string } | null;
    usuario_adicional1?: { name: string; id: any } | null;
    usuario_adicional2?: { name: string; id: any } | null;
    usuario_adicional3?: { name: string; id: any } | null;
}

// Facturas
export type Factura = {
    aprobado: any;
    fact_num: string;
    fec_emis: string;
    co_cli: string;
    tot_bruto: number;
    tot_neto: number;
    descripcion: string;
    descripcion_limpia?: string;
    revisado: boolean;
};
export type DetalleFactura = {
    id: number;
    servicio: { nombreServicio: string };
    cantidad: number;
    precioUnit: string;
    subtotal: string;
    imagen?: string | null;
};

export type AuditoriaProps = {
    vehiculo: VehiculoConductor;
    facturas: Factura[];
    isAdmin?: boolean;
};

export interface AuditoriaAdminProps {
    aprobado: boolean;
    setAprobado: (value: boolean) => void;
    observacionesAdmin: string;
    setObservacionesAdmin: (value: string) => void;
    onSubmit: () => void;
    supervisor?: string;
    cubre?: boolean;
    cubreUsuario?: string;
}

export interface AuditoriaAdminState {
    aprobado: boolean;
    observacionesAdmin: string;
    cubre: boolean;
    cubreUsuario: string;
}

export type TablaFacturasProps = {
    facturas: Factura[];
    vehiculo: VehiculoConductor;
    isAdmin?: boolean;
    aprobado: boolean;
};

export type FilaFacturaProps = {
    factura: Factura;
    vehiculo: VehiculoConductor;
    index: number;
    isAdmin?: boolean;
};

export type ModalDetalleFacturaProps = {
    factura: FacturaModalData;
    renglones: Renglon[];
    auditados: boolean;
    kilometraje: number;
    vehiculo: {
        placa: string;
        conductor: any;
        respaldo?: any;
        adicionales?: any;
    };
    visible: boolean;
    onClose: () => void;
    isAdmin?: boolean;
    supervisor?: string;
    cubre?: boolean;
    cubre_usuario?: string;
    onActualizarEstado?: (facturaNum: string, aprobado: boolean) => void;
};

export type FacturaModalData = {
    cubre_usuario: any;
    cubre: boolean;
    supervisor: string;
    supervisores: any;
    observaciones_admin: string;
    aprobado: boolean;
    kilometraje: number;
    observaciones_res: string;
    observacion_res: string;
    descripcion: string;
    fact_num: string;
    fec_emis: string;
    co_cli: string;
    tot_bruto: number;
    tot_neto: number;
    descripcion_limpia?: string;
    revisado: boolean;
};

export type Renglon = {
    imagen_url: any;
    fact_num: string;
    total_art: number;
    reng_neto: number;
    co_art: string;
    repuesto?: {
        art_des?: string;
    };
};

export type FacturaShowProps = {
    factura: FacturaModalData;
    vehiculo: {
        placa: string;
        conductor: string;
        respaldo?: string;
        adicionales?: string;
    };
    renglones: Renglon[];
    auditados: boolean;
    aprobado: boolean;
};

// Observaciones

export interface Observacion {
    vehiculo: any;
    fecha_resolucion: any;
    user: any;
    tipo: any;
    admin: any;
    fecha_creacion: any;
    id: number;
    observacion: string;
    resuelto: boolean;
    created_at: string;
    updated_at: string;
}

export interface ObsProps {
    observacion: Observacion;
    isAdmin?: boolean;
    onResolver?: (id: number) => void;
}

export interface PagePropsObs {
    vehiculo: VehiculoData;
    observaciones: Observacion[];
    isAdmin?: boolean;
    [key: string]: any;
}

export interface ObservacionCardProps {
    observacion: Observacion;
    isAdmin?: boolean;
    onResolver: (id: number) => void;
}

// Gasolina

export type SurtidoFieldType = 'text' | 'select' | 'date' | 'file' | 'checkbox' | 'number' | 'textarea';

export interface SurtidoField {
    id: string;
    label: string;
    type: SurtidoFieldType;
    placeholder?: string;
    options?: { value: string; label: string }[];
    required: boolean;
}

export interface SurtidoFormData {
    litros: string;
    kilometraje: string | any;
    observacion?: string;
    [key: string]: string | boolean | File | null;
}

export interface SurtidoResponse {
    surtido_ideal: number;
    precio: number;
}

export interface RegistroGasolina {
    factura: number;
    fecha: string;
    vehiculo: string;
    precio: number;
    km_actual: number;
    recorrido: number;
    litros: number;
    total: number;
    observaciones: string;
    diferencia: number;
    conductor: string;
    admin?: string;
}

// Pistas

interface Pista {
    name: string;
    id: number;
    user_id: string;
    accion: string;
    modelo: string;
    descripcion?: string;
    created_at: string;
    user?: {
        name: string;
    };
}

// Envios

export interface Envio {
    id: number;
    vehiculo_id: string;
    user_id: number;
    admin_id: number | null;
    descripcion: string;
    estado: 'pendiente' | 'en_camino' | 'recibido' | 'rechazado';
    foto_envio: string | null;
    foto_recibo: string | null;
    created_at: string;
    updated_at: string;
    user: UserInterface;
    admin: UserInterface | null;
}

export interface PagePropsEnvio extends PageProps {
    envios: Envio[];
    auth: Auth;
}

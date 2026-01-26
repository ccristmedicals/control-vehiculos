// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { accesoriosFields } from '@/constants/accesoriosFields';
// import { piezasRevisadasFields } from '@/constants/piezasRevisadasFields';
// import { Field } from '@/types';
// import { router, usePage } from '@inertiajs/react';
// import Pusher from 'pusher-js';
// import { useEffect } from 'react';
// import { toast } from 'sonner';

// function tieneUsuarioAsignado(data: any): boolean {
//     const usuario = data.usuario || data.userName || data.nuevoUsuario;
//     return typeof usuario === 'string' && usuario.trim().length > 0;
// }

// function getCampoLabel(formType: string, tipoVehiculo: 'CARRO' | 'MOTO', fieldId: string): string {
//     const sources: Record<string, Record<'CARRO' | 'MOTO', Field[]>> = {
//         Accesorios: accesoriosFields,
//         Piezas: piezasRevisadasFields,
//     };

//     const normalizedFormType = formType.charAt(0).toUpperCase() + formType.slice(1).toLowerCase();
//     const fields = sources[normalizedFormType]?.[tipoVehiculo];
//     const match = fields?.find((f) => f.id === String(fieldId));
//     return match?.label ?? `Campo ${fieldId}`;
// }

// function getEstadoLabel(value: number | string): string {
//     const estados: Record<string, string> = {
//         '0': 'BUENO',
//         '1': 'REGULAR',
//         '2': 'MALO',
//         '3': 'NO POSEE',
//     };

//     return estados[String(value)] ?? `Valor ${value}`;
// }

// export default function NotificacionRealtime() {
//     const { auth } = usePage<{ auth: { user: { id: number; name: string; is_admin: boolean } } }>().props;

//     useEffect(() => {
//         if (!auth?.user?.is_admin) return;

//         Pusher.logToConsole = true;

//         const pusher = new Pusher('d1e9e4983a9ebf030f2b', {
//             cluster: 'us2',
//         });
//         const channel = pusher.subscribe('admin.dashboard');

//         // Cambio crítico en formulario
//         channel.bind('input.changed', (data: any) => {
//             if (!tieneUsuarioAsignado(data)) return;

//             const campo = getCampoLabel(data.formType, data.tipoVehiculo, data.field);
//             const estado = getEstadoLabel(data.value);

//             toast.warning(`Cambio crítico registrado`, {
//                 description: (
//                     <div className="flex cursor-pointer flex-col gap-1 text-left" onClick={() => router.visit(`/fichaTecnica/${data.placa}`)}>
//                         <span className="text-sm font-semibold text-blue-700">
//                             <strong>{data.userName}</strong> marcó el campo <strong>{campo}</strong> como <strong>{estado}</strong>
//                         </span>
//                         <span className="text-xs text-gray-700">
//                             Vehículo afectado: <strong>{data.placa}</strong>
//                         </span>
//                         {data.formType && (
//                             <span className="text-xs text-gray-600">
//                                 Formulario: <strong>{data.formType}</strong>
//                             </span>
//                         )}
//                         <span className="text-xs text-gray-500 italic">Este cambio fue registrado y notificado automáticamente.</span>
//                     </div>
//                 ),

//                 duration: 15000,
//             });
//         });

//         // Reasignación de vehículo
//         channel.bind('asignacion.usuario', (data: any) => {
//             toast.info(`Reasignación de vehículo`, {
//                 description: (
//                     <div className="flex cursor-pointer flex-col gap-1 text-left" onClick={() => router.visit(`/fichaTecnica/${data.placa}`)}>
//                         <span className="text-sm font-semibold text-green-700">
//                             <strong>{data.adminName}</strong> asignó el vehículo <strong>{data.placa}</strong> a <strong>{data.nuevoUsuario}</strong>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Cambio registrado en tiempo real.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         // Chequeo omitido
//         channel.bind('chequeo.omitido', (data: any) => {
//             if (!tieneUsuarioAsignado(data)) return;

//             toast.error(`Chequeo diario omitido`, {
//                 description: (
//                     <div
//                         className="flex cursor-pointer flex-col gap-1 text-left"
//                         onClick={() => router.visit(`/fichaTecnica/${data.placa}/revisionFluidos`)}
//                     >
//                         <span className="text-sm font-semibold text-red-700">
//                             El vehículo <strong>{data.placa}</strong> no fue revisado el <strong>{data.fecha}</strong>
//                         </span>
//                         <span className="text-xs text-gray-700">
//                             Responsable asignado: <strong>{data.usuario}</strong>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Este evento fue detectado automáticamente a las 9:00am.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         // Nivel de fluido bajo
//         channel.bind('nivel.bajo', (data: any) => {
//             if (!tieneUsuarioAsignado(data)) return;

//             toast.error(`Nivel de fluido crítico`, {
//                 description: (
//                     <div
//                         className="flex cursor-pointer flex-col gap-1 text-left"
//                         onClick={() => router.visit(`/fichaTecnica/${data.placa}/revisionFluidos`)}
//                     >
//                         <span className="text-sm font-semibold text-red-700">
//                             <strong>{data.usuario}</strong> marcó el campo <strong>{data.campo}</strong> como <strong>{data.nivel}</strong>
//                         </span>
//                         <span className="text-xs text-gray-700">
//                             Vehículo afectado: <strong>{data.placa}</strong>
//                         </span>
//                         <span className="text-xs text-gray-600">
//                             Formulario: <strong>{data.formulario}</strong>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Este evento fue registrado y notificado automáticamente.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         // Permiso por vencer
//         channel.bind('permiso.por.vencer', (data: any) => {
//             if (!tieneUsuarioAsignado(data)) return;

//             toast.warning(`Permiso por vencer`, {
//                 description: (
//                     <div className="flex cursor-pointer flex-col gap-1 text-left" onClick={() => router.visit(`/fichaTecnica/${data.placa}`)}>
//                         <span className="text-sm font-semibold text-yellow-700">
//                             El permiso <strong>{data.permiso}</strong> del vehículo <strong>{data.placa}</strong> vence el{' '}
//                             <strong>{data.fechaVencimiento}</strong>
//                         </span>
//                         <span className="text-xs text-gray-700">
//                             Registrado por: <strong>{data.usuario}</strong>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Haz clic para ver la ficha técnica.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         // Video semanal omitido
//         channel.bind('video.semanal.omitido', (data: any) => {
//             if (!tieneUsuarioAsignado(data)) return;

//             toast.error(`Video semanal no subido`, {
//                 description: (
//                     <div
//                         className="flex cursor-pointer flex-col gap-1 text-left"
//                         onClick={() => router.visit(`/fichaTecnica/${data.placa}/revisionSemanal`)}
//                     >
//                         <span className="text-sm font-semibold text-red-700">
//                             El vehículo <strong>{data.placa}</strong> no tiene video para <strong>{data.semana}</strong>
//                         </span>
//                         <span className="text-xs text-gray-700">
//                             Responsable: <strong>{data.usuario}</strong>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Haz clic para revisar el módulo de videos.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         // Observación agregada
//         channel.bind('observacion.agregada', (data: any) => {
//             if (!tieneUsuarioAsignado(data)) return;

//             toast.info(`Nueva observación registrada`, {
//                 description: (
//                     <div
//                         className="flex cursor-pointer flex-col gap-1 text-left"
//                         onClick={() => router.visit(`/fichaTecnica/${data.placa}/observaciones`)}
//                     >
//                         <span className="text-sm font-semibold text-purple-700">
//                             <strong>{data.userName}</strong> agregó una observación al vehículo <strong>{data.placa}</strong>
//                         </span>
//                         <span className="text-xs text-gray-700">
//                             Estado: <strong>{data.estado}</strong>
//                         </span>
//                         <span className="text-xs text-gray-600">
//                             Contenido: <em>{data.contenido}</em>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Haz clic para ver el historial de observaciones.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         // Documento personal por vencer
//         channel.bind('documento.usuario.por.vencer', (data: any) => {
//             toast.warning(`Documento personal por vencer`, {
//                 description: (
//                     <div className="flex cursor-pointer flex-col gap-1 text-left" onClick={() => router.visit(`/perfil/${data.usuario}`)}>
//                         <span className="text-sm font-semibold text-pink-700">
//                             El documento <strong>{data.documento}</strong> de <strong>{data.userName}</strong> vence el{' '}
//                             <strong>{data.fechaVencimiento}</strong>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Haz clic para revisar el perfil del usuario.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         // Imagen agregada a factura
//         channel.bind('imagen.factura.subida', (data: any) => {
//             if (!tieneUsuarioAsignado(data)) return;

//             toast.info(`Imágenes subidas a factura`, {
//                 description: (
//                     <div
//                         className="flex cursor-pointer flex-col gap-1 text-left"
//                         onClick={() => router.visit(`/fichaTecnica/${data.placa}/facturas`)}
//                     >
//                         <span className="text-sm font-semibold text-shadow-teal-700">
//                             <strong>{data.userName}</strong> subió {data.cantidad} imagen{data.cantidad > 1 ? 'es' : ''} en la factura{' '}
//                             <strong>#{data.factNum}</strong> del vehículo <strong>{data.placa}</strong>
//                         </span>
//                         <span className="text-xs text-gray-700">
//                             Estado: <strong>{data.estado ?? 'Pendiente de revisión'}</strong>
//                         </span>
//                         <span className="text-xs text-gray-500 italic">Haz clic para ver la auditoría visual.</span>
//                     </div>
//                 ),
//                 duration: 15000,
//             });
//         });

//         return () => {
//             channel.unbind_all();
//             channel.unsubscribe();
//         };
//     }, [auth?.user?.is_admin]);

//     return null;
// }

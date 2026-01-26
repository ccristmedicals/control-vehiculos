import { PropsNoti } from '@/types';
import clsx from 'clsx';
import { AlertTriangle, Bell, CalendarClock, ClipboardPenLine, Droplets, UserCheck } from 'lucide-react';

export default function NotificacionCard({ notificacion, onMarcarLeida }: PropsNoti) {
    const { titulo, descripcion, tipo, leida, created_at } = notificacion;

    const icono = (() => {
        switch (tipo) {
            case 'chequeoOmitido':
                return <AlertTriangle className="h-5 w-5 text-orange-600" />;
            case 'nivelFluido':
                return <Droplets className="h-5 w-5 text-red-600" />;
            case 'revisionSemanal':
                return <Bell className="h-5 w-5 text-yellow-600" />;
            case 'permiso':
                return <CalendarClock className="h-5 w-5 text-yellow-700" />;
            case 'cambioInput':
            case 'estado_item':
                return <ClipboardPenLine className="h-5 w-5 text-blue-600" />;
            case 'reasignacion':
                return <UserCheck className="h-5 w-5 text-[#49af4e]" />;
            case 'observacion':
                return <ClipboardPenLine className="h-5 w-5 text-purple-600" />;
            case 'documentoUsuario':
                return <CalendarClock className="h-5 w-5 text-pink-600" />;
            case 'auditoria':
                return <ClipboardPenLine className="h-5 w-5 text-shadow-teal-700" />;
            default:
                return <AlertTriangle className="h-5 w-5 text-gray-400" />;
        }
    })();

    const handleClick = () => {
        onMarcarLeida?.(notificacion);
        console.log(notificacion);
    };

    return (
        <div
            onClick={handleClick}
            className={clsx(
                'cursor-pointer rounded-md border-l-4 p-4 shadow-sm transition hover:shadow-md',
                {
                    'border-orange-600 bg-orange-50 dark:bg-orange-900': tipo === 'chequeoOmitido' && !leida,
                    'border-red-600 bg-red-50 dark:bg-red-900': tipo === 'nivelFluido' && !leida,
                    'border-yellow-600 bg-yellow-50 dark:bg-yellow-900': (tipo === 'revisionSemanal' || tipo === 'permiso') && !leida,
                    'border-indigo-600 bg-indigo-50 dark:bg-indigo-900': (tipo === 'cambioInput' || tipo === 'estado_item') && !leida,
                    'border-green-400 bg-green-50 dark:bg-green-800': tipo === 'reasignacion' && !leida,
                    'border-purple-600 bg-purple-50 dark:bg-purple-900': tipo === 'observacion' && !leida,
                    'border-pink-600 bg-pink-50 dark:bg-pink-900': tipo === 'documentoUsuario' && !leida,
                    'border-teal-600 bg-teal-50 dark:bg-teal-900': tipo === 'auditoria' && !leida,
                },
                leida && 'border-gray-300 bg-gray-100 dark:border-gray-700 dark:bg-gray-800',
                !leida && 'hover:scale-[1.02] active:scale-[0.98]',
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icono}
                    <h2 className={clsx('text-sm font-semibold', leida ? 'text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white')}>
                        {titulo}
                    </h2>
                </div>
                <span
                    className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', {
                        'bg-orange-100 text-orange-700 dark:bg-orange-800 dark:text-orange-200': tipo === 'chequeo' && !leida,
                        'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200': tipo === 'fluido' && !leida,
                        'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200':
                            (tipo === 'revisionSemanal' || tipo === 'permiso') && !leida,
                        'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200': (tipo === 'cambioInput' || tipo === 'estado_item') && !leida,
                        'bg-green-200 text-green-700 dark:bg-green-700 dark:text-green-300': tipo === 'reasignacion' && !leida,
                        'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400': leida,
                        'bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-400': tipo === 'observacion' && !leida,
                        'bg-pink-100 text-pink-700 dark:bg-pink-800 dark:text-pink-200': tipo === 'documentoUsuario' && !leida,
                        'bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200': tipo === 'auditoria' && !leida,
                    })}
                >
                    {tipo}
                </span>
            </div>
            <p className={clsx('mt-2 line-clamp-2 text-xs', leida ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-300')}>
                {descripcion}
            </p>
            <div className={clsx('mt-2 text-right text-[11px]', leida ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400')}>
                {new Date(created_at).toLocaleString('es-VE', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })}
            </div>
        </div>
    );
}

import { Observacion } from '@/types';
import { router } from '@inertiajs/react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
    observacion: Observacion;
}

export default function ObservacionesCardDashboard({ observacion }: Props) {
    const { observacion: texto, resuelto, fecha_creacion, vehiculo, user } = observacion;

    const irAFichaObservaciones = () => {
        if (vehiculo?.placa) {
            router.visit(`/fichaTecnica/${vehiculo.placa}/observaciones`);
        }
    };

    return (
        <div
            onClick={irAFichaObservaciones}
            className={clsx(
                'cursor-pointer rounded-md border-l-4 p-4 shadow-sm transition hover:shadow-md',
                {
                    'border-green-500 bg-green-50 dark:bg-green-900': resuelto,
                    'border-red-600 bg-red-50 dark:bg-red-900': !resuelto,
                },
                !resuelto && 'hover:scale-[1.02] active:scale-[0.98]',
            )}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {resuelto ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <h2 className={clsx('text-sm font-semibold', resuelto ? 'text-gray-800 dark:text-white' : 'text-gray-800 dark:text-white')}>
                        {vehiculo?.modelo} ({vehiculo?.placa})
                    </h2>
                </div>
                <span
                    className={clsx('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase', {
                        'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200': resuelto,
                        'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200': !resuelto,
                    })}
                >
                    {resuelto ? 'Resuelta' : 'Pendiente'}
                </span>
            </div>

            <p className={clsx('mt-2 line-clamp-2 text-xs', resuelto ? 'text-gray-400 dark:text-gray-300' : 'text-gray-600 dark:text-gray-300')}>
                {texto}
            </p>

            <p
                className={clsx(
                    'mt-1 text-[11px] font-semibold italic',
                    resuelto ? 'text-gray-400 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400',
                )}
            >
                Creado por: {user?.name ?? 'Usuario desconocido'}
            </p>

            <div className={clsx('mt-2 text-right text-[11px]', resuelto ? 'text-gray-400 dark:text-gray-500' : 'text-gray-500 dark:text-gray-400')}>
                {new Date(fecha_creacion).toLocaleString('es-VE', {
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

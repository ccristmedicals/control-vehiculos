import { ObsProps } from '@/types';
import clsx from 'clsx';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ObservacionCard({ observacion, isAdmin = false, onResolver }: ObsProps) {
    const { observacion: texto, resuelto, fecha_creacion, fecha_resolucion, tipo, user, admin } = observacion;

    const estadoColor = resuelto
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';

    const fechaCreacion = fecha_creacion ? new Date(fecha_creacion).toLocaleDateString() : 'Sin fecha';

    const fechaResolucion = fecha_resolucion ? new Date(fecha_resolucion).toLocaleDateString() : null;

    return (
        <div className={clsx('rounded-lg border p-4 shadow-sm transition hover:shadow-md', 'bg-white dark:bg-gray-800', 'flex flex-col gap-3')}>
            {/* Estado y tipo */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {resuelto ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoColor}`}>{resuelto ? 'Resuelto' : 'Pendiente'}</span>
                </div>
                {tipo && <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{tipo}</span>}
            </div>

            {/* Texto de la observación */}
            <p className="text-sm break-words whitespace-pre-line text-gray-800 dark:text-gray-100">{texto}</p>

            {/* Acciones para admin */}
            {isAdmin && !resuelto && onResolver && (
                <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                    <input
                        type="checkbox"
                        checked={resuelto}
                        onChange={() => onResolver?.(observacion.id)}
                        className="mr-2 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Marcar como resuelta
                </label>
            )}

            {/* Metadatos */}
            <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <div>
                    <span className="font-semibold">Autor:</span> {user?.name || 'Usuario desconocido'}
                </div>
                <div>
                    <span className="font-semibold">Fecha:</span> {fechaCreacion}
                </div>
                {resuelto && fechaResolucion && (
                    <div className="col-span-2">
                        <span className="font-semibold">Resuelto el:</span> {fechaResolucion}
                        {admin?.name && (
                            <>
                                {' '}
                                por <span className="font-semibold">{admin.name}</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Observacion } from '@/types';
import { router } from '@inertiajs/react';
import clsx from 'clsx';
import { AlertCircle, CheckCircle, Clock, User, Car } from 'lucide-react';

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
        <Card
            onClick={irAFichaObservaciones}
            className={clsx(
                'group h-full cursor-pointer overflow-hidden border-l-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
                resuelto
                    ? 'border-l-green-500 bg-green-50/30 dark:bg-green-950/20'
                    : 'border-l-red-600 bg-red-50/30 dark:bg-red-950/20'
            )}
        >
            <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className={clsx(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                            resuelto ? "bg-green-100 text-green-600 dark:bg-green-900/50" : "bg-red-100 text-red-600 dark:bg-red-900/50"
                        )}>
                            <Car className="h-4 w-4" />
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="truncate text-sm font-bold tracking-tight text-gray-900 dark:text-white">
                                {vehiculo?.placa}
                            </h2>
                            <p className="truncate text-[10px] font-medium text-gray-500 dark:text-gray-400">
                                {vehiculo?.modelo}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={resuelto ? "outline" : "destructive"}
                        className={clsx(
                            "h-5 px-1.5 text-[9px] font-bold uppercase tracking-wider",
                            resuelto && "border-green-200 bg-green-100 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300"
                        )}
                    >
                        {resuelto ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                        ) : (
                            <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {resuelto ? 'Resuelta' : 'Pendiente'}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-4 pt-2">
                <p className={clsx(
                    'line-clamp-3 text-xs leading-relaxed',
                    resuelto ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-200'
                )}>
                    {texto}
                </p>
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-1 p-4 pt-0 text-[10px]">
                <div className="flex w-full items-center justify-between border-t border-gray-100 pt-3 dark:border-gray-800">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                        <User className="h-3 w-3" />
                        <span className="font-medium truncate max-w-[100px]">{user?.name ?? 'Anon.'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="h-3 w-3" />
                        <span>
                            {new Date(fecha_creacion).toLocaleDateString('es-VE', {
                                day: '2-digit',
                                month: 'short',
                            })}
                        </span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehiculoCompleto } from '@/types';
import { router } from '@inertiajs/react';
import { AlertCircle, Calendar, ClipboardCheck, FileText, Package, User } from 'lucide-react';

export default function VehiculoCard({ vehiculo }: { vehiculo: VehiculoCompleto }) {
    const {
        observaciones_no_resueltas = 0,
        imagenes_factura_pendientes = 0,
        factura_pendiente = 0,
        envios_pendientes = 0,
        revision_diaria = true,
        usuario,
        usuario_adicional1,
        usuario_adicional2,
        usuario_adicional3,
    } = vehiculo;

    const adicionales = [usuario_adicional1, usuario_adicional2, usuario_adicional3].filter(Boolean) as { id: number; name: string }[];

    return (
        <Card
            className="group relative h-full cursor-pointer overflow-hidden border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-[#49af4e]/50 dark:border-gray-700 dark:bg-gray-800"
            onClick={() => router.get(`/fichaTecnica/${vehiculo.placa}`)}
        >
            <CardHeader className="flex flex-row items-start justify-between gap-4 pb-4">
                <div className="flex-1 overflow-hidden">
                    <CardTitle className="truncate text-xl font-bold text-gray-900 transition-colors group-hover:text-[#49af4e] dark:text-white">
                        {vehiculo.modelo}
                    </CardTitle>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Badge variant="outline" className="bg-gray-50 px-2 font-mono tracking-wider uppercase dark:bg-gray-900">
                            {vehiculo.placa}
                        </Badge>
                    </div>
                </div>

                {/* Indicador de alerta alineado a la derecha */}
                {!revision_diaria && (
                    <div className="mt-2 shrink-0">
                        <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                        </span>
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-[#49af4e]" />
                        <div className="text-sm leading-tight">
                            <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">Conductor Principal</p>
                            <p className="font-medium text-gray-700 italic dark:text-gray-200">{usuario?.name || 'Sin asignar'}</p>
                        </div>
                    </div>

                    {adicionales.length > 0 && (
                        <div className="border-t border-gray-100 pt-1 dark:border-gray-700/50">
                            {adicionales.map((adicional) => (
                                <div key={adicional.id} className="mt-2 flex items-start gap-2.5">
                                    <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                    <div className="text-sm leading-tight">
                                        <p className="font-medium text-gray-600 dark:text-gray-300">{adicional.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {revision_diaria === false && (
                        <Badge
                            variant="destructive"
                            className="cursor-pointer gap-1 py-1 transition-all hover:brightness-90"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.get(`/fichaTecnica/${vehiculo.placa}/revisionFluidos`);
                            }}
                        >
                            <AlertCircle className="h-3 w-3" />
                            Revisión Pendiente
                        </Badge>
                    )}
                    {observaciones_no_resueltas > 0 && (
                        <Badge
                            className="cursor-pointer gap-1 border-purple-200 bg-purple-100 py-1 text-purple-700 hover:bg-purple-200 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.get(`/fichaTecnica/${vehiculo.placa}/observaciones`);
                            }}
                        >
                            <ClipboardCheck className="h-3 w-3" />
                            {observaciones_no_resueltas} Obs.
                        </Badge>
                    )}
                    {imagenes_factura_pendientes > 0 && (
                        <Badge
                            className="cursor-pointer gap-1 border-teal-200 bg-teal-100 py-1 text-teal-700 hover:bg-teal-200 dark:border-teal-800 dark:bg-teal-900/30 dark:text-teal-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.get(`/fichaTecnica/${vehiculo.placa}/facturas`);
                            }}
                        >
                            <Calendar className="h-3 w-3" />
                            Auditoría Visual
                        </Badge>
                    )}
                    {factura_pendiente > 0 && (
                        <Badge
                            className="cursor-pointer gap-1 border-yellow-200 bg-yellow-100 py-1 text-yellow-800 hover:bg-yellow-200 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.get(`/fichaTecnica/${vehiculo.placa}/facturas`);
                            }}
                        >
                            <FileText className="h-3 w-3" />
                            {factura_pendiente} Factura{factura_pendiente > 1 ? 's' : ''}
                        </Badge>
                    )}
                    {envios_pendientes > 0 && (
                        <Badge
                            className="cursor-pointer gap-1 border-blue-200 bg-blue-100 py-1 text-blue-700 hover:bg-blue-200 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            onClick={(e) => {
                                e.stopPropagation();
                                router.get(`/fichaTecnica/${vehiculo.placa}/envios`);
                            }}
                        >
                            <Package className="h-3 w-3" />
                            {envios_pendientes} Envío{envios_pendientes > 1 ? 's' : ''}
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

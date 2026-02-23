import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VehiculoCompleto } from '@/types';
import { router } from '@inertiajs/react';
import { AlertCircle, Calendar, Car, ClipboardCheck, FileText, Package, User } from 'lucide-react';

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
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <div className="relative">
                    {vehiculo.imagen_url ? (
                        <img
                            src={vehiculo.imagen_url}
                            alt={`Vehículo ${vehiculo.modelo}`}
                            className="h-16 w-16 rounded-lg object-cover shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                            <Car className="h-8 w-8 text-gray-400" />
                        </div>
                    )}
                    {!revision_diaria && (
                        <div className="absolute -right-1 -top-1">
                            <span className="relative flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <CardTitle className="truncate text-xl font-bold text-gray-900 group-hover:text-[#49af4e] dark:text-white transition-colors">
                        {vehiculo.modelo}
                    </CardTitle>
                    <div className="flex items-center gap-1.5 mt-0.5 text-sm font-medium text-gray-500 dark:text-gray-400">
                        <Badge variant="outline" className="px-1.5 h-5 font-mono uppercase tracking-wider bg-gray-50 dark:bg-gray-900">
                            {vehiculo.placa}
                        </Badge>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-[#49af4e]" />
                        <div className="text-sm leading-tight">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Conductor Principal</p>
                            <p className="font-medium text-gray-700 dark:text-gray-200 italic">
                                {usuario?.name || 'Sin asignar'}
                            </p>
                        </div>
                    </div>

                    {adicionales.length > 0 && (
                        <div className="pt-1 border-t border-gray-100 dark:border-gray-700/50">
                            {adicionales.map((adicional) => (
                                <div key={adicional.id} className="flex items-start gap-2.5 mt-2">
                                    <User className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                                    <div className="text-sm leading-tight">
                                        <p className="font-medium text-gray-600 dark:text-gray-300">
                                            {adicional.name}
                                        </p>
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
                            className="cursor-pointer gap-1 py-1 hover:brightness-90 transition-all"
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
                            className="cursor-pointer gap-1 py-1 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800"
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
                            className="cursor-pointer gap-1 py-1 bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800"
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
                            className="cursor-pointer gap-1 py-1 bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800"
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
                            className="cursor-pointer gap-1 py-1 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
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

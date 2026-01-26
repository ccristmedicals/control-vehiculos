import { VehiculoCompleto } from '@/types';
import { router } from '@inertiajs/react';

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
        <div
            className="group flex h-[300px] cursor-pointer flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-md transition duration-200 hover:shadow-lg hover:ring-2 hover:ring-[#49af4e] dark:border-gray-700 dark:bg-gray-800"
            onClick={() => router.get(`/fichaTecnica/${vehiculo.placa}`)}
        >
            <div className="flex items-center gap-4">
                {vehiculo.imagen_url && (
                    <img src={vehiculo.imagen_url} alt={`Vehículo ${vehiculo.modelo}`} className="h-16 w-16 rounded-md object-cover shadow-sm" />
                )}
                <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-800 group-hover:text-[#49af4e] dark:text-white">{vehiculo.modelo}</h2>

                    <div className="mt-1 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        <p>
                            <span className="font-semibold text-gray-500 dark:text-gray-400">Placa:</span>{' '}
                            <span className="font-semibold">{vehiculo.placa}</span>
                        </p>
                        <p>
                            <span className="font-semibold text-[#49af4e]">Conductor principal:</span>{' '}
                            <span className="font-semibold italic">{usuario?.name || 'Sin asignar'}</span>
                        </p>
                        {adicionales.map((adicional, index) => (
                            <p key={adicional.id}>
                                <span className="font-semibold text-[#49af4e]">Conductor adicional {index + 1}:</span>{' '}
                                <span className="font-semibold italic">{adicional.name}</span>
                            </p>
                        ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {observaciones_no_resueltas > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.get(`/fichaTecnica/${vehiculo.placa}/observaciones`);
                                }}
                                className="cursor-pointer rounded-sm bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 hover:underline dark:bg-purple-800 dark:text-purple-300"
                            >
                                {observaciones_no_resueltas} observación
                                {observaciones_no_resueltas > 1 ? 'es' : ''} pendiente
                                {observaciones_no_resueltas > 1 ? 's' : ''}
                            </button>
                        )}
                        {imagenes_factura_pendientes > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.get(`/fichaTecnica/${vehiculo.placa}/facturas`);
                                }}
                                className="cursor-pointer rounded-sm bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-700 hover:underline dark:bg-teal-800 dark:text-teal-300"
                            >
                                {imagenes_factura_pendientes} auditoría visual pendiente
                                {imagenes_factura_pendientes > 1 ? 's' : ''}
                            </button>
                        )}
                        {factura_pendiente > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.get(`/fichaTecnica/${vehiculo.placa}/facturas`);
                                }}
                                className="cursor-pointer rounded-sm bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700 hover:underline dark:bg-yellow-800 dark:text-yellow-300"
                            >
                                {factura_pendiente} factura por auditar
                            </button>
                        )}
                        {revision_diaria === false && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.get(`/fichaTecnica/${vehiculo.placa}/revisionFluidos`);
                                }}
                                className="cursor-pointer rounded-sm bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:underline dark:bg-red-800 dark:text-red-300"
                            >
                                revision diaria pendiente
                            </button>
                        )}
                        {envios_pendientes > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.get(`/fichaTecnica/${vehiculo.placa}/envios`);
                                }}
                                className="cursor-pointer rounded-sm bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 hover:underline dark:bg-blue-800 dark:text-blue-300"
                            >
                                {envios_pendientes} envio
                                {envios_pendientes > 1 ? 'es' : ''} pendiente
                                {envios_pendientes > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

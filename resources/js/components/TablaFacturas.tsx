import { Factura, FacturaModalData, FacturaShowProps, Renglon, TablaFacturasProps } from '@/types';
import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { FilaFactura } from '../components/FilaFactura';
import ModalDetalleFactura from './modal/ModalDetalleFactura';

export function TablaFacturas({ facturas: facturasIniciales, vehiculo, isAdmin }: TablaFacturasProps) {
    const [facturas, setFacturas] = useState<Factura[]>(facturasIniciales);
    const actualizarEstadoFactura = (facturaNum: string, aprobado: boolean) => {
        setFacturas((prev) => prev.map((f) => (f.fact_num === facturaNum ? { ...f, aprobado } : f)));
    };

    useEffect(() => {
        setFacturas(facturasIniciales);
    }, [facturasIniciales]);

    const [showModal, setShowModal] = useState(false);

    const [modalData, setModalData] = useState<{
        factura: FacturaModalData;
        vehiculo: {
            placa: string;
            conductor: string;
            respaldo?: string | null;
            adicionales?: string | null;
        };
        renglones: Renglon[];
        auditados: boolean;
    } | null>(null);
    const handleCloseModal = () => {
        setShowModal(false);
        if (typeof window !== 'undefined') {
            window.history.back();
        }
    };

    return (
        <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full table-auto border-collapse bg-white dark:bg-gray-800">
                <thead className="bg-gray-200 dark:bg-gray-700">
                    <tr className="text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                        <th className="px-4 py-2">N° de Factura</th>
                        <th className="px-4 py-2">Fecha</th>
                        <th className="px-4 py-2">Vehículo</th>
                        <th className="px-4 py-2">Bruto</th>
                        <th className="px-4 py-2">Neto</th>
                        <th className="px-4 py-2">Descripción</th>
                        <th className="px-4 py-2">Revisado</th>
                        <th className="px-4 py-2">Detalles</th>
                    </tr>
                </thead>
                <tbody>
                    {facturas.map((factura) => (
                        <FilaFactura
                            key={factura.fact_num}
                            factura={factura}
                            isAdmin={isAdmin}
                            onOpenModal={(facturaNum) => {
                                router.get(
                                    `/fichaTecnica/facturas/${facturaNum}`,
                                    {},
                                    {
                                        preserveState: true,
                                        onSuccess: (page) => {
                                            const { factura, vehiculo, renglones, auditados } = page.props as unknown as FacturaShowProps;
                                            setModalData({
                                                factura,
                                                vehiculo: {
                                                    ...vehiculo,
                                                    respaldo: vehiculo.respaldo ?? null,
                                                    adicionales: vehiculo.adicionales ?? null,
                                                },
                                                renglones,
                                                auditados,
                                            });
                                            setShowModal(true);
                                        },
                                    },
                                );
                            }}
                            vehiculo={vehiculo}
                            index={0}
                        />
                    ))}
                </tbody>
            </table>
            {showModal && modalData && (
                <ModalDetalleFactura
                    onClose={handleCloseModal}
                    factura={modalData.factura}
                    vehiculo={modalData.vehiculo}
                    renglones={modalData.renglones}
                    auditados={modalData.auditados}
                    isAdmin={isAdmin}
                    visible={showModal}
                    onActualizarEstado={actualizarEstadoFactura}
                />
            )}
        </div>
    );
}

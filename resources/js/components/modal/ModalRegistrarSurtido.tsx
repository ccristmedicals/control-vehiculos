/* eslint-disable react-hooks/exhaustive-deps */
import { fields } from '@/constants/surtidoFields';
import { useFormLogic } from '@/hooks/useFormLogic';
import { ModalRegistroSurtidoProps, SurtidoFormData } from '@/types';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { router } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function ModalRegistroSurtido({ isOpen, onClose, vehiculo }: ModalRegistroSurtidoProps) {
    const { formValues, handleChange, hasCamposIncompletos } = useFormLogic<SurtidoFormData>(
        {
            litros: '',
            kilometraje: '',
            observacion: '',
            user_id: '',
        },
        fields,
    );
    const { litros, kilometraje, observacion } = formValues;
    const [processing, setProcessing] = useState(false);
    const [kilometrajeAnterior, setKilometrajeAnterior] = useState<number>(0);
    const [precioUnitario, setPrecioUnitario] = useState<number>(0.5);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [valorCarburador, setValorCarburador] = useState(0);
    const [conductores, setConductores] = useState<{ id: number; name: string }[]>([]);

    const surtidoIdeal =
        kilometrajeAnterior > 0 && Number(kilometraje) > kilometrajeAnterior ? (Number(kilometraje) - kilometrajeAnterior) * valorCarburador : 0;

    const precioTotal = Number(litros) * precioUnitario;

    console.log(valorCarburador);

    useEffect(() => {
        if (isOpen) {
            fetch(`/fichaTecnica/${vehiculo.placa}/gasolina/info`)
                .then((res) => res.json())
                .then((data) => {
                    setKilometrajeAnterior(data.kilometraje_anterior);
                    setPrecioUnitario(data.precio_unitario);
                    setValorCarburador(data.valor_carburador);
                    setConductores(data.users);
                });
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            handleChange('litros', '');
            handleChange('kilometraje', '');
            handleChange('observacion', '');
            handleChange('user_id', '');
        }
    }, [isOpen]);

    function registrarSurtido() {
        if (hasCamposIncompletos) {
            toast.error('Por favor completa los campos requeridos');
            return;
        }

        const diferenciaLitros = Math.abs(Number(litros) - surtidoIdeal);
        if (surtidoIdeal !== 0 && diferenciaLitros > 10) {
            setMostrarConfirmacion(true);
            return;
        }

        const confirmarKilometraje = window.confirm(`ESTAS REGISTRANDO UN SURTIDO CON ${kilometraje}KM DE KILOMETRAJE. ¿Deseas continuar?`);
        if (!confirmarKilometraje) return;

        ejecutarRegistro();
    }

    function ejecutarRegistro() {
        setProcessing(true);

        router.post(
            `/fichaTecnica/${vehiculo.placa}/gasolina`,
            {
                cant_litros: litros,
                kilometraje,
                observaciones: observacion,
                precio: precioTotal,
                user_id: formValues.user_id,
            },
            {
                onSuccess: () => {
                    toast.success('Surtido registrado correctamente');
                    onClose();
                },
                onError: () => toast.error('Error al registrar el surtido'),
                onFinish: () => setProcessing(false),
            },
        );
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 p-4">
                <DialogPanel className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl dark:border dark:border-gray-700 dark:bg-gray-900">
                    {/* Encabezado */}
                    <div className="mb-6 flex items-center justify-between border-b pb-2">
                        <DialogTitle className="text-xl font-bold text-gray-800 dark:text-white">Registrar Surtido de Gasolina</DialogTitle>
                        <button onClick={onClose} className="rounded-full p-1 text-gray-500 hover:text-gray-700 dark:hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Datos del vehículo */}
                    <div className="mb-6 text-gray-700 dark:text-gray-300">
                        <p>
                            <strong>Placa:</strong> {vehiculo.placa}
                        </p>
                        <p>
                            <strong>Conductor:</strong> {vehiculo.conductor}
                        </p>
                        <p>
                            <strong>Modelo:</strong> {vehiculo.modelo}
                        </p>
                    </div>
                    {/* Resumen de cálculo */}
                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Kilometraje anterior</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {kilometrajeAnterior !== null ? kilometrajeAnterior.toFixed(2) + ' km' : 'N/A'}
                            </p>
                        </div>
                        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Surtido ideal</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                {surtidoIdeal !== 0 ? surtidoIdeal.toFixed(2) + ' litros' : 'N/A'}
                            </p>
                        </div>
                        <div className="rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
                            <p className="text-sm text-gray-600 dark:text-gray-300">Precio total</p>
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">${precioTotal.toFixed(2)}</p>
                        </div>
                    </div>
                    {/* Campos dinámicos */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {/* Renderizar primero kilometraje y litros surtidos */}
                        {['kilometraje', 'litros'].map((id) => {
                            const field = fields.find((f) => f.id === id);
                            if (!field) return null;
                            return (
                                <div key={field.id}>
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{field.label}</label>
                                    <input
                                        type="number"
                                        value={formValues[field.id] as string}
                                        onChange={(e) => handleChange(field.id, e.target.value)}
                                        placeholder={field.placeholder}
                                        className={`w-full rounded-md border px-3 py-2 text-sm ${hasCamposIncompletos && field.required && !formValues[field.id]
                                            ? 'border-red-500'
                                            : 'border-gray-300 dark:border-gray-700'
                                            } bg-white text-gray-800 shadow-sm focus:border-green-500 focus:outline-none dark:bg-gray-800 dark:text-white`}
                                    />
                                </div>
                            );
                        })}

                        {/* Renderizar conductor al lado de litros surtidos */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Conductor</label>
                            <select
                                value={String(formValues.user_id ?? '')}
                                onChange={(e) => handleChange('user_id', e.target.value)}
                                className={`w-full rounded-md border px-3 py-2 text-sm ${hasCamposIncompletos && !formValues.user_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    } bg-white text-gray-800 shadow-sm focus:border-green-500 focus:outline-none dark:bg-gray-800 dark:text-white`}
                            >
                                <option value="">Seleccionar</option>
                                {conductores.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Renderizar textarea de observación ocupando dos columnas */}
                        <div className="sm:col-span-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Observación</label>
                                <span className={`text-xs ${(formValues.observacion as string || '').length >= 60
                                    ? 'text-red-500 font-bold'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {(formValues.observacion as string || '').length}/60
                                </span>
                            </div>
                            <textarea
                                maxLength={60}
                                value={formValues.observacion as string}
                                onChange={(e) => handleChange('observacion', e.target.value)}
                                placeholder={fields.find((f) => f.id === 'observacion')?.placeholder}
                                className={`w-full rounded-md border px-3 py-2 text-sm ${hasCamposIncompletos && fields.find((f) => f.id === 'observacion')?.required && !formValues.observacion
                                    ? 'border-red-500'
                                    : 'border-gray-300 dark:border-gray-700'
                                    } bg-white text-gray-800 shadow-sm focus:border-green-500 focus:outline-none dark:bg-gray-800 dark:text-white`}
                                rows={3}
                            />
                        </div>
                    </div>
                    {/* Confirmación embebida */}
                    {mostrarConfirmacion && (
                        <div className="mt-6 rounded-lg border border-red-400 bg-red-100 p-4 text-sm text-red-800 dark:border-red-600 dark:bg-red-900 dark:text-red-200">
                            <p className="mb-2 font-semibold">
                                ¿Registrar surtido con diferencia de {Math.abs(Number(litros) - surtidoIdeal).toFixed(2)} litros?
                            </p>
                            <p className="mb-4">La cantidad ingresada difiere significativamente del cálculo ideal.</p>
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setMostrarConfirmacion(false);

                                        // Confirmación adicional de kilometraje
                                        const confirmarKilometraje = window.confirm(
                                            `Estás registrando un surtido con kilometraje ${kilometraje}. ¿Deseas continuar?`,
                                        );
                                        if (!confirmarKilometraje) return;

                                        ejecutarRegistro();
                                    }}
                                    className="rounded bg-gray-300 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-white"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => {
                                        setMostrarConfirmacion(false);
                                        ejecutarRegistro();
                                    }}
                                    className="rounded bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    Confirmar
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="mt-6 text-right">
                        <button
                            onClick={registrarSurtido}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded bg-[#49af4e] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4fbb55] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                                    </svg>
                                    Registrando...
                                </>
                            ) : (
                                'Registrar surtido'
                            )}
                        </button>
                    </div>
                </DialogPanel>
            </div>
        </Dialog>
    );
}

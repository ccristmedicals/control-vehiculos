/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { DateField } from '@/components/form-fields/DateField';
import { SearchSelectField } from '@/components/form-fields/SearchSelectField';
import { SelectField } from '@/components/form-fields/SelectField';
import { TextField } from '@/components/form-fields/TextField';
import { useFormLogic } from '@/hooks/useFormLogic';
import { Field, FormCardProps } from '@/types';
import { compressToWebp } from '@/utils/compressToWebp';
import { useMemo, useState } from 'react';
import { CheckField } from './form-fields/CheckField';
import { FileField } from './form-fields/FileField';

export default function FormCard({ title, fields, buttonText, formType = 'expediente', onSubmit, expediente = {}, onChange }: FormCardProps) {
    const { formValues, isEditing, hasFechasInvalidas, hasCamposIncompletos, handleChange } = useFormLogic(expediente, fields, onChange);

    const [imagenModal, setImagenModal] = useState<string | null>(null);
    // Progreso de compresión por campo (0–100). Si existe la clave, está comprimiendo.
    const [compProgress, setCompProgress] = useState<Record<string, number>>({});

    const isCompressing = useMemo(() => Object.keys(compProgress).length > 0, [compProgress]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (hasFechasInvalidas) {
            alert('Hay fechas inválidas. Corrige antes de guardar.');
            return;
        }
        if (isCompressing) {
            alert('Espera a que termine la compresión antes de guardar.');
            return;
        }
        onSubmit?.(formValues);
    };

    const handleChangeWrapper = (id: string, value: any) => {
        handleChange(id, value);
        // onChange is now handled by useFormLogic to avoid stale state issues in async contexts
    };

    const renderField = (field: Field) => {
        const value = formValues[field.id];

        switch (field.type) {
            case 'date':
                return (
                    <DateField
                        id={field.id}
                        label={field.label}
                        expedicion={typeof formValues[`${field.id}_expedicion`] === 'string' ? formValues[`${field.id}_expedicion`] : ''}
                        vencimiento={typeof formValues[`${field.id}_vencimiento`] === 'string' ? formValues[`${field.id}_vencimiento`] : ''}
                        onChange={handleChangeWrapper}
                    />
                );

            case 'select':
                return <SelectField id={field.id} label={field.label} value={value} options={field.options} onChange={handleChangeWrapper} />;

            // --- NUEVO: Agregamos el case para el buscador ---
            case 'search-select':
                return <SearchSelectField id={field.id} label={field.label} value={value} options={field.options} onChange={handleChangeWrapper} />;
            // --------------------------------------------------

            case 'file': {
                const safeFile = value instanceof File || value === null ? value : undefined;

                const baseId = field.id.replace(/_archivo$/, '');
                const rawDocumento = expediente[field.id] ?? expediente[`${baseId}`] ?? expediente[`${baseId}_documento`];
                const documentoActual = typeof rawDocumento === 'string' ? rawDocumento : undefined;

                const progress = compProgress[field.id];

                return (
                    <div className="space-y-2">
                        <FileField
                            id={field.id}
                            label={field.label}
                            value={safeFile}
                            onChange={async (id, file) => {
                                // Si el usuario limpia el input
                                if (!file) {
                                    handleChangeWrapper(id, null);
                                    setCompProgress((prev) => {
                                        const { [id]: _, ...rest } = prev;
                                        return rest;
                                    });
                                    return;
                                }

                                // Iniciar y mostrar progreso de compresión
                                setCompProgress((prev) => ({ ...prev, [id]: 0 }));
                                try {
                                    const compressed = await compressToWebp(file, {
                                        maxWidthOrHeight: 2000, // ajusta si necesitas 1600–2400
                                        targetSizeMB: 1.2, // ajusta la calidad/tamaño objetivo
                                        onProgress: (p) => setCompProgress((prev) => ({ ...prev, [id]: p })),
                                    });
                                    handleChangeWrapper(id, compressed);
                                } finally {
                                    // Quitar el indicador de compresión
                                    setCompProgress((prev) => {
                                        const { [id]: _, ...rest } = prev;
                                        return rest;
                                    });
                                }
                            }}
                        />

                        {/* Indicador simple de compresión */}
                        {typeof progress === 'number' && (
                            <div className="text-xs text-gray-600 dark:text-gray-300">Comprimiendo: {Math.round(progress)}%</div>
                        )}

                        {/* Archivo anterior si existe */}
                        {documentoActual &&
                            (/\.(pdf)$/i.test(documentoActual) ? (
                                <a
                                    href={`${documentoActual}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-blue-600 underline"
                                >
                                    Ver PDF actual
                                </a>
                            ) : (
                                <div className="max-h-48 cursor-pointer" onClick={() => setImagenModal(`${documentoActual}`)}>
                                    <img
                                        src={`${documentoActual}`}
                                        alt="Documento actual"
                                        className="max-h-48 rounded border object-contain shadow-sm"
                                    />
                                </div>
                            ))}
                        {documentoActual && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Al subir un nuevo archivo, se reemplazará el documento actual.</p>
                        )}
                    </div>
                );
            }

            case 'checkbox':
                return (
                    <CheckField
                        id={field.id}
                        label={field.label}
                        checked={value === true}
                        onChange={(id, checked) => handleChangeWrapper(id, checked)}
                    />
                );

            default:
                return (
                    <TextField
                        id={field.id}
                        label={field.label}
                        value={typeof value === 'string' ? value : ''}
                        placeholder={field.placeholder}
                        type={field.type}
                        onChange={handleChangeWrapper}
                    />
                );
        }
    };

    return (
        <div className="mx-auto w-full max-w-5xl rounded-xl border bg-gray-100 px-4 py-4 shadow-lg md:px-8 dark:bg-gray-800">
            {title && <h2 className="pb-4 text-center text-2xl font-semibold text-gray-800 dark:text-gray-100">{title}</h2>}

            <form className="space-y-8" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {fields.map((field) => (
                        <div key={field.id} className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                            {renderField(field)}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={hasFechasInvalidas || hasCamposIncompletos || isCompressing}
                        title={isCompressing ? 'Esperando a que termine la compresión…' : undefined}
                        className={`w-full rounded-full px-6 py-3 text-base font-semibold shadow-md transition-transform duration-200 md:w-auto ${
                            hasFechasInvalidas || hasCamposIncompletos || isCompressing
                                ? 'cursor-not-allowed bg-gray-400 text-white'
                                : 'bg-[#49af4e] text-white hover:scale-105 hover:bg-[#3d9641] focus:ring-2 focus:ring-[#49af4e] focus:ring-offset-2 focus:outline-none'
                        }`}
                    >
                        {buttonText ||
                            (isEditing
                                ? `Actualizar ${formType.charAt(0).toUpperCase() + formType.slice(1)}`
                                : `Guardar ${formType.charAt(0).toUpperCase() + formType.slice(1)}`)}
                    </button>
                </div>
            </form>

            {/* Modal para imagen ampliada */}
            {imagenModal && (
                <div className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black" onClick={() => setImagenModal(null)}>
                    <img
                        src={imagenModal}
                        alt="Imagen ampliada"
                        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

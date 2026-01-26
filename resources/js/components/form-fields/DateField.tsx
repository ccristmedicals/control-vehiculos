import { DateFieldProps } from '@/types';

export function DateField({ id, label, expedicion, vencimiento, onChange }: DateFieldProps) {
    const exp = typeof expedicion === 'string' ? expedicion : '';
    const ven = typeof vencimiento === 'string' ? vencimiento : '';

    const fechaInvalida = exp && ven && new Date(ven) < new Date(exp);

    const formatDate = (iso: string): string => {
        if (!iso) return '';
        return iso.split('T')[0];
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-600 dark:text-gray-300">{label}</label>
            <div className="flex flex-col gap-1">
                <label htmlFor={`${id}-expedicion`} className="text-xs text-gray-500 dark:text-gray-400">
                    Fecha de Expedición
                </label>
                <input
                    id={`${id}-expedicion`}
                    type="date"
                    value={formatDate(exp)}
                    onChange={(e) => onChange(`${id}_expedicion`, e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm transition focus:border-[#49af4e] focus:ring-2 focus:ring-[#49af4e] focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div className="flex flex-col gap-1">
                <label htmlFor={`${id}-vencimiento`} className="text-xs text-gray-500 dark:text-gray-400">
                    Fecha de Vencimiento
                </label>
                <input
                    id={`${id}-vencimiento`}
                    type="date"
                    value={formatDate(ven)}
                    onChange={(e) => onChange(`${id}_vencimiento`, e.target.value)}
                    className={`rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none ${
                        fechaInvalida
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500'
                            : 'border-gray-300 focus:border-[#49af4e] focus:ring-2 focus:ring-[#49af4e]'
                    } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                />
                {fechaInvalida && <p className="mt-1 text-xs text-red-500">La fecha de vencimiento no puede ser anterior a la de expedición.</p>}
            </div>
        </div>
    );
}

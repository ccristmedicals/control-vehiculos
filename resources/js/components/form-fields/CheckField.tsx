import { CheckFieldProps } from '@/types';

export function CheckField({ id, label, checked, onChange }: CheckFieldProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) => onChange(id, e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[#49af4e] focus:ring-[#49af4e]"
            />
            <label htmlFor={id} className="text-sm text-gray-700 dark:text-gray-300">
                {label}
            </label>
        </div>
    );
}

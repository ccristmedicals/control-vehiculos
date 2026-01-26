import { SelectFieldProps } from '@/types';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from '@headlessui/react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export function SearchSelectField({ id, label, value, options = [], onChange }: SelectFieldProps) {
    const [query, setQuery] = useState('');

    // 1. Encontrar la opción seleccionada actual (manejando strings, numbers o null)
    const selectedOption = useMemo(
        () => options.find((opt) => String(opt.value) === String(value)) || null,
        [options, value]
    );

    // 2. Filtrar las opciones en tiempo real según lo que el usuario escriba
    const filteredOptions = useMemo(() => {
        return query === ''
            ? options
            : options.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));
    }, [options, query]);

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                {label}
            </label>

            <Combobox
                value={selectedOption}
                onChange={(option) => {
                    // Si selecciona algo, enviamos el valor. Si lo limpia, enviamos un string vacío.
                    onChange(id, option ? option.value : '');
                }}
                onClose={() => setQuery('')} // Limpia la búsqueda al cerrar el desplegable
            >
                <div className="relative mt-1">
                    {/* Contenedor principal del input */}
                    <div className="relative w-full cursor-default overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm transition-all focus-within:border-[#49af4e] focus-within:ring-2 focus-within:ring-[#49af4e] dark:border-gray-600 dark:bg-gray-700 sm:text-sm">

                        {/* Ícono de Lupa */}
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400 dark:text-gray-300" aria-hidden="true" />
                        </div>

                        {/* Input escribible */}
                        <ComboboxInput
                            id={id}
                            className="w-full border-none bg-transparent py-2 pl-9 pr-10 text-sm text-gray-700 focus:outline-none focus:ring-0 dark:text-white"
                            displayValue={(opt: { label: string } | null) => opt?.label || ''}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar o seleccionar..."
                            autoComplete="off"
                        />

                        {/* Botón de flechas */}
                        <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronsUpDown className="h-4 w-4 text-gray-400 dark:text-gray-300" aria-hidden="true" />
                        </ComboboxButton>
                    </div>

                    {/* Lista desplegable */}
                    <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-600 sm:text-sm">
                        {filteredOptions.length === 0 && query !== '' ? (
                            <div className="relative cursor-default select-none px-4 py-2 text-gray-700 dark:text-gray-300">
                                No se encontraron resultados.
                            </div>
                        ) : (
                            filteredOptions.map((option) => (
                                <ComboboxOption
                                    key={option.value}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 transition-colors ${active ? 'bg-[#49af4e] text-white' : 'text-gray-900 dark:text-white'
                                        }`
                                    }
                                    value={option}
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span
                                                    className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-[#49af4e]'
                                                        }`}
                                                >
                                                    <Check className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </ComboboxOption>
                            ))
                        )}
                    </ComboboxOptions>
                </div>
            </Combobox>
        </div>
    );
}
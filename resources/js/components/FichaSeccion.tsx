import FormCard from '@/components/FormCard';
import { FichaSeccionProps } from '@/types';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { PanelTopOpen } from 'lucide-react';

export default function FichaSeccion({ title, fields, formType, expediente, onSubmit, onChange, loading }: FichaSeccionProps) {
    return (
        <Disclosure as="div" className="mx-auto w-full max-w-5xl rounded-xl border bg-gray-100 shadow-lg dark:bg-gray-800">
            {({ open }) => (
                <>
                    <DisclosureButton className="flex w-full items-center justify-between px-4 py-4 text-left text-xl font-bold text-gray-800 focus:outline-none focus-visible:ring focus-visible:ring-[#49af4e] focus-visible:ring-offset-2 md:px-6 dark:text-white">
                        <span>{title}</span>
                        <PanelTopOpen className={`h-5 w-5 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
                    </DisclosureButton>
                    <DisclosurePanel className="px-4 pt-2 pb-6 md:px-6">
                        <FormCard
                            fields={fields}
                            formType={formType}
                            expediente={expediente || {}}
                            onSubmit={onSubmit}
                            onChange={onChange}
                            loading={loading}
                        />
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}

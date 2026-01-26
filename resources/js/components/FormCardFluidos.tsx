import FormCard from '@/components/FormCard';
import { FichaSeccionFluidosProps } from '@/types';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { PanelTopOpen } from 'lucide-react';

export default function FichaSeccionFluidos({ title, fields, expediente, onSubmit }: FichaSeccionFluidosProps) {
    return (
        <Disclosure as="div" className="mx-auto w-full max-w-5xl rounded-xl border bg-gray-100 shadow-lg dark:bg-gray-800">
            {({ open }) => (
                <>
                    <DisclosureButton className="flex w-full items-center justify-between px-6 py-4 text-left text-xl font-bold text-gray-800 dark:text-white">
                        <span>{title}</span>
                        <PanelTopOpen className={`h-5 w-5 transform transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`} />
                    </DisclosureButton>
                    <DisclosurePanel className="space-y-6 px-6 pt-2 pb-6">
                        <FormCard fields={fields} formType="revisionFluidos" expediente={expediente} onSubmit={onSubmit} />
                    </DisclosurePanel>
                </>
            )}
        </Disclosure>
    );
}

import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-[#f8fafc] p-6 md:p-10 dark:bg-gray-950">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-2xl bg-[#49af4e]/10 flex items-center justify-center text-[#49af4e] mb-2 dark:bg-[#49af4e]/20">
                                <span className="text-xl font-black">CV</span>
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-gray-900 dark:text-white">
                                Control de <span className="text-[#49af4e]">Vehículos</span>
                            </span>
                        </div>

                        <div className="text-center space-y-1">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
                            <p className="text-sm text-muted-foreground font-medium">{description}</p>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-xl shadow-gray-200/50 md:p-10 dark:bg-gray-900 dark:border-gray-800 dark:shadow-none">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

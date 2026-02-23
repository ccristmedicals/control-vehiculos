/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { PageProps } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Activity, Calendar, CheckCircle2, User } from 'lucide-react';
import { useEffect } from 'react';

export default function Pistas() {
    const { activityMatrix, administrators, actions } = usePage<PageProps>().props;

    const { data, setData, get } = useForm<{ date: string }>({
        date: '',
    });

    // Enviar automáticamente al backend cuando cambia la fecha
    useEffect(() => {
        if (data.date) {
            get('/supervision', {
                preserveScroll: true,
                preserveState: true,
            });
        }
    }, [data.date]);

    const getActionCount = (adminName: any, actionName: string | number) => {
        const adminData = activityMatrix.find((item: { name: any }) => item.name === adminName);
        return adminData?.actions[actionName] || 0;
    };

    return (
        <AppLayout>
            <Head title="Pista de Empleados" />
            <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950">
                {/* Minimalist Header */}
                <div className="bg-white border-b border-gray-200 py-8 dark:bg-gray-900 dark:border-gray-800">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-1 text-center md:text-left">
                                <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                                    Pista de <span className="text-[#49af4e]">Empleados</span>
                                </h1>
                                <p className="text-sm text-muted-foreground font-medium">
                                    Seguimiento de actividad y supervisión administrativa.
                                </p>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#49af4e]/10 flex items-center justify-center text-[#49af4e] dark:bg-[#49af4e]/20">
                                    <Activity className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto py-8 px-4 md:px-8">
                    {/* Filters Section */}
                    <div className="mb-8 max-w-xs">
                        <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70">
                            Filtrar por Fecha
                        </label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-[#49af4e] transition-colors" />
                            <Input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="pl-11 h-11 bg-white border-gray-200 rounded-xl shadow-sm dark:bg-gray-900 dark:border-gray-800 focus:ring-4 focus:ring-[#49af4e]/10 focus:border-[#49af4e] transition-all"
                            />
                        </div>
                        {data.date && (
                            <p className="mt-2 text-[11px] font-bold text-[#49af4e] uppercase tracking-wider">
                                Acciones del día: {data.date}
                            </p>
                        )}
                    </div>

                    {/* Matrix Table */}
                    {activityMatrix.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-24 dark:border-gray-800">
                            <Activity className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sin actividad registrada</h3>
                            <p className="text-sm text-gray-500 text-center max-w-xs mt-2">
                                No se encontraron acciones registradas para la fecha seleccionada.
                            </p>
                        </div>
                    ) : (
                        <Card className="border-none shadow-xl shadow-gray-200/40 overflow-hidden dark:bg-gray-900 dark:shadow-none">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100 dark:bg-gray-800/50 dark:border-gray-800">
                                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                Administrador
                                            </th>
                                            {actions.map((action: any) => (
                                                <th key={action} className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                                    {action}
                                                </th>
                                            ))}
                                            <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground bg-gray-100/30 dark:bg-gray-800/30">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                        {administrators.map((adminName: any) => {
                                            const totalActions = actions.reduce(
                                                (sum: number, actionName: any) => sum + getActionCount(adminName, actionName),
                                                0,
                                            );
                                            return (
                                                <tr key={adminName} className="group hover:bg-gray-50/80 transition-colors dark:hover:bg-gray-800/50">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center dark:bg-gray-800">
                                                                <User className="h-4 w-4 text-gray-400" />
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                                {adminName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {actions.map((actionName: any) => {
                                                        const count = getActionCount(adminName, actionName);
                                                        return (
                                                            <td key={`${adminName}-${actionName}`} className="px-4 py-4 text-center">
                                                                {count > 0 ? (
                                                                    <Badge className="bg-green-50 text-green-700 border-green-100 shadow-none font-black dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50">
                                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                                        {count}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-xs font-medium text-gray-300 dark:text-gray-600">
                                                                        0
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                    <td className="px-6 py-4 text-center bg-gray-50/30 dark:bg-gray-800/30">
                                                        <span className="text-sm font-black text-[#49af4e]">
                                                            {totalActions}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

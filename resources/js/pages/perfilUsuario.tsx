/* eslint-disable react-hooks/exhaustive-deps */
import AppLayout from '@/layouts/app-layout';
import { UsuarioBasico } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    User,
    Mail,
    Fingerprint,
    Calendar,
    FileText,
    ShieldCheck,
    CreditCard,
    Camera,
    AlertCircle,
    Save,
} from 'lucide-react';
import clsx from 'clsx';

export default function PerfilUsuario() {
    const { usuario } = usePage<{ usuario: UsuarioBasico }>().props;

    const [formData, setFormData] = useState<Record<string, string | File | null>>({});
    const [submitting, setSubmitting] = useState(false);
    const [imagenModal, setImagenModal] = useState<string | null>(null);

    const documentos = [
        { label: 'Cédula de Identidad', key: 'cedula', icon: Fingerprint, color: 'text-blue-500' },
        { label: 'Licencia de Conducir', key: 'licencia', icon: CreditCard, color: 'text-green-500' },
        { label: 'Certificado Médico', key: 'certificado_medico', icon: ShieldCheck, color: 'text-purple-500' },
    ];

    const handleFileChange = (key: string, file: File | null) => {
        setFormData((prev) => ({ ...prev, [`foto_${key}`]: file }));
    };

    const handleDateChange = (key: string, date: string) => {
        setFormData((prev) => ({ ...prev, [`vencimiento_${key}`]: date }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const payload = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== null) payload.append(key, value);
        });
        payload.append('_method', 'PATCH');
        router.post(`/perfil/${usuario.id}`, payload, {
            forceFormData: true,
            onFinish: () => setSubmitting(false),
        });
    };

    useEffect(() => {
        const initialData: Record<string, string | File | null> = {};
        documentos.forEach(({ key }) => {
            const vencimiento = usuario[`vencimiento_${key}` as keyof UsuarioBasico] as string | undefined;
            if (vencimiento) initialData[`vencimiento_${key}`] = vencimiento;
        });
        setFormData(initialData);
    }, []);

    return (
        <AppLayout>
            <Head title={`Perfil de ${usuario.name}`} />
            <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-900/50">
                {/* Minimalist Header */}
                <div className="bg-white border-b border-gray-200 py-10 dark:bg-gray-900 dark:border-gray-800">
                    <div className="container mx-auto px-4 md:px-8">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="h-24 w-24 rounded-3xl bg-[#49af4e]/10 flex items-center justify-center text-[#49af4e] dark:bg-[#49af4e]/20">
                                <User className="h-12 w-12" />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                    {usuario.name}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6">
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold dark:bg-gray-800 dark:text-gray-400">
                                        <Fingerprint className="h-3.5 w-3.5" />
                                        ID: {usuario.id}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                        <Mail className="h-4 w-4" />
                                        {usuario.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest text-green-600 dark:text-green-500">
                                            Activo
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto py-10 px-4 md:px-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                    Documentación Digital
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Gestiona y actualiza los documentos obligatorios del personal.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-[#49af4e] hover:bg-[#3d9641] text-white shadow-lg shadow-green-500/20 font-bold px-8 h-11 rounded-full"
                            >
                                {submitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Guardando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Save className="h-4 w-4" />
                                        Guardar Cambios
                                    </div>
                                )}
                            </Button>
                        </div>

                        {/* Documents Section */}
                        <div className="space-y-6">
                            {/* Tips Banner */}
                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 text-amber-800 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/50">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm font-medium">
                                    <span className="font-bold">Nota importante:</span> Mantenga sus documentos actualizados para evitar restricciones en el sistema de control vehicular. Los archivos se optimizan automáticamente al subir.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {documentos.map(({ label, key, icon: Icon, color }) => {
                                    const foto = usuario[`foto_${key}` as keyof UsuarioBasico] as string | undefined;
                                    const vencimiento = usuario[`vencimiento_${key}` as keyof UsuarioBasico] as string | undefined;
                                    const vencido = vencimiento && new Date(vencimiento) < new Date();

                                    return (
                                        <Card key={key} className="group border-none shadow-xl shadow-gray-200/40 dark:shadow-none dark:bg-gray-900 transition-all hover:scale-[1.01]">
                                            <CardHeader className="pb-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={clsx("p-2 rounded-xl bg-gray-50 dark:bg-gray-800 group-hover:bg-white transition-colors duration-300", color)}>
                                                            <Icon className="h-5 w-5" />
                                                        </div>
                                                        <CardTitle className="text-base font-bold dark:text-white">{label}</CardTitle>
                                                    </div>
                                                    {vencimiento && (
                                                        <Badge className={clsx(
                                                            "font-bold text-[10px] uppercase tracking-wider bg-transparent border shadow-none",
                                                            vencido
                                                                ? "text-red-600 border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                                                                : "text-green-600 border-green-100 bg-green-50 dark:bg-green-900/20 dark:border-green-800"
                                                        )}>
                                                            {vencido ? 'Vencido' : 'Vigente'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 group-hover:border-[#49af4e]/30 transition-colors">
                                                    {foto ? (
                                                        <>
                                                            <img
                                                                src={foto}
                                                                alt={label}
                                                                className="h-full w-full object-cover"
                                                            />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    type="button"
                                                                    onClick={() => setImagenModal(foto)}
                                                                    className="rounded-full font-bold"
                                                                >
                                                                    <FileText className="mr-2 h-4 w-4" />
                                                                    Ver detalle
                                                                </Button>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                                                            <Camera className="h-10 w-10 mb-2 opacity-20" />
                                                            <p className="text-xs font-bold uppercase tracking-tighter opacity-50">Sin Documento Cargado</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                            <Calendar className="h-3 w-3" />
                                                            Fecha de Vencimiento
                                                        </label>
                                                        <input
                                                            type="date"
                                                            onChange={(e) => handleDateChange(key, e.target.value)}
                                                            value={
                                                                typeof formData[`vencimiento_${key}`] === 'string'
                                                                    ? (formData[`vencimiento_${key}`] as string)
                                                                    : vencimiento || ''
                                                            }
                                                            className="w-full h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium transition-all focus:border-[#49af4e] focus:ring-4 focus:ring-[#49af4e]/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                                        />
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                            <FileText className="h-3 w-3" />
                                                            Actualizar Archivo
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(key, e.target.files?.[0] || null)}
                                                                className="w-full h-10 file:hidden rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium dark:border-gray-700 dark:bg-gray-800 cursor-pointer"
                                                            />
                                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                                                                <Camera className="h-4 w-4" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* MODAL DE IMAGEN AMPLIADA */}
            {imagenModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-all"
                    onClick={() => setImagenModal(null)}
                >
                    <div className="relative max-w-5xl w-full animate-in zoom-in duration-300">
                        <img
                            src={imagenModal}
                            alt="Documento ampliado"
                            className="max-h-[85vh] w-full rounded-2xl object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                            variant="secondary"
                            size="icon"
                            className="absolute -top-12 right-0 rounded-full h-10 w-10"
                            onClick={() => setImagenModal(null)}
                        >
                            <span className="text-xl">×</span>
                        </Button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

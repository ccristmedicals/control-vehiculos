import { useState } from 'react';
import NewPasswordController from '@/actions/App/Http/Controllers/Auth/NewPasswordController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import TextLink from '@/components/text-link';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <AuthLayout title="Recupera tu contraseña" description="Ingresa tus datos para recuperar contraseña">
            <Head title="Recuperar" />

            <Form {...NewPasswordController.actualizar.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                    Cédula de Identidad
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="Ej. 12345678"
                                    className="h-12 rounded-xl border-gray-200 px-4 transition-all focus:ring-4 focus:ring-[#49af4e]/10 focus:border-[#49af4e] dark:bg-gray-800 dark:border-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                    Nueva Contraseña
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Ingresa tu nueva contraseña"
                                        className="h-12 rounded-xl border-gray-200 px-4 transition-all focus:ring-4 focus:ring-[#49af4e]/10 focus:border-[#49af4e] dark:bg-gray-800 dark:border-gray-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#49af4e] transition-colors focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <Eye size={18} />
                                        ) : (
                                            <EyeClosed size={18} />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-[#49af4e] font-black text-white shadow-lg shadow-[#49af4e]/20 transition-all hover:bg-[#3d9641] active:scale-[0.98]"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Actualizar contraseña"
                                )}
                            </Button>

                            <div className="pt-4 border-t border-gray-50 dark:border-gray-800 text-center">
                                <TextLink href={login()} tabIndex={5} className="text-xs font-black text-[#49af4e] hover:underline">
                                    Volver al inicio de sesión
                                </TextLink>
                            </div>
                        </div>
                    </>
                )}
            </Form>

            {status && <div className="mb-4 text-center text-sm font-medium text-[#49af4e]">{status}</div>}
        </AuthLayout>
    );
}

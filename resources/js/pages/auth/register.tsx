import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

    return (
        <AuthLayout title="Create una Cuenta" description="Ingresa tus datos a continuación para crear su cuenta">
            <Head title="Register" />
            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                    Nombre Completo
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Ingresa tu nombre"
                                    className="h-12 rounded-xl border-gray-200 px-4 transition-all focus:ring-4 focus:ring-[#49af4e]/10 focus:border-[#49af4e] dark:bg-gray-800 dark:border-gray-700"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                    Cédula de Identidad
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="Ej. 12345678"
                                    className="h-12 rounded-xl border-gray-200 px-4 transition-all focus:ring-4 focus:ring-[#49af4e]/10 focus:border-[#49af4e] dark:bg-gray-800 dark:border-gray-700"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                    Contraseña
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder="Crea una contraseña"
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

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 ml-1">
                                    Confirma tu contraseña
                                </Label>
                                <div className="relative group">
                                    <Input
                                        id="password_confirmation"
                                        type={showPasswordConfirmation ? "text" : "password"}
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder="Repite tu contraseña"
                                        className="h-12 rounded-xl border-gray-200 px-4 transition-all focus:ring-4 focus:ring-[#49af4e]/10 focus:border-[#49af4e] dark:bg-gray-800 dark:border-gray-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-[#49af4e] transition-colors focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPasswordConfirmation ? (
                                            <Eye size={18} />
                                        ) : (
                                            <EyeClosed size={18} />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 h-12 w-full rounded-xl bg-[#49af4e] font-black text-white shadow-lg shadow-[#49af4e]/20 transition-all hover:bg-[#3d9641] active:scale-[0.98]"
                                tabIndex={5}
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Crear nueva cuenta"
                                )}
                            </Button>
                        </div>

                        <div className="pt-4 border-t border-gray-50 dark:border-gray-800 text-center">
                            <p className="text-xs font-medium text-muted-foreground">
                                ¿Ya tienes una cuenta?{' '}
                                <TextLink href={login()} tabIndex={6} className="font-black text-[#49af4e] hover:underline">
                                    Inicia sesión aquí
                                </TextLink>
                            </p>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

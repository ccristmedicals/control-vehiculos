import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';
import { useState } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <AuthLayout title="Accede a tu cuenta" description="Ingresa tus datos para continuar">
            <Head title="Acceder" />

            <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-semibold text-gray-700 dark:text-gray-300">
                                    Cedula de Identidad
                                </Label>
                                <Input
                                    id="email"
                                    type="text"
                                    name="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    placeholder="12345678"
                                    className="rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-[#49af4e] focus:ring-2 focus:ring-[#49af4e]"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300">
                                        Contraseña
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Contraseña"
                                        className="rounded-lg border border-gray-300 px-4 py-2 transition-all focus:border-[#49af4e] focus:ring-2 focus:ring-[#49af4e]"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 cursor-pointer focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <Eye size={16} color='#49af4e' />
                                        ) : (
                                            <EyeClosed size={16} color='#49af4e' />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" tabIndex={3} />
                                <Label htmlFor="remember" className="text-gray-600 dark:text-gray-400">
                                    Recuérdame
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full rounded-lg bg-[#49af4e] py-3 font-semibold text-white shadow-md transition-colors hover:bg-[#3d9641]"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                Acceder
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            ¿Aún no tienes una cuenta?{' '}
                            <TextLink href={register()} tabIndex={5} className="text-blue-600 hover:underline">
                                Regístrate
                            </TextLink>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Olvidaste tu contraseña?{' '}
                            <TextLink href={'reset-password'} tabIndex={5} className="text-blue-600 hover:underline">
                                Cambiar contraseña
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>

            {status && <div className="mb-4 text-center text-sm font-medium text-[#49af4e]">{status}</div>}
        </AuthLayout>
    );
}

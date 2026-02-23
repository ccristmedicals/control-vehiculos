import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UsuarioBasico } from '@/types';
import { router } from '@inertiajs/react';
import { ChevronRight, Fingerprint, Mail, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function UserCard({ usuario }: { usuario: UsuarioBasico & { documentos_completos?: boolean } }) {
    const documentosIncompletos = usuario.documentos_completos === false;

    return (
        <Card
            className="group relative flex h-full cursor-pointer flex-col overflow-hidden border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:ring-2 hover:ring-blue-500/50 dark:border-gray-700 dark:bg-gray-800"
            onClick={() => router.get(`/perfil/${usuario.id}`)}
        >
            <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-800">
                    <User className="h-7 w-7" />
                </div>
                <div className="flex-1 overflow-hidden">
                    <CardTitle className="truncate text-xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-white transition-colors">
                        {usuario.name}
                    </CardTitle>
                    <div className="mt-1 flex flex-wrap gap-2">
                        {documentosIncompletos ? (
                            <Badge variant="destructive" className="h-5 gap-1 px-1.5 text-[10px] font-bold uppercase tracking-wider">
                                <AlertCircle className="h-3 w-3" />
                                Incompleto
                            </Badge>
                        ) : (
                            <Badge className="h-5 gap-1 px-1.5 bg-green-100 text-green-700 border-green-200 text-[10px] font-bold uppercase tracking-wider dark:bg-green-900/30 dark:text-green-300 dark:border-green-800">
                                <CheckCircle2 className="h-3 w-3" />
                                Al día
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pb-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-sm">
                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="truncate text-gray-600 dark:text-gray-300">{usuario.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                        <Fingerprint className="h-4 w-4 shrink-0 text-gray-400" />
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-tighter">ID:</span>
                            <span className="font-mono text-gray-700 dark:text-gray-200">{usuario.id}</span>
                        </div>
                    </div>
                </div>

                {documentosIncompletos && (
                    <p className="text-[11px] font-medium text-red-500/80 italic">
                        * Requiere actualización de expediente
                    </p>
                )}
            </CardContent>

            <CardFooter className="border-t border-gray-100 bg-gray-50/50 py-3 dark:border-gray-700/50 dark:bg-gray-900/20">
                <div className="flex w-full items-center justify-between text-blue-600 dark:text-blue-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Ver Perfil Detallado</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
            </CardFooter>
        </Card>
    );
}

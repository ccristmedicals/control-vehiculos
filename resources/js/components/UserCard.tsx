import { UsuarioBasico } from '@/types';
import { router } from '@inertiajs/react';

export default function UserCard({ usuario }: { usuario: UsuarioBasico & { documentos_completos?: boolean } }) {
    const documentosIncompletos = usuario.documentos_completos === false;

    return (
        <div
            className="group flex h-[200px] flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-md transition duration-200 hover:shadow-lg hover:ring-2 hover:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
            onClick={() => router.get(`/perfil/${usuario.id}`)}
        >
            <div>
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 dark:text-white">{usuario.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Cédula:</span> {usuario.email}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">ID interno:</span> {usuario.id}
                </p>

                {documentosIncompletos && (
                    <div className="mt-3">
                        <span className="inline-block cursor-pointer rounded-sm bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 hover:underline dark:bg-red-800 dark:text-red-300">
                            Documentos incompletos
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-4 text-right">
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-800 dark:text-blue-300">
                    Ver perfil
                </span>
            </div>
        </div>
    );
}

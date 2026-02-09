interface UploadProgressBarProps {
    percentage: number;
    loaded: number; // in bytes
    total: number; // in bytes
}

export default function UploadProgressBar({ percentage, loaded, total }: UploadProgressBarProps) {
    const formatBytes = (bytes: number, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const loadedStr = formatBytes(loaded);
    const totalStr = formatBytes(total);
    const remaining = total - loaded;
    const remainingStr = formatBytes(remaining > 0 ? remaining : 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Subiendo imágenes</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Por favor, no cierres esta ventana.</p>
                </div>

                <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-200">
                    <span>Progreso</span>
                    <span>{percentage}%</span>
                </div>

                {/* Custom Progress Bar using Tailwind */}
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                        className="h-full bg-blue-600 transition-all duration-300 ease-in-out dark:bg-blue-500"
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                        {loadedStr} / {totalStr}
                    </span>
                    <span>Faltan: {remainingStr}</span>
                </div>
            </div>
        </div>
    );
}

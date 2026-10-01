// URL del microservicio Go de subida de imágenes (Revisión Diaria / Semanal).
//
// Corre en el mismo host que la app, en el puerto 8021 (ver
// C:\xampp\htdocs\simple-uploader — bajo PM2 como `control-vehiculos-uploader`).
// Derivamos el host de `window.location` para no volver a romper cuando cambie
// la IP/hostname del servidor. Se puede forzar con VITE_UPLOADER_URL en .env.
const FALLBACK = 'http://98.94.185.164:8021/upload';

export function uploaderUrl(): string {
    const fromEnv = import.meta.env.VITE_UPLOADER_URL as string | undefined;
    if (fromEnv) return fromEnv;

    if (typeof window !== 'undefined' && window.location?.hostname) {
        return `${window.location.protocol}//${window.location.hostname}:8021/upload`;
    }

    return FALLBACK;
}

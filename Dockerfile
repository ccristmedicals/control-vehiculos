# syntax=docker/dockerfile:1
# 1. Base image: oficiales y mínimas / 2. Pin image version
# Etapa 1: Construcción de dependencias PHP (Composer)
FROM composer:2.7.2 AS composer-build
WORKDIR /app
# 12. COPY over ADD / 11. Explicit COPY
COPY composer.json composer.lock ./
# 10. Combine run commands & Clean cache
RUN composer install --no-dev --no-interaction --no-scripts --prefer-dist --optimize-autoloader --ignore-platform-reqs

# Etapa 2: Construcción de dependencias de Node.js y React (Vite Build)
# 1. Base image mínima y 2. Pin image version
FROM node:22.14.0-alpine AS node-build
# Wayfinder plugin de Vite requiere arrancar la app de Laravel para inyectar configuración
# 5. No sudo & No debugging / 6. Minimal packages / 10. Combine run commands
RUN apk update && apk add --no-cache \
    php \
    php-dom \
    php-fileinfo \
    php-mbstring \
    php-openssl \
    php-pdo \
    php-pdo_mysql \
    php-phar \
    php-session \
    php-tokenizer \
    php-xml \
    php-xmlwriter
# 14. Use WORKDIR
WORKDIR /app
COPY package.json package-lock.json ./
# 10. Combinación y uso eficiente para el entorno de build frontend
RUN npm ci
# Copiamos temporalmente el vendor de composer necesario para `php artisan`
COPY --from=composer-build /app/vendor/ ./vendor/
# 11. Explicit COPY (Copiamos selectivamente lo que artisan y vite necesitan)
COPY artisan composer.json vite.config.ts tsconfig.json .env.example ./
COPY app/ ./app/
COPY bootstrap/ ./bootstrap/
COPY config/ ./config/
COPY database/ ./database/
COPY routes/ ./routes/
COPY storage/ ./storage/
COPY resources/ ./resources/
COPY public/ ./public/
# 10. Combinar comandos. Preparamos el entorno mínimo para que artisan pueda arrancar sin BD (Wayfinder lo necesita)
RUN cp .env.example .env && \
    touch database/database.mysql && \
    php artisan key:generate && \
    npm run build

# Etapa 3: IMAGEN FINAL DE PRODUCCIÓN
# 1. Base image mínima oficial / 2. Pin image version
FROM php:8.3.3-fpm AS production

# 18. Add OCI labels
LABEL org.opencontainers.image.source="https://github.com/organization/rendimiento-ejecutivo" \
      org.opencontainers.image.description="Aplicacion central Rendimiento Ejecutivo (Laravel/React/Inertia)" \
      org.opencontainers.image.vendor="MyCompany"

# 15. Derive the version from your project (opcional, en CI/CD pasamos --build-arg VERSION=...)
ARG VERSION=1.0.0
ENV APP_VERSION=$VERSION

# 14. Use WORKDIR
WORKDIR /var/www

# 6. Minimal packages & Production dependencies only / 10. Combine run commands & Clean cache / 13. Sort arguments
# 5. No sudo & No debugging tools (Sin dev dependencies, solo lo necesario para PHP e interacciones con MSSQL/MySQL y Nginx Proxying)
# 5. No sudo & No debugging tools (Sin dev dependencies, solo lo necesario para PHP e interacciones con MSSQL/MySQL y Nginx Proxying)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg2 \
    apt-transport-https \
    libfcgi-bin \
    libicu-dev \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    unixodbc-dev \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc -o /etc/apt/keyrings/microsoft.asc \
    && echo "deb [arch=amd64,armhf,arm64 signed-by=/etc/apt/keyrings/microsoft.asc] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && docker-php-ext-install \
    bcmath \
    gd \
    intl \
    opcache \
    pdo_mysql \
    zip \
    # Compilación manual para pdo_sqlsrv usando pecl
    && pecl install pdo_sqlsrv-5.12.0 sqlsrv-5.12.0 \
    && docker-php-ext-enable pdo_sqlsrv sqlsrv \
    # Eliminamos los headers de compilación (-dev) que ya no se necesitan en runtime.
    # Las librerías runtime (libicu72, libpng16, libxml2, libzip4) se mantienen automáticamente.
    && apt-get purge -y --auto-remove \
    libicu-dev \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    unixodbc-dev \
    # Limpieza de caché (apt-get clean para reducir tamaño)
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* \
    printf 'upload_max_filesize = 32M\npost_max_size = 512M\nmemory_limit = 1024M\nmax_execution_time = 300\n' > /usr/local/etc/php/conf.d/uploads-limits.ini


# 9. Dockerfile layer caching (Base -> Deps -> Config -> Source code)
# Copiar configuración custom PHP si hubiere se pondría aquí.
# COPY ./docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Copiar el código base (propiedad de root como dictan 8. Permissions)
COPY --chown=root:root . /var/www

# Copiar dependencias de Composer desde la etapa 1
# 3. Multi-stage builds: Solo traemos los binarios/artefactos crudos
COPY --chown=root:root --from=composer-build /app/vendor /var/www/vendor

# Copiar los archivos compilados de React/Vite desde la etapa 2
COPY --chown=root:root --from=node-build /app/public/build /var/www/public/build

# 8. Permissions
# La app general y ejecutables pertenecen a root. El entrypoint.sh corregirá
# los permisos de los volúmenes montados al inicio con el usuario correcto.
# chown -R appuser:appgroup es responsabilidad del entrypoint, no del build.

# Crear el enlace simbólico del storage ANTES de cambiar al usuario sin privilegios
RUN php artisan storage:unlink || true && \
    php artisan storage:link

# 12. COPY entrypoint
COPY --chown=root:root docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# 7. Non-root user: El proceso maestro de PHP-FPM corre como root (diseño oficial),
# sus workers los gestiona como www-data. El entrypoint.sh hace chown a www-data
# sobre storage y bootstrap/cache antes de lanzar php-fpm.
EXPOSE 9000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# -----------------------------------------------------------------------------
# Etapa 4: Servidor Web Nginx (Sirve los estáticos y funciona de proxy a FPM)
# -----------------------------------------------------------------------------
FROM nginx:1.25.4-alpine AS web

# 12. COPY over ADD
COPY nginx-interno.conf /etc/nginx/conf.d/default.conf

# 3. Multi-stage builds: Copiamos unicamente la carpeta public que contiene
# el index.php y los assets ya compilados por Vite en la etapa anterior.
COPY --from=production /var/www/public /var/www/public

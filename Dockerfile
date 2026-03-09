FROM php:8.3-fpm

# 1. Instalar dependencias básicas y herramientas de Linux
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libwebp-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    gnupg2 \
    apt-transport-https

# 2. Añadir las llaves y el repositorio oficial de Microsoft (para Debian 12, base actual de php 8.2)
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list

# 3. Instalar los drivers ODBC de Microsoft (ACCEPT_EULA=Y es obligatorio para automatizarlo)
RUN apt-get update && ACCEPT_EULA=Y apt-get install -y \
    msodbcsql18 \
    unixodbc-dev

# 4. Limpiar caché para que la imagen no pese tanto
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# 5. Instalar extensiones nativas de PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif pcntl bcmath gd zip

# 6. Instalar extensiones PECL de SQL Server
RUN pecl install sqlsrv pdo_sqlsrv \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# 6. Instalar Composer (Copiando el ejecutable oficial)
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 7. Instalar Node.js y NPM (Copiando desde la imagen oficial de Node)
COPY --from=node:20 /usr/local/bin/ /usr/local/bin/
COPY --from=node:20 /usr/local/lib/node_modules/ /usr/local/lib/node_modules/

WORKDIR /var/www
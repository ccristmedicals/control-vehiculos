#!/bin/sh
set -e

# El proceso maestro de PHP-FPM corre como root (diseño oficial).
# Los workers los maneja como www-data (configurado en /usr/local/etc/php-fpm.d/www.conf).
# Solo fijamos la propiedad de los directorios mutables para que www-data pueda escribir.
chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

exec php-fpm

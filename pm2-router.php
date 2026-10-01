<?php

/**
 * Router para el servidor embebido de PHP cuando corre bajo PM2 en Windows.
 *
 * Copia del server.php de Laravel SIN la linea que escribe el log de request a
 * php://stdout. En Windows, cuando stdout es un pipe de PM2, esa escritura falla
 * con "file_put_contents(): Write of N bytes failed with errno=22 Invalid
 * argument" y, con display_errors=On (XAMPP), el Notice se inyecta dentro del
 * cuerpo de la respuesta HTTP/JSON y rompe las paginas.
 *
 * Se referencia desde ecosystem.config.cjs en vez de
 * vendor/laravel/framework/.../resources/server.php para que sobreviva a
 * `composer update`.
 */

$publicPath = getcwd();

$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? ''
);

if ($uri !== '/' && file_exists($publicPath.$uri)) {
    return false;
}

require_once $publicPath.'/index.php';

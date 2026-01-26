@echo off
cd /d "C:\xampp\htdocs\control-vehiculos"
start /B php artisan serve --host=0.0.0.0 --port=8007
exit
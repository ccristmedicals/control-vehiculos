<?php

use App\Http\Controllers\AdminRoleController;
use App\Http\Controllers\AsignacionesController;
use App\Http\Controllers\NotificacionController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Controladores
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FacturasController;
use App\Http\Controllers\FichaTecnica\FichaTecnicaController;
use App\Http\Controllers\FichaTecnica\ExpedienteTecnicoController;
use App\Http\Controllers\FichaTecnica\PermisologiaController;
use App\Http\Controllers\FichaTecnica\AccesoriosController;
use App\Http\Controllers\FichaTecnica\PiezasController;
use App\Http\Controllers\ObservacionesController;
use App\Http\Controllers\PistaController;
use App\Http\Controllers\RevisionDiariaController;
use App\Http\Controllers\RevisionSemanalController;
use App\Http\Controllers\SurtidosController;
use App\Http\Controllers\TipoUsuarioController;
use App\Http\Controllers\UsersController;
use App\Http\Controllers\VehiculoController;
use App\Http\Controllers\EnviosController;

// Ruta raíz: redirige al dashboard si está autenticado
Route::get('/', function () {
    return Auth::check()
        ? redirect()->route('dashboard')
        : Inertia::render('auth/login');
})->name('home');

// Rutas protegidas por autenticación y verificación
Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard principal (muestra las cards de vehículos)
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Rutas perfil
    Route::get('perfil/{user}', [UsersController::class, 'show'])->name('perfil.show');
    Route::patch('perfil/{user}', [UsersController::class, 'update'])->name('perfil.update');

    //Rutas Factura
    Route::get('fichaTecnica/facturas/{factura:fact_num}', [FacturasController::class, 'show'])->name('facturas.show');
    Route::post('fichaTecnica/facturas/{factura:fact_num}/auditoria', [FacturasController::class, 'storeAuditoria'])->name('facturas.auditoria.store')->middleware('audit:Audito factura, Factura');
});


// Route::get('gasolina', [SurtidosController::class, 'test']);

Route::middleware(['auth'])->group(function () {
    //Rutas Factura
    Route::get('fichaTecnica/{vehiculo:placa}/facturas', [FacturasController::class, 'index'])->name('facturas.index');

    // Ficha Técnica
    Route::get('fichaTecnica/{vehiculo:placa}', [FichaTecnicaController::class, 'show'])->name('fichaTecnica.show');

    // Formularios asociados a ficha técnica
    Route::post('fichaTecnica/{vehiculo:placa}/expedientes', [ExpedienteTecnicoController::class, 'store'])->name('expedientes.store')->middleware('audit:Actualizo el expediente del vehiculo, Expediente');
    Route::post('fichaTecnica/{vehiculo:placa}/permisologia', [PermisologiaController::class, 'store'])->name('permisos.store')->middleware('audit:Actualizo la permisologia del vehiculo, Permiso');
    Route::post('fichaTecnica/{vehiculo:placa}/accesorios', [AccesoriosController::class, 'store'])->name('accesorios.store')->middleware('audit:Actualizo los accesorios del vehiculo, Accesorio');
    Route::post('fichaTecnica/{vehiculo:placa}/piezas', [PiezasController::class, 'store'])->name('piezas.store')->middleware('audit:Actualizo las piezas del vehiculo, Pieza');

    // Revisión de Fluidos
    Route::get('fichaTecnica/{vehiculo:placa}/revisionFluidos', [RevisionDiariaController::class, 'index'])->name('revisionFluidos');
    Route::post('fichaTecnica/{vehiculo:placa}/revisionFluidos', [RevisionDiariaController::class, 'store'])->name('revisionFluidos.store')->middleware('audit:Realizo la revision diaria, Revision diaria');

    // Revisión Semanal
    Route::get('fichaTecnica/{vehiculo:placa}/revisionSemanal', [RevisionSemanalController::class, 'index'])->name('revisionSemanal');
    Route::post('fichaTecnica/{vehiculo:placa}/revisionSemanal', [RevisionSemanalController::class, 'store'])->name('revisionSemanal.store')->middleware('audit:Realizo la revision semanal, Revision semanal');
    //Route::patch('fichaTecnica/{vehiculo:placa}/revisionSemanal/{revision}', [RevisionSemanalController::class, 'update'])->name('revisionSemanal.update');

    // Observaciones
    Route::get('fichaTecnica/{vehiculo:placa}/observaciones', [ObservacionesController::class, 'show'])->name('observaciones.show');
    Route::post('observaciones/{vehiculo:placa}/save', [ObservacionesController::class, 'store'])->name('observaciones.store')->middleware('audit:Realizo una observacion, Observacion');
    ;

    // Rutas para asignaciones
    Route::get('fichaTecnica/{vehiculo:placa}/asignaciones', [AsignacionesController::class, 'index'])->name('asignaciones');

    // Exportar gasolina
    Route::post('gasolina/exportar-seleccion', [SurtidosController::class, 'exportSelected'])->name('gasolina.exportSelected');

    // Envios
    Route::get('fichaTecnica/{vehiculo:placa}/envios', [EnviosController::class, 'index'])->name('envios.index');
    Route::post('fichaTecnica/{vehiculo:placa}/envios', [EnviosController::class, 'store'])->name('envios.store');
    Route::post('fichaTecnica/{vehiculo:placa}/envios/{envio}', [EnviosController::class, 'update'])->name('envios.update');
});


Route::middleware(['auth', 'admin'])->group(function () {
    // Pistas
    Route::get('supervision', [PistaController::class, 'index'])->name('supervision');

    // Asignar rol
    Route::get('asignar-rol', [AdminRoleController::class, 'index'])->name('asignar')->middleware('role');
    Route::post('asignar-rol', [AdminRoleController::class, 'assign'])->name('asignar.assign')->middleware('role');

    // Asignar tipo a usuario
    Route::get('asignar-tipo', [TipoUsuarioController::class, 'index'])->name('asignar-tipo')->middleware('role');
    Route::post('asignar-tipo', [TipoUsuarioController::class, 'assign'])->name('asignar-tipo.assign')->middleware('role');

    // Rutas facturas
    Route::patch('fichaTecnica/facturas/{factura:fact_num}/auditoria', [FacturasController::class, 'updateAuditoria'])->name('facturas.auditoria.update')->middleware('audit:Aprobo una factura, Aprobo Factura');
    ;

    // Observaciones globales
    Route::get('observaciones', [ObservacionesController::class, 'index'])->name('observaciones.index');

    // Rutas gasolina
    Route::get('fichaTecnica/{vehiculo:placa}/gasolina', [SurtidosController::class, 'index'])->name('gasolina.index');
    Route::get('fichaTecnica/{vehiculo:placa}/gasolina/info', [SurtidosController::class, 'info']);
    Route::post('fichaTecnica/{vehiculo:placa}/gasolina', [SurtidosController::class, 'store'])->name('surtidos.store')->middleware('audit:Realizo surtido de gasolina, Permisos');
    ;

    // Visualizar perfil
    Route::get('perfiles', [UsersController::class, 'index'])->name('perfil.index');

    // Asignar usuario
    Route::post('fichaTecnica/{vehiculo:placa}/assign-user', [AsignacionesController::class, 'store'])->name('asignaciones.store')->middleware('audit:Realizo una asignacion, Asignaciones');
    // Unassing usuario
    Route::post('fichaTecnica/{vehiculo:placa}/unassign-user', [AsignacionesController::class, 'unassign'])->name('asignaciones.unassign')->middleware('audit:Elimino los conductores de un vehiculo, Asignaciones');

    // Rutas para modificar vehiculos (necesario proximamente)
    Route::get('vehiculo/{vehiculo:placa}/edit', [VehiculoController::class, 'edit'])->name('vehiculo.edit');
    Route::patch('vehiculo/{vehiculo:placa}', [VehiculoController::class, 'update'])->name('vehiculo.update');

    // Rutas para notificaciones
    // Route::get('notificaciones', [NotificacionController::class, 'index'])->name('notificaciones.index');
    // Route::put('notificaciones/{notificacion}/marcar-leida', [NotificacionController::class, 'marcarComoLeida'])->name('notificaciones.marcarLeida');
    // Route::put('/notificaciones/marcar-todas', [NotificacionController::class, 'marcarTodasComoLeidas']);
    // Route::delete('notificaciones/{notificacion}', [NotificacionController::class, 'destroy'])->name('notificaciones.destroy');

    // Editar Observacion
    Route::patch('observaciones/{vehiculo:placa}/{observacion}/edit', [ObservacionesController::class, 'update'])->name('observaciones.update')->middleware('audit:Resolvio una observacion, Observacion');
    ;
});

// Configuración y autenticación
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

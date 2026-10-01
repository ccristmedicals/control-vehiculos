<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'employee_id',
        'zona',
        'foto_cedula',
        'vencimiento_cedula',
        'foto_licencia',
        'vencimiento_licencia',
        'foto_certificado_medico',
        'vencimiento_certificado_medico',
    ];


    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Vehículos registrados por el usuario.
     */
    public function vehiculos(): HasMany
    {
        return $this->hasMany(Vehiculo::class, 'user_id');
    }

    /**
     * Permisos registrados por el usuario.
     */
    public function permisos(): HasMany
    {
        return $this->hasMany(VehiculoPermisos::class, 'user_id');
    }

    /**
     * Especificaciones técnicas registradas por el usuario.
     */
    public function especificaciones(): HasMany
    {
        return $this->hasMany(VehiculoEspecificaciones::class, 'user_id');
    }

    /**
     * Accesorios registrados por el usuario.
     */
    public function accesorios(): HasMany
    {
        return $this->hasMany(VehiculoAccesorios::class, 'user_id');
    }

    public function notificaciones()
    {
        return $this->hasMany(Notificacion::class);
    }

    /**
     * Historial donde el usuario fue asignado a un vehículo.
     */
    public function asignacionesRecibidas(): HasMany
    {
        return $this->hasMany(HistorialAsignaciones::class, 'user_id');
    }

    /**
     * Historial donde el usuario hizo la asignación (como admin).
     */
    public function asignacionesRealizadas(): HasMany
    {
        return $this->hasMany(HistorialAsignaciones::class, 'admin_id');
    }
    /**
     * Observaciones registradas por el usuario.
     */
    public function observaciones(): HasMany
    {
        return $this->hasMany(\App\Models\Observacion::class, 'user_id');
    }
}

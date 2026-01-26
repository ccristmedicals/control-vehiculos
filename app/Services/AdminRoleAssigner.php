<?php

namespace App\Services;

use App\Models\User;
use Spatie\Permission\Models\Role;

class AdminRoleAssigner
{
    public static function assignToUser(string $email): bool
    {
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $user = User::where('email', $email)->first();

        if (! $user) {
            return false;
        }

        $user->assignRole($adminRole);
        return true;
    }
}

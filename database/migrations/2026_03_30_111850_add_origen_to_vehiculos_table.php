<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $tables = ['vendedor', 'tipo_cli', 'zona', 'segmento', 'cta_ingr', 'clientes', 'vehiculos'];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->string('origen')->nullable();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['vendedor', 'tipo_cli', 'zona', 'segmento', 'cta_ingr', 'clientes', 'vehiculos'];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropColumn('origen');
            });
        }
    }
};

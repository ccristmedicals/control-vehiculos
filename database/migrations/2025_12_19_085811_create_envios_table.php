<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('envios', function (Blueprint $table) {
            $table->id();
            $table->string('vehiculo_id');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('admin_id')->nullable()->constrained('users');
            $table->text('descripcion');
            $table->string('estado')->default('pendiente');
            $table->string('foto_envio')->nullable();
            $table->string('foto_recibo')->nullable();
            $table->timestamps();

            // Foreign key to vehiculos assuming 'placa' is string primary key
            $table->foreign('vehiculo_id')->references('placa')->on('vehiculos')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('envios');
    }
};

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
        Schema::table('surtidos', function (Blueprint $table) {
            $table->dropUnique('surtidos_fact_num_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('surtidos', function (Blueprint $table) {
            $table->unique('fact_num');
        });
    }
};

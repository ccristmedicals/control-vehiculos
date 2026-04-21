<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Drop FK from auditoria_renglones — references auditoria_facturas.fact_num
        //    which will no longer be a standalone unique key after this migration.
        Schema::table('auditoria_renglones', function (Blueprint $table) {
            $table->dropForeign(['fact_num']);
            $table->string('db_origen')->nullable()->after('fact_num');
        });

        // 2. Add db_origen to auditoria_facturas (nullable first, backfill, then NOT NULL)
        Schema::table('auditoria_facturas', function (Blueprint $table) {
            $table->string('db_origen')->nullable()->after('fact_num');
        });

        // 3. Backfill db_origen from vehiculos.origen where available
        DB::statement("
            UPDATE auditoria_facturas af
            JOIN vehiculos v ON af.vehiculo_id = v.placa
            SET af.db_origen = v.origen
            WHERE af.db_origen IS NULL AND v.origen IS NOT NULL
        ");

        // 4. Default any remaining NULLs to sqlsrv_carros (prior fallback behaviour)
        DB::table('auditoria_facturas')
            ->whereNull('db_origen')
            ->update(['db_origen' => 'sqlsrv_carros']);

        // 5. Make NOT NULL
        Schema::table('auditoria_facturas', function (Blueprint $table) {
            $table->string('db_origen')->nullable(false)->change();
        });

        // 6. Drop old unique on fact_num alone; add composite unique (fact_num, db_origen)
        Schema::table('auditoria_facturas', function (Blueprint $table) {
            $table->dropUnique(['fact_num']);
            $table->unique(['fact_num', 'db_origen'], 'auditoria_facturas_fact_num_db_origen_unique');
        });

        // 7. Backfill db_origen in auditoria_renglones from auditoria_facturas
        DB::statement("
            UPDATE auditoria_renglones ar
            JOIN auditoria_facturas af ON ar.fact_num = af.fact_num
            SET ar.db_origen = af.db_origen
            WHERE ar.db_origen IS NULL
        ");

        DB::table('auditoria_renglones')
            ->whereNull('db_origen')
            ->update(['db_origen' => 'sqlsrv_carros']);

        // 8. Make NOT NULL
        Schema::table('auditoria_renglones', function (Blueprint $table) {
            $table->string('db_origen')->nullable(false)->change();
        });
    }

    public function down(): void
    {
        Schema::table('auditoria_renglones', function (Blueprint $table) {
            $table->dropColumn('db_origen');
            $table->foreign('fact_num')->references('fact_num')->on('auditoria_facturas');
        });

        Schema::table('auditoria_facturas', function (Blueprint $table) {
            $table->dropUnique('auditoria_facturas_fact_num_db_origen_unique');
            $table->dropColumn('db_origen');
            $table->unique('fact_num');
        });
    }
};

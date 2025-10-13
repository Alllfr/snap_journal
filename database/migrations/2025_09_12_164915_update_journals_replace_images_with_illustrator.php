<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            if (Schema::hasColumn('journals', 'images')) {
                $table->dropColumn('images');
            }
            $table->json('illustrator')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('journals', function (Blueprint $table) {
            if (Schema::hasColumn('journals', 'illustrator')) {
                $table->dropColumn('illustrator');
            }
            $table->json('images')->nullable()->after('note');
        });
    }
};

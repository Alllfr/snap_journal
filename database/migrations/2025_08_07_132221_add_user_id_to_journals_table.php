<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
{
    Schema::table('journals', function (Blueprint $table) {
        if (!Schema::hasColumn('journals', 'user_id')) {
            $table->uuid('user_id')->after('id');
        }

        $table->foreign('user_id')
              ->references('id')
              ->on('users')
              ->onDelete('cascade');
    });
    }
};

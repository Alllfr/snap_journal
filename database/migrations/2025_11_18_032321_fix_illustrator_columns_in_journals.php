<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up()
{
    Schema::table('journals', function (Blueprint $table) {
        $table->json('illustrator')->nullable()->change();
        $table->json('illustrator_urls')->nullable()->change();
    });
}

public function down()
{
    Schema::table('journals', function (Blueprint $table) {
        $table->text('illustrator')->nullable()->change();
        $table->text('illustrator_urls')->nullable()->change();
    });
}
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('learning_materials', function (Blueprint $table) {
            $table->string('link');
        });
    }

    public function down()
    {
        Schema::table('learning_materials', function (Blueprint $table) {
            $table->dropColumn('link');
        });
    }
};

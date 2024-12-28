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
        Schema::table('job_opportunities', function (Blueprint $table) {
            $table->string('link', 2058);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('job_opportunities', function (Blueprint $table) {
            //
        });
    }
};

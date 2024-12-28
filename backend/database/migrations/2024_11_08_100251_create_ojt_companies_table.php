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
        Schema::create('ojt_companies', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('company_president');
            $table->string('address');
            $table->string('slots_available');
            $table->string('email');
            $table->string('phone');
            $table->string('deployment_location');
            $table->string('logo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ojt_companies');
    }
};

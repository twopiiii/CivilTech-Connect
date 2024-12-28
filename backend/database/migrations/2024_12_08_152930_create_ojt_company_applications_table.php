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
        Schema::create('ojt_company_applications', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('company_president');
            $table->string('company_address');
            $table->string('company_email')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('deployment_location');
            $table->string('student_name');
            $table->string('student_number');
            $table->string('student_email');
            $table->string('course');
            $table->string('year_level');
            $table->string('cover_letter')->nullable();
            $table->string('cv')->nullable();
            $table->string('status');
            $table->date('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ojt_company_applications');
    }
};

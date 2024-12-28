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
        Schema::create('tesda_training_centers', function (Blueprint $table) {
            $table->id();
            $table->string("training_center");
            $table->string("center_id");
            $table->string("address");
            $table->string("email")->nullable();
            $table->string("phone")->nullable();


            // $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tesda_training_centers');
    }
};

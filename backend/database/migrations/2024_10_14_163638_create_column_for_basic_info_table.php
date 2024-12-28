<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('basic_info', function (Blueprint $table) {
            // Add the new column
            $table->string('title')->after('id'); // Adjust the column position if needed
        });

        // Insert predefined values
        DB::table('basic_info')->insert([
            ['title' => 'What is CivilTech Connect?', 'description' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'],
            ['title' => 'Learning Resources', 'description' => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.']
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('basic_info', function (Blueprint $table) {
            //
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practice_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('error_category_id')->constrained();
            $table->string('difficulty');
            $table->unsignedInteger('total_exercises');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practice_sessions');
    }
};

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
        Schema::create('errors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('text_submission_id')->constrained()->cascadeOnDelete();
            $table->foreignId('error_category_id')->constrained()->cascadeOnDelete();
            $table->text('message');
            $table->text('context')->nullable();
            $table->unsignedInteger('offset')->default(0);
            $table->unsignedInteger('length')->default(0);
            $table->json('replacement_suggestions')->nullable();
            $table->string('rule_id')->nullable();
            $table->text('rule_description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('errors');
    }
};

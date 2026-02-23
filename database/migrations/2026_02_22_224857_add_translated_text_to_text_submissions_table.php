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
        Schema::table('text_submissions', function (Blueprint $table) {
            $table->text('translated_text')->nullable()->after('original_text');
        });
    }

    public function down(): void
    {
        Schema::table('text_submissions', function (Blueprint $table) {
            $table->dropColumn('translated_text');
        });
    }
};

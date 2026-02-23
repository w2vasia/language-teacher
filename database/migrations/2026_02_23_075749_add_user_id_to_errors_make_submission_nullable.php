<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('errors', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->cascadeOnDelete();
        });

        DB::statement('UPDATE errors SET user_id = (SELECT user_id FROM text_submissions WHERE text_submissions.id = errors.text_submission_id)');

        Schema::table('errors', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();
            $table->foreignId('text_submission_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('errors', function (Blueprint $table) {
            $table->foreignId('text_submission_id')->nullable(false)->change();
            $table->dropConstrainedForeignId('user_id');
        });
    }
};

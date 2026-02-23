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
            $table->foreignId('practice_session_id')->nullable()->after('text_submission_id')->constrained()->cascadeOnDelete();
        });

        // Backfill: create a practice session for each existing orphan error
        $orphans = DB::table('errors')
            ->whereNull('text_submission_id')
            ->orderBy('created_at')
            ->get();

        foreach ($orphans as $error) {
            $sessionId = DB::table('practice_sessions')->insertGetId([
                'user_id' => $error->user_id,
                'error_category_id' => $error->error_category_id,
                'difficulty' => 'intermediate',
                'total_exercises' => 1,
                'created_at' => $error->created_at,
                'updated_at' => $error->updated_at,
            ]);

            DB::table('errors')
                ->where('id', $error->id)
                ->update(['practice_session_id' => $sessionId]);
        }
    }

    public function down(): void
    {
        Schema::table('errors', function (Blueprint $table) {
            $table->dropConstrainedForeignId('practice_session_id');
        });
    }
};

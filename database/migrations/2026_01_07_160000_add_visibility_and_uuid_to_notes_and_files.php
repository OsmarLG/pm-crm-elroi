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
        Schema::table('notes', function (Blueprint $table) {
            $table->string('visibility')->default('private')->after('content'); // private, public
            $table->uuid('uuid')->nullable()->unique()->after('id');
        });

        Schema::table('files', function (Blueprint $table) {
            $table->string('visibility')->default('private')->after('size');
            $table->uuid('uuid')->nullable()->unique()->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notes', function (Blueprint $table) {
            $table->dropColumn(['visibility', 'uuid']);
        });

        Schema::table('files', function (Blueprint $table) {
            $table->dropColumn(['visibility', 'uuid']);
        });
    }
};

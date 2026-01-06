<?php

use App\Http\Controllers\Admin\RolesController;
use App\Http\Controllers\Admin\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->name('admin.')->group(function () {

    /**
     * USERS
     * Importante:
     * - /create antes que /{user}
     * - /bulk antes que /{user}
     */
    Route::prefix('users')->name('users.')->group(function () {

        // Pages
        Route::get('/', [UserController::class, 'index'])
            ->middleware('can:users.view')
            ->name('index');

        Route::get('/create', [UserController::class, 'create'])
            ->middleware('can:users.create')
            ->name('create');

        Route::get('/{user}/edit', [UserController::class, 'edit'])
            ->middleware('can:users.update')
            ->name('edit');

        Route::get('/{user}', [UserController::class, 'show'])
            ->middleware('can:users.view')
            ->name('show');

        // Actions
        Route::post('/', [UserController::class, 'store'])
            ->middleware('can:users.create')
            ->name('store');

        Route::delete('/bulk', [UserController::class, 'bulkDestroy'])
            ->middleware('can:users.delete')
            ->name('bulkDestroy');

        Route::put('/{user}', [UserController::class, 'update'])
            ->middleware('can:users.update')
            ->name('update');

        Route::delete('/{user}', [UserController::class, 'destroy'])
            ->middleware('can:users.delete')
            ->name('destroy');
    });

    /**
     * ROLES + PERMISSIONS (mismo controller)
     * Importante:
     * - todo /permissions/... antes que /{role}
     * - /bulk y /list antes que /{role}
     */
    Route::prefix('roles')
        ->middleware('can:roles.manage')
        ->name('roles.')
        ->group(function () {

            // ---------- Permissions (Pages)
            Route::get('/permissions', [RolesController::class, 'permissionsIndex'])->name('permissions.index');
            // Route::get('/permissions/create', [RolesController::class, 'permissionsCreate'])->name('permissions.create');
            // Route::get('/permissions/{permission}/edit', [RolesController::class, 'permissionsEdit'])->name('permissions.edit');
            Route::get('/permissions/{permission}', [RolesController::class, 'permissionsShow'])->name('permissions.show');

            // ---------- Permissions (Actions)
            // Route::post('/permissions', [RolesController::class, 'permissionsStore'])->name('permissions.store');
            // Route::delete('/permissions/bulk', [RolesController::class, 'permissionsBulkDestroy'])->name('permissions.bulkDestroy');
            // Route::put('/permissions/{permission}', [RolesController::class, 'permissionsUpdate'])->name('permissions.update');
            // Route::delete('/permissions/{permission}', [RolesController::class, 'permissionsDestroy'])->name('permissions.destroy');

            // ---------- Permissions list (AJAX)
            Route::get('/permissions/list', [RolesController::class, 'permissionsList'])->name('permissions.list');

            // ---------- Roles (Pages)
            Route::get('/', [RolesController::class, 'index'])->name('index');
            Route::get('/create', [RolesController::class, 'create'])->name('create');
            Route::get('/{role}/edit', [RolesController::class, 'edit'])->name('edit');
            Route::get('/{role}', [RolesController::class, 'show'])->name('show');

            // ---------- Roles (Actions)
            Route::post('/', [RolesController::class, 'store'])->name('store');
            Route::delete('/bulk', [RolesController::class, 'bulkDestroy'])->name('bulkDestroy');
            Route::get('/list', [RolesController::class, 'rolesList'])->name('list');
            Route::put('/{role}', [RolesController::class, 'update'])->name('update');
            Route::delete('/{role}', [RolesController::class, 'destroy'])->name('destroy');
        });
});

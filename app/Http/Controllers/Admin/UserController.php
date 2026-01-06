<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\Users\UserIndexRequest;
use App\Http\Requests\Admin\Users\UserStoreRequest;
use App\Http\Requests\Admin\Users\UserUpdateRequest;
use App\Http\Requests\Admin\Users\UserBulkDeleteRequest;
use App\Http\Resources\Admin\Users\UserResource;
use App\Services\Admin\UserService;
use Inertia\Inertia;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function __construct(protected UserService $userService) {}

    /**
     * Display a listing of the resource.
     */
    public function index(UserIndexRequest $request)
    {
        $filters = $request->validatedFilters();

        $paginator = $this->userService->paginate($filters);

        // Importante: "resource collection" para transformar el data
        // y conservar meta/links del paginator para Inertia.
        $users = UserResource::collection($paginator);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'allUsersCount' => $this->userService->totalCount(),
            'filters' => [
                'search' => $filters['search'],
                'sort'   => $filters['sort'],
                'dir'    => $filters['dir'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/users/create', [
            'roles' => Role::query()->select('id', 'name')->orderBy('name')->get(),
            'permissions' => Permission::query()->select('id', 'name')->orderBy('name')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserStoreRequest $request)
    {
        $user = $this->userService->create($request->validated());

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Usuario creado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return Inertia::render('admin/users/show', [
            'user' => (new UserResource($user))->resolve(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $user->load(['roles', 'permissions']); // direct perms

        return Inertia::render('admin/users/edit', [
            'user' => (new UserResource($user))->resolve(),
            'roles' => Role::query()->select('id', 'name')->orderBy('name')->get(),
            'permissions' => Permission::query()->select('id', 'name')->orderBy('name')->get(),
            'userRoleIds' => $user->roles->pluck('id')->values(),
            'userPermissionIds' => $user->permissions->pluck('id')->values(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UserUpdateRequest $request, User $user)
    {
        $updated = $this->userService->update($user, $request->validated());

        return redirect()
            ->route('admin.users.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */

    public function destroy(User $user)
    {
        $this->userService->delete($user);

        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    public function verify(User $user)
    {
        if ($user->id === 1) {
            abort(403);
        }

        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }

        return back()->with('success', 'Usuario verificado.');
    }

    public function bulkDestroy(UserBulkDeleteRequest $request)
    {
        $count = $this->userService->bulkDelete($request->validated('ids'));

        return back()->with('success', "{$count} usuario(s) eliminado(s) correctamente.");
    }
}

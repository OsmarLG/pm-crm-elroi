<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Roles\BulkDestroyPermissionsRequest;
use App\Http\Requests\Admin\Roles\BulkDestroyRolesRequest;
use App\Http\Requests\Admin\Roles\IndexPermissionsRequest;
use App\Http\Requests\Admin\Roles\IndexRolesRequest;
use App\Http\Requests\Admin\Roles\StorePermissionRequest;
use App\Http\Requests\Admin\Roles\StoreRoleRequest;
use App\Http\Requests\Admin\Roles\UpdatePermissionRequest;
use App\Http\Requests\Admin\Roles\UpdateRoleRequest;
use App\Services\Admin\RolesService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Http\Resources\Admin\Roles\RoleResource;

class RolesController extends Controller
{
    public function __construct(
        private readonly RolesService $service
    ) {}

    // ==========================================================
    // ROLES - PAGES
    // ==========================================================

    public function index(IndexRolesRequest $request): Response
    {
        $filters = $request->validated();
        $paginator = $this->service->rolesPaginate($filters);

        $roles = RoleResource::collection($paginator);

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
            'allRolesCount' => $this->service->rolesTotalCount($filters['guard_name'] ?? null),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'sort' => $filters['sort'] ?? 'id',
                'dir' => $filters['dir'] ?? 'desc',
                'per_page' => (int)($filters['per_page'] ?? 10),
                'guard_name' => $filters['guard_name'] ?? null,
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $guard = $request->query('guard_name');

        return Inertia::render('admin/roles/create', [
            'permissions' => $this->service->permissionsList($guard),
            'guard_name' => $guard,
        ]);
    }

    public function show(Role $role): Response
    {
        $role->load(['permissions:id,name,guard_name']);

        return Inertia::render('admin/roles/show', [
            'role' => $role,
        ]);
    }

    public function edit(Request $request, Role $role): Response
    {
        $role->load(['permissions:id,name,guard_name']);
        $guard = $request->query('guard_name') ?? $role->guard_name;

        return Inertia::render('admin/roles/edit', [
            'role' => $role,
            'permissions' => $this->service->permissionsList($guard),
            'guard_name' => $guard,
        ]);
    }

    // ==========================================================
    // ROLES - ACTIONS
    // ==========================================================

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $this->service->createRole($request->validated());

        return redirect()
            ->to('/admin/roles')
            ->with('success', 'Role created successfully.');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $this->service->updateRole($role, $request->validated());

        return redirect()
            ->to("/admin/roles/{$role->id}/edit")
            ->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        $this->service->deleteRole($role);

        return redirect()
            ->to('/admin/roles')
            ->with('success', 'Role deleted successfully.');
    }

    public function bulkDestroy(BulkDestroyRolesRequest $request): RedirectResponse
    {
        $this->service->bulkDeleteRoles($request->validated('ids'));

        return redirect()
            ->to('/admin/roles')
            ->with('success', 'Roles deleted successfully.');
    }

    // ==========================================================
    // PERMISSIONS - PAGES
    // ==========================================================

    public function permissionsIndex(IndexPermissionsRequest $request): Response
    {
        $filters = $request->validated();

        return Inertia::render('admin/permissions/index', [
            'permissions' => $this->service->permissionsPaginate($filters),
            'allPermissionsCount' => $this->service->permissionsTotalCount($filters['guard_name'] ?? null),
            'filters' => [
                'search' => $filters['search'] ?? '',
                'sort' => $filters['sort'] ?? 'id',
                'dir' => $filters['dir'] ?? 'desc',
                'per_page' => (int)($filters['per_page'] ?? 10),
                'guard_name' => $filters['guard_name'] ?? null,
            ],
        ]);
    }

    public function permissionsCreate(Request $request): Response
    {
        $guard = $request->query('guard_name');

        return Inertia::render('admin/permissions/create', [
            'roles' => $this->service->rolesList($guard),
            'guard_name' => $guard,
        ]);
    }

    public function permissionsShow(Permission $permission): Response
    {
        $permission->load(['roles:id,name,guard_name']);

        return Inertia::render('admin/permissions/show', [
            'permission' => $permission,
        ]);
    }

    public function permissionsEdit(Request $request, Permission $permission): Response
    {
        $permission->load(['roles:id,name,guard_name']);
        $guard = $request->query('guard_name') ?? $permission->guard_name;

        return Inertia::render('admin/permissions/edit', [
            'permission' => $permission,
            'roles' => $this->service->rolesList($guard),
            'guard_name' => $guard,
        ]);
    }

    // ==========================================================
    // PERMISSIONS - ACTIONS
    // ==========================================================

    public function permissionsStore(StorePermissionRequest $request): RedirectResponse
    {
        $this->service->createPermission($request->validated());

        return redirect()
            ->to('/admin/roles/permissions')
            ->with('success', 'Permission created successfully.');
    }

    public function permissionsUpdate(UpdatePermissionRequest $request, Permission $permission): RedirectResponse
    {
        $this->service->updatePermission($permission, $request->validated());

        return redirect()
            ->to("/admin/roles/permissions/{$permission->id}/edit")
            ->with('success', 'Permission updated successfully.');
    }

    public function permissionsDestroy(Permission $permission): RedirectResponse
    {
        $this->service->deletePermission($permission);

        return redirect()
            ->to('/admin/roles/permissions')
            ->with('success', 'Permission deleted successfully.');
    }

    public function permissionsBulkDestroy(BulkDestroyPermissionsRequest $request): RedirectResponse
    {
        $this->service->bulkDeletePermissions($request->validated('ids'));

        return redirect()
            ->to('/admin/roles/permissions')
            ->with('success', 'Permissions deleted successfully.');
    }

    // ==========================================================
    // LISTS (AJAX)
    // ==========================================================

    public function rolesList(Request $request)
    {
        $guard = $request->query('guard_name');

        return response()->json([
            'status' => 'ok',
            'data' => $this->service->rolesList($guard),
        ]);
    }

    public function permissionsList(Request $request)
    {
        $guard = $request->query('guard_name');

        return response()->json([
            'status' => 'ok',
            'data' => $this->service->permissionsList($guard),
        ]);
    }
}

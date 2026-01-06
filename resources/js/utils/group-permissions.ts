export type Permission = { id: number; name: string }

type Grouped = {
  key: string
  title: string
  items: Permission[]
}

/**
 * Agrupa permisos por prefijo antes del primer punto:
 * users.view -> group "users"
 * folders_files.manage -> group "folders_files"
 * Si no trae punto, cae en "other"
 */
export function groupPermissions(permissions: Permission[]): Grouped[] {
  const map = new Map<string, Permission[]>()

  for (const p of permissions) {
    const raw = String(p.name ?? "")
    const key = raw.includes(".") ? raw.split(".")[0] : "other"
    map.set(key, [...(map.get(key) ?? []), p])
  }

  // Ordenar items dentro de cada grupo
  const groups: Grouped[] = Array.from(map.entries()).map(([key, items]) => ({
    key,
    title: humanizePermissionGroup(key),
    items: items.sort((a, b) => a.name.localeCompare(b.name)),
  }))

  // Ordenar grupos por título, pero "other" al final
  groups.sort((a, b) => {
    if (a.key === "other") return 1
    if (b.key === "other") return -1
    return a.title.localeCompare(b.title)
  })

  return groups
}

function humanizePermissionGroup(key: string) {
  // Puedes tunear aquí los nombres visibles
  const dict: Record<string, string> = {
    users: "Usuarios",
    roles: "Roles",
    permissions: "Permisos",
    notes: "Notas",
    folders: "Folders",
    files: "Files",
    folders_files: "Folders / Files",
    other: "Otros",
  }

  if (dict[key]) return dict[key]

  // fallback: folders_files -> "Folders Files"
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

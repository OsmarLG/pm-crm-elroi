import type { NavItem } from "@/types"

export function filterNavItems(items: NavItem[], permissions: string[]): NavItem[] {
  const hasAny = (need?: string | string[]) => {
    if (!need) return true
    const arr = Array.isArray(need) ? need : [need]
    // si quieres AND en vez de OR, cambia some -> every
    return arr.some((p) => permissions.includes(p))
  }

  const walk = (list: NavItem[]): NavItem[] => {
    return list
      .map((item) => {
        const children = item.children ? walk(item.children) : undefined
        const allowed = hasAny(item.can)

        // Si el item no está permitido, pero tiene hijos permitidos, lo mantenemos como "group"
        if (!allowed && (!children || children.length === 0)) return null

        return {
          ...item,
          children: children && children.length ? children : undefined,
        } as NavItem
      })
      .filter(Boolean) as NavItem[]
  }

  return walk(items)
}

"use client"

import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar"
import type { NavItem } from "@/types"
import { NavTree } from "@/components/nav-tree"

export function NavMain({ items = [] }: { items: NavItem[] }) {
  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <NavTree items={items} />
    </SidebarGroup>
  )
}

"use client"

import * as React from "react"
import { Link, usePage } from "@inertiajs/react"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { resolveUrl } from "@/lib/utils"
import type { NavItem } from "@/types"

function normalizeHref(href: any): string {
  // resolveUrl ya maneja string normalmente; esto es por si Ziggy mete objetos
  return resolveUrl(href as any)
}

function itemHasChildren(item: NavItem) {
  return !!(item.children && item.children.length > 0)
}

function isActiveUrl(currentUrl: string, href?: any) {
  if (!href) return false
  const url = normalizeHref(href)
  return currentUrl === url || currentUrl.startsWith(url)
}

function hasActiveDescendant(currentUrl: string, item: NavItem): boolean {
  if (isActiveUrl(currentUrl, item.href)) return true
  if (!item.children?.length) return false
  return item.children.some((c) => hasActiveDescendant(currentUrl, c))
}

type NavTreeProps = {
  items: NavItem[]
  level?: number
  // Para top-level: usa SidebarMenu
  // Para nested: usa SidebarMenuSub
  variant?: "root" | "sub"
}

export function NavTree({ items, level = 0, variant = "root" }: NavTreeProps) {
  const page = usePage()
  const currentUrl = page.url
  const { state } = useSidebar() // "expanded" | "collapsed"

  const Menu = variant === "root" ? SidebarMenu : SidebarMenuSub

  return (
    <Menu>
      {items.map((item) => {
        const activeSelf = isActiveUrl(currentUrl, item.href)
        const activeTree = hasActiveDescendant(currentUrl, item)
        const hasChildren = itemHasChildren(item)

        // ✅ LINK (no children)
        if (!hasChildren) {
          if (variant === "root") {
            return (
              <SidebarMenuItem key={`${level}-${item.title}`}>
                <SidebarMenuButton
                  asChild
                  isActive={activeSelf}
                  tooltip={{ children: item.title }}
                >
                  <Link href={item.href!} prefetch className="flex items-center w-full">
                    {item.icon && <item.icon />}
                    <span className="truncate">{item.title}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-5 justify-center">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          }

          // sub
          return (
            <SidebarMenuSubItem key={`${level}-${item.title}`}>
              <SidebarMenuSubButton asChild isActive={activeSelf}>
                <Link href={item.href!} prefetch className="flex items-center w-full">
                  {item.icon && <item.icon />}
                  <span className="truncate">{item.title}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-5 justify-center">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          )
        }

        // ✅ GROUP (has children)
        // Si tiene href, al hacer click en el label navega. Y el chevron abre.
        // En colapsado, abrimos con dropdown.
        const groupKey = `${level}-${item.title}`

        if (state === "collapsed") {
          // 🟦 Collapsed: dropdown para mostrar subitems
          // Si tiene href, el primer item del dropdown puede ser "Go to {title}"
          return (
            <SidebarMenuItem key={groupKey}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip={{ children: item.title }}
                    isActive={activeTree}
                  // en collapsed no hay espacio para chevron; el click abre dropdown
                  >
                    {item.icon && <item.icon />}
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="right" align="start" className="min-w-56">
                  {item.href && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href={item.href} prefetch className="w-full flex items-center justify-between">
                          <span className={activeSelf ? "font-semibold" : ""}>{item.title}</span>
                          {item.badge !== undefined && item.badge > 0 && (
                            <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  {/* Render recursivo en dropdown */}
                  <DropdownNavItems items={item.children!} currentUrl={currentUrl} />
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        }

        // 🟩 Expanded: collapsible inline
        return (
          <Collapsible key={groupKey} defaultOpen={activeTree}>
            <SidebarMenuItem>
              <div className="flex items-center">
                {/* Si tiene href, el texto navega */}
                {item.href ? (
                  <SidebarMenuButton
                    asChild
                    isActive={activeSelf}
                    tooltip={{ children: item.title }}
                    className="flex-1"
                  >
                    <Link href={item.href} prefetch className="flex items-center w-full">
                      {item.icon && <item.icon />}
                      <span className="truncate">{item.title}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="secondary" className="ml-auto h-5 px-1.5 min-w-5 justify-center">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                ) : (
                  <SidebarMenuButton
                    isActive={activeTree}
                    tooltip={{ children: item.title }}
                    className="flex-1"
                  >
                    {item.icon && <item.icon />}
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>
                )}

                {/* Botón separado para abrir/cerrar el collapsible */}
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="ml-1 inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                    aria-label={`Toggle ${item.title}`}
                  >
                    <ChevronRight className="size-4 transition-transform data-[state=open]:rotate-90" />
                  </button>
                </CollapsibleTrigger>
              </div>

              <CollapsibleContent className="transition-all duration-200 ease-in-out">
                <SidebarMenuSub>
                  <NavTree items={item.children!} level={level + 1} variant="sub" />
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )
      })}
    </Menu>
  )
}

/**
 * Render recursivo para dropdown (collapsed)
 */
function DropdownNavItems({
  items,
  currentUrl,
  level = 0,
}: {
  items: NavItem[]
  currentUrl: string
  level?: number
}) {
  return (
    <>
      {items.map((item) => {
        const hasChildren = itemHasChildren(item)
        const activeSelf = isActiveUrl(currentUrl, item.href)
        const activeTree = hasActiveDescendant(currentUrl, item)
        const key = `dd-${level}-${item.title}`

        if (!hasChildren) {
          return (
            <DropdownMenuItem key={key} asChild>
              <Link href={item.href!} prefetch className="w-full flex items-center justify-between">
                <span className={activeSelf ? "font-semibold" : ""}>{item.title}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            </DropdownMenuItem>
          )
        }

        // nested dropdown: usamos un "section" simple (no sub-dropdown) para no complicar UX
        // si quieres sub-dropdown real, lo armamos después.
        return (
          <div key={key} className="px-2 py-1">
            <div className={`text-xs uppercase tracking-wide ${activeTree ? "font-semibold" : ""}`}>
              {item.title}
            </div>

            <div className="mt-1 space-y-1">
              {item.href && (
                <DropdownMenuItem asChild>
                  <Link href={item.href} prefetch className="w-full">
                    {item.title}
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownNavItems items={item.children!} currentUrl={currentUrl} level={level + 1} />
            </div>
          </div>
        )
      })}
    </>
  )
}

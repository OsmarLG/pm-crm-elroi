import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavAdmin } from '@/components/nav-admin';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, KeyRound, LayoutGrid, ShieldCheck, UserCog, Users, Notebook, NotebookText, Shield, Settings2, Bot } from 'lucide-react';
import AppLogo from './app-logo';
import { usePage } from '@inertiajs/react';
import { filterNavItems } from "@/utils/filter-nav-items";

type PageProps = {
    auth: {
        user: any | null;
        permissions: string[];
        roles: string[];
    };
};

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: "Notebook",
        icon: Notebook,
        href: "/notes",
        can: "notes.view",
    },
    {
        title: "My Files",
        href: "/files",
        icon: Folder,
        can: "files.view",
    },
]


const adminNavItems: NavItem[] = [
    {
        title: "CRM",
        icon: Users,
        href: "/admin/customers",
        children: [
            {
                title: "Customers",
                href: "/admin/customers",
                icon: Users,
            },
            {
                title: "Projects",
                href: "/admin/projects",
                icon: Folder,
            },
        ],
    },
    {
        title: "User Management",
        icon: UserCog,
        href: "/admin/users",
        can: "users.view",
    },
    {
        title: "Security",
        icon: ShieldCheck,
        href: "/admin/roles",        // ✅
        children: [
            {
                title: "Roles",
                href: "/admin/roles",
                icon: Shield,
                can: "roles.manage",
            },
            {
                title: "Permissions",
                href: "/admin/roles/permissions",
                icon: KeyRound,
                can: "permissions.manage",
            },
        ],
    },
    {
        title: "Settings",
        icon: Settings2,
        href: "/admin/settings/ai",
        children: [
            {
                title: "AI Integration",
                href: "/admin/settings/ai",
                icon: Bot,
            },
        ],
    },
]


const footerNavItems: NavItem[] = [

];

const adminFooterNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/OsmarLG/project-hub-elroi-labs',
        icon: Folder,
    },
    {
        title: 'Laravel Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const permissions = auth.permissions ?? [];

    const filteredMainNav = filterNavItems(mainNavItems, permissions);
    const filteredAdminNav = filterNavItems(adminNavItems, permissions);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredMainNav} />

                {(auth.roles.includes("master") || auth.roles.includes("admin")) && <NavAdmin items={filteredAdminNav} />}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                {(auth.roles.includes("master") || auth.roles.includes("admin")) && <NavFooter items={adminFooterNavItems} />}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

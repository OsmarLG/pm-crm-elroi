import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

/**
 * Un NavItem puede ser:
 * 1) Link: tiene href
 * 2) Group: tiene children (sin href)
 */
export type NavItem = {
    title: string
    icon?: LucideIcon | null
    can?: string | string[]
    isActive?: boolean

    // ✅ opcional: si lo pones, al hacer click navega (aunque tenga children)
    href?: NonNullable<InertiaLinkProps["href"]>

    // ✅ opcional: permite niveles infinitos
    children?: NavItem[]

    // ✅ opcional: badge count
    badge?: number
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
}

// Global types for Note and FileItem
export type Note = {
    id: string
    title: string
    content: string
    folder_id: string | null
    user_id?: number
    author_name?: string // if populated
    owner?: { id: number, name: string } // if populated
    created_at: string
    updated_at: string
    visibility?: 'private' | 'public'
    uuid?: string
}

export type FileItem = {
    id: number
    folder_id: number | null
    title: string
    original_name: string
    mime_type: string | null
    size: number
    created_at?: string
    owner?: { id: number, name: string }
    user?: { id: number, name: string }
    visibility?: 'private' | 'public'
    uuid?: string
}

export type NoteFolder = {
    id: string
    name: string
    parent_id: string | null
    owner_id?: number
    user_id?: number
    created_at: string
    updated_at: string
    children?: NoteFolder[]
}

export type FileFolder = {
    id: number
    parent_id: number | null
    name: string
    children?: FileFolder[]
}

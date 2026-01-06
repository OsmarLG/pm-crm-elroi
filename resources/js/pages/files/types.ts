export type FileFolder = {
  id: number
  parent_id: number | null
  name: string
  children?: FileFolder[]
}

export type FileItem = {
  id: number
  folder_id: number | null
  title: string
  original_name: string
  mime_type: string | null
  size: number
  created_at?: string
}

export type ResourceCollection<T> = { data: T[] }

export type PaginationMeta = {
  current_page: number
  last_page: number
  links: { url: string | null; label: string; active: boolean }[]
}

export type PaginationLinks = { prev: string | null; next: string | null }

export type Paginated<T> = {
  data: T[]
  meta: PaginationMeta
  links: PaginationLinks
}

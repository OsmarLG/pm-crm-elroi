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

export type Note = {
  id: string
  title: string
  content: string
  folder_id: string | null
  user_id?: number
  author_name?: string
  created_at: string
  updated_at: string
}

export type ResourceCollection<T> = { data: T[] }
export type Paginated<T> = { data: T[]; links?: any; meta?: any }
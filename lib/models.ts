export interface JournalEntry {
  id: string
  user_id?: string
  title: string | null
  body: string
  mood: string | null
  created_at: string
  shared_at?: string | null
  is_public?: boolean
  local_time?: string | null
  weather?: string | null
  location_name?: string | null
}

export interface UserProfile {
  id: string
  display_name: string | null
  created_at: string
  email?: string
  is_admin?: boolean
}

export type EntryWithWordCount = JournalEntry & { wordCount: number }

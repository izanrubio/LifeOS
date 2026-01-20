import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

export type EnergyLevel = 'low' | 'medium' | 'high'

export interface DailyEntry {
  id: string
  user_id: string
  date: string
  energy_level: EnergyLevel | null
  note: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  date: string
  title: string
  completed: boolean
  created_at: string
}

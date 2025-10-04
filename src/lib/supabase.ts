import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface GalleryItem {
  id: string
  image_url: string
  prompt: string
  original_image_url?: string
  created_at: string
  user_id?: string
  design_name?: string
  category?: string
  colors?: string[]
  techniques?: string[]
  occasions?: string[]
  seasons?: string[]
  styles?: string[]
  shapes?: string[]
}

export interface SaveGalleryItemRequest {
  imageData: string
  prompt: string
  originalImageData?: string
  designName?: string
  category?: string
  colors?: string[]
  techniques?: string[]
  occasions?: string[]
  seasons?: string[]
  styles?: string[]
  shapes?: string[]
}



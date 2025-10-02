import { supabase } from './supabase'
import type { NailArtEditorial } from './geminiService'

export interface GalleryEditorialRecord {
  id: string
  item_id: string
  editorial: NailArtEditorial
  created_at: string
  updated_at?: string
}

const TABLE = 'gallery_editorials'

export async function getEditorialByItemId(itemId: string): Promise<NailArtEditorial | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('editorial')
      .eq('item_id', itemId)
      .single()

    if (error) {
      return null
    }
    return (data as { editorial: NailArtEditorial } | null)?.editorial || null
  } catch (e) {
    return null
  }
}

export async function upsertEditorial(itemId: string, editorial: NailArtEditorial): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        {
          item_id: itemId,
          editorial,
        },
        { onConflict: 'item_id' }
      )

    if (error) {
      return false
    }
    return true
  } catch (e) {
    return false
  }
}



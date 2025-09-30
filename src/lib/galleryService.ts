import { supabase, GalleryItem, SaveGalleryItemRequest } from './supabase'

export async function saveGalleryItem(item: SaveGalleryItemRequest): Promise<GalleryItem | null> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `nail-art-${timestamp}.jpg`
    
    // Convert base64 to blob
    const imageBlob = dataURLtoBlob(item.imageData)
    
    // Upload image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('nail-art-images')
      .upload(filename, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading image:', uploadError)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('nail-art-images')
      .getPublicUrl(filename)

    // Save to database
    const { data, error } = await supabase
      .from('gallery_items')
      .insert({
        image_url: publicUrl,
        prompt: item.prompt,
        design_name: item.designName,
        category: item.category,
        original_image_url: item.originalImageData ? await uploadOriginalImage(item.originalImageData) : null
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving to database:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error saving gallery item:', error)
    return null
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery items:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching gallery items:', error)
    return []
  }
}

export async function getGalleryItem(id: string): Promise<GalleryItem | null> {
  try {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching gallery item:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching gallery item:', error)
    return null
  }
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  try {
    // Get the item to find the image filename
    const { data: item, error: fetchError } = await supabase
      .from('gallery_items')
      .select('image_url, original_image_url')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching item for deletion:', fetchError)
      return false
    }

    // Delete from storage
    if (item.image_url) {
      const filename = item.image_url.split('/').pop()
      if (filename) {
        await supabase.storage
          .from('nail-art-images')
          .remove([filename])
      }
    }

    if (item.original_image_url) {
      const originalFilename = item.original_image_url.split('/').pop()
      if (originalFilename) {
        await supabase.storage
          .from('nail-art-images')
          .remove([originalFilename])
      }
    }

    // Delete from database
    const { error } = await supabase
      .from('gallery_items')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting from database:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting gallery item:', error)
    return false
  }
}

// Helper function to convert data URL to blob
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new Blob([u8arr], { type: mime })
}

// Helper function to upload original image
async function uploadOriginalImage(originalImageData: string): Promise<string | null> {
  try {
    const timestamp = Date.now()
    const filename = `original-${timestamp}.jpg`
    const imageBlob = dataURLtoBlob(originalImageData)
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('nail-art-images')
      .upload(filename, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading original image:', uploadError)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('nail-art-images')
      .getPublicUrl(filename)

    return publicUrl
  } catch (error) {
    console.error('Error uploading original image:', error)
    return null
  }
}


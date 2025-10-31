'use client'

import React, { useState, useEffect } from 'react'
import { GalleryItem } from '@/lib/supabase'
import Link from 'next/link'
import OptimizedImage from './OptimizedImage'

interface GalleryProps {
  onImageSelect?: (item: GalleryItem) => void
  showPrompts?: boolean
  showDelete?: boolean
}

const Gallery = function Gallery({ 
  showPrompts = true, 
  showDelete = false 
}: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/gallery')
      const data = await response.json()
      
      if (data.success) {
        setItems(data.items)
      } else {
        setError('Failed to load gallery items')
      }
    } catch (err) {
      setError('Failed to load gallery items')
      console.error('Error fetching gallery items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setItems(items.filter(item => item.id !== id))
      } else {
        alert('Failed to delete item')
      }
    } catch (err) {
      console.error('Error deleting item:', err)
      alert('Failed to delete item')
    }
  }

  const handleImageClick = (item: GalleryItem) => {
    // Navigate to canonical URL format: /{category}/{design-name}-{id}
    const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
    const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
    const idSuffix = item.id.slice(-8);
    const canonicalUrl = `/${categorySlug}/${designSlug}-${idSuffix}`;
    window.location.href = canonicalUrl;
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button 
          onClick={fetchGalleryItems}
          className="px-4 py-2 bg-purple-500 text-gray-900 rounded-lg hover:bg-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No designs yet</h3>
        <p className="text-gray-500">Generate some nail art to see them here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="bg-surface rounded-lg shadow-lg overflow-hidden hover:shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            onClick={() => handleImageClick(item)}
          >
            <div className="aspect-square relative">
              <OptimizedImage
                src={item.image_url}
                alt={item.design_name || 'Generated nail art'}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {showDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-gray-900 rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="p-4">
              {item.category && (
                <span className="text-sm text-blue-400 font-medium">{item.category}</span>
              )}
              {item.design_name && (
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.design_name}</h3>
              )}
              {showPrompts && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.prompt}</p>
              )}
              
              {/* Try This Design Button */}
              <Link 
                href={`/try-on?design=${item.id}`}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-primary text-gray-900 font-bold py-2 px-4 rounded-lg hover:bg-primary-dark transition duration-300 text-center block"
              >
                Try This Design
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default React.memo(Gallery);



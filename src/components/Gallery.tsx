'use client'

import React, { useState, useEffect } from 'react'
import { GalleryItem } from '@/lib/supabase'

interface GalleryProps {
  onImageSelect?: (item: GalleryItem) => void
  showPrompts?: boolean
  showDelete?: boolean
}

export default function Gallery({ 
  onImageSelect, 
  showPrompts = true, 
  showDelete = false 
}: GalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)

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
    setSelectedItem(item)
    if (onImageSelect) {
      onImageSelect(item)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchGalleryItems}
          className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
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
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleImageClick(item)}
          >
            <div className="aspect-square relative">
              <img
                src={item.image_url}
                alt={item.design_name || 'Generated nail art'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {showDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(item.id)
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {showPrompts && (
              <div className="p-4">
                {item.design_name && (
                  <h3 className="font-medium text-gray-900 mb-2">{item.design_name}</h3>
                )}
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.prompt}</p>
                <p className="text-xs text-gray-400">{formatDate(item.created_at)}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal for selected item */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedItem.design_name || 'Generated Nail Art'}
                </h2>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-4">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.design_name || 'Generated nail art'}
                  className="w-full rounded-lg"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Prompt:</h3>
                  <p className="text-gray-600 text-sm">{selectedItem.prompt}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Created:</h3>
                  <p className="text-gray-600 text-sm">{formatDate(selectedItem.created_at)}</p>
                </div>
                
                {selectedItem.category && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Category:</h3>
                    <p className="text-gray-600 text-sm">{selectedItem.category}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = selectedItem.image_url
                    link.download = `nail-art-${selectedItem.id}.jpg`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                  className="flex-1 bg-pink-500 text-white py-2 px-4 rounded-lg hover:bg-pink-600"
                >
                  Download
                </button>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


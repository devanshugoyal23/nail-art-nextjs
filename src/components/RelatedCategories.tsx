'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import OptimizedImage from './OptimizedImage'
import { getGalleryItemsByCategory } from '@/lib/galleryService'
import { GalleryItem } from '@/lib/supabase'

interface RelatedCategoriesProps {
  currentCategory?: string
  limit?: number
}

export default function RelatedCategories({ 
  currentCategory, 
  limit = 6 
}: RelatedCategoriesProps) {
  const [categories, setCategories] = useState<string[]>([])
  const [categoryItems, setCategoryItems] = useState<Record<string, GalleryItem[]>>({})
  const [loading, setLoading] = useState(true)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      
      // Use fallback categories for build time
      const fallbackCategories = [
        'Christmas Nail Art',
        'Halloween Nail Art', 
        'Summer Nail Art',
        'Butterfly Nail Art',
        'French Nail Art',
        'Abstract Nail Art'
      ]
      
      // Filter out current category if provided
      const filteredCategories = currentCategory 
        ? fallbackCategories.filter((cat: string) => cat !== currentCategory)
        : fallbackCategories
      
      setCategories(filteredCategories.slice(0, limit))
      
      // Try to fetch from API, but don't fail if it doesn't work
      try {
        const response = await fetch('/api/generate-gallery')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.categories?.all) {
            const allCategories = data.categories.all
            const filteredApiCategories = currentCategory 
              ? allCategories.filter((cat: string) => cat !== currentCategory)
              : allCategories
            setCategories(filteredApiCategories.slice(0, limit))
          }
        }
      } catch {
        // Silently fail and use fallback categories
        console.log('Using fallback categories for build')
      }
      
      // Fetch sample items for each category (only if not in build mode)
      if (typeof window !== 'undefined') {
        const itemsPromises = filteredCategories.slice(0, limit).map(async (category: string) => {
          try {
            const items = await getGalleryItemsByCategory(category)
            return { category, items: items.slice(0, 1) } // Get first item as preview
          } catch {
            return { category, items: [] }
          }
        })
        
        const results = await Promise.all(itemsPromises)
        const categoryItemsMap: Record<string, GalleryItem[]> = {}
        results.forEach(({ category, items }) => {
          categoryItemsMap[category] = items
        })
        
        setCategoryItems(categoryItemsMap)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }, [currentCategory, limit])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (categories.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-6">
        {currentCategory ? 'Explore Other Categories' : 'Browse by Category'}
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => {
          const previewItem = categoryItems[category]?.[0]
          
          return (
            <Link
              key={category}
              href={`/nail-art-gallery/category/${encodeURIComponent(category)}`}
              className="group bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-square relative">
                {previewItem ? (
                  <OptimizedImage
                    src={previewItem.image_url}
                    alt={`${category} nail art preview`}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No preview</span>
                  </div>
                )}
              </div>
              
              <div className="p-3">
                <h3 className="text-sm font-medium text-white text-center truncate">
                  {category}
                </h3>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

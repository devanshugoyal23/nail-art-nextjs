import React from 'react'
import EnhancedGallery from '@/components/EnhancedGallery'
import RelatedCategories from '@/components/RelatedCategories'

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <EnhancedGallery showPrompts={true} showDelete={false} />
        
        {/* Related Categories Section */}
        <div className="mt-16">
          <RelatedCategories />
        </div>
      </div>
    </div>
  )
}



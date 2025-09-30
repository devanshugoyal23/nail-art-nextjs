import React from 'react'
import Gallery from '@/components/Gallery'

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Nail Art Design Gallery</h1>
        <p className="text-white text-lg">
          Browse our curated collection of stunning nail art designs. Click on any design to learn more and try it on virtually.
        </p>
      </div>
      
      <Gallery showPrompts={true} showDelete={true} />
    </div>
  )
}


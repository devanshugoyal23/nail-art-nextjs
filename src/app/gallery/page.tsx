import React from 'react'
import Gallery from '@/components/Gallery'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Nail Art Gallery</h1>
          <p className="text-gray-600">
            View and manage all your generated nail art designs
          </p>
        </div>
        
        <Gallery showPrompts={true} showDelete={true} />
      </main>
      
      <Footer />
    </div>
  )
}


import { useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import type { Image } from '#/lib/commercetools/types'

interface ProductGalleryProps {
  images: Image[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const currentImage = images[selectedIndex]

  const goToNext = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-2xl bg-[var(--color-cream-dark)] flex items-center justify-center">
        <span className="text-[var(--color-slate)]">No image available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main image */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--color-cream-dark)] group">
        <img
          src={currentImage.url}
          alt={`${productName} - Image ${selectedIndex + 1}`}
          className="img-cover cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Zoom button */}
        <button
          onClick={() => setIsZoomed(true)}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
          aria-label="Zoom image"
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === selectedIndex
                  ? 'border-[var(--color-charcoal)]'
                  : 'border-transparent hover:border-[var(--color-cream-dark)]'
              }`}
            >
              <img
                src={image.url}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="img-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrev()
                }}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={currentImage.url}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

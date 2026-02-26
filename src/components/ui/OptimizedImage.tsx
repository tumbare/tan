import { useState, useRef, useEffect } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  placeholder?: 'blur' | 'empty'
  onLoad?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  onLoad,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(priority)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (priority) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [priority])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.includes('unsplash.com')) return undefined

    const sizes = [320, 640, 960, 1280, 1920]
    return sizes
      .map((size) => {
        const url = new URL(baseSrc)
        url.searchParams.set('w', size.toString())
        return `${url.toString()} ${size}w`
      })
      .join(', ')
  }

  const srcSet = generateSrcSet(src)

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder */}
      {placeholder === 'blur' && !isLoaded && (
        <div className="absolute inset-0 bg-[var(--color-cream-dark)] animate-pulse" />
      )}

      {/* Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}

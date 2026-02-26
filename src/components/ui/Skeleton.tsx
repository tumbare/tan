interface SkeletonProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  full: 'rounded-full',
}

export function Skeleton({
  className = '',
  width,
  height,
  rounded = 'md',
}: SkeletonProps) {
  const style: React.CSSProperties = {}
  if (width) style.width = typeof width === 'number' ? `${width}px` : width
  if (height) style.height = typeof height === 'number' ? `${height}px` : height

  return (
    <div
      className={`skeleton ${roundedClasses[rounded]} ${className}`}
      style={style}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card">
      <Skeleton className="aspect-product w-full" rounded="lg" />
      <div className="p-4 space-y-3">
        <Skeleton height={12} width="60%" />
        <Skeleton height={20} width="80%" />
        <Skeleton height={16} width="40%" />
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

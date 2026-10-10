import ProductImage from './ProductImage'
import { useState } from 'react'
export default function ProductGallery({ images, name }) {
  const [i, setI] = useState(0)
  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[56px_minmax(0,1fr)]">
      <div className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:flex-col">
        {images.map((src, k) => (
          <button key={k} onClick={() => setI(k)} aria-pressed={k === i} aria-label={`View image ${k + 1}`} className={`h-14 w-14 shrink-0 overflow-hidden rounded-md border ${k === i ? 'border-teal' : 'border-transparent'}`}>
            <ProductImage src={src} alt={`${name} view ${k + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div data-testid="product-main-image" className="order-1 aspect-[4/3] max-h-[300px] overflow-hidden rounded-xl bg-bone sm:order-2 sm:max-h-[360px]">
        <ProductImage src={images[i]} alt={`${name} marble product`} className="h-full w-full object-contain" />
      </div>
    </div>
  )
}

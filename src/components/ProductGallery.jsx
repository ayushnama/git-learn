import { useState } from 'react'
export default function ProductGallery({ images, name }) {
  const [i, setI] = useState(0)
  return (
    <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
      <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
        {images.map((src, k) => (
          <button key={k} onClick={() => setI(k)} aria-label={`View image ${k + 1}`} className={`h-20 w-16 shrink-0 overflow-hidden border sm:w-full ${k === i ? 'border-ink' : 'border-transparent'}`}>
            <img src={src} alt={`${name} view ${k + 1}`} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="order-1 aspect-[4/5] overflow-hidden bg-bone sm:order-2">
        <img src={images[i]} alt={`${name} marble product`} className="h-full w-full object-cover" />
      </div>
    </div>
  )
}

import { useState } from 'react'
import { brand } from '../config/brand'

export default function BrandMark({ className = '', variant = 'header' }) {
  const [failed, setFailed] = useState(false)
  if (!brand.logoUrl || failed) {
    return <span className={`font-serif text-2xl tracking-[0.13em] ${className}`}>MARBELLO</span>
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <img
        src={brand.logoUrl}
        onError={() => setFailed(true)}
        alt={brand.name}
        width={variant === 'footer' ? 120 : variant === 'header' ? 64 : 56}
        height={variant === 'footer' ? 120 : variant === 'header' ? 64 : 56}
        className={variant === 'footer' ? 'h-[120px] w-[120px] rounded-lg bg-cream object-contain' : variant === 'header' ? 'h-[52px] w-[52px] shrink-0 object-contain sm:h-16 sm:w-16 lg:h-[76px] lg:w-[76px]' : 'h-14 w-14 shrink-0 object-contain'}
      />
      {variant === 'menu' && <span aria-hidden="true" className="font-serif text-lg leading-none tracking-[0.12em]">MARBELLO</span>}
    </span>
  )
}

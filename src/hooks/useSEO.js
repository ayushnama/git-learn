import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { applyMetadata, pageMetadata, siteOrigin } from '../utils/seo'

export default function useSEO({ title, description, image, jsonLd, type, noIndex }) {
  const { pathname, search } = useLocation()
  const structuredData = jsonLd ? JSON.stringify(jsonLd) : undefined
  useEffect(() => {
    const origin = siteOrigin(import.meta.env.VITE_SITE_URL, window.location.origin)
    applyMetadata(document, pageMetadata({ title, description, image, type, noIndex }, pathname, origin), structuredData)
  }, [title, description, image, type, noIndex, structuredData, pathname, search])
}

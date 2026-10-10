import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { siteOrigin } from './src/utils/seo.js'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  siteOrigin(env.VITE_SITE_URL, 'http://localhost')
  return { plugins: [react()] }
})

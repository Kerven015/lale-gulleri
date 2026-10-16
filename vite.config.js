import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/lale-gulleri/',
  plugins: [react()],
  // ...keep everything else that's already there
})

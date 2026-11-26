import path from 'node:path'
import { cpSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const root = path.dirname(fileURLToPath(import.meta.url))

function copyRepoStaticAssets() {
  return {
    name: 'copy-repo-static-assets',
    closeBundle() {
      const dist = path.join(root, 'dist')
      for (const dir of ['draft-xd10', 'md1t-screen-demo']) {
        cpSync(path.join(root, dir), path.join(dist, dir), { recursive: true })
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyRepoStaticAssets(),
  ],
})

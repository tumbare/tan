import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    devtools(),
    tsconfigPaths({ projects: ['./tsconfig.json'] }),
    tailwindcss(),
    tanstackStart({
      routers: {
        client: {
          entry: './src/router.tsx',
        },
      },
    }),
    viteReact(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['@tanstack/react-router', '@tanstack/react-query'],
          commercetools: ['@commercetools/ts-client', '@commercetools/platform-sdk'],
        },
      },
    },
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query'],
  },
})

export default config

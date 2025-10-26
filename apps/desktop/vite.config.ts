import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron/simple'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: {
          build: {
            rollupOptions: {
              external: [
                'pdf2json',
                'mammoth',
                '@xenova/transformers'
              ]
            },
            commonjsOptions: {
              ignoreDynamicRequires: true
            }
          }
        }
      },
      preload: {
        input: 'electron/preload.ts',
      },
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: [
      '@docsummarizer/llm-client',
      '@docsummarizer/document-parsers',
      '@docsummarizer/rag-engine',
      '@xenova/transformers',
      'mammoth',
      'pdf2json'
    ]
  },
  build: {
    rollupOptions: {
      external: [
        '@docsummarizer/llm-client',
        '@docsummarizer/document-parsers',
        '@docsummarizer/rag-engine'
      ]
    }
  },
  server: {
    port: 5173
  }
})

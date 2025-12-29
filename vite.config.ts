import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//@ts-ignore
import tailwindcss from '@tailwindcss/vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
//@ts-ignore
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'events', 'string_decoder'],
      globals: {
        Buffer: true,
        global: true,
      },
      protocolImports: true,
    }),
  ],
  server: {
    host: '127.0.0.1',
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'app': path.resolve(__dirname, './src/app'),
      'pages': path.resolve(__dirname, './src/pages'),
      'widgets': path.resolve(__dirname, './src/widgets'),
      'features': path.resolve(__dirname, './src/features'),
      'entities': path.resolve(__dirname, './src/entities'),
      'shared': path.resolve(__dirname, './src/shared'),
    },
  },
});

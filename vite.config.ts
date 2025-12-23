import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
//@ts-ignore
import tailwindcss from '@tailwindcss/vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
//@ts-ignore
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'util', 'process', 'events', 'string_decoder'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
      protocolImports: true,
    }),
  ],
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

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // base: 'chat',
  // server: {
  //   host: '0.0.0.0',
  // },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@libs': path.resolve(__dirname, './src/libs'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
});

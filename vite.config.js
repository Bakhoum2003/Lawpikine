import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The existing image folder is Vite's public folder: no product image is replaced.
export default defineConfig({ plugins: [react()], publicDir: 'images' });

import path from 'path';
import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  return {
    base: '/markdown/',
    plugins: [
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});

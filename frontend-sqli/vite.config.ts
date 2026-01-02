import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    host: '0.0.0.0', // Écouter sur toutes les interfaces
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '192.168.1.4',
      '.ngrok-free.app', // Autoriser tous les sous-domaines ngrok .app
      '.ngrok-free.dev', // Autoriser tous les sous-domaines ngrok .dev
      '.ngrok.io', // Autoriser tous les sous-domaines ngrok .io
      '03d418b181d0.ngrok-free.app',
      '67f295abd8fa.ngrok-free.app',
      '29b9e11d43bd.ngrok-free.app',
      'aleen-balsaminaceous-temeka.ngrok-free.dev', // URL ngrok actuelle
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
});

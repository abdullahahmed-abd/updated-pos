import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
      tailwindcss(),
      
  ],
  server: {
    proxy: {
      '/api': {
        target: ['http://192.168.209.84:8081/','http://192.168.29.78:8080/'],
        changeOrigin: true,
        secure: false,
      },
  },
 },
}
)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // This makes the server accessible from outside the container
    port: 5173       // Ensure this port matches the one mapped in docker-compose
  }
})

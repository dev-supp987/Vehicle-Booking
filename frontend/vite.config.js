import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
    plugins: [react()],
    base: command === 'build' ? '/vehicle_booking/' : '/',
    server: {
        port: 5174,
        strictPort: true,
        proxy: {
            '/vehicle_booking_api': 'http://localhost:5000'
        }
    }
}))

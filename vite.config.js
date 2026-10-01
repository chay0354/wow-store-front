import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In dev, calls to /api are forwarded to the Node back end.
// Override with VITE_DEV_PORT / VITE_DEV_API when 5173 or 4000 are already taken.
const api = process.env.VITE_DEV_API || 'http://localhost:4000';
const port = Number(process.env.VITE_DEV_PORT || 5173);

export default defineConfig({
  plugins: [react()],
  server: { port, strictPort: true, proxy: { '/api': api } },
});

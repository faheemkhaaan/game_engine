import { defineConfig } from 'vite';
import path from 'path';
export default defineConfig({
    plugins: [],
    resolve: {
        alias: {
            '@assets': path.resolve(__dirname, './assets'),
            '@': path.resolve(__dirname, './src'),
        },
    },
    // Optional: Ensures the dev server serves .wasm files with the correct MIME type
    server: {
        headers: {
            'Cross-Origin-Embedder-Policy': 'require-corp',
            'Cross-Origin-Opener-Policy': 'same-origin'
        }
    },
    base: "/game_engine/"
});
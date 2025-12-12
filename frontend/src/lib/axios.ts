import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore'; // Sesuaikan path store Anda

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api', // Backend URL with /api prefix
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Menyisipkan Token ke setiap Request
api.interceptors.request.use(
    (config) => {
        // Ambil token dari Auth Store atau LocalStorage
        // Cara pengambilan tergantung bagaimana Anda menyimpan token di useAuthStore
        let token = useAuthStore.getState().token;

        // JIKA token tidak ada di state, coba cari manual di sessionStorage
        // Ini membantu saat initialization belum selesai tapi request sudah jalan (misal SSR/refresh)
        if (!token && typeof window !== 'undefined') {
            token = sessionStorage.getItem('auth_token');
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
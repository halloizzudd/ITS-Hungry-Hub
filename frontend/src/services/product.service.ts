import api from '@/lib/axios';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl?: string;
    // Add other fields as needed
}

export const productService = {
    async getAll(params?: { search?: string; category?: string }) {
        const response = await api.get('/products', { params });
        return response.data;
    },

    async getOne(id: number | string) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    async create(data: FormData) {
        const response = await api.post('/products', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

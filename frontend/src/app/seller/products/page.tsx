'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { getImageUrl } from '@/utils/image';
import { useAuthStore } from '@/store/useAuthStore';
import { Plus, Clock, Tag, Utensils, Edit2, Trash2, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    prepTime: number;
    category: string;
}

export default function ProductListPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { user } = useAuthStore();

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/my-products');
            // Backend now returns { data: [], meta: {} }
            const productList = response.data.data || response.data;
            console.log('Fetched products:', productList);
            setProducts(productList);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role === 'SELLER' && user.verificationStatus !== 'VERIFIED') {
            router.push('/seller');
            return;
        }
        fetchProducts();
    }, [user, router]);

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            try {
                await api.delete(`/products/${id}`);
                // Refresh list
                fetchProducts();
            } catch (error) {
                console.error('Failed to delete product', error);
                alert('Failed to delete product');
            }
        }
    };



    if (loading) return (
        <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5C9E33]"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[#2C2C2C]">My Menu</h1>
                    <p className="text-gray-500 font-medium">Manage your dishes and stock.</p>
                </div>
                <Link
                    href="/seller/products/create"
                    className="flex items-center gap-2 rounded-2xl bg-[#5C9E33] px-6 py-3 text-white font-bold hover:bg-[#4a8226] transition-all shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    Add Menu
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                    <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                        <Utensils className="h-8 w-8" />
                    </div>
                    <p className="text-gray-500 font-medium mb-4">You haven't added any menu items yet.</p>
                    <Link href="/seller/products/create" className="text-[#5C9E33] font-bold hover:underline">Start Adding Now</Link>
                </div>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product: any) => {
                        console.log({ product });


                        const fullImageUrl = getImageUrl(product.imageUrl || product.images?.[0]?.url);
                        console.log({ fullImageUrl });
                        return (
                            <div key={product.id} className="group relative bg-white rounded-[2.5rem] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:shadow-green-900/10 transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-100 flex flex-col h-full">
                                {/* Image */}
                                <div className="relative aspect-square rounded-[2rem] bg-gray-100 overflow-hidden mb-4 shadow-inner">
                                    {fullImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <Image
                                            width={300}
                                            height={300}
                                            src={fullImageUrl}
                                            unoptimized
                                            alt={product.name}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        // onError={(e) => {
                                        //     (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=No+Image';
                                        // }}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-300">
                                            <Utensils className="h-10 w-10" />
                                        </div>
                                    )}

                                    {/* Category Badge */}
                                    <div className="absolute top-3 left-3">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold text-gray-700 shadow-sm">
                                            <Tag className="h-3 w-3 text-[#5C9E33]" />
                                            {product.category}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-2 pb-2 flex-grow">
                                    <h3 className="text-lg font-bold text-[#2C2C2C] line-clamp-1 group-hover:text-[#5C9E33] transition-colors mb-1">{product.name}</h3>

                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-xl font-black text-[#2C2C2C]">
                                            Rp {product.price.toLocaleString('id-ID')}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 text-xs font-medium text-gray-500">
                                        <span className="bg-gray-50 px-2 py-1 rounded-lg">Stock: <strong className="text-gray-900">{product.stock}</strong></span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {product.prepTime}m
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2 pt-2 border-t border-gray-100">
                                    <Link
                                        href={`/seller/products/edit/${product.id}`}
                                        className="flex-1 py-2 rounded-xl bg-gray-50 text-gray-600 font-bold text-xs hover:bg-[#5C9E33] hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit2 className="h-4 w-4" /> Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="flex-1 py-2 rounded-xl bg-red-50 text-red-500 font-bold text-xs hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
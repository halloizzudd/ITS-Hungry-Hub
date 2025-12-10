'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ChevronLeft, Upload, Loader2, DollarSign, Clock, Package } from 'lucide-react';

export default function CreateProductPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'Food',
        prepTime: '',
    });
    const [image, setImage] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!image) {
            setError('Product image is required');
            setLoading(false);
            return;
        }

        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('prepTime', formData.prepTime);
        data.append('category', formData.category);
        data.append('image', image);

        try {
            await api.post('/products', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            router.push('/seller/products');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-20">
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest mb-6 hover:text-[#5C9E33] transition-colors group"
            >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Menu
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-green-900/5 p-8 lg:p-10 border border-white/60 relative overflow-hidden">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#eefbf0] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-[#2C2C2C] mb-2">New Dish</h1>
                    <p className="text-gray-500 text-sm font-medium mb-8">Add a delicious new item to your menu.</p>

                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Image Upload Area */}
                        <div className="flex justify-center mb-8">
                            <label className="relative cursor-pointer group w-full">
                                <div className="w-full h-48 rounded-[2rem] bg-[#f8fcf8] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-[#5C9E33] hover:bg-[#eefbf0] transition-all overflow-hidden group-hover:shadow-lg group-hover:shadow-green-500/10">
                                    {image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-4 bg-white rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform text-gray-300 group-hover:text-[#5C9E33]">
                                                <Upload className="h-6 w-6" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-400 group-hover:text-[#5C9E33] uppercase tracking-wide">Upload Photo</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Product Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="block w-full rounded-2xl border-none bg-gray-50 py-3.5 px-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-[#5C9E33] transition-all hover:bg-white placeholder:text-gray-300 font-medium"
                                        placeholder="e.g. Nasi Goreng Spesial"
                                        required
                                    />
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Category</label>
                                    <div className="relative">
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="block w-full rounded-2xl border-none bg-gray-50 py-3.5 px-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-[#5C9E33] transition-all cursor-pointer appearance-none font-medium"
                                        >
                                            <option value="Food">🍛 Food</option>
                                            <option value="Drink">🥤 Drink</option>
                                            <option value="Snack">🍟 Snack</option>
                                        </select>
                                        <div className="absolute right-4 top-4 pointer-events-none text-gray-400">▼</div>
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="block w-full rounded-2xl border-none bg-gray-50 py-3.5 px-5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-[#5C9E33] transition-all hover:bg-white placeholder:text-gray-300 font-medium resize-none"
                                    placeholder="Describe the taste and ingredients..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Price</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 text-gray-400"><DollarSign size={16} /></div>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            min="0"
                                            className="block w-full rounded-2xl border-none bg-gray-50 py-3.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-[#5C9E33] transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Stock</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 text-gray-400"><Package size={16} /></div>
                                        <input
                                            type="number"
                                            name="stock"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            min="0"
                                            className="block w-full rounded-2xl border-none bg-gray-50 py-3.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-[#5C9E33] transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1">Prep Time</label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-3.5 text-gray-400"><Clock size={16} /></div>
                                        <input
                                            type="number"
                                            name="prepTime"
                                            value={formData.prepTime}
                                            onChange={handleChange}
                                            min="1"
                                            className="block w-full rounded-2xl border-none bg-gray-50 py-3.5 pl-10 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-100 focus:ring-2 focus:ring-[#5C9E33] transition-all font-bold"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-8 rounded-2xl bg-[#5C9E33] px-6 py-4 text-white font-bold text-lg shadow-xl shadow-green-500/30 transition-all hover:bg-[#4a8226] hover:scale-[1.02] active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" /> Publishing...
                                </>
                            ) : (
                                'Publish to Menu'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
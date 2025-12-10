'use client';

import { useCartStore } from '@/store/useCartStore';
import { Trash2, ChevronLeft, ArrowRight, ShoppingBag, Utensils, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import api from '@/lib/axios';

export default function CartPage() {
    const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCartStore();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (items.length === 0) return;
        setLoading(true);

        try {
            const sellerId = items[0].sellerId;
            const payload = {
                sellerId,
                orderType: 'DINE_IN',
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity
                }))
            };

            const response = await api.post('/orders', payload);

            clearCart();
            const orderId = response.data.id;
            router.push(`/orders/${orderId}/pay`);

        } catch (error) {
            console.error('Checkout failed', error);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ... existing empty state code ...

    // --- FILLED CART ---
    return (
        <div className="min-h-screen bg-[#f8fcf8] pb-32 font-sans text-[#2C2C2C] relative overflow-x-hidden">

            {/* Background Shape */}
            <div className="absolute top-0 left-0 -z-10 w-full h-[80%] translate-x-[-30%] translate-y-[-20%] rotate-90">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/5">
                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                </svg>
            </div>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 px-4 py-4 shadow-sm shadow-green-900/5">
                <div className="container mx-auto max-w-2xl flex items-center gap-4">
                    <Link href="/dashboard" className="rounded-full p-2 bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-[#5C9E33] hover:shadow-md transition-all">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-[#2C2C2C] tracking-tight">My Order</h1>
                        <p className="text-xs font-bold text-[#5C9E33] tracking-wide uppercase">{items.length} Items Added</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 py-8">
                {/* Cart Items Card */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-green-900/5 border border-white/60">
                    <div className="flex items-center gap-2 mb-6 px-2">
                        <div className="bg-[#eefbf0] p-2 rounded-full">
                            <Utensils className="h-4 w-4 text-[#5C9E33]" />
                        </div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Items from Stall</h2>
                    </div>

                    <div className="flex flex-col gap-6">
                        {items.map((item) => (
                            <div key={item.productId} className="group flex gap-5 items-center p-3 rounded-[2rem] hover:bg-[#f8fcf8] transition-colors border border-transparent hover:border-green-50">
                                {/* Item Image */}
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-[1.5rem] bg-gray-100 shadow-md border border-white">
                                    {item.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}${item.image}`}
                                            alt={item.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-gray-400 font-bold">No Img</div>
                                    )}
                                </div>

                                {/* Item Details */}
                                <div className="flex flex-1 flex-col justify-between py-1 min-h-[5rem]">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-[#2C2C2C] leading-tight mb-2">{item.name}</h3>

                                            {/* Quantity Control */}
                                            <div className="flex items-center bg-gray-50 rounded-xl p-1 w-fit border border-gray-100">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-[#5C9E33] hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-black text-[#2C2C2C]">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-[#5C9E33] hover:shadow-sm transition-all"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.productId)}
                                            className="p-2 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="mt-auto">
                                        <span className="font-black text-lg text-[#5C9E33]">
                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Checkout Bar */}
                <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
                    <div className="mx-auto max-w-2xl bg-[#2C2C2C] p-4 pr-5 rounded-[2rem] shadow-2xl shadow-green-900/30 flex items-center justify-between border border-white/10 backdrop-blur-md">
                        <div className="flex flex-col pl-4">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Total Payment</p>
                            <p className="text-2xl font-black text-white leading-none">
                                Rp {getTotalPrice().toLocaleString('id-ID')}
                            </p>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="flex items-center gap-2 rounded-full bg-[#5C9E33] px-8 py-4 font-bold text-white transition-all hover:bg-[#4a8226] hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg shadow-green-500/30"
                        >
                            {loading ? 'Processing...' : (
                                <>
                                    Checkout <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Order, OrderStatus } from '@/types/order';
import { ChevronLeft, Clock, ShoppingBag, Utensils, Calendar, Receipt, CheckCircle, XCircle, Timer, ChefHat, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OrderHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            // Filter for PAST orders (Completed or Cancelled)
            const historyStatuses = [
                OrderStatus.COMPLETED,
                OrderStatus.CANCELLED
            ];

            const historyOrders = res.data
                .filter((order: Order) => historyStatuses.includes(order.status as OrderStatus))
                .sort((a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(historyOrders);
        } catch (error) {
            console.error('Failed to fetch history', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f8fcf8]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5C9E33] border-t-transparent"></div>
                    <p className="text-sm font-bold text-gray-400 animate-pulse">Loading history...</p>
                </div>
            </div>
        );
    }

    // --- EMPTY STATE ---
    if (orders.length === 0) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fcf8] relative overflow-hidden font-sans text-[#2C2C2C]">
                {/* Organic Background Shape */}
                <div className="absolute top-0 right-0 -z-10 w-full h-[120%] lg:w-[60%] translate-x-[20%] -translate-y-[20%]">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/10">
                        <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                    </svg>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-green-900/5 text-center max-w-sm mx-4 border border-white/50 backdrop-blur-sm">
                    <div className="mb-6 flex h-28 w-28 mx-auto items-center justify-center rounded-full bg-[#f8fcf8] shadow-inner text-gray-300">
                        <Receipt className="h-12 w-12" />
                    </div>
                    <h2 className="text-3xl font-black text-[#2C2C2C] mb-2">No Past Orders</h2>
                    <p className="mb-8 text-gray-400 font-medium">Your order history is empty.</p>
                    <Link href="/dashboard" className="block w-full rounded-full bg-gray-100 px-8 py-4 font-bold text-gray-600 transition-all hover:bg-gray-200">
                        Back to Menu
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fcf8] pb-32 font-sans text-[#2C2C2C] relative overflow-x-hidden">

            {/* Background Shape */}
            <div className="absolute top-0 left-0 -z-10 w-full h-[80%] translate-x-[-30%] translate-y-[-20%] rotate-90">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/5">
                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                </svg>
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 px-4 py-4 shadow-sm shadow-green-900/5">
                <div className="container mx-auto max-w-2xl flex items-center gap-4">
                    <Link href="/dashboard" className="rounded-full p-2 bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-[#5C9E33] hover:shadow-md transition-all">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-[#2C2C2C] tracking-tight">Order History</h1>
                        <p className="text-xs font-bold text-[#5C9E33] tracking-wide uppercase">Past Purchases</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
                {orders.map(order => (
                    <div key={order.id} className="group bg-white rounded-[2.5rem] p-6 shadow-xl shadow-green-900/5 border border-white/60 hover:shadow-2xl hover:shadow-green-900/10 transition-all duration-300 opacity-80 hover:opacity-100">
                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-[#f8fcf8] flex items-center justify-center border border-gray-100 text-[#5C9E33]">
                                    <StoreIcon status={order.status} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-[#2C2C2C] leading-tight mb-0.5">
                                        {order.seller?.stallName || 'Unknown Stall'}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                            <StatusBadge status={order.status} />
                        </div>

                        {/* Order Items */}
                        <div className="bg-[#f8fcf8] rounded-[1.5rem] p-4 mb-4 border border-gray-50/50">
                            <div className="divide-y divide-gray-100">
                                {order.orderItems.map(item => (
                                    <div key={item.id} className="flex justify-between py-3 items-center first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3">
                                            <div className="h-6 w-6 rounded-md bg-white border border-gray-100 flex items-center justify-center text-xs font-bold text-[#5C9E33]">
                                                {item.quantity}x
                                            </div>
                                            <span className="font-bold text-gray-600 text-sm">{item.product.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-400 text-sm">Rp {item.price.toLocaleString('id-ID')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Card Footer */}
                        <div className="flex justify-between items-end">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Paid</span>
                                <span className="font-black text-xl text-[#2C2C2C]">
                                    Rp {order.totalAmount.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function StatusBadge({ status }: { status: string }) {
    let styles = 'bg-gray-100 text-gray-500 border-gray-200';
    let icon = <Clock className="h-3 w-3" />;
    let label = status.replace('_', ' ');

    switch (status) {
        case OrderStatus.COMPLETED:
            styles = 'bg-gray-100 text-gray-600 border-gray-200';
            icon = <CheckCircle className="h-3 w-3" />;
            break;
        case OrderStatus.CANCELLED:
            styles = 'bg-red-50 text-red-600 border-red-100';
            icon = <XCircle className="h-3 w-3" />;
            break;
    }

    return (
        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles}`}>
            {icon}
            {label}
        </span>
    );
}

function StoreIcon({ status }: { status: string }) {
    if (status === OrderStatus.READY) return <Utensils className="h-6 w-6 animate-bounce" />;
    if (status === OrderStatus.PROCESSING) return <ChefHat className="h-6 w-6" />;
    return <ShoppingBag className="h-6 w-6" />;
}
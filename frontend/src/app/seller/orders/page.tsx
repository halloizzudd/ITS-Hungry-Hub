'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { getImageUrl } from '@/utils/image';
import { Order, OrderStatus } from '@/types/order';
import { ChefHat, CheckCircle, AlertCircle, Archive, Eye } from 'lucide-react';

export default function SellerOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            console.log(res.data);
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000);
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (orderId: number, status: string) => {
        if (!confirm(`Change order #${orderId} status to ${status}?`)) return;
        try {
            await api.patch(`/orders/${orderId}`, { status });
            fetchOrders();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const incomingOrders = orders.filter(o => o.status === OrderStatus.WAITING_CONFIRMATION);
    const kitchenOrders = orders.filter(o => o.status === OrderStatus.PROCESSING);
    const pickupOrders = orders.filter(o => o.status === OrderStatus.READY);
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.CANCELLED);

    if (loading) return <div className="p-10 text-center text-gray-400 font-medium">Loading orders...</div>;



    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-[#2C2C2C] tracking-tight">Order Management</h1>
                <p className="text-gray-500 font-medium">Manage incoming orders and kitchen status.</p>
            </div>

            {/* 1. Incoming Orders */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-xl"><AlertCircle className="h-6 w-6" /></div>
                    <h2 className="text-xl font-bold text-[#2C2C2C]">Incoming Orders</h2>
                    <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{incomingOrders.length}</span>
                </div>

                {incomingOrders.length === 0 ? <EmptySection message="No incoming orders." /> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {incomingOrders.map(order => (
                            <OrderCard key={order.id} order={order} borderColor="border-blue-100"
                                actions={
                                    <div className="grid grid-cols-2 gap-3 mt-4">
                                        <button onClick={() => updateStatus(order.id, OrderStatus.PROCESSING)} className="py-2.5 bg-[#5C9E33] text-white rounded-xl font-bold text-sm hover:bg-[#4a8226] shadow-lg shadow-green-500/20">Accept</button>
                                        <button onClick={() => updateStatus(order.id, OrderStatus.CANCELLED)} className="py-2.5 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100">Reject</button>
                                        {order.paymentProofUrl && (
                                            <button onClick={() => setSelectedProof(order.paymentProofUrl!)} className="col-span-2 py-2 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 flex items-center justify-center gap-2"><Eye className="h-3 w-3" /> Check Payment</button>
                                        )}
                                    </div>
                                }
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 2. Kitchen */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-xl"><ChefHat className="h-6 w-6" /></div>
                    <h2 className="text-xl font-bold text-[#2C2C2C]">In Kitchen</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full">{kitchenOrders.length}</span>
                </div>
                {kitchenOrders.length === 0 ? <EmptySection message="Kitchen is clear." /> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {kitchenOrders.map(order => (
                            <OrderCard key={order.id} order={order} borderColor="border-yellow-100"
                                actions={
                                    <button onClick={() => updateStatus(order.id, OrderStatus.READY)} className="mt-4 w-full py-3 bg-yellow-400 text-yellow-900 rounded-xl font-bold text-sm hover:bg-yellow-500 shadow-lg shadow-yellow-400/20 flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4" /> Mark as Ready</button>
                                }
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 3. Ready for Pickup (NEW) */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-100 text-green-700 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
                    <h2 className="text-xl font-bold text-[#2C2C2C]">Ready for Pickup</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">{pickupOrders.length}</span>
                </div>
                {pickupOrders.length === 0 ? <EmptySection message="No orders ready for pickup." /> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {pickupOrders.map(order => (
                            <OrderCard key={order.id} order={order} borderColor="border-green-100"
                                actions={
                                    <button onClick={() => updateStatus(order.id, OrderStatus.COMPLETED)} className="mt-4 w-full py-3 bg-[#5C9E33] text-white rounded-xl font-bold text-sm hover:bg-[#4a8226] shadow-lg shadow-green-500/20 flex items-center justify-center gap-2">
                                        <CheckCircle className="h-4 w-4" /> Mark as Picked Up
                                    </button>
                                }
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 4. History */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 text-gray-600 rounded-xl"><Archive className="h-6 w-6" /></div>
                    <h2 className="text-xl font-bold text-[#2C2C2C]">Order History</h2>
                </div>
                {completedOrders.length === 0 ? <EmptySection message="No completed orders yet." /> : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {completedOrders.map(order => (
                            <OrderCard key={order.id} order={order} borderColor="border-gray-200" isHistory />
                        ))}
                    </div>
                )}
            </section>

            {/* Proof Modal */}
            {selectedProof && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-2 rounded-3xl max-w-md w-full shadow-2xl relative">
                        <button onClick={() => setSelectedProof(null)} className="absolute -top-10 right-0 text-white font-bold">Close [X]</button>
                        <img src={getImageUrl(selectedProof)} alt="Proof" className="w-full h-auto rounded-2xl object-contain" />
                    </div>
                </div>
            )}
        </div>
    );
}

function OrderCard({ order, actions, borderColor, isHistory }: any) {
    return (
        <div className={`bg-white rounded-[2rem] p-6 border ${borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-lg transition-all`}>
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order #{order.id}</span>
                    <span className="text-base font-bold text-[#2C2C2C]">{order.user?.name || 'Guest User'}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600">{order.status.replace(/_/g, ' ')}</span>
            </div>
            <div className={`space-y-3 mb-6 ${isHistory ? 'opacity-70' : ''}`}>
                {order.orderItems.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <span className="bg-white px-2 py-1 rounded-md text-xs font-bold border border-gray-200 shadow-sm">x{item.quantity}</span>
                            <span className="font-semibold text-gray-700">{item.product.name}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-end border-t border-gray-100 pt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Total</span>
                    <span className="text-xl font-black text-[#2C2C2C]">Rp {order.totalAmount.toLocaleString()}</span>
                </div>
            </div>
            {actions}
        </div>
    );
}

function EmptySection({ message }: { message: string }) {
    return <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center text-gray-400 font-medium bg-gray-50/50">{message}</div>;
}
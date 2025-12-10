'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { TrendingUp, ShoppingBag, DollarSign, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/orders');
                const orders: any[] = res.data;
                
                const totalOrders = orders.length;
                const pendingOrders = orders.filter(o => o.status === 'WAITING_CONFIRMATION' || o.status === 'PROCESSING').length;
                const totalRevenue = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

                setStats({ totalOrders, pendingOrders, totalRevenue });
            } catch (error) {
                console.error("Error fetching stats");
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-[#2C2C2C] tracking-tight">
                    Seller <span className="text-[#5C9E33]">Dashboard</span>
                </h1>
                <p className="text-gray-500 font-medium">Here's what's happening at your stall today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Revenue" 
                    value={`Rp ${stats.totalRevenue.toLocaleString('id-ID')}`} 
                    icon={DollarSign} 
                    color="green" 
                />
                <StatCard 
                    title="Active Orders" 
                    value={stats.pendingOrders.toString()} 
                    icon={Clock} 
                    color="orange" 
                    subtitle="Needs attention"
                />
                <StatCard 
                    title="Total Sales" 
                    value={stats.totalOrders.toString()} 
                    icon={ShoppingBag} 
                    color="blue" 
                />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-green-900/5 border border-white/60">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#2C2C2C]">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link href="/seller/products/create" className="group flex items-center justify-between p-6 bg-[#f8fcf8] rounded-[2rem] hover:bg-[#5C9E33] transition-all duration-300 border border-transparent hover:shadow-lg hover:shadow-green-500/30">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-white mb-1">Add New Menu</h3>
                            <p className="text-xs text-gray-400 group-hover:text-green-100 font-medium">Create a new dish</p>
                        </div>
                        <div className="bg-white p-3 rounded-full text-[#5C9E33] shadow-sm">
                            <ArrowRight size={20} />
                        </div>
                    </Link>
                    <Link href="/seller/orders" className="group flex items-center justify-between p-6 bg-[#f8fcf8] rounded-[2rem] hover:bg-orange-500 transition-all duration-300 border border-transparent hover:shadow-lg hover:shadow-orange-500/30">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-white mb-1">Manage Orders</h3>
                            <p className="text-xs text-gray-400 group-hover:text-orange-100 font-medium">Check incoming orders</p>
                        </div>
                        <div className="bg-white p-3 rounded-full text-orange-500 shadow-sm">
                            <ArrowRight size={20} />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: any) {
    const colors: any = {
        green: "bg-[#eefbf0] text-[#5C9E33]",
        orange: "bg-orange-50 text-orange-500",
        blue: "bg-blue-50 text-blue-500"
    };

    return (
        <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-transparent hover:border-gray-100 transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-4 rounded-2xl ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                {subtitle && <span className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-bold rounded-full uppercase tracking-wider">{subtitle}</span>}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <h3 className="text-3xl font-black text-[#2C2C2C]">{value}</h3>
            </div>
        </div>
    );
}
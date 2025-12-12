'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { TrendingUp, Users, ShoppingBag, DollarSign, Loader2 } from 'lucide-react';
import api from '@/lib/axios'; // Pastikan import ini ada

export default function AdminDashboard() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        revenue: 0,
        activeSellers: 0,
        totalOrders: 0,
        growth: 15 // Placeholder jika belum ada logic growth di backend
    });
    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // 1. Fetch All Users (untuk menghitung Active Sellers & Recent Registrations)
                const usersResponse = await api.get('/users');
                const users = usersResponse.data.data || usersResponse.data;
                
                // Filter Seller
                const sellers = Array.isArray(users) ? users.filter((u: any) => u.role === 'SELLER') : [];
                
                // Ambil 3 seller terbaru untuk "Recent Activities"
                const sortedSellers = [...sellers].sort((a: any, b: any) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ).slice(0, 3);

                setRecentActivities(sortedSellers);

                // 2. Fetch All Orders (untuk menghitung Revenue & Total Orders)
                const ordersResponse = await api.get('/orders'); // Pastikan admin punya akses ke endpoint ini
                const orders = ordersResponse.data.data || ordersResponse.data;
                
                const orderList = Array.isArray(orders) ? orders : [];
                const totalOrd = orderList.length;
                
                // Hitung Revenue (Sum of totalAmount)
                const totalRev = orderList.reduce((acc: number, curr: any) => acc + (Number(curr.totalAmount) || 0), 0);

                setStatsData(prev => ({
                    ...prev,
                    revenue: totalRev,
                    activeSellers: sellers.length,
                    totalOrders: totalOrd
                }));

            } catch (error) {
                console.error("Failed to fetch admin dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'ADMIN') {
            fetchDashboardData();
        }
    }, [user]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    // Mapping data state ke UI cards
    const stats = [
        { 
            title: 'Total Revenue', 
            value: loading ? '-' : formatCurrency(statsData.revenue), 
            icon: DollarSign, 
            color: 'text-green-600', 
            bg: 'bg-green-50' 
        },
        { 
            title: 'Active Sellers', 
            value: loading ? '-' : statsData.activeSellers.toString(), 
            icon: Users, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
        },
        { 
            title: 'Total Orders', 
            value: loading ? '-' : statsData.totalOrders.toString(), 
            icon: ShoppingBag, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
        },
        { 
            title: 'Growth', 
            value: `+${statsData.growth}%`, 
            icon: TrendingUp, 
            color: 'text-orange-600', 
            bg: 'bg-orange-50' 
        },
    ];

    return (
        <div className="space-y-8 w-full max-w-7xl mx-auto">
            {/* 1. Header Section */}
            <div>
                <h1 className="text-3xl font-black text-[#2C2C2C] tracking-tight">Dashboard Overview</h1>
                <p className="text-gray-400 mt-2 font-medium">
                    Welcome back, <span className="text-[#5C9E33] font-bold">{user?.name || 'Admin'}</span>! Here is the real-time data from your platform.
                </p>
            </div>

            {/* 2. Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">All Time</span>
                        </div>
                        <h3 className="text-3xl font-black text-[#2C2C2C] relative z-10">
                            {stat.value}
                        </h3>
                        <p className="text-sm text-gray-400 font-bold mt-1 relative z-10">{stat.title}</p>
                        
                        {/* Decorative Blob */}
                        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-110 transition-transform ${stat.bg.replace('bg-', 'bg-')}`}></div>
                    </div>
                ))}
            </div>

            {/* 3. Recent Activity Section (Real Data) */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-[#2C2C2C]">Recent Seller Registrations</h2>
                    <button className="text-sm font-bold text-[#5C9E33] hover:underline">View All</button>
                </div>
                
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-8 text-gray-400">
                            <Loader2 className="animate-spin" />
                        </div>
                    ) : recentActivities.length > 0 ? (
                        recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8fcf8] border border-gray-50 hover:bg-green-50/30 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-[#5C9E33] font-bold">
                                    {activity.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#2C2C2C]">New Seller Joined</p>
                                    <p className="text-xs text-gray-400">
                                        <span className="font-bold text-gray-600">{activity.name}</span> ({activity.email}) has registered.
                                    </p>
                                </div>
                                <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                                    {activity.createdAt ? formatTimeAgo(activity.createdAt) : 'Recently'}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-400 text-sm py-4">No recent activities found.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
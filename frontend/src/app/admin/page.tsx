'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { UserCheck, Activity, Store, ArrowRight, Loader2, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [pendingCount, setPendingCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/seller-profiles?status=UNVERIFIED');
                setPendingCount(res.data.length);
            } catch (error) {
                console.error('Failed to fetch admin stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5C9E33]" />
            </div>
        );
    }

    return (
        <div className="space-y-10 max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-[#2C2C2C] tracking-tight">
                    Dashboard <span className="text-[#5C9E33]">Overview</span>
                </h1>
                <p className="text-gray-500 font-medium">
                    Welcome back, Admin. Here is today's system activity summary.
                </p>
            </div>

            {/* Info Banner (Green Gradient) */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#5C9E33] to-[#86efac] p-8 text-white shadow-xl shadow-green-500/20">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Needs Attention! 🚀</h2>
                        <p className="text-green-50 text-sm md:text-base max-w-2xl leading-relaxed opacity-90">
                            There are incoming verification requests from new canteen tenants. 
                            Please review their documents to maintain platform quality.
                        </p>
                    </div>
                    {pendingCount !== null && pendingCount > 0 && (
                         <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 text-center min-w-[120px]">
                            <span className="block text-3xl font-black">{pendingCount}</span>
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Pending</span>
                         </div>
                    )}
                </div>
                {/* Decor circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 left-10 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl"></div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Pending Verifications Card */}
                <div className="group relative bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(92,158,51,0.15)] transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-100">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-orange-500 uppercase mb-2">Pending Actions</p>
                            <h3 className="text-5xl font-black text-[#2C2C2C]">
                                {pendingCount !== null ? pendingCount : '-'}
                            </h3>
                        </div>
                        <div className="p-4 bg-orange-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <UserCheck className="w-8 h-8 text-orange-500" />
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-50">
                        <Link
                            href="/admin/verifications"
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#2C2C2C] group-hover:text-orange-600 transition-colors"
                        >
                            Review Requests 
                            <div className="bg-gray-100 group-hover:bg-orange-100 p-1 rounded-full transition-colors">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* System Status */}
                <div className="group relative bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(92,158,51,0.15)] transition-all duration-300 hover:-translate-y-1 border border-transparent hover:border-green-100">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-[#5C9E33] uppercase mb-2">System Health</p>
                            <h3 className="text-2xl font-black text-[#2C2C2C] mt-1">Operational</h3>
                            <p className="text-sm text-gray-400 font-medium mt-1">All systems normal</p>
                        </div>
                        <div className="p-4 bg-[#eefbf0] rounded-2xl group-hover:scale-110 transition-transform duration-300">
                            <Activity className="w-8 h-8 text-[#5C9E33]" />
                        </div>
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
                         <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5C9E33]"></span>
                          </div>
                         <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Live Monitoring</span>
                    </div>
                </div>

                {/* Total Sellers Placeholder */}
                <div className="group relative bg-white/60 p-8 rounded-[2rem] border border-dashed border-gray-200 hover:bg-white transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <p className="text-xs font-bold tracking-widest text-blue-500 uppercase mb-2">Total Tenants</p>
                            <h3 className="text-4xl font-black text-gray-300">--</h3>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <Store className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium bg-gray-50 p-2 rounded-lg w-fit">
                        <TrendingUp size={16} />
                        Coming Soon
                    </div>
                </div>
            </div>
        </div>
    );
}
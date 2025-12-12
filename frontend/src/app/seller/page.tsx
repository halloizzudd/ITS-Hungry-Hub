'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import axios from 'axios';
import { ShoppingBag, DollarSign, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

type SellerProfile = {
    verificationStatus?: 'UNVERIFIED' | 'VERIFIED' | 'REJECTED' | string;
    rejectionReason?: string | null;
    stallName?: string;
};

type Order = {
    status?: string;
    totalAmount?: number;
};

export default function SellerDashboard() {
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        totalRevenue: 0
    });
    const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const fetchProfile = async () => {
            try {
                const res = await api.get('/seller-profiles/me');
                if (!mounted) return;
                setSellerProfile(res.data);
            } catch (err: unknown) {
                if (!mounted) return;
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 404) {
                        setProfileError('no-profile');
                    } else if (err.response?.status === 401) {
                        setProfileError('unauthorized');
                    } else {
                        setProfileError('unknown');
                        console.error('Failed to fetch seller profile', err);
                    }
                } else {
                    setProfileError('unknown');
                    console.error('Failed to fetch seller profile', err);
                }
            } finally {
                if (mounted) setProfileLoading(false);
            }
        };
        fetchProfile();
        return () => { mounted = false; };
    }, []);

    useEffect(() => {
        // Only fetch stats when seller is verified
        if (!sellerProfile || sellerProfile.verificationStatus !== 'VERIFIED') return;

        const fetchStats = async () => {
            try {
                const res = await api.get('/orders');
                const orders = res.data as Order[];

                const totalOrders = orders.length;
                const pendingOrders = orders.filter(o => o.status === 'WAITING_CONFIRMATION' || o.status === 'PROCESSING').length;
                const totalRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount ?? 0), 0);

                setStats({ totalOrders, pendingOrders, totalRevenue });
            } catch (error) {
                console.error("Error fetching stats", error);
            }
        };
        fetchStats();
    }, [sellerProfile]);

    // Conditional rendering based on seller profile / verification status
    if (profileLoading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5C9E33]"></div>
            </div>
        );
    }

    // No profile -> prompt onboarding
    if (profileError === 'no-profile') {
        return (
            <div className="max-w-3xl mx-auto py-20">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl text-center">
                    <h2 className="text-2xl font-bold mb-4">You haven&apos;t created a seller profile yet</h2>
                    <p className="text-gray-500 mb-6">Create your stall profile to start selling. Your application will be reviewed by an admin.</p>
                    <Link href="/seller/onboarding" className="inline-block bg-[#5C9E33] text-white px-6 py-3 rounded-lg font-bold">Complete Onboarding</Link>
                </div>
            </div>
        );
    }

    // If profile exists but not verified
    if (sellerProfile && sellerProfile.verificationStatus !== 'VERIFIED') {
        const status = sellerProfile.verificationStatus || 'UNVERIFIED';
        return (
            <div className="max-w-3xl mx-auto py-20">
                <div className="bg-white rounded-[2.5rem] p-10 shadow-xl text-center">
                    <h2 className="text-2xl font-bold mb-4">Your seller application is {status.toLowerCase()}</h2>
                    {status === 'REJECTED' && (
                        <p className="text-red-600 mb-4">{sellerProfile.rejectionReason || 'Your application was rejected by the admin.'}</p>
                    )}
                    {status !== 'REJECTED' && (
                        <p className="text-gray-500 mb-6">We&apos;re reviewing your application. You&apos;ll be notified when an admin approves your profile.</p>
                    )}
                    <div className="flex items-center justify-center gap-4">
                        {status === 'REJECTED' ? (
                            <Link href="/seller/onboarding" className="inline-block bg-white text-[#5C9E33] border border-green-100 px-6 py-3 rounded-lg font-bold">Edit Application</Link>
                        ) : (
                            <Link href="/seller/products" className="inline-block bg-white text-gray-600 border border-gray-100 px-6 py-3 rounded-lg font-bold">Back to Products</Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Otherwise, render the normal dashboard
    return (
        <div className="space-y-10">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-black text-[#2C2C2C] tracking-tight">
                    Seller <span className="text-[#5C9E33]">Dashboard</span>
                </h1>
                <p className="text-gray-500 font-medium">Here&apos;s what's happening at your stall today.</p>
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
                    {/* Only allow actions if verified */}
                    {sellerProfile?.verificationStatus === 'VERIFIED' ? (
                        <>
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
                        </>
                    ) : (
                        <div className="col-span-1 sm:col-span-2 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 text-center">
                            <p className="text-gray-400 font-bold mb-2">Account Verification Required</p>
                            <p className="text-sm text-gray-500 mb-4">Please complete onboarding and wait for admin approval to manage menus and orders.</p>
                            <Link href="/seller/onboarding" className="inline-block bg-[#5C9E33] text-white px-6 py-2 rounded-lg font-bold text-sm">Check Status</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string; value: string; icon: React.ComponentType<{ size?: number }>; color: 'green' | 'orange' | 'blue'; subtitle?: string }) {
    const colors: Record<string, string> = {
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
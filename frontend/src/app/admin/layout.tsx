'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';
import { LayoutDashboard, Users, LogOut, ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, logout, isInitialized } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isInitialized) {
            if (!isAuthenticated || user?.role !== 'ADMIN') {
                router.push('/login');
            }
        }
    }, [isAuthenticated, user, router, isInitialized]);

    if (!mounted || !isInitialized) return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f8fcf8]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5C9E33] border-t-transparent"></div>
                <p className="text-sm font-bold text-gray-400 animate-pulse">Loading Admin Panel...</p>
            </div>
        </div>
    );

    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return null; 
    }

    const navItems = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Seller Requests', href: '/admin/verifications', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-[#f8fcf8] flex font-sans text-[#2C2C2C] overflow-hidden">
            
            {/* --- Organic Background Shape --- */}
            <div className="absolute top-0 right-0 -z-10 w-full h-[150%] translate-x-[10%] -translate-y-[20%] opacity-60 pointer-events-none">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/5">
                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                </svg>
            </div>

            {/* Sidebar (Glassmorphism) */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-white/40 shadow-xl shadow-green-900/5 h-screen fixed z-20 flex flex-col justify-between">
                <div>
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-2 font-black text-xl tracking-tight mb-10">
                            <div className="bg-[#5C9E33] p-2 rounded-full text-white shadow-lg shadow-green-500/20">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <span>Admin <span className="text-[#5C9E33]">Panel</span></span>
                        </div>
                        
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Main Menu</p>
                        
                        <nav className="space-y-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${isActive
                                            ? 'bg-[#5C9E33] text-white shadow-lg shadow-green-500/30 translate-x-1'
                                            : 'text-gray-500 hover:bg-green-50 hover:text-[#5C9E33]'
                                            }`}
                                    >
                                        <item.icon size={18} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-gray-100 bg-white/50">
                    <div className="flex items-center gap-3 mb-4 p-2.5 rounded-2xl bg-[#f8fcf8] border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-[#eefbf0] flex items-center justify-center text-[#5C9E33] font-bold shadow-sm border border-white">
                            {user?.name?.charAt(0) || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-[#2C2C2C] truncate">{user?.name}</p>
                            <p className="text-[10px] text-gray-400 truncate uppercase tracking-wide font-bold">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            router.push('/login');
                        }}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 text-sm font-bold transition-all"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 p-8 lg:p-12 overflow-y-auto h-screen relative z-10 scrollbar-hide">
                {children}
            </main>
        </div>
    );
}
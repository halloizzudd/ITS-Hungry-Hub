'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, LogOut, Store } from 'lucide-react';

export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, logout, isInitialized } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isInitialized) {
            if (!isAuthenticated || user?.role !== 'SELLER') {
                router.push('/login');
            }
        }
    }, [isAuthenticated, user, router, isInitialized]);

    if (!mounted || !isInitialized) return (
        <div className="flex h-screen w-full items-center justify-center bg-[#f8fcf8]">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5C9E33] border-t-transparent"></div>
                <p className="text-sm font-bold text-gray-400 animate-pulse">Loading Kitchen...</p>
            </div>
        </div>
    );

    if (!isAuthenticated || user?.role !== 'SELLER') {
        return null;
    }

    const navItems = [
        { name: 'Dashboard', href: '/seller', icon: LayoutDashboard },
        { name: 'My Menu', href: '/seller/products', icon: UtensilsCrossed },
        { name: 'Orders', href: '/seller/orders', icon: ClipboardList },
    ];

    return (
        <div className="min-h-screen bg-[#f8fcf8] flex font-sans text-[#2C2C2C]">

            {/* --- Organic Background Shape --- */}
            <div className="fixed top-0 right-0 -z-10 w-full h-[150%] translate-x-[10%] -translate-y-[20%] opacity-60 pointer-events-none">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/5">
                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                </svg>
            </div>

            {/* Sidebar (Glassmorphism) */}
            <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-white/40 shadow-xl shadow-green-900/5 h-screen fixed z-20 flex flex-col justify-between transition-all hidden lg:flex">
                <div className="p-8 pb-4">
                    {/* Logo Area */}
                    <div className="flex items-center gap-2 font-black text-xl tracking-tight mb-10">
                        <div className="bg-[#5C9E33] p-2.5 rounded-full text-white shadow-lg shadow-green-500/20">
                            <Store className="h-5 w-5" />
                        </div>
                        <span>Seller <span className="text-[#5C9E33]">Panel</span></span>
                    </div>

                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 mb-4">Management</p>

                    <nav className="space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/seller' && pathname.startsWith(item.href));
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

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-gray-100 bg-white/50">
                    <div className="flex items-center gap-3 mb-4 p-2.5 rounded-2xl bg-[#f8fcf8] border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-[#eefbf0] flex items-center justify-center text-[#5C9E33] font-bold shadow-sm border border-white">
                            {user?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-sm text-[#2C2C2C] truncate">{user?.name}</p>
                            <p className="text-[10px] text-gray-400 truncate uppercase tracking-wide font-bold">Seller Account</p>
                        </div>
                    </div>
                    <button
                        onClick={() => { logout(); router.push('/login'); }}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 text-sm font-bold transition-all"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Visible on small screens) */}
            <div className="lg:hidden fixed top-0 left-0 w-full z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-2 font-black text-lg tracking-tight">
                    <div className="bg-[#5C9E33] p-1.5 rounded-full text-white">
                        <Store className="h-4 w-4" />
                    </div>
                    <span>Seller <span className="text-[#5C9E33]">Panel</span></span>
                </div>
                {/* Minimal Mobile Menu - simplified heavily */}
                <div className="flex gap-4">
                    {navItems.map(item => (
                        <Link key={item.href} href={item.href} className={`text-sm font-bold ${pathname === item.href ? 'text-[#5C9E33]' : 'text-gray-400'}`}>
                            {item.name.replace('Dashboard', 'Home')}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 p-4 lg:p-12 min-h-screen relative z-10 pt-20 lg:pt-12">
                {children}
            </main>
        </div>
    );
}
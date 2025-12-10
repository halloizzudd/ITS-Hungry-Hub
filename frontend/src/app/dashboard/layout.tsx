'use client';

import { useEffect, useState } from 'react'; // Added useState for safety
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
// Hapus import icon yang tidak lagi digunakan di sini
// import { LogOut, Utensils } from 'lucide-react'; 

export default function ConsumerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isAuthenticated, logout, isInitialized } = useAuthStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Logic perlindungan rute
        if (isInitialized) {
            if (!isAuthenticated || (user && user.role !== 'CONSUMER')) {
                router.push('/login');
            } else {
                setIsChecking(false);
            }
        }
    }, [isAuthenticated, user, router, isInitialized]);

    // Tampilkan loading state saat mengecek auth
    if (!isInitialized || isChecking) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#f8fcf8]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#5C9E33] border-t-transparent"></div>
                    <p className="text-sm font-bold text-gray-400 animate-pulse">Loading Kitchen...</p>
                </div>
            </div>
        );
    }

    // Jika user tidak valid (double check), jangan render apapun agar tidak flash content
    if (!isAuthenticated || (user && user.role !== 'CONSUMER')) {
        return null; 
    }

    // --- PERUBAHAN UTAMA ---
    // Navbar lama dihapus.
    // Kita hanya mereturn {children} agar page.tsx (Dashboard) bisa mengontrol tampilan sepenuhnya.
    // Fragment (<>...</>) digunakan agar tidak menambah div ekstra yang merusak layout flex/grid di page.tsx.
    
    return (
        <>
            {children}
        </>
    );
}
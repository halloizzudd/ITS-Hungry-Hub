'use client';

import { useState } from 'react';
import { Mail, Lock, LogIn, Loader2, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/lib/axios';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
    // --- LOGIC AREA (TIDAK DIUBAH) ---
    const router = useRouter();
    const login = useAuthStore((state: any) => state.login);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response: any = await api.post('/auth/login', { email, password });
            const { access_token } = response.data;

            login(access_token);
            const decoded: any = jwtDecode(access_token);
            const role = decoded.role;

            if (role === 'ADMIN') {
                router.push('/admin');
            } else if (role === 'SELLER') {
                router.push('/seller');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f8fcf8] p-4 font-sans relative overflow-hidden">
            
            {/* --- Organic Green Background Shape (Mirrored from Register) --- */}
            <div className="absolute top-0 left-0 -z-10 w-full h-[140%] lg:w-[60%] -translate-x-[20%] -translate-y-[10%] opacity-80 rotate-180">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/10">
                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                </svg>
            </div>

            {/* Header Content */}
            <div className="mb-8 text-center relative z-10">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-xl shadow-green-100 border border-green-50">
                    <UtensilsCrossed className="h-10 w-10 text-[#5C9E33]" />
                </div>
                <h2 className="text-4xl font-black text-[#2C2C2C] tracking-tight">Welcome Back!</h2>
                <p className="mt-2 text-gray-500 font-medium">Ready to satisfy your cravings?</p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-green-900/5 transition-all z-10 border border-white/50">
                <div className="p-8 sm:p-10">
                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C9E33] transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full rounded-2xl border-none bg-gray-50/50 py-4 pl-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#5C9E33] transition-all sm:text-sm sm:leading-6 hover:bg-white"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C9E33] transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full rounded-2xl border-none bg-gray-50/50 py-4 pl-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#5C9E33] transition-all sm:text-sm sm:leading-6 hover:bg-white"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-gray-300 text-[#5C9E33] focus:ring-[#5C9E33]"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-500">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-semibold text-[#5C9E33] hover:text-[#4a8226] hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5C9E33] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-[#4a8226] hover:shadow-xl hover:shadow-green-500/40 focus:outline-none focus:ring-2 focus:ring-[#5C9E33] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <LogIn className="h-4 w-4 opacity-70 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50/50 p-6 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-bold text-[#5C9E33] hover:text-[#4a8226] hover:underline transition-colors">
                            Register now
                        </Link>
                    </p>
                </div>
            </div>

            <p className="mt-8 text-xs text-gray-400 font-medium tracking-wide">
                © {new Date().getFullYear()} Canteen App. All rights reserved.
            </p>
        </div>
    );
}
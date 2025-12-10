'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { User, Mail, Lock, ChefHat, Utensils, ArrowRight, Loader2 } from 'lucide-react';

export default function RegisterPage() {
    // --- LOGIC AREA (TIDAK DIUBAH) ---
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (role: string) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.role) {
            setError('Please select whether you want to Eat or Sell.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await api.post('/auth/register', formData);
            router.push('/login');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // Background disamakan dengan Dashboard (Light Greenish White)
        <div className="flex min-h-screen items-center justify-center bg-[#f8fcf8] p-4 font-sans relative overflow-hidden">
            
            {/* --- Organic Green Background Shape (Sama seperti Dashboard) --- */}
            <div className="absolute top-0 right-0 -z-10 w-full h-[150%] lg:w-[60%] translate-x-[20%] -translate-y-[10%] opacity-80">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/10">
                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                </svg>
            </div>
            
            {/* Decorative Floating Icon (Green Theme) */}
            <div className="absolute top-10 left-10 opacity-20 hidden lg:block">
                <div className="bg-[#eefbf0] p-4 rounded-full">
                    <Utensils className="h-12 w-12 text-[#5C9E33]" />
                </div>
            </div>

            {/* Main Card */}
            <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl shadow-green-900/5 border border-white/50 backdrop-blur-sm z-10">
                <div className="p-8 sm:p-12">
                    <div className="mb-8 text-center">
                        <span className="inline-block px-3 py-1 mb-4 rounded-full bg-[#eefbf0] text-[#5C9E33] text-xs font-bold tracking-wider uppercase">
                            New Member
                        </span>
                        <h1 className="text-3xl font-extrabold text-[#2C2C2C] tracking-tight">
                            Join the Feast! 🥗
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            Create your account to start ordering fresh meals.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100">
                            <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse"></span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C9E33] transition-colors" />
                            </div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                className="block w-full rounded-2xl border-none bg-gray-50/50 py-4 pl-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#5C9E33] transition-all sm:text-sm sm:leading-6 hover:bg-white"
                                required
                            />
                        </div>

                        {/* Email Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C9E33] transition-colors" />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="block w-full rounded-2xl border-none bg-gray-50/50 py-4 pl-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#5C9E33] transition-all sm:text-sm sm:leading-6 hover:bg-white"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#5C9E33] transition-colors" />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className="block w-full rounded-2xl border-none bg-gray-50/50 py-4 pl-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#5C9E33] transition-all sm:text-sm sm:leading-6 hover:bg-white"
                                required
                            />
                        </div>

                        {/* Modern Role Selection (Updated Colors) */}
                        <div className="pt-2">
                            <label className="mb-3 block text-xs font-bold uppercase tracking-wider text-gray-400">
                                I want to...
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('CONSUMER')}
                                    className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all duration-300 ${formData.role === 'CONSUMER'
                                        ? 'border-[#5C9E33] bg-[#eefbf0] text-[#5C9E33] ring-1 ring-[#5C9E33] shadow-md shadow-green-100'
                                        : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600'
                                        }`}
                                >
                                    <Utensils className={`h-6 w-6 ${formData.role === 'CONSUMER' ? 'text-[#5C9E33]' : 'text-gray-300'}`} />
                                    <span className="text-sm font-bold">Eat Food</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRoleChange('SELLER')}
                                    className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all duration-300 ${formData.role === 'SELLER'
                                        ? 'border-[#5C9E33] bg-[#eefbf0] text-[#5C9E33] ring-1 ring-[#5C9E33] shadow-md shadow-green-100'
                                        : 'border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-600'
                                        }`}
                                >
                                    <ChefHat className={`h-6 w-6 ${formData.role === 'SELLER' ? 'text-[#5C9E33]' : 'text-gray-300'}`} />
                                    <span className="text-sm font-bold">Sell Food</span>
                                </button>
                            </div>
                        </div>

                        {/* Button Green Style */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-[#5C9E33] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all hover:bg-[#4a8226] hover:shadow-xl hover:shadow-green-500/40 focus:outline-none focus:ring-2 focus:ring-[#5C9E33] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-gray-50/50 p-6 text-center border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                        Already part of the family?{' '}
                        <Link href="/login" className="font-bold text-[#5C9E33] hover:text-[#4a8226] hover:underline transition-colors">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
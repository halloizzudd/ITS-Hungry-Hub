'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Check, X, MapPin, Store, User, FileText, ImageOff, Loader2, ExternalLink } from 'lucide-react';

interface SellerProfile {
    id: number;
    stallName: string;
    description: string;
    location: string;
    photoKtpUrl: string;
    photoStallUrl: string;
    qrisImageUrl: string;
    verificationStatus: string;
    userId: number;
}

export default function VerificationPage() {
    const [sellers, setSellers] = useState<SellerProfile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSellers = async () => {
        try {
            const res = await api.get('/seller-profiles?status=UNVERIFIED');
            setSellers(res.data);
        } catch (error) {
            console.error('Failed to fetch sellers', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleVerification = async (id: number, status: 'VERIFIED' | 'REJECTED') => {
        const action = status === 'VERIFIED' ? 'approve' : 'reject';
        if (!confirm(`Are you sure you want to ${action} this seller?`)) return;

        try {
            await api.patch(`/seller-profiles/${id}/verify`, { status });
            setSellers(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error(error);
            alert('Failed to update status.');
        }
    };

    const getImageUrl = (path: string) => {
        if (!path) return '';
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        return `${baseUrl}/${path}`;
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5C9E33]" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black text-[#2C2C2C] tracking-tight">Seller Verifications</h1>
                <p className="text-gray-500 font-medium">
                    Review and validate new canteen registrations before they go live.
                </p>
            </div>

            {sellers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center shadow-sm">
                    <div className="w-20 h-20 bg-[#eefbf0] rounded-full flex items-center justify-center mb-6 shadow-green-200 shadow-lg">
                        <Check className="w-10 h-10 text-[#5C9E33]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#2C2C2C]">All Caught Up!</h3>
                    <p className="text-gray-400 max-w-sm mt-2 mx-auto">
                        No pending verifications at the moment. Great job!
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                    {sellers.map((seller) => (
                        <div key={seller.id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-10px_rgba(92,158,51,0.15)] transition-all duration-300 flex flex-col border border-transparent hover:border-green-100 hover:-translate-y-1">
                            
                            {/* Card Cover Image (Stall) */}
                            <div className="relative h-56 bg-gray-100 overflow-hidden">
                                {seller.photoStallUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={getImageUrl(seller.photoStallUrl)}
                                        alt={seller.stallName}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageOff className="w-10 h-10" />
                                    </div>
                                )}
                                
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className="px-4 py-1.5 rounded-full bg-yellow-100/90 backdrop-blur-md text-yellow-700 text-[10px] font-bold uppercase tracking-widest border border-yellow-200 shadow-sm">
                                        Pending Review
                                    </span>
                                </div>

                                {/* ID Badge */}
                                <div className="absolute bottom-4 left-4">
                                     <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-bold border border-white/20">
                                        <Store className="w-3.5 h-3.5" />
                                        <span>#{seller.id}</span>
                                     </div>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-6">
                                    <h2 className="text-2xl font-black text-[#2C2C2C] line-clamp-1 group-hover:text-[#5C9E33] transition-colors mb-2">
                                        {seller.stallName}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm font-medium bg-gray-50 w-fit px-3 py-1 rounded-lg">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="line-clamp-1">{seller.location}</span>
                                    </div>
                                    <p className="mt-4 text-gray-500 text-sm line-clamp-2 leading-relaxed">
                                        {seller.description || <span className="italic text-gray-400">No description provided.</span>}
                                    </p>
                                </div>

                                {/* Documents Mini-Grid */}
                                <div className="mt-auto pt-6 border-t border-gray-50">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Legal Documents</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <DocumentThumbnail 
                                            label="KTP / ID Card" 
                                            url={getImageUrl(seller.photoKtpUrl)} 
                                            icon={<User className="w-3 h-3" />}
                                        />
                                        <DocumentThumbnail 
                                            label="QRIS / Payment" 
                                            url={getImageUrl(seller.qrisImageUrl)} 
                                            icon={<ExternalLink className="w-3 h-3" />}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="p-6 pt-2 bg-white grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleVerification(seller.id, 'REJECTED')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 font-bold text-sm transition-all hover:shadow-lg hover:shadow-red-500/10"
                                >
                                    <X className="w-4 h-4" />
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerification(seller.id, 'VERIFIED')}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#5C9E33] text-white border border-transparent rounded-xl hover:bg-[#4a8226] font-bold text-sm shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all hover:-translate-y-0.5"
                                >
                                    <Check className="w-4 h-4" />
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DocumentThumbnail({ label, url, icon }: { label: string; url: string; icon?: React.ReactNode }) {
    return (
        <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#5C9E33] hover:shadow-md hover:shadow-green-100 transition-all group/doc"
        >
            <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden shrink-0 relative border border-gray-200">
                 {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={label} className="w-full h-full object-cover group-hover/doc:scale-110 transition-transform" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center"><FileText className="w-4 h-4 text-gray-400" /></div>
                 )}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-gray-700 truncate group-hover/doc:text-[#5C9E33]">{label}</p>
                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400 group-hover/doc:text-[#5C9E33]/70">
                    {icon}
                    <span>View</span>
                </div>
            </div>
        </a>
    );
}
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { ChevronLeft, Upload, CheckCircle, Clock, CreditCard, Store } from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!id) return;

        api.get(`/orders/${id}`)
            .then((res) => {
                setOrder(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch order', err);
                alert('Failed to load order details');
                setLoading(false);
            });
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file || !id) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/orders/${id}/payment`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Payment uploaded successfully!');
            router.push('/dashboard'); // Or /history if it existed
        } catch (error) {
            console.error('Upload failed', error);
            alert('Failed to upload payment proof');
        } finally {
            setUploading(false);
        }
    };

    const getImageUrl = (url: string | null) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Ensure one slash between base URL and path
        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '';
        const cleanUrl = url.startsWith('/') ? url : `/${url}`;
        return `${baseUrl}${cleanUrl}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fcf8]">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!order) return null;

    const estimatedTime = order.estimatedReadyAt
        ? new Date(order.estimatedReadyAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Calculating...';

    return (
        <div className="min-h-screen bg-[#f8fcf8] font-sans text-[#2C2C2C] pb-10">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-white/20 px-4 py-4 shadow-sm shadow-green-900/5">
                <div className="container mx-auto max-w-md flex items-center gap-4">
                    <Link href="/dashboard" className="rounded-full p-2 bg-white shadow-sm border border-gray-100 text-gray-500 hover:text-[#5C9E33] transition-all">
                        <ChevronLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-xl font-black text-[#2C2C2C] tracking-tight">Payment</h1>
                </div>
            </div>

            <div className="container mx-auto max-w-md px-4 py-8">

                {/* Success Message */}
                <div className="bg-[#eefbf0] rounded-[2rem] p-6 text-center mb-6 border border-green-100 shadow-sm">
                    <div className="w-16 h-16 bg-[#5C9E33] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                        <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-black text-[#2C2C2C] mb-2">Order Created!</h2>
                    <p className="text-gray-500 font-medium text-sm">Please complete payment to start processing.</p>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-green-900/5 border border-white/60 mb-6">

                    {/* Queue Info */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-dashed border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 text-blue-500 rounded-xl">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Estimated Ready</p>
                                <p className="text-xl font-black text-[#2C2C2C]">{estimatedTime}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Amount */}
                    <div className="flex flex-col items-center justify-center py-4 bg-[#FAFAFA] rounded-2xl border border-gray-100 mb-6">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total to Pay</p>
                        <p className="text-3xl font-black text-[#5C9E33]">
                            Rp {order.totalAmount.toLocaleString('id-ID')}
                        </p>
                    </div>

                    {/* Seller Payment Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-[#eefbf0] p-1.5 rounded-full">
                                <Store className="h-4 w-4 text-[#5C9E33]" />
                            </div>
                            <h3 className="font-bold text-[#2C2C2C]">Payment Destination</h3>
                        </div>

                        {order.seller?.qrisImageUrl ? (
                            <div className="flex flex-col items-center p-4 border border-gray-200 rounded-2xl">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getImageUrl(order.seller.qrisImageUrl)}
                                    alt="QRIS"
                                    className="max-w-[200px] h-auto rounded-lg mb-2"
                                />
                                <p className="text-xs text-gray-400 font-bold">Scan QRIS to Pay</p>
                            </div>
                        ) : (
                            <div className="p-4 border border-gray-200 rounded-2xl bg-gray-50 text-center">
                                <p className="text-sm font-bold text-gray-500">No QRIS available.</p>
                                <p className="text-xs text-gray-400">Please pay at the cashier.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-green-900/5 border border-white/60">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-[#eefbf0] p-1.5 rounded-full">
                            <CreditCard className="h-4 w-4 text-[#5C9E33]" />
                        </div>
                        <h3 className="font-bold text-[#2C2C2C]">Upload Payment Proof</h3>
                    </div>

                    <div className="mb-6">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-[#5C9E33] transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-3 text-gray-400 group-hover:text-[#5C9E33] transition-colors" />
                                <p className="mb-2 text-sm text-gray-500 font-bold"><span className="font-extrabold text-[#2C2C2C] group-hover:text-[#5C9E33]">Click to upload</span></p>
                                <p className="text-xs text-gray-400 font-semibold">{file ? file.name : 'SVG, PNG, JPG (MAX. 800x400px)'}</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className="w-full rounded-full bg-[#5C9E33] px-8 py-4 font-bold text-white transition-all hover:bg-[#4a8226] hover:shadow-lg hover:shadow-green-500/30 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {uploading ? 'Uploading...' : 'Confirm Payment'}
                    </button>
                </div>

            </div>
        </div>
    );
}

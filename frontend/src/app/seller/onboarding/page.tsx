'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Store, MapPin, FileText, Upload, Loader2, ChefHat } from 'lucide-react';

export default function SellerOnboardingPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        stallName: '',
        description: '',
        location: '',
    });
    const [photoKtp, setPhotoKtp] = useState<File | null>(null);
    const [photoStall, setPhotoStall] = useState<File | null>(null);
    const [qrisImage, setQrisImage] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const checkVerification = async () => {
            try {
                const response = await api.get('/seller-profiles/me');
                if (response.data) {
                    router.push('/seller/products');
                }
            } catch (err) {
                setIsLoading(false);
            }
        };
        checkVerification();
    }, [router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            setter(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!photoKtp || !photoStall || !qrisImage) {
            setError('Please upload all required documents.');
            return;
        }

        const data = new FormData();
        data.append('stallName', formData.stallName);
        data.append('description', formData.description);
        data.append('location', formData.location);
        data.append('photoKtp', photoKtp);
        data.append('photoStall', photoStall);
        data.append('qrisImage', qrisImage);

        try {
            await api.post('/seller-profiles', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setMessage('Application submitted! Waiting for Admin Approval.');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit application');
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fcf8]">
                <Loader2 className="h-8 w-8 animate-spin text-[#5C9E33]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fcf8] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-[#2C2C2C]">
            {/* Background Shape */}
            <div className="absolute top-0 right-0 -z-10 w-full h-[150%] lg:w-[60%] translate-x-[20%] -translate-y-[20%]">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/5">
                    <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                </svg>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="mx-auto h-20 w-20 bg-[#eefbf0] rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-100">
                        <ChefHat className="h-10 w-10 text-[#5C9E33]" />
                    </div>
                    <h2 className="text-3xl font-black text-[#2C2C2C]">Partner with Us</h2>
                    <p className="mt-2 text-gray-500">Complete your stall profile to start selling on Hungry Hub.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-green-900/5 border border-white/60 p-8 lg:p-10 relative z-10">
                    {message ? (
                        <div className="text-center py-10">
                            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600">
                                <Store className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
                            <p className="text-green-700">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {error && (
                                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                                    {error}
                                </div>
                            )}

                            {/* Info Section */}
                            <div>
                                <h3 className="text-lg font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                                    <Store className="h-5 w-5 text-[#5C9E33]" /> Stall Information
                                </h3>
                                <div className="grid gap-6">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Stall Name</label>
                                        <input
                                            type="text"
                                            name="stallName"
                                            value={formData.stallName}
                                            onChange={handleChange}
                                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#5C9E33] focus:ring-[#5C9E33] transition-all hover:bg-white"
                                            placeholder="e.g. Kantin Bu Siti"
                                            required
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3 px-4 text-gray-900 focus:border-[#5C9E33] focus:ring-[#5C9E33] transition-all hover:bg-white"
                                            placeholder="What kind of food do you sell?"
                                            required
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                className="block w-full rounded-2xl border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-gray-900 focus:border-[#5C9E33] focus:ring-[#5C9E33] transition-all hover:bg-white"
                                                placeholder="e.g. Kantin Pusat Lt. 1"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents Section */}
                            <div>
                                <h3 className="text-lg font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-[#5C9E33]" /> Documents
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FileUploadField label="Photo KTP" onChange={(e) => handleFileChange(e, setPhotoKtp)} file={photoKtp} />
                                    <FileUploadField label="Photo Stall" onChange={(e) => handleFileChange(e, setPhotoStall)} file={photoStall} />
                                    <FileUploadField label="QRIS Image" onChange={(e) => handleFileChange(e, setQrisImage)} file={qrisImage} />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full rounded-2xl bg-[#5C9E33] px-6 py-4 text-white font-bold shadow-lg shadow-green-500/30 transition-all hover:bg-[#4a8226] hover:scale-[1.02] active:scale-95"
                            >
                                Submit Application
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

// Sub-component for file upload
function FileUploadField({ label, onChange, file }: { label: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, file: File | null }) {
    return (
        <div className="relative group">
            <label className="block w-full cursor-pointer rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center hover:border-[#5C9E33] hover:bg-[#eefbf0] transition-all">
                <div className="flex flex-col items-center gap-2">
                    <div className={`p-3 rounded-full ${file ? 'bg-green-100 text-[#5C9E33]' : 'bg-gray-200 text-gray-500'} transition-colors`}>
                        <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-500 group-hover:text-[#5C9E33]">
                        {file ? file.name : label}
                    </span>
                </div>
                <input type="file" accept="image/*" onChange={onChange} className="hidden" />
            </label>
        </div>
    );
}
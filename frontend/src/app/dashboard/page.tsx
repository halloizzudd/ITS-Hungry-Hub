'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import { getImageUrl } from '@/utils/image';
import { Clock, Plus, ShoppingCart, Search, Star, Utensils, X, ChevronRight, Filter, User, Bell, LogOut, ChevronDown, UserCircle } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore'; // Import Auth
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string | null;
    category: string;
    prepTime: number;
    sellerId: number;
    stallName?: string;
    images?: { url: string }[];
}

const CATEGORIES = ["All", "Food", "Drink", "Snack"];

// --- Main Component ---
export default function ConsumerDashboard() {
    // --- AUTH & ROUTER ---
    const { user, logout } = useAuthStore();
    console.log(user)
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false); // State untuk dropdown profil

    // --- LOGIC AREA ---
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [userName, setUserName] = useState<string>(''); // Local state for user name to ensure it displays even if store is empty

    const { addToCart, getTotalItems } = useCartStore();
    const cartItemCount = getTotalItems();

    // Close dropdown when clicking outside
    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                // Backend now returns { data: [], meta: {} }
                const productList = response.data.data || response.data;
                console.log('Dashboard products:', productList);
                setProducts(productList);
                setFilteredProducts(productList);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                if (response.data && response.data.name) {
                    setUserName(response.data.name);
                }
            } catch (error) {
                console.error('Failed to fetch profile', error);
            }
        };

        fetchProducts();
        fetchProfile();
    }, []);

    useEffect(() => {
        let result = products;
        if (selectedCategory !== "All") {
            result = result.filter(p => p.category === selectedCategory);
        }
        if (searchQuery) {
            result = result.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        setFilteredProducts(result);
    }, [selectedCategory, searchQuery, products]);

    const handleAddToCart = (product: Product) => {
        addToCart({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            sellerId: product.sellerId,
            image: product.imageUrl || product.images?.[0]?.url
        });
    };

    // --- SKELETON UI ---
    const ProductSkeleton = () => (
        <div className="relative mt-20 flex flex-col items-center rounded-[2.5rem] bg-white p-6 pb-8 shadow-sm border border-gray-100">
            <div className="absolute -top-12 h-36 w-36 rounded-full bg-gray-100 animate-pulse border-8 border-white"></div>
            <div className="mt-20 h-6 w-3/4 rounded bg-gray-100 animate-pulse"></div>
            <div className="mt-3 h-3 w-1/2 rounded bg-gray-100 animate-pulse"></div>
            <div className="mt-8 flex w-full justify-between items-center px-2">
                <div className="h-6 w-20 rounded bg-gray-100"></div>
                <div className="h-10 w-10 rounded-full bg-gray-100"></div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col bg-[#f8fcf8] font-sans text-[#2C2C2C] overflow-x-hidden">

            {/* --- 1. NAVBAR (UPDATED PROFILE DISPLAY) --- */}
            <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-white/80 backdrop-blur-xl transition-all shadow-sm shadow-green-900/5">
                <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
                    {/* Logo Area */}
                    <Link href="/dashboard" className="flex items-center gap-2 font-black text-2xl tracking-tight group">
                        <div className="bg-[#5C9E33] p-2.5 rounded-full text-white shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                            <Utensils className="h-5 w-5" />
                        </div>
                        <span>ITS <span className="text-[#5C9E33]">Hungry Hub</span></span>
                    </Link>

                    {/* Center Navigation */}
                    <nav className="hidden lg:flex items-center gap-1 p-1 bg-gray-100/50 rounded-full border border-gray-200/50">
                        <Link href="/dashboard" className="px-6 py-2 rounded-full bg-white text-[#5C9E33] font-bold text-sm shadow-sm transition-all">
                            Menu
                        </Link>
                        <Link href="/orders" className="px-6 py-2 rounded-full text-gray-400 font-bold text-sm hover:text-[#5C9E33] hover:bg-white/50 transition-all">
                            Orders
                        </Link>
                        <Link href="/history" className="px-6 py-2 rounded-full text-gray-400 font-bold text-sm hover:text-[#5C9E33] hover:bg-white/50 transition-all">
                            History
                        </Link>
                    </nav>

                    {/* User Profile Area (With Dropdown) */}
                    <div className="flex items-center gap-4">
                        <button className="hidden sm:flex p-2.5 rounded-full text-gray-400 hover:bg-green-50 hover:text-[#5C9E33] transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
                        </button>

                        {/* Profile Dropdown Container */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group ${isProfileOpen ? 'ring-2 ring-green-100' : ''}`}
                            >
                                <div className="h-9 w-9 rounded-full bg-[#eefbf0] border border-green-100 flex items-center justify-center text-[#5C9E33] group-hover:bg-[#5C9E33] group-hover:text-white transition-colors">
                                    <User size={18} />
                                </div>
                                <div className="hidden md:flex flex-col items-start mr-1 text-left">
                                    {/* UPDATED: Menggunakan "Hi," dan Nama Asli */}
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hi,</span>
                                    <span className="text-sm font-bold text-[#2C2C2C] leading-none truncate max-w-[150px]">
                                        {userName || user?.name || 'Guest'}
                                    </span>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-3 w-60 origin-top-right rounded-2xl bg-white shadow-xl shadow-green-900/10 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                                    {/* User Info Header */}
                                    <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-sm font-bold text-gray-900 truncate">{userName || user?.name || 'Guest User'}</p>
                                        <p className="text-xs text-gray-500 truncate font-medium">{user?.email || 'No Email'}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="p-1.5 space-y-0.5">
                                        <button className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-[#5C9E33] transition-colors">
                                            <UserCircle size={18} />
                                            My Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* --- 2. HERO SECTION --- */}
            <main className="flex-1 pt-20 pb-32">
                <div className="relative w-full overflow-hidden pt-12 pb-16 lg:pt-20">

                    {/* Organic Background Shape */}
                    <div className="absolute top-0 right-0 -z-10 w-full h-[120%] lg:w-[60%] lg:h-[150%] translate-x-[20%] lg:translate-x-0 -translate-y-[20%]">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/10">
                            <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-6 lg:px-12">
                        <div className="flex flex-col lg:flex-row items-center gap-12">
                            {/* Left: Text & Search */}
                            <div className="flex-1 w-full max-w-2xl text-center lg:text-left z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#eefbf0] border border-[#bbf7d0] text-[#5C9E33] font-bold text-xs uppercase tracking-widest shadow-sm">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                    </span>
                                    Order & Pickup
                                </div>

                                <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-[#2C2C2C] leading-[1.15] mb-6">
                                    Hungry? <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C9E33] to-[#86efac]">
                                        Grab a Bite!
                                    </span> 🍔
                                </h1>

                                <p className="text-gray-500 text-lg mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                                    Browse the best menus from campus canteens. Fresh, fast, and friendly to your wallet.
                                </p>

                                {/* Search Bar (Elevated Pill Style) */}
                                <div className="relative group max-w-lg mx-auto lg:mx-0 shadow-2xl shadow-green-900/10 rounded-full bg-white flex items-center border border-gray-100 hover:border-[#5C9E33]/30 transition-all p-2">
                                    <div className="pl-4 pr-3 text-gray-400">
                                        <Search size={24} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Find nasi goreng, drinks..."
                                        className="flex-1 bg-transparent py-3 outline-none text-gray-700 placeholder-gray-400 font-medium text-base lg:text-lg"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                                            <X size={20} />
                                        </button>
                                    )}
                                    <button className="bg-[#5C9E33] hover:bg-[#4a8226] text-white rounded-full py-3 px-8 transition-all duration-300 font-bold text-sm shadow-lg shadow-green-500/30 hover:shadow-green-500/50">
                                        Search
                                    </button>
                                </div>
                            </div>

                            {/* Right: Decorative Image */}
                            <div className="hidden lg:flex flex-1 justify-end relative">
                                <div className="relative w-[400px] h-[400px]">
                                    <img
                                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80"
                                        alt="Dashboard Hero"
                                        className="w-full h-full object-cover rounded-full shadow-2xl shadow-green-900/10 border-8 border-white animate-[spin_60s_linear_infinite]"
                                    />
                                    {/* Floating Decorations */}
                                    <div className="absolute top-0 left-10 bg-white p-3 rounded-2xl shadow-lg animate-bounce" style={{ animationDuration: '3s' }}>
                                        <span className="text-2xl">🌮</span>
                                    </div>
                                    <div className="absolute bottom-10 right-0 bg-white p-3 rounded-2xl shadow-lg animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                                        <span className="text-2xl">🥤</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- 3. MENU SECTION --- */}
                <div className="container mx-auto px-6 lg:px-12">

                    {/* Category Filter */}
                    <div className="sticky top-24 z-30 py-4 -mx-6 px-6 lg:mx-0 lg:px-0 bg-[#f8fcf8]/95 backdrop-blur-sm lg:static lg:bg-transparent lg:backdrop-blur-none mb-8">
                        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white shadow-sm border border-gray-100 flex-shrink-0 text-gray-400">
                                <Filter size={18} />
                            </div>
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 border flex-shrink-0 ${selectedCategory === cat
                                        ? 'bg-[#5C9E33] text-white border-[#5C9E33] shadow-lg shadow-green-500/30 transform scale-105'
                                        : 'bg-white text-gray-500 border-gray-100 hover:border-[#5C9E33] hover:text-[#5C9E33] shadow-sm hover:shadow-md'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="grid gap-x-8 gap-y-28 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-12">
                            {[1, 2, 3, 4].map((n) => <ProductSkeleton key={n} />)}
                        </div>
                    ) : (
                        <div className="grid gap-x-8 gap-y-28 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pt-12">
                            {filteredProducts.map((product) => (
                                <div
                                    key={product.id}
                                    className="group relative flex flex-col bg-white rounded-[2.5rem] p-6 pt-24 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(92,158,51,0.2)] transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-green-50"
                                >
                                    {/* Floating Image */}
                                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-44 h-44">
                                        <div className="w-full h-full rounded-full border-[8px] border-[#f8fcf8] shadow-xl overflow-hidden relative z-10 bg-white group-hover:scale-105 transition-transform duration-500 ease-out">
                                            {getImageUrl(product.imageUrl || product.images?.[0]?.url) ? (
                                                <img
                                                    src={getImageUrl(product.imageUrl || product.images?.[0]?.url)}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-gray-50 text-gray-300">
                                                    <Utensils className="h-12 w-12" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Prep Time Badge */}
                                        <div className="absolute bottom-2 -right-0 bg-white rounded-full py-1.5 px-3 shadow-md z-20 border border-gray-50 flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-[#5C9E33]" />
                                            <span className="text-[11px] font-bold text-gray-700">{product.prepTime}m</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="text-center flex-grow mt-4">
                                        <div className="flex justify-center gap-1 mb-3 opacity-60">
                                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />)}
                                        </div>

                                        <h3 className="text-xl font-black text-[#2C2C2C] mb-2 line-clamp-1 group-hover:text-[#5C9E33] transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-5 h-10 px-2 font-medium">
                                            {product.description || 'Delicious meal prepared with fresh ingredients.'}
                                        </p>

                                        <span className="inline-block px-3 py-1 rounded-lg bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100">
                                            {product.stallName || 'Canteen Stall'}
                                        </span>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between mt-6 border-t border-gray-50 pt-5">
                                        <div className="flex flex-col items-start">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Price</span>
                                            <span className="text-lg font-black text-[#2C2C2C]">
                                                Rp{product.price.toLocaleString('id-ID').replace(/,00/, '')}
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            className="bg-[#2C2C2C] hover:bg-[#5C9E33] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-gray-200 hover:shadow-green-500/40 transition-all duration-300 hover:rotate-90 hover:scale-110 active:scale-90"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && filteredProducts.length === 0 && (
                        <div className="mt-20 flex flex-col items-center justify-center text-center py-20 px-4 rounded-[3rem] border border-dashed border-gray-200 bg-white/50">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-green-100 rounded-full blur-xl opacity-50"></div>
                                <div className="relative bg-white p-6 rounded-full shadow-sm border border-green-50">
                                    <Search className="h-10 w-10 text-[#5C9E33]" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#2C2C2C] mb-2">Oops, No Results</h3>
                            <p className="text-gray-400 max-w-sm mx-auto mb-8 font-medium">
                                We couldn't find exactly what you're looking for. Maybe try searching for "Chicken" or "Coffee"?
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                className="px-10 py-4 rounded-full bg-[#2C2C2C] text-white font-bold hover:bg-black transition-all shadow-xl hover:-translate-y-1"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </main>

            {/* --- 5. FLOATING CART --- */}
            {cartItemCount > 0 && (
                <div className="fixed bottom-10 right-6 lg:right-12 z-50">
                    <Link href="/cart">
                        <button className="relative group flex items-center bg-[#2C2C2C] hover:bg-[#1a1a1a] text-white rounded-full p-2 pr-8 shadow-2xl shadow-green-900/30 transition-all hover:scale-105 active:scale-95 border-2 border-white/10 backdrop-blur-md">
                            <div className="bg-[#5C9E33] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                                <ShoppingCart size={24} className="fill-white/20" />
                                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full border-[3px] border-[#2C2C2C]">
                                    {cartItemCount}
                                </div>
                            </div>
                            <div className="ml-4 text-left">
                                <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-0.5">My Cart</span>
                                <span className="block text-base font-bold leading-none text-white">Checkout Now</span>
                            </div>
                            <ChevronRight className="absolute right-3 text-gray-600 group-hover:text-white transition-colors" size={20} />
                        </button>
                    </Link>
                </div>
            )}
        </div>
    );
}
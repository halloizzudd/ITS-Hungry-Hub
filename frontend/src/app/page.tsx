import Link from 'next/link';
import { Utensils, Clock, UserCheck, ChefHat, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fcf8] font-sans text-[#2C2C2C] overflow-x-hidden">
      
      {/* --- Navbar (Glass Effect) --- */}
      <header className="fixed top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl transition-all">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tight">
            <div className="bg-[#5C9E33] p-2 rounded-full text-white">
              <Utensils className="h-5 w-5" />
            </div>
            <span>ITS <span className="text-[#5C9E33]">Hungry Hub</span></span>
          </div>
          <nav className="flex items-center gap-6">
            <Link
              href="/login"
              className="hidden sm:block text-sm font-bold text-gray-500 hover:text-[#5C9E33] transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#5C9E33] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-green-500/30 hover:bg-[#4a8226] hover:shadow-green-500/40 transition-all hover:-translate-y-0.5"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pt-20">
        
        {/* --- Hero Section --- */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40">
          {/* Background Shape (Organic Blob) */}
          <div className="absolute top-0 right-0 -z-10 w-full h-[120%] lg:w-[60%] lg:h-[150%] translate-x-[20%] lg:translate-x-0 -translate-y-[20%]">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full fill-[#5C9E33]/10">
              <path d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,71.2,32.7C60.2,43.9,49.5,53.4,37.6,60.8C25.7,68.2,12.6,73.5,-1.2,75.6C-15,77.7,-30,76.6,-43.3,70.5C-56.6,64.4,-68.2,53.3,-76.4,39.8C-84.6,26.3,-89.4,10.4,-86.3,-3.9C-83.2,-18.2,-72.2,-30.9,-61.1,-41.2C-50,-51.5,-38.8,-59.4,-27,-68.2C-15.2,-77,-2.8,-86.7,11.5,-86.3C25.8,-85.9,51.6,-75.4,44.7,-76.4Z" transform="translate(100 100) scale(1.1)" />
            </svg>
          </div>

          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              
              {/* Left Content */}
              <div className="flex-1 text-center lg:text-left z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-[#eefbf0] border border-[#bbf7d0] text-[#5C9E33] font-bold text-xs uppercase tracking-widest shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  No. 1 Campus Food App
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-[#2C2C2C] leading-[1.1]">
                  Good Food, <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5C9E33] to-[#86efac]">
                    Good Mood
                  </span>
                </h1>
                
                <p className="mt-6 text-lg text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Skip the long lines at the canteen. Order your favorite meals online, 
                  grab them fresh, and fuel your study sessions.
                </p>
                
                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/dashboard"
                    className="group flex items-center justify-center gap-2 rounded-full bg-[#5C9E33] px-8 py-4 text-base font-bold text-white shadow-xl shadow-green-500/30 transition-all hover:bg-[#4a8226] hover:scale-105 active:scale-95"
                  >
                    Order Now
                    <div className="bg-white/20 rounded-full p-1 group-hover:translate-x-1 transition-transform">
                        <ArrowRight size={16} />
                    </div>
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-gray-600 shadow-md border border-gray-100 transition-all hover:bg-gray-50 hover:text-[#5C9E33]"
                  >
                    Partner with Us
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="mt-12 flex items-center justify-center lg:justify-start gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex -space-x-3">
                        {[1,2,3,4].map(i => (
                             <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                        ))}
                    </div>
                    <div className="text-sm font-semibold text-gray-500">
                        <span className="text-[#5C9E33] font-bold">1k+</span> Students Fed
                    </div>
                </div>
              </div>

              {/* Right Image (Floating Plate Animation) */}
              <div className="flex-1 relative flex justify-center lg:justify-end">
                <div className="relative w-[300px] h-[300px] lg:w-[550px] lg:h-[550px]">
                    {/* Main Dish */}
                    <img 
                        src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80" 
                        alt="Hero Food" 
                        className="w-full h-full object-cover rounded-full shadow-2xl shadow-green-900/20 border-8 border-white z-10 relative animate-[spin_60s_linear_infinite]" 
                    />
                    
                    {/* Floating Elements (Decorations) */}
                    <div className="absolute top-10 left-0 lg:-left-10 bg-white p-3 rounded-2xl shadow-xl animate-bounce z-20" style={{ animationDuration: '3s' }}>
                        <span className="text-2xl">🥗</span>
                    </div>
                    <div className="absolute bottom-20 right-0 lg:-right-4 bg-white p-3 rounded-2xl shadow-xl animate-bounce z-20" style={{ animationDuration: '4s', animationDelay: '1s' }}>
                        <span className="text-2xl">🍔</span>
                    </div>
                    
                    {/* Circle Pattern Behind */}
                    <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#5C9E33]/30 scale-125 animate-[spin_40s_linear_infinite_reverse] -z-10"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Features Section (Cards) --- */}
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-[#5C9E33] font-bold tracking-widest uppercase text-sm mb-3">Why Choose Us</h2>
                <h3 className="text-3xl lg:text-4xl font-extrabold text-[#2C2C2C]">
                    More Than Just Food Delivery
                </h3>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group rounded-[2.5rem] bg-[#f8fcf8] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/10 border border-transparent hover:border-green-100">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md text-[#5C9E33] group-hover:scale-110 transition-transform duration-300">
                  <Utensils className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#2C2C2C]">Diverse Canteen Menus</h3>
                <p className="text-gray-500 leading-relaxed">
                  Explore a wide variety of food options from all your favorite campus canteens in one single app.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-[2.5rem] bg-[#f8fcf8] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/10 border border-transparent hover:border-green-100">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md text-orange-500 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#2C2C2C]">Skip The Queue</h3>
                <p className="text-gray-500 leading-relaxed">
                  Order ahead and pick up your food when it's ready. No more wasting break time standing in line.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-[2.5rem] bg-[#f8fcf8] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-900/10 border border-transparent hover:border-green-100">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-md text-blue-500 group-hover:scale-110 transition-transform duration-300">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-[#2C2C2C]">Easy & Secure</h3>
                <p className="text-gray-500 leading-relaxed">
                  Simple registration for students and canteen tenants. Secure transactions and reliable service.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- Simple CTA Section --- */}
        <section className="py-20">
            <div className="container mx-auto px-6">
                <div className="rounded-[3rem] bg-[#5C9E33] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-green-600/30">
                     {/* Decorative Circles */}
                    <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl lg:text-5xl font-black text-white mb-6">
                            Ready to Eat?
                        </h2>
                        <p className="text-green-100 text-lg mb-10 max-w-xl mx-auto">
                            Join thousands of students enjoying their meals hassle-free.
                        </p>
                        <Link
                            href="/register"
                            className="inline-block rounded-full bg-white px-10 py-4 text-lg font-bold text-[#5C9E33] shadow-lg transition-transform hover:scale-105 active:scale-95"
                        >
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* --- Footer --- */}
      <footer className="bg-white py-12 border-t border-gray-100">
        <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 font-bold text-xl text-[#2C2C2C] mb-4">
                <div className="bg-gray-100 p-2 rounded-full">
                    <Utensils className="h-5 w-5 text-[#5C9E33]" />
                </div>
                <span>ITS Hungry Hub</span>
            </div>
            <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} ITS Hungry Hub. Made with 🥗 for students.
            </p>
        </div>
      </footer>
    </div>
  );
}
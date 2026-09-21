import React, { useEffect, useState } from 'react';
import {
  Building2,
  Phone,
  MapPin,
  Wifi,
  Video,
  Shirt,
  ArrowUpCircle,
  Snowflake,
  Refrigerator,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  LayoutDashboard,
  UtensilsCrossed,
  Layers
} from 'lucide-react';
import { User, MenuItem } from '../types';
import { getPublicRooms, getMenu } from '../api';

interface HomePageProps {
  currentUser: User | null;
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ currentUser, onNavigate }) => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);

  useEffect(() => {
    getPublicRooms()
      .then((data) => setRooms(data))
      .catch((err) => console.error('Error fetching rooms:', err))
      .finally(() => setLoadingRooms(false));

    getMenu()
      .then((data) => setMenu(data))
      .catch((err) => console.error('Error fetching menu:', err));
  }, []);

  const totalRooms = rooms.length;
  const totalBeds = rooms.reduce((acc, r) => acc + (r.totalBeds || 0), 0);
  const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupiedBeds || 0), 0);
  const availableBeds = rooms.reduce((acc, r) => acc + (r.availableBeds || 0), 0);

  const facilities = [
    { name: 'CCTV Camera Security', icon: Video, desc: '24/7 continuous surveillance on all corridors and common areas.' },
    { name: 'High-Speed Wi-Fi', icon: Wifi, desc: 'Dedicated high-speed fiber internet for seamless work & study.' },
    { name: 'Washing Machine', icon: Shirt, desc: 'Fully automatic laundry machines provided for all residents.' },
    { name: 'Elevator / Lift', icon: ArrowUpCircle, desc: 'Modern reliable elevator servicing all 8 residential floors.' },
    { name: 'Refrigerator', icon: Refrigerator, desc: 'Spacious food storage refrigerators in dining and common spaces.' },
    { name: 'Freezer in Every Room', icon: Snowflake, desc: 'Personal freezer and cooling convenience in each room.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hero Section - Clean, modern, bright theme (No black color) */}
      <section className="relative bg-gradient-to-b from-sky-50/70 via-indigo-50/30 to-slate-50 text-slate-900 overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-100 border border-cyan-200 text-cyan-800 text-xs font-semibold uppercase tracking-wider mb-6">
            <Building2 className="w-4 h-4 text-cyan-700" />
            Premium Men&apos;s Living in Hyderabad
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 mb-4">
            TLNR MEN&apos;S PG
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-6">
            Modern, hygienic, and fully managed accommodation located at{' '}
            <strong className="text-slate-900 font-semibold">KPHB Road Number 3</strong>.
          </p>

          {/* Quick Contact Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm text-slate-700 mb-8">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
              <MapPin className="w-4 h-4 text-cyan-700" />
              <span>KPHB Road Number 3</span>
            </div>
            <a
              href="tel:9908522152"
              title="Click to Call Owner"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-800 hover:text-emerald-700 shadow-xs transition-colors cursor-pointer group"
            >
              <Phone className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>Call Owner: 9908522152 / 9133699944</span>
            </a>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {/* Dedicated Call Owner Button */}
            <a
              id="hero-call-owner-btn"
              href="tel:9908522152"
              title="Call Owner Directly"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Phone className="w-5 h-5 text-white animate-pulse" />
              <span>Call Owner (+91 9908522152)</span>
            </a>

            {currentUser ? (
              <button
                id="hero-go-to-dashboard-btn"
                onClick={() =>
                  onNavigate(currentUser.role === 'HOST' ? 'host-dashboard' : 'resident-dashboard')
                }
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Go to Dashboard</span>
              </button>
            ) : (
              <>
                <button
                  id="hero-resident-login-btn"
                  onClick={() => onNavigate('resident-login')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
                >
                  <UserCheck className="w-5 h-5 text-indigo-200" />
                  <span>Resident Portal Login</span>
                </button>
                <button
                  id="hero-host-login-btn"
                  onClick={() => onNavigate('host-login')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-xl border border-slate-300 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <ShieldCheck className="w-5 h-5 text-cyan-700" />
                  <span>Host Management Access</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Realtime Live Room Status Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-700" />
                Live Hostel Room & Bed Availability
              </h2>
              <p className="text-xs text-slate-500">
                Real-time occupancy synchronization across all 8 floors (Rooms 101 to 802).
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                {availableBeds} Beds Available Now
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">Total Rooms</span>
              <span className="text-2xl font-black text-slate-900">{totalRooms || 37}</span>
              <span className="text-[11px] text-slate-500 block">Floors 1 to 8</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">Total Beds</span>
              <span className="text-2xl font-black text-slate-900">{totalBeds}</span>
              <span className="text-[11px] text-slate-500 block">Configured Capacity</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <span className="text-xs text-slate-500 font-medium block">Occupied Beds</span>
              <span className="text-2xl font-black text-slate-900">{occupiedBeds}</span>
              <span className="text-[11px] text-slate-500 block">Current Residents</span>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
              <span className="text-xs text-emerald-700 font-medium block">Available Beds</span>
              <span className="text-2xl font-black text-emerald-950">{availableBeds}</span>
              <span className="text-[11px] text-emerald-700 block">Ready for check-in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Amenities & Comfort
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Hostel Facilities
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Every convenience designed to make living comfortable, secure, and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facilities.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.name}
                className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-100 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{f.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Weekly Menu Section - Monday to Sunday Cards with CSS (Requirement update) */}
      <section className="bg-slate-50/50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Food & Nutrition
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Weekly Meal Menu (Monday to Sunday)
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Freshly prepared, hygienic, South & North Indian style 3-time meal schedule served daily.
            </p>
          </div>

          {/* Monday to Sunday Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((dayName) => {
              const dayMenu = menu.find((m) => m.day.toLowerCase() === dayName.toLowerCase());
              const todayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date());
              const isToday = dayName.toLowerCase() === todayName.toLowerCase();

              return (
                <div
                  key={dayName}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs hover:shadow-lg flex flex-col overflow-hidden ${
                    isToday ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div
                    className={`px-5 py-3.5 border-b flex items-center justify-between ${
                      isToday ? 'bg-indigo-50/90 border-indigo-100' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UtensilsCrossed className="w-4 h-4 text-indigo-600" />
                      <span className="font-bold text-sm text-slate-900 tracking-wide">
                        {dayName}
                      </span>
                    </div>
                    {isToday ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 bg-indigo-600 text-white rounded-full shadow-xs">
                        Today
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200/70 text-slate-700 rounded-md">
                        3 Meals
                      </span>
                    )}
                  </div>

                  {/* Card Meals Body */}
                  <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                    {/* Tiffin */}
                    <div className="bg-amber-50/70 border border-amber-200/70 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wide mb-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center text-[10px]">🍽</span>
                        <span>Breakfast / Tiffin</span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium space-y-0.5 pl-5">
                        {dayMenu?.tiffin?.length ? (
                          dayMenu.tiffin.map((f, i) => (
                            <p key={i} className="leading-relaxed">• {f}</p>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">Fresh breakfast & tea</p>
                        )}
                      </div>
                    </div>

                    {/* Lunch */}
                    <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px]">🍛</span>
                        <span>Lunch</span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium space-y-0.5 pl-5">
                        {dayMenu?.lunch?.length ? (
                          dayMenu.lunch.map((f, i) => (
                            <p key={i} className="leading-relaxed">• {f}</p>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">Rice, Dal & Curries</p>
                        )}
                      </div>
                    </div>

                    {/* Dinner */}
                    <div className="bg-indigo-50/70 border border-indigo-200/70 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-800 uppercase tracking-wide mb-1.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[10px]">🌙</span>
                        <span>Dinner</span>
                      </div>
                      <div className="text-xs text-slate-700 font-medium space-y-0.5 pl-5">
                        {dayMenu?.dinner?.length ? (
                          dayMenu.dinner.map((f, i) => (
                            <p key={i} className="leading-relaxed">• {f}</p>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">Roti, Rice & Curry</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer / Hostel Details Reference */}
      <footer className="bg-slate-100 text-slate-600 py-12 px-4 sm:px-6 lg:px-8 text-sm border-t border-slate-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-slate-900 font-black text-lg tracking-tight">TLNR MEN&apos;S PG</h4>
            <p className="text-xs text-slate-500 mt-1">KPHB Road Number 3, Hyderabad</p>
            <p className="text-xs text-slate-600 mt-0.5">Owner Contacts: 9908522152 / 9133699944</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              id="footer-call-owner-btn"
              href="tel:9908522152"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Owner</span>
            </a>
            <button
              onClick={() => onNavigate('resident-login')}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 transition-colors shadow-xs"
            >
              Resident Login
            </button>
            <button
              onClick={() => onNavigate('host-login')}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Host Login
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} TLNR MEN&apos;S PG. All rights reserved. Cloud Database & Realtime Synchronization Active.
        </div>
      </footer>
    </div>
  );
};

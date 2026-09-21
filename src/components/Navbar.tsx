import React, { useState } from 'react';
import { Building2, Phone, MapPin, UserCheck, Shield, LogOut, Menu as MenuIcon, X, LayoutDashboard } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentView,
  onNavigate,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Derive Resident avatar e.g. "EL | Elisha"
  const getAvatarText = (name: string) => {
    if (!name) return 'PG';
    const clean = name.trim().toUpperCase();
    const initials = clean.length >= 2 ? clean.substring(0, 2) : clean.substring(0, 1);
    return `${initials} | ${name.trim()}`;
  };

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (!currentUser) return;
    if (currentUser.role === 'HOST') {
      handleNav('host-dashboard');
    } else {
      handleNav('resident-dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro contact bar */}
      <div className="bg-slate-100 text-slate-700 border-b border-slate-200 text-xs px-4 py-1.5 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-700" />
            KPHB Road Number 3, Hyderabad
          </span>
          <span className="text-slate-300">|</span>
          <a
            href="tel:9908522152"
            title="Click to Call Owner"
            className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            Call Owner: 9908522152
          </a>
          <span className="text-slate-300">/</span>
          <a
            href="tel:9133699944"
            title="Click to Call Secondary Number"
            className="font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            9133699944
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] text-emerald-700 font-semibold uppercase">Cloud Sync Active</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => handleNav('home')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-700 text-white flex items-center justify-center shadow-md group-hover:bg-cyan-800 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                TLNR MEN&apos;S PG
              </span>
              <span className="text-[11px] font-semibold text-cyan-700 tracking-wider uppercase block">
                KPHB Road Number 3
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => handleNav('home')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                currentView === 'home' ? 'text-slate-950 font-semibold bg-slate-100' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('home')}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Facilities
            </button>
            <button
              onClick={() => handleNav('home')}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Rooms
            </button>
          </nav>

          {/* Auth & Call Owner Controls on Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {/* Direct Call Owner Button */}
            <a
              id="nav-call-owner-btn"
              href="tel:9908522152"
              title="Call Owner (+91 9908522152)"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-sm font-bold rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Call Owner</span>
            </a>

            {currentUser ? (
              <div className="flex items-center gap-3">
                {/* Profile Badge: e.g. "EL | Elisha" */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {currentUser.role === 'HOST' ? 'OW' : currentUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span>
                    {currentUser.role === 'HOST' ? 'Owner (Host)' : getAvatarText(currentUser.name)}
                  </span>
                </div>

                {/* Clearly visible "Go to Dashboard" button (Requirement 13) */}
                <button
                  id="nav-go-to-dashboard-btn"
                  onClick={handleDashboardClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </button>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  title="Logout"
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-resident-login-btn"
                  onClick={() => handleNav('resident-login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold rounded-xl transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-slate-600" />
                  <span>Resident Login</span>
                </button>

                <button
                  id="nav-host-login-btn"
                  onClick={() => handleNav('host-login')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Shield className="w-4 h-4 text-cyan-200" />
                  <span>Host Login</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile buttons: Quick Call + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <a
              id="mobile-header-call-btn"
              href="tel:9908522152"
              title="Call Owner (+91 9908522152)"
              className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 rounded-lg flex items-center gap-1 text-xs font-bold transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Call Owner</span>
            </a>

            {currentUser && (
              <button
                onClick={handleDashboardClick}
                className="p-2 text-indigo-600 font-semibold text-xs flex items-center gap-1 bg-indigo-50 rounded-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2">
          <div className="text-xs text-slate-500 py-1 flex flex-col gap-1 border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-cyan-700" /> KPHB Road Number 3
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Phone className="w-3.5 h-3.5 text-cyan-700" /> 9908522152 / 9133699944
            </span>
          </div>

          {/* Quick Call Owner Action in Mobile Menu */}
          <a
            id="mobile-menu-call-owner-btn"
            href="tel:9908522152"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            <Phone className="w-4 h-4 text-white" />
            <span>Call Owner (+91 9908522152)</span>
          </a>

          <div className="space-y-1">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 rounded-lg"
            >
              Home
            </button>
          </div>

          {currentUser ? (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700">
                Logged in as:{' '}
                <span className="text-slate-950 font-bold">
                  {currentUser.role === 'HOST' ? 'Owner (Host)' : getAvatarText(currentUser.name)}
                </span>
              </div>

              <button
                onClick={handleDashboardClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl shadow-xs"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Go to Dashboard</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <button
                onClick={() => handleNav('resident-login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-xl"
              >
                <UserCheck className="w-4 h-4" />
                <span>Resident Login</span>
              </button>

              <button
                onClick={() => handleNav('host-login')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-700 hover:bg-cyan-800 text-white text-sm font-semibold rounded-xl shadow-xs"
              >
                <Shield className="w-4 h-4 text-white" />
                <span>Host Login</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from './types';
import { getCurrentUser, logoutUser } from './api';
import { Navbar } from './components/Navbar';
import { OfflineBanner } from './components/OfflineBanner';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HomePage } from './pages/HomePage';
import { ResidentLoginPage } from './pages/ResidentLoginPage';
import { ResidentRegisterPage } from './pages/ResidentRegisterPage';
import { ResidentForgotPasswordPage } from './pages/ResidentForgotPasswordPage';
import { HostLoginPage } from './pages/HostLoginPage';
import { HostForgotPasswordPage } from './pages/HostForgotPasswordPage';
import { ResidentDashboard } from './pages/ResidentDashboard';
import { HostDashboard } from './pages/HostDashboard';
import { FloatingCallButton } from './components/FloatingCallButton';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('home');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Toast notification state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (user) {
          setCurrentUser(user);
          if (user.role === 'HOST') {
            setCurrentView('host-dashboard');
          } else if (user.role === 'RESIDENT') {
            setCurrentView('resident-dashboard');
          }
        }
      })
      .catch(() => {
        // No active session; remain on public view
      })
      .finally(() => {
        setLoadingInitial(false);
      });
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'HOST') {
      setCurrentView('host-dashboard');
      showToast('Welcome to Host Administration Portal', 'success');
    } else {
      setCurrentView('resident-dashboard');
      showToast(`Welcome back, ${user.name.split(' ')[0]}!`, 'success');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error('Logout error:', e);
    }
    setCurrentUser(null);
    setCurrentView('home');
    showToast('Logged out successfully', 'info');
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Offline Connectivity Banner (Requirement 31) */}
      <OfflineBanner />

      {/* Top Main Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        currentView={currentView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Dynamic View Rendering */}
      <div className="flex-1">
        {currentView === 'home' && (
          <HomePage
            currentUser={currentUser}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'resident-login' && (
          <ResidentLoginPage
            onSuccess={handleLoginSuccess}
            onNavigateRegister={() => handleNavigate('resident-register')}
            onNavigateForgotPassword={() => handleNavigate('resident-forgot-password')}
            onBackHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'resident-register' && (
          <ResidentRegisterPage
            onSuccessNavigateLogin={() => {
              showToast('✓ Registration complete. Please login with your credentials.', 'success');
              handleNavigate('resident-login');
            }}
            onNavigateLogin={() => handleNavigate('resident-login')}
            onBackHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'resident-forgot-password' && (
          <ResidentForgotPasswordPage
            onNavigateLogin={() => handleNavigate('resident-login')}
            onBackHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'host-login' && (
          <HostLoginPage
            onSuccess={handleLoginSuccess}
            onNavigateForgotPassword={() => handleNavigate('host-forgot-password')}
            onBackHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'host-forgot-password' && (
          <HostForgotPasswordPage
            onNavigateLogin={() => handleNavigate('host-login')}
            onBackHome={() => handleNavigate('home')}
          />
        )}

        {currentView === 'resident-dashboard' && (
          <ResidentDashboard
            onLogout={handleLogout}
            onShowToast={showToast}
          />
        )}

        {currentView === 'host-dashboard' && (
          <HostDashboard
            onLogout={handleLogout}
            onShowToast={showToast}
          />
        )}
      </div>

      {/* Floating Call Owner Quick Action (for public & resident views) */}
      {currentView !== 'host-dashboard' && (
        <FloatingCallButton onShowToast={showToast} />
      )}

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}


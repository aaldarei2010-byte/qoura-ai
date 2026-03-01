'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin_auth');
    if (auth) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Test authentication by making a request to the admin API
      const credentials = btoa(`admin:${password}`);
      const response = await fetch('/api/admin/leads?size=1', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (response.ok) {
        sessionStorage.setItem('admin_auth', credentials);
        setIsAuthenticated(true);
      } else {
        setError('كلمة المرور غير صحيحة / Invalid password');
      }
    } catch (err) {
      setError('حدث خطأ / An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-black/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-black mb-2">
                لوحة التحكم / Admin Dashboard
              </h1>
              <p className="text-gray-600">
                أدخل كلمة المرور للوصول / Enter password to access
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <Input
                  id="password"
                  type="password"
                  label="كلمة المرور / Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
              >
                {isSubmitting ? 'جارٍ التحقق...' : 'دخول / Login'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-black text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">Qoura AI</span>
            <span className="text-white/60">|</span>
            <span className="text-white/80">لوحة التحكم</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10
                      hover:bg-white/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">خروج / Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}

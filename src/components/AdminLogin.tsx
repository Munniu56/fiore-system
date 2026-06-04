/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, User, ShieldAlert, Flower, Eye, EyeOff } from 'lucide-react';
import brandLogoHeader from '../assets/images/logo_white_bg_1780554592404.png';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const storedAdminPassword = localStorage.getItem('fiore_admin_password') || '123456';

    if (username === 'admin' && password === storedAdminPassword) {
      onLoginSuccess();
    } else {
      setErrorMsg('Sai tên đăng nhập hoặc mật khẩu quản trị');
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8 mt-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-amber-200/60 bg-white p-8 shadow-md">
        
        {/* Header Visual */}
        <div className="text-center flex flex-col items-center">
          <img 
            src={brandLogoHeader} 
            alt="Fióre Boutique de Fleurs logo" 
            className="mx-auto h-24 w-auto object-contain mb-4 animate-fade-in"
            referrerPolicy="no-referrer"
          />
          <h2 className="mt-2 font-serif text-2xl font-bold tracking-tight text-emerald-950">
            Đăng nhập Quản trị viên
          </h2>
          <p className="mt-1.5 text-xs text-stone-500">
            Vui lòng xác thực tài khoản để truy cập hệ thống quản trị Fióre
          </p>
        </div>

        {/* LoginForm */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          
          {errorMsg && (
            <div className="rounded-lg bg-red-50 p-3.5 text-red-700 border border-red-100 flex items-center space-x-2 text-xs font-semibold animate-pulse">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Tên đăng nhập
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-700">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  className="w-full rounded-lg border border-amber-200 bg-neutral-50/50 py-2.5 pl-10 pr-4 text-xs font-medium outline-none transition focus:border-emerald-700 focus:bg-white"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-700">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-lg border border-amber-200 bg-neutral-50/50 py-2.5 pl-10 pr-10 text-xs font-medium outline-none transition focus:border-emerald-700 focus:bg-white"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-emerald-700 cursor-pointer"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>



          <div className="pt-2">
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg bg-emerald-800 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 cursor-pointer shadow-xs"
            >
              Đăng nhập
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

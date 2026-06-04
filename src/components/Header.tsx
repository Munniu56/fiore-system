/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Flower, Search, ShoppingBag, User, Settings, ShoppingCart, LogOut, CheckCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  currentUser: UserType | null;
  currentRole: 'customer' | 'admin';
  cartCount: number;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  onSwitchRole: (role: 'customer' | 'admin') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentView: string;
}

export default function Header({
  currentUser,
  currentRole,
  cartCount,
  onNavigate,
  onLogout,
  onSwitchRole,
  searchQuery,
  onSearchChange,
  currentView,
}: HeaderProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-pink-100 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo - Fiore */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex cursor-pointer items-center transition hover:opacity-85"
          id="logo-brand"
        >
          <img 
            src="/src/assets/images/brand_logo_luxury_1780395269921.png" 
            alt="Fióre Boutique de Fleurs" 
            className="h-12 w-auto object-contain sm:h-14 md:h-16"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Realtime Search Bar (Only shown for customer storefront view types) */}
        <div className="hidden max-w-md flex-1 px-8 md:block">
          {currentRole === 'customer' && (currentView === 'home' || currentView === 'catalog') ? (
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentView !== 'catalog') {
                    onNavigate('catalog');
                  }
                }}
                placeholder="Tìm tên hoa, từ khóa..."
                className="w-full rounded-full border border-pink-100 bg-pink-50/50 py-2 pl-10 pr-4 text-sm text-gray-700 placeholder-pink-300 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-1 focus:ring-rose-400"
                id="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-pink-400 hover:text-pink-600"
                >
                  ✕
                </button>
              )}
            </div>
          ) : (
            <div className="h-9"></div>
          )}
        </div>

        {/* Actions panel */}
        <div className="flex items-center space-x-4">
          
          {/* Quick Shortcuts */}
          <nav className="hidden space-x-1 lg:flex text-sm font-medium">
            <button
              onClick={() => onNavigate('home')}
              className={`rounded-md px-3 py-2 transition ${
                currentView === 'home' 
                  ? 'text-rose-600 font-semibold bg-pink-50' 
                  : 'text-gray-600 hover:text-rose-500 hover:bg-neutral-50'
              }`}
            >
              Trang Chủ
            </button>
            <button
              onClick={() => {
                onSearchChange('');
                onNavigate('catalog');
              }}
              className={`rounded-md px-3 py-2 transition ${
                currentView === 'catalog' 
                  ? 'text-rose-600 font-semibold bg-pink-50' 
                  : 'text-gray-600 hover:text-rose-500 hover:bg-neutral-50'
              }`}
            >
              Danh Mục Hoa
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`rounded-md px-3 py-2 transition ${
                currentView === 'about'
                  ? 'text-rose-600 font-semibold bg-pink-50'
                  : 'text-gray-600 hover:text-rose-500 hover:bg-neutral-50'
              }`}
            >
              Về Chúng Tôi
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className={`rounded-md px-3 py-2 transition ${
                currentView === 'contact'
                  ? 'text-rose-600 font-semibold bg-pink-50'
                  : 'text-gray-600 hover:text-rose-500 hover:bg-neutral-50'
              }`}
            >
              Liên Hệ
            </button>
            {currentUser && (
              <button
                onClick={() => onNavigate('orders')}
                className={`rounded-md px-3 py-2 transition ${
                  currentView === 'orders' 
                    ? 'text-rose-600 font-semibold bg-pink-50' 
                    : 'text-gray-600 hover:text-rose-500 hover:bg-neutral-50'
                }`}
              >
                Đơn Hàng Của Tôi
              </button>
            )}
          </nav>

          {/* Role Demarcation Switcher hidden but preserved functionality if needed internally */}

          {/* Cart Icon Bar */}
          {currentRole === 'customer' && (
            <button
              onClick={() => onNavigate('cart')}
              className="relative rounded-full p-2 text-rose-500 ring-offset-2 transition hover:bg-pink-50 hover:text-rose-600 cursor-pointer"
              aria-label="Xem giỏ hàng"
              id="cart-button"
            >
              <ShoppingBag className="h-5.5 w-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Profile Info Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-1 rounded-full p-1.5 transition hover:bg-pink-50 cursor-pointer"
              id="user-menu-button"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-rose-600">
                <User className="h-5 w-5" />
              </div>
              <span className="hidden text-xs font-medium text-gray-700 sm:block max-w-[80px] truncate">
                {currentUser ? currentUser.name : 'Đăng nhập'}
              </span>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-lg border border-pink-100 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                {currentUser ? (
                  <>
                    <div className="border-b border-pink-50 px-4 py-2.5">
                      <p className="text-xs text-gray-400">Tài khoản</p>
                      <p className="truncate text-sm font-semibold text-gray-800">{currentUser.name}</p>
                      <p className="truncate text-xs text-gray-500">{currentUser.email}</p>
                      {currentUser.isAdmin && (
                        <span className="mt-1 inline-flex items-center rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                          QUẢN TRỊ VIÊN
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('orders');
                      }}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-rose-600 transition"
                    >
                      <ShoppingBag className="mr-2 h-4 w-4 text-pink-400" />
                      Đơn hàng của tôi
                    </button>
                    {currentUser.isAdmin && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onSwitchRole('admin');
                          onNavigate('admin');
                        }}
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-pink-50 hover:text-rose-600 transition"
                      >
                        <Settings className="mr-2 h-4 w-4 text-pink-400" />
                        Quản trị hệ thống
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="flex w-full items-center border-t border-pink-50 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50/50 transition"
                    >
                      <LogOut className="mr-2 h-4 w-4 text-red-400" />
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <div className="p-3 text-center">
                    <p className="mb-2 text-xs text-gray-500">Đặt hoa nhanh chóng & theo dõi tiến độ</p>
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onNavigate('auth');
                      }}
                      className="w-full rounded-md bg-rose-600 py-1.5 text-center text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 cursor-pointer"
                    >
                      Đăng Nhập / Đăng Ký
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile search bar block */}
      <div className="px-4 pb-3 md:hidden">
        {currentRole === 'customer' && (currentView === 'home' || currentView === 'catalog') && (
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300">
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentView !== 'catalog') {
                  onNavigate('catalog');
                }
              }}
              placeholder="Tìm tên hoa hoặc từ khóa..."
              className="w-full rounded-full border border-pink-100 bg-pink-50/50 py-1.5 pl-10 pr-4 text-sm text-gray-700 placeholder-pink-300 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-1 focus:ring-rose-400"
            />
          </div>
        )}
      </div>
    </header>
  );
}

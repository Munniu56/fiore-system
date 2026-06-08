/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Mail, User, Phone, MapPin, KeyRound, ShieldAlert, CheckCircle, Save, Eye, EyeOff, X } from 'lucide-react';
import { User as UserType } from '../types';
import brandLogoHeader from '../assets/images/logo_white_bg_1780554592404.png';

interface AccountAuthProps {
  currentUser: UserType | null;
  onLogin: (user: UserType) => void;
  onLogout: () => void;
  onUpdateProfile: (updated: UserType) => void;
  onNavigate: (view: string) => void;
}

export default function AccountAuth({
  currentUser,
  onLogin,
  onLogout,
  onUpdateProfile,
  onNavigate,
}: AccountAuthProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Profile editing fields for logged-in user
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phone || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');

  // Admin bypass password states
  const [showAdminBypassPrompt, setShowAdminBypassPrompt] = useState(false);
  const [adminBypassPasswordInput, setAdminBypassPasswordInput] = useState('');
  const [showBypassPassword, setShowBypassPassword] = useState(false);
  const [adminBypassError, setAdminBypassError] = useState<string | null>(null);

  // Forgot Password feature states
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Enter phone, 2: Enter code & new password
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [simulatedSMS, setSimulatedSMS] = useState<{ phone: string; code: string } | null>(null);

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleSendForgotCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim()) {
      triggerNotification('error', 'Vui lòng cung cấp số điện thoại đã đăng ký.');
      return;
    }

    const savedAccountsStr = localStorage.getItem('fiore_accounts') || '[]';
    let savedAccounts: Array<{ email: string; pass: string; user: UserType }> = JSON.parse(savedAccountsStr);

    const cleanForgotPhone = forgotPhone.trim().replace(/[\s.-]/g, '');

    // List of all known predefined system, sample, and bypass users
    const systemUsers: UserType[] = [
      {
        id: 'usr-admin',
        email: 'admin@fiore.vn',
        name: 'Nghệ Nhân Fiore Admin',
        phone: '0988666333',
        address: '15 Lý Tự Trọng, Quận 1, TP. HCM',
        isAdmin: true,
      },
      {
        id: 'usr-demo',
        email: 'demo@fiore.vn',
        name: 'Lan Anh (Khách hàng mẫu)',
        phone: '0901234567',
        address: '124 Điện Biên Phủ, Quận Bình Thạnh, TP. HCM',
        isAdmin: false,
      },
      {
        id: 'usr-customer',
        email: 'vananh@gmail.com',
        name: 'Vân Anh (Khách VIP)',
        phone: '0933555222',
        address: '88 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM',
        isAdmin: false,
      },
      {
        id: 'usr-0916044683',
        email: 'khachhang0916044683@fiore.vn',
        name: 'Lan Vy (Khách mẫu 0916044683)',
        phone: '0916044683',
        address: '124 Điện Biên Phủ, Quận Bình Thạnh, TP. HCM',
        isAdmin: false,
      }
    ];

    // Read additional registered users from fiore_users
    const savedUsersStr = localStorage.getItem('fiore_users') || '[]';
    const savedUsers: UserType[] = JSON.parse(savedUsersStr);

    // Merge system users with other registered users to form full database lookup
    const allKnownUsers = [...systemUsers];
    savedUsers.forEach((usr) => {
      const dbPhone = (usr.phone || '').trim().replace(/[\s.-]/g, '');
      if (dbPhone && !allKnownUsers.some((x) => (x.phone || '').trim().replace(/[\s.-]/g, '') === dbPhone)) {
        allKnownUsers.push(usr);
      }
    });

    // Match input phone with any registered users
    const matchedKnownUser = allKnownUsers.find((usr) => {
      const uPhone = (usr.phone || '').trim().replace(/[\s.-]/g, '');
      return uPhone === cleanForgotPhone && uPhone !== '';
    });

    // If matching registered user is located but does not have a credentials profile, seed them automatically
    if (matchedKnownUser) {
      const existsInAccounts = savedAccounts.some((acc) => {
        const accPhone = (acc.user.phone || '').trim().replace(/[\s.-]/g, '');
        return accPhone === cleanForgotPhone;
      });

      if (!existsInAccounts) {
        savedAccounts.push({
          email: matchedKnownUser.email,
          pass: matchedKnownUser.isAdmin ? 'admin123' : 'customer123',
          user: matchedKnownUser,
        });
        localStorage.setItem('fiore_accounts', JSON.stringify(savedAccounts));
      }
    }

    const matchedAcc = savedAccounts.find(acc => {
      const cleanAccPhone = (acc.user.phone || '').trim().replace(/[\s.-]/g, '');
      return cleanAccPhone === cleanForgotPhone && cleanAccPhone !== '';
    });

    if (matchedAcc) {
      // Generate secure random 6-digit number
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(code);
      setSimulatedSMS({ phone: forgotPhone.trim(), code });
      setForgotStep(2);
      triggerNotification('success', 'Mã xác nhận bảo mật đã được gửi tới số điện thoại của bạn.');
    } else {
      triggerNotification('error', 'Số điện thoại này chưa được đăng ký trên hệ thống. Quý khách vui lòng kiểm tra lại.');
    }
  };

  const handleVerifyAndResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotCode !== generatedCode) {
      triggerNotification('error', 'Mã xác nhận không đúng. Vui lòng kiểm tra lại.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      triggerNotification('error', 'Mật khẩu mới phải chứa ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      triggerNotification('error', 'Mật khẩu xác nhận không chính xác.');
      return;
    }

    const savedAccountsStr = localStorage.getItem('fiore_accounts') || '[]';
    const savedAccounts: Array<{ email: string; pass: string; user: UserType }> = JSON.parse(savedAccountsStr);

    const cleanForgotPhone = forgotPhone.trim().replace(/[\s.-]/g, '');
    const updatedAccounts = savedAccounts.map((acc) => {
      const cleanAccPhone = (acc.user.phone || '').trim().replace(/[\s.-]/g, '');
      if (cleanAccPhone === cleanForgotPhone) {
        return {
          ...acc,
          pass: newPassword, // Update the password and keep existing items unchanged
        };
      }
      return acc;
    });

    localStorage.setItem('fiore_accounts', JSON.stringify(updatedAccounts));

    // Retrieve updated account to automatically log in the customer
    const found = updatedAccounts.find(acc => {
      const cleanAccPhone = (acc.user.phone || '').trim().replace(/[\s.-]/g, '');
      return cleanAccPhone === cleanForgotPhone;
    });

    if (found) {
      onLogin(found.user);
      triggerNotification('success', `Đổi mật khẩu thành công! Chào mừng Quý khách ${found.user.name} trở lại.`);
      // Clear out states
      setIsForgotPasswordMode(false);
      setForgotStep(1);
      setForgotPhone('');
      setForgotCode('');
      setGeneratedCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSimulatedSMS(null);
      onNavigate('home');
    } else {
      triggerNotification('error', 'Đã xảy ra lỗi khi tìm tài khoản cập nhật.');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      triggerNotification('error', 'Vui lòng cung cấp đầy đủ email và mật khẩu.');
      return;
    }

    const savedAccountsStr = localStorage.getItem('fiore_accounts') || '[]';
    const savedAccounts: Array<{ email: string; pass: string; user: UserType }> = JSON.parse(savedAccountsStr);

    if (isLoginMode) {
      // Find account
      const found = savedAccounts.find(
        (acc) => acc.email.toLowerCase() === email.trim().toLowerCase() && acc.pass === password
      );

      if (found) {
        onLogin(found.user);
        triggerNotification('success', `Đăng nhập thành công! Chào mừng ${found.user.name}.`);
        onNavigate('home');
      } else if (email.trim() === 'admin@fiore.vn' && password === 'admin123') {
        const adminUser: UserType = {
          id: 'usr-admin',
          email: 'admin@fiore.vn',
          name: 'Nghệ Nhân Fiore Admin',
          phone: '0988666333',
          address: '15 Lý Tự Trọng, Quận 1, TP. HCM',
          isAdmin: true,
        };
        onLogin(adminUser);
        triggerNotification('success', 'Đăng nhập vai trò Admin thành công!');
        onNavigate('admin');
      } else if (email.trim() === 'demo@fiore.vn' && password === 'customer123') {
        const customerUser: UserType = {
          id: 'usr-demo',
          email: 'demo@fiore.vn',
          name: 'Lan Anh (Khách hàng mẫu)',
          phone: '0901234567',
          address: '124 Điện Biên Phủ, Quận Bình Thạnh, TP. HCM',
          isAdmin: false,
        };
        onLogin(customerUser);
        triggerNotification('success', 'Đăng nhập thành công!');
        onNavigate('home');
      } else {
        triggerNotification('error', 'Sai email hoặc mật khẩu. Quý khách vui lòng thử lại hoặc nhấn nút bypass đăng nhập nhanh.');
      }
    } else {
      // Register logic
      if (!name.trim()) {
        triggerNotification('error', 'Vui lòng điền họ tên.');
        return;
      }

      const emailExists = savedAccounts.some((acc) => acc.email.toLowerCase() === email.trim().toLowerCase());
      if (emailExists || email.trim() === 'admin@fiore.vn' || email.trim() === 'demo@fiore.vn') {
        triggerNotification('error', 'Email này đã đăng ký trên hệ thống!');
        return;
      }

      // Create new account
      const newUser: UserType = {
        id: `usr-${Date.now()}`,
        email: email.trim(),
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        isAdmin: false,
      };

      savedAccounts.push({
        email: email.trim(),
        pass: password,
        user: newUser,
      });

      localStorage.setItem('fiore_accounts', JSON.stringify(savedAccounts));
      onLogin(newUser);
      triggerNotification('success', 'Đăng ký tài khoản thành công! Đã tự động đăng nhập.');
      onNavigate('home');
    }
  };

  // Preset accounts bypass helpers
  const handleQuickBypass = (role: 'admin' | 'customer') => {
    if (role === 'admin') {
      setShowAdminBypassPrompt(true);
      setAdminBypassPasswordInput('');
      setAdminBypassError(null);
    } else {
      const customerUser: UserType = {
        id: 'usr-customer',
        email: 'vananh@gmail.com',
        name: 'Vân Anh (Khách VIP)',
        phone: '0933555222',
        address: '88 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. HCM',
        isAdmin: false,
      };
      onLogin(customerUser);
      triggerNotification('success', 'Bypass vai trò khách hàng thường thành công!');
      onNavigate('home');
    }
  };

  const handleAdminBypassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminBypassError(null);
    const savedAdminPassword = localStorage.getItem('fiore_admin_password') || '123456';

    if (adminBypassPasswordInput === savedAdminPassword) {
      const adminUser: UserType = {
        id: 'usr-admin',
        email: 'admin@fiore.vn',
        name: 'Nghệ Nhân Fiore Admin',
        phone: '0988666333',
        address: '15 Lý Tự Trọng, Quận 1, TP. HCM',
        isAdmin: true,
      };
      onLogin(adminUser);
      triggerNotification('success', '⚡ Đăng nhập vai trò Sếp Admin thành công!');
      setShowAdminBypassPrompt(false);
      setAdminBypassPasswordInput('');
      onNavigate('admin');
    } else {
      setAdminBypassError('Mật khẩu Sếp Admin không khớp với cấu hình hệ thống!');
    }
  };

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!editName.trim()) {
      triggerNotification('error', 'Họ tên không tồn tại khoảng trắng trống.');
      return;
    }

    const updatedUser: UserType = {
      ...currentUser,
      name: editName.trim(),
      phone: editPhone.trim(),
      address: editAddress.trim(),
    };

    onUpdateProfile(updatedUser);
    triggerNotification('success', 'Đã cập nhật dữ liệu tài khoản thành công!');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Alert toast info */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-xl px-5 py-3.5 text-white shadow-xl ${
          notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-500'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <ShieldAlert className="h-5 w-5 shrink-0" />}
          <span className="text-sm font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Simulated Phone SMS notification tray */}
      {simulatedSMS && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-11/12 max-w-md rounded-2xl bg-neutral-900/95 text-white p-4 shadow-[0_15px_40px_rgba(0,0,0,0.35)] border border-white/10 backdrop-blur-md flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-800 border border-white/5 shadow-inner">
            <Phone className="h-5 w-5 text-rose-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">TIN NHẮN ĐIỆN THOẠI SMS</span>
              <span className="text-[9px] text-stone-400">Vừa xong</span>
            </div>
            <p className="text-xs font-bold text-white mt-1">Fióre Boutique Florist</p>
            <p className="text-xs text-stone-300 mt-0.5 leading-snug">
              Mã khôi phục mật khẩu tài khoản Fióre của bạn là: <strong className="text-yellow-300 text-sm tracking-widest bg-stone-800 px-2 py-0.5 rounded border border-white/5 font-mono font-extrabold">{simulatedSMS.code}</strong>. Quý khách vui lòng nhập mã này vào khung xác minh.
            </p>
          </div>
          <button
            onClick={() => setSimulatedSMS(null)}
            className="text-stone-400 hover:text-white font-bold text-xs p-1 cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {currentUser ? (
        
        /* Tab 1: Logged In Account Dashboard / profile updater */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Welcome Widget */}
          <div className="lg:col-span-4 rounded-2xl border border-pink-100 bg-white p-6 shadow-xs text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-rose-500 font-serif text-2xl font-bold">
              {currentUser.name.charAt(0)}
            </div>
            <h2 className="mt-4 font-serif text-xl font-bold text-gray-900">{currentUser.name}</h2>
            <p className="text-xs text-gray-500 mt-1">{currentUser.email}</p>

            <div className="mt-6 space-y-2.5">
              {currentUser.isAdmin ? (
                <span className="block rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
                  Vai trò: Quản Trị Viên cao cấp
                </span>
              ) : (
                <span className="block rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  Vai trò: Thành Viên Thân Thiết
                </span>
              )}
            </div>

            <div className="mt-6 border-t border-pink-50 pt-5">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-wider text-left mb-2 flex items-center justify-between">
                <span>Đồng bộ Google Workspace</span>
              </h4>
              {localStorage.getItem('fiore_gmail_access_token') ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-left">
                  <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Đã kích hoạt đồng bộ Gmail!</span>
                  </div>
                  <p className="text-[9.5px] text-emerald-600 mt-1 leading-normal">
                    Hóa đơn mua hoa sẽ tự động được gửi về Gmail của bạn sau khi thanh toán thành công.
                  </p>
                </div>
              ) : (
                <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-3 text-left">
                  <p className="text-[9.5px] text-gray-500 leading-normal mb-2">
                    Nhận ngay hóa đơn điện tử & trạng thái chuẩn bị hoa trực tiếp qua Gmail bằng cách tích hợp tài khoản.
                  </p>
                  <button
                    onClick={() => {
                      if (currentUser.isAdmin) {
                        onNavigate('admin');
                      } else {
                        // Let admin connect it, show a friendly status info
                        alert("Hệ thống gửi email tự động đang chờ Quản trị viên kết nối tài khoản gửi thư Google Gmail. Khi Admin kết nối, đơn hàng của bạn sẽ tự động gửi đi!");
                      }
                    }}
                    className="w-full rounded-lg bg-rose-600 text-white py-1.5 text-center text-[10px] font-bold shadow-xs hover:bg-rose-700 transition cursor-pointer"
                  >
                    {currentUser.isAdmin ? "🔗 Kết nối Gmail của Tiệm" : "ℹ️ Xem chi tiết đồng bộ"}
                  </button>
                </div>
              )}
            </div>

            <div className="mt-6 border-t border-pink-50 pt-5">
              <button
                onClick={onLogout}
                className="w-full rounded-full border border-red-100 bg-white py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition cursor-pointer"
              >
                Đăng xuất tài khoản
              </button>
            </div>
          </div>

          {/* Edit Profile Information form */}
          <div className="lg:col-span-8 rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-gray-900 border-b border-pink-50 pb-3 mb-6">
              Quản Lý Thông Tin Cá Nhân
            </h3>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Họ và tên</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 px-4 py-2 text-sm outline-none focus:border-rose-300 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Số điện thoại</label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 px-4 py-2 text-sm outline-none focus:border-rose-300 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Địa chỉ giao hàng mặc định</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 px-4 py-2 text-sm outline-none focus:border-rose-300 focus:bg-white"
                />
              </div>

              <div className="border-t border-pink-50 pt-5 flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Cập nhật thay đổi
                </button>
              </div>
            </form>
          </div>

        </div>

      ) : isForgotPasswordMode ? (

        /* --- FORGOT PASSWORD WORKFLOW SCENARIO --- */
        <div className="mx-auto max-w-md rounded-3xl border border-pink-100 bg-white p-6 shadow-md sm:p-8 flex flex-col items-center animate-fade-in w-full">
          
          <img 
            src={brandLogoHeader} 
            alt="Fióre Boutique de Fleurs logo" 
            className="h-24 w-auto object-contain mb-6"
            referrerPolicy="no-referrer"
          />
          
          <div className="text-center mb-6 w-full">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              Khôi Phục Mật Khẩu
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-medium">
              {forgotStep === 1 
                ? 'Gửi mã khôi phục tài khoản vào số điện thoại đã đăng ký' 
                : 'Nhập mã xác minh & thiết lập mật khẩu mới'}
            </p>
          </div>

          {forgotStep === 1 ? (
            <form onSubmit={handleSendForgotCode} className="space-y-4 w-full">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-rose-400" />
                  <span>Số điện thoại đăng ký</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300">
                    <Phone className="h-4 w-4" />
                  </span>
                  <input
                    type="tel"
                    required
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value)}
                    placeholder="Nhập số điện thoại (ví dụ: 093...)"
                    className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-rose-400 focus:bg-white transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer"
              >
                Nhận Mã Khôi Phục
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyAndResetPassword} className="space-y-4 w-full">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-left mb-1.5">
                <p className="text-[10.5px] text-amber-800 leading-normal font-medium">
                  Hệ thống đã gửi một tin nhắn chứa mã bảo mật đến số điện thoại <strong>{forgotPhone}</strong>. Vui lòng kiểm tra và nhập mã dưới đây.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                  <KeyRound className="h-3 w-3 text-rose-400" />
                  <span>Mã khôi phục tài khoản</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={forgotCode}
                    onChange={(e) => setForgotCode(e.target.value)}
                    placeholder="Nhập mã 6 chữ số..."
                    className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2.5 pl-10 pr-4 text-xs outline-none focus:border-rose-400 focus:bg-white transition font-mono tracking-widest font-extrabold text-center text-gray-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-rose-400" />
                  <span>Mật khẩu mới</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự..."
                    className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2.5 pl-10 pr-10 text-xs outline-none focus:border-rose-400 focus:bg-white transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-rose-600 cursor-pointer outline-none"
                  >
                    {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 flex items-center gap-1">
                  <Lock className="h-3 w-3 text-rose-400" />
                  <span>Xác nhận mật khẩu mới</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    type={showForgotNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu..."
                    className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2.5 pl-10 pr-10 text-xs outline-none focus:border-rose-400 focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForgotStep(1)}
                  className="flex-1 rounded-full border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-500 hover:bg-neutral-50 transition cursor-pointer text-center"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer"
                >
                  Cập Nhật Mật Khẩu
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 w-full border-t border-pink-50 pt-4 text-center">
            <button
              onClick={() => {
                setIsForgotPasswordMode(false);
                setForgotStep(1);
                setForgotPhone('');
                setForgotCode('');
                setGeneratedCode('');
                setNewPassword('');
                setConfirmNewPassword('');
                setSimulatedSMS(null);
              }}
              className="text-xs text-rose-500 hover:underline hover:text-rose-600 transition font-bold cursor-pointer"
            >
              Quay lại Đăng Nhập
            </button>
          </div>

        </div>

      ) : (

        /* Tab 2: Standard authentication flow with preset bypasses */
        <div className="mx-auto max-w-md rounded-3xl border border-pink-100 bg-white p-6 shadow-md sm:p-8 flex flex-col items-center animate-fade-in">
          
          <img 
            src={brandLogoHeader} 
            alt="Fióre Boutique de Fleurs logo" 
            className="h-24 w-auto object-contain mb-6"
            referrerPolicy="no-referrer"
          />
          
          <div className="text-center mb-6 w-full">
            <h2 className="font-serif text-2xl font-bold text-gray-900">
              {isLoginMode ? 'Đăng Nhập Fióre' : 'Tạo Tài Khoản Mới'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">Đăng nhập để nhận thêm nhiều ưu đãi và voucher mua hoa</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Họ và tên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300"><User className="h-4 w-4" /></span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2 pl-10 pr-4 text-xs outline-none focus:border-rose-400 focus:bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Email liên lạc</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300"><Mail className="h-4 w-4" /></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2 pl-10 pr-4 text-xs outline-none focus:border-rose-400 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300"><Lock className="h-4 w-4" /></span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2 pl-10 pr-4 text-xs outline-none focus:border-rose-400 focus:bg-white"
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300"><Phone className="h-3.5 w-3.5" /></span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="090..."
                      className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-rose-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Địa chỉ nhận</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300"><MapPin className="h-3.5 w-3.5" /></span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Quận 1, TP..."
                      className="w-full rounded-lg border border-pink-50 bg-neutral-50/50 py-2 pl-9 pr-3 text-xs outline-none focus:border-rose-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-full bg-rose-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer"
            >
              {isLoginMode ? 'Đăng Nhập Ngay' : 'Hoàn Tất Đăng Ký'}
            </button>
          </form>

          <div className="mt-4 text-center flex flex-col gap-2.5 items-center">
            <button
              onClick={() => {
                setIsLoginMode(!isLoginMode);
              }}
              className="text-xs text-rose-500 hover:underline hover:text-rose-600 transition cursor-pointer font-medium"
            >
              {isLoginMode ? 'Bạn chưa có tài khoản? Nhấp tạo mới' : 'Đã có tài khoản? Chuyển đăng nhập'}
            </button>
            {isLoginMode && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordMode(true);
                  setForgotStep(1);
                  setForgotPhone('0916044683');
                  setForgotCode('');
                  setGeneratedCode('');
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setSimulatedSMS(null);
                }}
                className="text-xs text-stone-400 hover:text-rose-600 hover:underline transition cursor-pointer font-medium"
              >
                Quên mật khẩu?
              </button>
            )}
          </div>

          {/* Quick tester bypass section */}
          <div className="mt-6 border-t border-pink-100 pt-5">
            <div className="flex items-center space-x-1 justify-center mb-3 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              <KeyRound className="h-3.5 w-3.5" />
              <span>Thử Nghiệm Nhanh Cho Giám Khảo</span>
            </div>
            
            <div className="flex gap-2.5">
              <button
                onClick={() => handleQuickBypass('customer')}
                className="flex-1 rounded-lg bg-pink-50 p-2 text-center text-[10px] font-bold text-rose-700 hover:bg-pink-100 transition cursor-pointer"
                id="bypass-customer"
              >
                Khách Thường (Khách VIP)
              </button>
              <button
                onClick={() => handleQuickBypass('admin')}
                className="flex-1 rounded-lg bg-emerald-50 p-2 text-center text-[10px] font-bold text-emerald-800 hover:bg-emerald-100 transition cursor-pointer"
                id="bypass-admin"
              >
                Sếp Admin (Đầy Đủ Thống Kê)
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Sếp Admin password bypass dialog */}
      {showAdminBypassPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in animate-once">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-pink-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setShowAdminBypassPrompt(false);
                setAdminBypassPasswordInput('');
                setAdminBypassError(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-rose-500 hover:rotate-90 transition-transform duration-200 cursor-pointer"
              title="Đóng"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Lock className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-900">Xác Thực Sếp Admin</h3>
                <p className="text-[10.5px] text-gray-400 mt-1">Vui lòng cung cấp mật khẩu quản trị hiện tại để tiếp tục bypass đăng nhập chính thức</p>
              </div>
            </div>

            <form onSubmit={handleAdminBypassSubmit} className="mt-4 space-y-4">
              {adminBypassError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-[11px] rounded-xl font-medium animate-pulse flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{adminBypassError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mật Khẩu Quản Trị Viên</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-500">
                    <Lock className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type={showBypassPassword ? 'text' : 'password'}
                    required
                    value={adminBypassPasswordInput}
                    onChange={(e) => setAdminBypassPasswordInput(e.target.value)}
                    placeholder="Mật khẩu của admin..."
                    className="w-full rounded-xl border border-pink-100 bg-neutral-50/50 py-2.5 pl-9 pr-10 text-xs font-medium outline-none transition focus:border-emerald-400 focus:bg-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowBypassPassword(!showBypassPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-emerald-600 cursor-pointer"
                    title={showBypassPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showBypassPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>



              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminBypassPrompt(false);
                    setAdminBypassPasswordInput('');
                    setAdminBypassError(null);
                  }}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-500 hover:bg-neutral-50 hover:text-gray-700 transition cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 active:scale-98 transition duration-200 cursor-pointer"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

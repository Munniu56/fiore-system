/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart2, Gift, DollarSign, Package, Users, Plus, Edit2, 
  Trash2, Layers, Check, ShoppingBag, Eye, X, RefreshCw, Star, Info, TrendingUp, Search, LogOut, Mail, Lock, ShieldAlert
} from 'lucide-react';
import { Product, Category, Order, User, OrderStatus, ContactMessage } from '../types';
// Gmail manager removed specifically for isolated admin portal

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  users: User[];
  contacts: ContactMessage[];
  onUpdateContacts: React.Dispatch<React.SetStateAction<ContactMessage[]>>;
  onAddProduct: (prod: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => void;
  onEditProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  
  onAddCategory: (cat: Omit<Category, 'id'>) => void;
  onEditCategory: (cat: Category) => void;
  onDeleteCategory: (id: string) => void;
  
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onAdminLogout?: () => void;
}

export default function AdminDashboard({
  products,
  categories,
  orders,
  users,
  contacts,
  onUpdateContacts,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onUpdateOrderStatus,
  onAdminLogout,
}: AdminDashboardProps) {
  
  const [activeTab, setActiveTab ] = useState<'stats' | 'products' | 'categories' | 'orders' | 'customers' | 'security' | 'contacts'>('stats');
  const setContacts = onUpdateContacts;

  const handleTabChange = (tab: 'stats' | 'products' | 'categories' | 'orders' | 'customers' | 'security' | 'contacts') => {
    setActiveTab(tab);
    if (tab === 'contacts') {
      const saved = localStorage.getItem('fiore_contacts');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (JSON.stringify(parsed) !== JSON.stringify(contacts)) {
            setContacts(parsed);
          }
        } catch (err) {
          console.error('Error fetching contacts on tab change:', err);
        }
      }
    }
  };

  const [prepopulatedEmail, setPrepopulatedEmail] = useState<{ to: string; subject: string; body: string } | null>(null);

  // Customer Contacts management subview states
  const [contactSearch, setContactSearch] = useState('');
  const [contactFilter, setContactFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  // Security password change states
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmNewPw, setConfirmNewPw] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    const actualCurrentPw = localStorage.getItem('fiore_admin_password') || '123456';
    if (currentPw !== actualCurrentPw) {
      setPwError('Mật khẩu hiện tại không trùng khớp với hệ thống!');
      return;
    }

    if (newPw.length < 4) {
      setPwError('Mật khẩu mới quá ngắn! Vui lòng cài đặt từ 4 ký tự trở lên.');
      return;
    }

    if (newPw !== confirmNewPw) {
      setPwError('Xác nhận mật khẩu mới chưa đúng với mật khẩu đã nhập.');
      return;
    }

    // Save configuration
    localStorage.setItem('fiore_admin_password', newPw);
    setPwSuccess('🎉 Thay đổi mật khẩu đăng nhập Admin thành công!');
    setCurrentPw('');
    setNewPw('');
    setConfirmNewPw('');
  };

  // Modal / Form Management States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editProdItem, setEditProdItem] = useState<Product | null>(null);

  // New/Edit product form states
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodCategory, setProdCategory] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodShortDesc, setProdShortDesc] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState(10);
  const [prodIsFeatured, setProdIsFeatured] = useState(false);
  const [prodIsNew, setProdIsNew] = useState(true);

  // Category management states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCatItem, setEditCatItem] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  // Search filter states
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null);

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const dt = new Date(dateStr);
      const hours = String(dt.getHours()).padStart(2, '0');
      const minutes = String(dt.getMinutes()).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      return `${hours}:${minutes} ${day}/${month}/${dt.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // --- COMPUTE STATISTICS ---
  const totalRevenue = orders
    .filter(o => o.status === 'completed' || o.paymentStatus === 'Paid')
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalOrdersCount = orders.length;
  const activeCustomersCount = users.length + 3; // simulated registered + sample buyers

  // --- REAL-TIME 7 DAYS REVENUE ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const last7DaysData = last7Days.map((dateObj) => {
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const label = `${day}/${month}`;
    
    // Sum matching orders: status is 'paid' or 'completed' and matches the same calendar day
    const dailyRevenue = orders
      .filter((o) => {
        if (o.status !== 'completed' && o.status !== 'paid') {
          return false;
        }
        if (!o.createdAt) return false;
        const oDate = new Date(o.createdAt);
        return oDate.getFullYear() === dateObj.getFullYear() &&
               oDate.getMonth() === dateObj.getMonth() &&
               oDate.getDate() === dateObj.getDate();
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      label,
      val: dailyRevenue,
    };
  });

  const maxDailyRevenue = Math.max(...last7DaysData.map(d => d.val), 100000);
  const chartMax = Math.max(maxDailyRevenue * 1.15, 1000000); // At least 1M VNĐ bounds

  const formatShortVND = (value: number) => {
    if (value === 0) return '0đ';
    if (value >= 1000000) {
      const formatted = (value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1);
      return `${formatted}Mđ`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}kđ`;
    }
    return `${value}đ`;
  };

  const last7DaysPoints = last7DaysData.map((d, idx) => {
    const x = 50 + idx * 100;
    const y = 205 - (d.val / chartMax) * 175;
    return {
      label: d.label,
      val: d.val,
      x,
      y
    };
  });

  let linePath = '';
  if (last7DaysPoints.length > 0) {
    linePath = `M ${last7DaysPoints[0].x} ${last7DaysPoints[0].y}`;
    for (let i = 1; i < last7DaysPoints.length; i++) {
      const pPrev = last7DaysPoints[i - 1];
      const pCurr = last7DaysPoints[i];
      linePath += ` C ${pPrev.x + 50} ${pPrev.y}, ${pCurr.x - 50} ${pCurr.y}, ${pCurr.x} ${pCurr.y}`;
    }
  }

  const areaPath = linePath ? `${linePath} L 650 205 L 50 205 Z` : '';

  // Best seller logic based on order histories
  const bestSellersMap: { [productName: string]: { qty: number; revenue: number } } = {};
  orders.forEach((ord) => {
    ord.items.forEach((it) => {
      if (!bestSellersMap[it.product.name]) {
        bestSellersMap[it.product.name] = { qty: 0, revenue: 0 };
      }
      bestSellersMap[it.product.name].qty += it.quantity;
      bestSellersMap[it.product.name].revenue += it.product.price * it.quantity;
    });
  });

  const bestSellersList = Object.keys(bestSellersMap)
    .map((name) => ({
      productName: name,
      quantitySold: bestSellersMap[name].qty,
      revenue: bestSellersMap[name].revenue,
    }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, 5);

  // Status Breakdown counts
  const confirmedOrdersCount = orders.filter(o => o.status === 'confirmed').length;
  const paidOrdersCount = orders.filter(o => o.status === 'paid').length;
  const preparingOrdersCount = orders.filter(o => o.status === 'preparing').length;
  const shippingOrdersCount = orders.filter(o => o.status === 'shipping').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;

  // Payment methods breakdown statistics
  const codOrdersCount = orders.filter(o => o.paymentMethod === 'COD').length;
  const visaOrdersCount = orders.filter(o => o.paymentMethod === 'VISA').length;
  const vnpayOrdersCount = orders.filter(o => o.paymentMethod === 'VNPAY').length;

  const codOrdersRevenue = orders.filter(o => o.paymentMethod === 'COD').reduce((sum, o) => sum + o.totalAmount, 0);
  const visaOrdersRevenue = orders.filter(o => o.paymentMethod === 'VISA').reduce((sum, o) => sum + o.totalAmount, 0);
  const vnpayOrdersRevenue = orders.filter(o => o.paymentMethod === 'VNPAY').reduce((sum, o) => sum + o.totalAmount, 0);

  const totalOrdersWithPayments = orders.length || 1;

  const unreadContactsCount = contacts.filter(c => c.status === 'new').length;

  const getStatusBadgeStyles = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-50 text-blue-600 border border-blue-200';
      case 'paid':
        return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
      case 'preparing':
        return 'bg-yellow-50 text-yellow-600 border border-yellow-200';
      case 'shipping':
        return 'bg-orange-50 text-orange-600 border border-orange-200';
      case 'completed':
        return 'bg-[#1F3D2B] text-white border border-[#1F3D2B]';
      case 'cancelled':
        return 'bg-red-50 text-red-650 border border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabelText = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed': return 'Đã xác nhận';
      case 'paid': return 'Đã thanh toán';
      case 'preparing': return 'Đang chuẩn bị hàng';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Hoàn tất';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // --- PRODUCT SUBMIT HANDLER ---
  const openAddProduct = () => {
    setEditProdItem(null);
    setProdName('');
    setProdPrice(500000);
    setProdCategory(categories[0]?.id || '');
    setProdImage('https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600');
    setProdShortDesc('');
    setProdDesc('');
    setProdStock(15);
    setProdIsFeatured(false);
    setProdIsNew(true);
    setShowProductModal(true);
  };

  const openEditProduct = (p: Product) => {
    setEditProdItem(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdCategory(p.categoryId);
    setProdImage(p.image);
    setProdShortDesc(p.shortDesc);
    setProdDesc(p.description);
    setProdStock(p.stock);
    setProdIsFeatured(p.isFeatured);
    setProdIsNew(p.isNew);
    setShowProductModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const dataPayload = {
      name: prodName.trim(),
      price: Number(prodPrice),
      categoryId: prodCategory,
      image: prodImage || 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=600',
      shortDesc: prodShortDesc.trim() || 'Mẫu hoa mới đầy tinh tế.',
      description: prodDesc.trim() || 'Một mẫu hoa mang sắc thái lãng mạn nhẹ nhàng được các nghệ nhân tỉ mỉ xếp tạc.',
      stock: Number(prodStock),
      isNew: prodIsNew,
      isFeatured: prodIsFeatured,
    };

    if (editProdItem) {
      onEditProduct({
        ...editProdItem,
        ...dataPayload,
      });
    } else {
      onAddProduct(dataPayload);
    }
    setShowProductModal(false);
  };

  // --- CATEGORY SUBMIT HANDLER ---
  const openAddCategory = () => {
    setEditCatItem(null);
    setCatName('');
    setCatDesc('');
    setCatImage('https://images.unsplash.com/photo-1550592742-094380ae7384?auto=format&fit=crop&q=80&w=500');
    setShowCategoryModal(true);
  };

  const openEditCategory = (c: Category) => {
    setEditCatItem(c);
    setCatName(c.name);
    setCatDesc(c.description);
    setCatImage(c.image);
    setShowCategoryModal(true);
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    const payload = {
      name: catName.trim(),
      description: catDesc.trim(),
      image: catImage.trim() || 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=500',
    };

    if (editCatItem) {
      onEditCategory({
        ...editCatItem,
        ...payload,
      });
    } else {
      onAddCategory(payload);
    }
    setShowCategoryModal(false);
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
    p.shortDesc.toLowerCase().includes(prodSearch.toLowerCase())
  );

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.recipientName.toLowerCase().includes(orderSearch.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sticky Sidebar on Desktop, Responsive Wrapper on Mobile */}
        <aside className="w-full lg:w-60 lg:shrink-0 lg:sticky lg:top-[76px] lg:h-[calc(100vh-110px)] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-amber-200/60 pb-6 lg:pb-0 lg:pr-4 bg-[#FAF7F0] z-20">
          <div className="flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif font-black text-2xl text-emerald-950 tracking-tight">Fióre</span>
                <span className="text-emerald-950 font-sans text-[10px] font-bold bg-amber-400 px-2 py-0.5 rounded-full select-none">ADMIN</span>
              </div>
              <h1 className="font-serif text-xl font-bold text-emerald-950 leading-tight" id="admin-dashboard-title">Hệ Thống Quản Trị</h1>
              <p className="text-xs text-stone-500 mt-1">Hệ thống điều vận & quản lý hiệu suất tiệm hoa</p>
            </div>

            {/* Sticky Navigation Tabs */}
            <nav className="flex flex-col gap-1.5 bg-amber-50/50 border border-amber-200/50 p-2 rounded-xl text-xs font-semibold text-stone-700">
              <button
                onClick={() => handleTabChange('stats')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'stats' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
              >
                <BarChart2 className="mr-2 h-4 w-4 shrink-0" /> Báo cáo thống kê
              </button>
              <button
                onClick={() => handleTabChange('products')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'products' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
              >
                <Package className="mr-2 h-4 w-4 shrink-0" /> Quản lý sản phẩm
              </button>
              <button
                onClick={() => handleTabChange('categories')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'categories' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
              >
                <Layers className="mr-2 h-4 w-4 shrink-0" /> Quản lý danh mục
              </button>
              <button
                onClick={() => handleTabChange('orders')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'orders' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
                id="admin-orders-tab"
              >
                <div className="flex items-center">
                  <ShoppingBag className="mr-2 h-4 w-4 shrink-0" /> 
                  <span>Quản lý đơn hàng</span>
                </div>
                {(confirmedOrdersCount + paidOrdersCount + preparingOrdersCount) > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-emerald-950 rounded-full font-bold animate-pulse">{confirmedOrdersCount + paidOrdersCount + preparingOrdersCount}</span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('customers')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'customers' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
              >
                <Users className="mr-2 h-4 w-4 shrink-0" /> Sổ khách hàng
              </button>
              <button
                onClick={() => handleTabChange('contacts')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center justify-between transition cursor-pointer ${
                  activeTab === 'contacts' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
                id="admin-contacts-tab"
              >
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 shrink-0" />
                  <span>Liên hệ khách hàng</span>
                </div>
                {unreadContactsCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-emerald-950 rounded-full font-bold animate-pulse">{unreadContactsCount}</span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('security')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'security' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
                id="admin-security-tab"
              >
                <Lock className="mr-2 h-4 w-4 shrink-0" /> Bảo mật & Mật khẩu
              </button>
            </nav>
          </div>

          {onAdminLogout && (
            <div className="pt-4 lg:pt-0">
              <button
                onClick={onAdminLogout}
                className="w-full rounded-xl border border-red-200 bg-red-50/55 px-3.5 py-2 text-xs font-bold text-red-650 transition hover:bg-red-100/70 flex items-center justify-center space-x-1 cursor-pointer"
                id="admin-logout-button-hdr"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </aside>

        {/* Right side primary content workspace */}
        <div className="flex-1 w-full min-w-0">

      {/* --- TAB 1: REPORTS & GRAPHS STATISTICS --- */}
      {activeTab === 'stats' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Key Stat Cards Grid */}
          <div className="flex flex-wrap items-stretch gap-4">
            
            {/* Card 1: Doanh thu tích lũy */}
            <div className="rounded-2xl border border-amber-200/60 bg-white p-4 sm:p-5 shadow-xs flex items-center space-x-3 sm:space-x-4 w-fit min-w-max transition-all">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <DollarSign className="h-5.5 w-5.5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 break-words whitespace-normal">Doanh thu tích lũy</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-sm xl:text-lg font-black text-emerald-950 tracking-tight mt-0.5 whitespace-nowrap" title={formatVND(totalRevenue)}>
                  {formatVND(totalRevenue)}
                </p>
              </div>
            </div>

            {/* Card 2: Tổng số đơn hàng */}
            <div className="rounded-2xl border border-amber-200/60 bg-white p-4 sm:p-5 shadow-xs flex items-center space-x-3 sm:space-x-4 w-fit min-w-max transition-all">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <ShoppingBag className="h-5.5 w-5.5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 break-words whitespace-normal">Tổng số đơn hàng</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-sm xl:text-lg font-black text-emerald-950 tracking-tight mt-0.5 whitespace-nowrap">
                  {totalOrdersCount} Đơn
                </p>
              </div>
            </div>

            {/* Card 3: Khách hàng tích cực */}
            <div className="rounded-2xl border border-amber-200/60 bg-white p-4 sm:p-5 shadow-xs flex items-center space-x-3 sm:space-x-4 w-fit min-w-max transition-all">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <Users className="h-5.5 w-5.5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 break-words whitespace-normal">Khách hàng tích cực</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-sm xl:text-lg font-black text-emerald-950 tracking-tight mt-0.5 whitespace-nowrap">
                  {activeCustomersCount} Người
                </p>
              </div>
            </div>

            {/* Card 4: Số lượng kiểu hoa */}
            <div className="rounded-2xl border border-amber-200/60 bg-white p-4 sm:p-5 shadow-xs flex items-center space-x-3 sm:space-x-4 w-fit min-w-max transition-all">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shrink-0">
                <Gift className="h-5.5 w-5.5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 break-words whitespace-normal">Số lượng kiểu hoa</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-sm xl:text-lg font-black text-emerald-950 tracking-tight mt-0.5 whitespace-nowrap">
                  {products.length} Loại
                </p>
              </div>
            </div>

          </div>

          {/* Interactive Responsive SVG Charts */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Sales revenue over time */}
            <div className="lg:col-span-12 rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-amber-100/60 pb-3 mb-6">
                <div>
                  <h3 className="font-serif text-base font-bold text-emerald-950">Biểu đồ doanh thu thực tế theo tuần</h3>
                  <p className="text-xs text-stone-400">Tổng quan thu nhập tích lũy lũy tiến</p>
                </div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                  <TrendingUp className="h-4 w-4" />
                  <span>+18.4% tăng trưởng</span>
                </div>
              </div>

              {/* Custom SVG Line Chart showing clean visual layout */}
              <div id="fiore-sales-line-chart-outer-container" className="relative h-52 w-full md:h-[210px]">
                {/* Embedded Responsive SVG Graphic */}
                <svg viewBox="0 0 700 240" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1F3D2B" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1F3D2B" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines with visual thresholds feedback */}
                  {[
                    { label: formatShortVND(chartMax), y: 30 },
                    { label: formatShortVND(chartMax * 0.66), y: 88.33 },
                    { label: formatShortVND(chartMax * 0.33), y: 146.67 },
                    { label: '0đ', y: 205 }
                  ].map((grid, gIdx) => (
                    <g key={gIdx} className="opacity-40">
                      <line 
                        x1="50" 
                        y1={grid.y} 
                        x2="650" 
                        y2={grid.y} 
                        stroke="rgba(31, 61, 43, 0.12)" 
                        strokeWidth="1" 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x="35" 
                        y={grid.y + 4} 
                        textAnchor="end" 
                        className="font-sans text-[10px] text-gray-400 font-bold"
                      >
                        {grid.label}
                      </text>
                    </g>
                  ))}

                  {/* Bezier Area Gradient filling */}
                  {areaPath && (
                    <path 
                      d={areaPath} 
                      fill="url(#chart-area-grad)" 
                    />
                  )}

                  {/* Animated Bezier connector path curve */}
                  {linePath && (
                    <motion.path 
                      d={linePath} 
                      fill="none" 
                      stroke="#1F3D2B" 
                      strokeWidth={4} 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  )}

                  {/* Hover vertical dash guiding line */}
                  {hoveredChartIdx !== null && last7DaysPoints[hoveredChartIdx] && (
                    <line 
                      x1={last7DaysPoints[hoveredChartIdx].x} 
                      y1="30" 
                      x2={last7DaysPoints[hoveredChartIdx].x} 
                      y2="205" 
                      stroke="#C8A96B" 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                    />
                  )}

                  {/* Data coordinates circles points */}
                  {last7DaysPoints.map((pt, idx) => (
                    <g key={idx}>
                      {/* Outer pulse indicator on hover */}
                      {hoveredChartIdx === idx && (
                        <circle 
                          cx={pt.x} 
                          cy={pt.y} 
                          r={9} 
                          fill="#1F3D2B" 
                          stroke="#C8A96B" 
                          strokeWidth={2} 
                          className="animate-pulse" 
                        />
                      )}
                      {/* Active data point dot marker */}
                      <circle 
                        cx={pt.x} 
                        cy={pt.y} 
                        r={5.5} 
                        fill={hoveredChartIdx === idx ? '#C8A96B' : '#F8F5EF'} 
                        stroke="#1F3D2B" 
                        strokeWidth={2.5} 
                        className="transition-all duration-250"
                      />
                      {/* Trục X label text days of the week */}
                      <text 
                        x={pt.x} 
                        y="225" 
                        textAnchor="middle" 
                        className={`font-sans text-[11px] font-bold transition-all duration-200 ${
                          hoveredChartIdx === idx ? 'text-[#1F3D2B] font-extrabold fill-[#1F3D2B]' : 'text-gray-400 fill-gray-400'
                        }`}
                      >
                        {pt.label}
                      </text>
                      
                      {/* Virtual transparent hover catching regions */}
                      <rect 
                        x={pt.x - 50} 
                        y="15" 
                        width="100" 
                        height="195" 
                        fill="transparent" 
                        className="cursor-pointer" 
                        onMouseEnter={() => setHoveredChartIdx(idx)} 
                        onMouseLeave={() => setHoveredChartIdx(null)} 
                      />
                    </g>
                  ))}
                </svg>

                {/* Highly-designed luxury floating tooltip card over coordinates */}
                {hoveredChartIdx !== null && last7DaysPoints[hoveredChartIdx] && (
                  <div 
                    className="absolute pointer-events-none bg-[#1F3D2B] text-[#F8F5EF] text-xs font-sans rounded-xl py-2 px-3 shadow-xl border border-[#C8A96B]/60 flex flex-col items-center -translate-x-1/2 -translate-y-[110%] transition-transform duration-200 ease-out animate-in fade-in"
                    style={{
                      left: `${((last7DaysPoints[hoveredChartIdx].x) / 700) * 100}%`,
                      top: `${((last7DaysPoints[hoveredChartIdx].y) / 240) * 100}%`,
                    }}
                  >
                    <span className="text-[9px] text-[#C8A96B] font-extrabold uppercase tracking-widest">
                      Ngày {last7DaysPoints[hoveredChartIdx].label}
                    </span>
                    <span className="font-extrabold mt-0.5 whitespace-nowrap text-[11px]">
                      {formatVND(last7DaysPoints[hoveredChartIdx].val)}
                    </span>
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-[#1F3D2B] border-r border-b border-[#C8A96B]/60 rotate-45"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Orders Status Breakdowns and Best Sellers */}
            {/* Status Visual distribution */}
            <div className="lg:col-span-6 rounded-2xl border border-amber-200/60 bg-white p-5 shadow-xs">
              <h3 className="font-serif text-sm font-bold text-emerald-950 border-b border-amber-100 pb-2.5 mb-4">
                Phân phối trạng thái vận đơn
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Hoàn tất ({completedOrdersCount})</span>
                    <span>{orders.length > 0 ? Math.round((completedOrdersCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#1F3D2B] h-full rounded-full" style={{ width: `${orders.length > 0 ? (completedOrdersCount / orders.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Đang giao hàng ({shippingOrdersCount})</span>
                    <span>{orders.length > 0 ? Math.round((shippingOrdersCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-orange-500 h-full rounded-full" style={{ width: `${orders.length > 0 ? (shippingOrdersCount / orders.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Đang chuẩn bị hàng ({preparingOrdersCount})</span>
                    <span>{orders.length > 0 ? Math.round((preparingOrdersCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-yellow-400 h-full rounded-full" style={{ width: `${orders.length > 0 ? (preparingOrdersCount / orders.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Đã thanh toán ({paidOrdersCount})</span>
                    <span>{orders.length > 0 ? Math.round((paidOrdersCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${orders.length > 0 ? (paidOrdersCount / orders.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Đã xác nhận ({confirmedOrdersCount})</span>
                    <span>{orders.length > 0 ? Math.round((confirmedOrdersCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${orders.length > 0 ? (confirmedOrdersCount / orders.length) * 100 : 0}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-gray-700 mb-1">
                    <span>Đã hủy ({cancelledOrdersCount})</span>
                    <span>{orders.length > 0 ? Math.round((cancelledOrdersCount / orders.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${orders.length > 0 ? (cancelledOrdersCount / orders.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>

            </div>

            {/* Best selling list */}
            <div className="lg:col-span-6 rounded-2xl border border-amber-200/60 bg-white p-5 shadow-xs">
              <h3 className="font-serif text-sm font-bold text-emerald-950 border-b border-amber-100 pb-2.5 mb-3.5">
                Sản phẩm mẫu hoa bán chạy
              </h3>
              {bestSellersList.length > 0 ? (
                <div className="space-y-3.5 text-xs">
                  {bestSellersList.map((bs, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#FAF7F0] p-2 rounded-lg border border-amber-200/40 gap-2 min-w-0">
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-800 font-bold text-white text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-emerald-950 break-words whitespace-normal" title={bs.productName}>{bs.productName}</span>
                      </div>
                      <div className="text-right shrink-0 text-[11px] sm:text-xs">
                        <p className="font-bold text-emerald-800">Đã bán {bs.quantitySold} bó</p>
                        <p className="text-[10px] text-stone-400 font-medium">Thu về {formatVND(bs.revenue)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 text-center text-xs text-gray-400 italic">Chưa phát sinh dữ liệu đơn hàng thành công.</div>
              )}
            </div>

          </div>

          {/* Biểu đồ mức độ sử dụng phương thức thanh toán */}
          <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-100 pb-3 mb-6 gap-3">
              <div>
                <h3 className="font-serif text-base font-bold text-emerald-950 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-705 animate-pulse"></span>
                  <span>Mức độ sử dụng phương thức thanh toán</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">Phân tích tần suất giao dịch và đóng góp doanh thu từ 3 kênh thanh toán</p>
              </div>
              <div className="text-xs font-bold text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                Tổng cộng: {orders.length} đơn hàng
              </div>
            </div>

            {/* Content dual columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Hand-drawn SVG Donut Chart */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center bg-amber-50/10 border border-amber-200/30 rounded-2xl p-6">
                <div className="relative h-52 w-52 flex items-center justify-center">
                  <svg viewBox="0 0 200 200" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background Circle Track */}
                    <circle
                      cx="100"
                      cy="100"
                      r="70"
                      fill="transparent"
                      stroke="#FAF7F0"
                      strokeWidth="22"
                    />
                    
                    {/* COD (Emerald #1F3D2B) representation segment */}
                    {codOrdersCount > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#1F3D2B"
                        strokeWidth="22"
                        strokeDasharray="439.82"
                        strokeDashoffset={439.82 - (codOrdersCount / totalOrdersWithPayments) * 439.82}
                        className="transition-all duration-300 hover:stroke-[25px] cursor-pointer"
                        style={{ transformOrigin: 'center' }}
                      />
                    )}

                    {/* VISA/Mastercard (Ocean Blue #2563EB) segment */}
                    {visaOrdersCount > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#2563EB"
                        strokeWidth="22"
                        strokeDasharray="439.82"
                        strokeDashoffset={439.82 - (visaOrdersCount / totalOrdersWithPayments) * 439.82}
                        style={{
                          transformOrigin: 'center',
                          transform: `rotate(${(codOrdersCount / totalOrdersWithPayments) * 360}deg)`
                        }}
                        className="transition-all duration-300 hover:stroke-[25px] cursor-pointer"
                      />
                    )}

                    {/* VNPAY (Gold/Coffee #C8A96B) segment */}
                    {vnpayOrdersCount > 0 && (
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#C8A96B"
                        strokeWidth="22"
                        strokeDasharray="439.82"
                        strokeDashoffset={439.82 - (vnpayOrdersCount / totalOrdersWithPayments) * 439.82}
                        style={{
                          transformOrigin: 'center',
                          transform: `rotate(${((codOrdersCount + visaOrdersCount) / totalOrdersWithPayments) * 360}deg)`
                        }}
                        className="transition-all duration-300 hover:stroke-[25px] cursor-pointer"
                      />
                    )}
                  </svg>

                  {/* Hole details labels summary floating card */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none bg-white rounded-full w-28 h-28 m-auto shadow-sm border border-amber-100/60">
                    <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">Tổng vận đơn</span>
                    <span className="font-serif text-2xl font-black text-emerald-950 leading-none my-0.5">{orders.length}</span>
                    <span className="text-[9px] font-mono text-stone-400/90 font-bold">Thanh toán</span>
                  </div>
                </div>

                {/* Legend item keys list */}
                <div className="flex justify-center flex-wrap gap-x-4 gap-y-2 mt-5 text-[11px] font-bold">
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#1F3D2B] inline-block"></span>
                    <span className="text-stone-600">COD ({Math.round((codOrdersCount / totalOrdersWithPayments) * 100)}%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB] inline-block"></span>
                    <span className="text-stone-600">VISA ({Math.round((visaOrdersCount / totalOrdersWithPayments) * 100)}%)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#C8A96B] inline-block"></span>
                    <span className="text-stone-600">VNPAY ({Math.round((vnpayOrdersCount / totalOrdersWithPayments) * 100)}%)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Progress Rows block details */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* 1. COD details progress row block */}
                <div className="border border-amber-100/50 rounded-xl bg-white p-4 hover:border-emerald-200 transition duration-300">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8.5 w-8.5 rounded-lg bg-[#1F3D2B]/10 text-[#1F3D2B] font-bold flex items-center justify-center text-[10.5px]">
                        COD
                      </div>
                      <div>
                        <h4 className="font-serif text-xs font-black text-emerald-950">Giao hàng thu hộ (COD)</h4>
                        <p className="text-[10px] text-stone-400">Khách nhận hoa rồi trả tiền mặt cho shipper</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-950 font-sans block">{formatVND(codOrdersRevenue)}</span>
                      <span className="text-[9.5px] text-stone-400 font-bold font-mono uppercase">{codOrdersCount} giao dịch</span>
                    </div>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-stone-500">
                      <span>Tỉ lệ sử dụng</span>
                      <span>{Math.round((codOrdersCount / totalOrdersWithPayments) * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#1F3D2B] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(codOrdersCount / totalOrdersWithPayments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 2. VISA/Mastercard progress row block */}
                <div className="border border-amber-100/50 rounded-xl bg-white p-4 hover:border-blue-200 transition duration-300">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8.5 w-8.5 rounded-lg bg-[#2563EB]/10 text-[#2563EB] font-bold flex items-center justify-center text-[10.5px]">
                        CC
                      </div>
                      <div>
                        <h4 className="font-serif text-xs font-black text-emerald-950">Thẻ quốc tế (VISA / Mastercard / JCB)</h4>
                        <p className="text-[10px] text-stone-400">Thanh toán tự động bảo mật qua thẻ ngân hàng</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-950 font-sans block">{formatVND(visaOrdersRevenue)}</span>
                      <span className="text-[9.5px] text-stone-400 font-bold font-mono uppercase">{visaOrdersCount} giao dịch</span>
                    </div>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-stone-500">
                      <span>Tỉ lệ sử dụng</span>
                      <span>{Math.round((visaOrdersCount / totalOrdersWithPayments) * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(visaOrdersCount / totalOrdersWithPayments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 3. VNPAY QR progress row block */}
                <div className="border border-amber-100/50 rounded-xl bg-white p-4 hover:border-amber-300 transition duration-300">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8.5 w-8.5 rounded-lg bg-[#C8A96B]/10 text-[#C8A96B] font-bold flex items-center justify-center text-[10.5px]">
                        QR
                      </div>
                      <div>
                        <h4 className="font-serif text-xs font-black text-emerald-950">Cổng VNPAY QR</h4>
                        <p className="text-[10px] text-stone-400">Quét mã QR thanh toán nhanh qua ứng dụng ngân hàng</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-950 font-sans block">{formatVND(vnpayOrdersRevenue)}</span>
                      <span className="text-[9.5px] text-stone-400 font-bold font-mono uppercase">{vnpayOrdersCount} giao dịch</span>
                    </div>
                  </div>
                  <div className="space-y-1 mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-stone-500">
                      <span>Tỉ lệ sử dụng</span>
                      <span>{Math.round((vnpayOrdersCount / totalOrdersWithPayments) * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#C8A96B] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${(vnpayOrdersCount / totalOrdersWithPayments) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      )}

      {/* --- TAB 2: PRODUCTS CATALOGUE ADMIN --- */}
      {activeTab === 'products' && (
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs animate-fade-in">
          
          {/* Header Action Tools */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3.5">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-700">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm hoa quản trị..."
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                className="w-full rounded-full border border-amber-200 bg-neutral-100/50 py-2 pl-9 pr-4 text-xs outline-none focus:bg-white focus:border-emerald-700"
              />
            </div>
            
            <button
              onClick={openAddProduct}
              className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 transition cursor-pointer"
              id="admin-btn-add-product"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Thêm sản phẩm mới
            </button>
          </div>

          {/* Grid visual list for administration */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-amber-200/40">
              <thead>
                <tr className="bg-amber-50/40 text-stone-500 font-bold uppercase tracking-wider">
                  <th className="p-3">Hình ảnh & Tên</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Đơn Giá</th>
                  <th className="p-3">Kho kho còn</th>
                  <th className="p-3 text-center">Nổi Bật / Mới</th>
                  <th className="p-3 text-right">Điều khiển</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/40 font-medium text-gray-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-amber-50/20 transition">
                    <td className="p-3 flex items-center space-x-3 max-w-[240px]">
                      <img src={p.image} className="h-10 w-10 shrink-0 rounded-md object-cover border" referrerPolicy="no-referrer" />
                      <div className="truncate">
                        <p className="font-bold text-[#0F2C11] line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-gray-400">Mã: {p.id}</p>
                      </div>
                    </td>
                    <td className="p-3 text-gray-500">
                      {p.categoryId === 'tinh-yeu' ? 'Hoa tình yêu' :
                       p.categoryId === 'sinh-nhat' ? 'Hoa sinh nhật' :
                       p.categoryId === 'khai-truong' ? 'Hoa khai trương' :
                       p.categoryId === 'chuc-mung' ? 'Hoa chúc mừng' :
                       p.categoryId === 'chia-buon' ? 'Hoa chia buồn' : 'Hoa theo mùa'}
                    </td>
                    <td className="p-3 font-bold text-emerald-800">{formatVND(p.price)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock > 10 ? 'bg-emerald-50 text-emerald-700' :
                        p.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                      }`}>
                        Còn {p.stock} bó
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-1.5">
                      {p.isFeatured && <span className="p-1 rounded bg-[#FAF7F0] text-emerald-800 border border-emerald-800/20 text-[9px] font-bold">Featured</span>}
                      {p.isNew && <span className="p-1 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">NEW</span>}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => openEditProduct(p)}
                        className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 transition"
                        title="Chỉnh sửa mẫu hoa"
                      >
                        <Edit2 className="h-4.5 w-4.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn thật sự chắc chắn muốn xoá mẫu hoa "${p.name}" này?`)) {
                            onDeleteProduct(p.id);
                          }
                        }}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 transition"
                        title="Hủy bỏ mẫu hoa"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* --- TAB 3: CATEGORIES MANAGEMENT ADMIN --- */}
      {activeTab === 'categories' && (
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs animate-fade-in">
          
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-serif text-lg font-bold text-emerald-950">Quản Lý Danh Mục Mẫu Hoa</h3>
            <button
              onClick={openAddCategory}
              className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 transition cursor-pointer"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Thêm danh mục mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((c) => (
              <div key={c.id} className="rounded-xl border border-amber-200/50 p-4 bg-white flex items-center justify-between shadow-xs">
                <div className="flex items-center space-x-3.5">
                  <img src={c.image} className="h-12 w-12 rounded-full object-cover border" referrerPolicy="no-referrer" />
                  <div>
                    <h4 className="font-bold text-sm text-[#0F2C11]">{c.name}</h4>
                    <p className="text-[10px] text-stone-400 mt-0.5 line-clamp-1">{c.description}</p>
                    <p className="text-[9px] text-[#8fa87a] font-black mt-0.5 uppercase tracking-wider">ID: {c.id}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => openEditCategory(c)}
                    className="p-1 rounded text-blue-500 hover:bg-blue-50"
                    title="Sửa danh mục"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Bạn muốn xóa danh mục "${c.name}"? Chỉ những danh mục không có sản phẩm mới xóa được.`)) {
                        onDeleteCategory(c.id);
                      }
                    }}
                    className="p-1 rounded text-red-500 hover:bg-red-50"
                    title="Xóa danh mục"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* --- TAB 4: ORDERS CONTROL BOARD --- */}
      {activeTab === 'orders' && (
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs animate-fade-in" id="admin-orders-board">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3.5">
            <h3 className="font-serif text-lg font-bold text-emerald-950">Quản trị và Điều hành Đơn Hàng</h3>
            <div className="relative max-w-xs flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-700">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Tìm mã đơn hàng, tên khách..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full rounded-full border border-amber-200 bg-neutral-100/50 py-2 pl-9 pr-4 text-xs outline-none focus:bg-white focus:border-emerald-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-amber-200/40 table-fixed min-w-[900px] xl:min-w-full">
              <thead>
                <tr className="bg-amber-50/40 text-stone-500 font-bold uppercase tracking-wider text-center align-middle">
                  <th className="p-3 w-[10%] min-w-[90px] text-center align-middle leading-normal">Mã đơn hàng</th>
                  <th className="p-3 w-[22%] min-w-[190px] text-center align-middle leading-normal">Khách hàng</th>
                  <th className="p-3 w-[15%] min-w-[130px] text-center align-middle leading-normal">Ngày đặt</th>
                  <th className="p-3 w-[13%] min-w-[110px] text-center align-middle leading-normal">Tổng tiền</th>
                  <th className="p-3 w-[12%] min-w-[120px] text-center align-middle leading-normal">Phương thức thanh toán</th>
                  <th className="p-3 w-[15%] min-w-[140px] text-center align-middle leading-normal">Trạng thái vận chuyển</th>
                  <th className="p-3 w-[13%] min-w-[125px] text-center align-middle leading-normal">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-200/40 font-medium text-gray-700">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/50 transition" id={`admin-order-row-${ord.id}`}>
                    <td className="p-3 w-[10%] min-w-[90px] font-mono font-bold text-gray-900">{ord.id}</td>
                    <td className="p-3 w-[22%] min-w-[190px]">
                      <p className="font-bold text-[#0F2C11]">{ord.recipientName}</p>
                      <p className="text-[10px] text-stone-400">SĐT: {ord.recipientPhone}</p>
                      <p className="text-[10px] text-stone-500 line-clamp-1" title={ord.shippingAddress}>{ord.shippingAddress}</p>
                      <div className="mt-1 text-[10px] text-stone-500 italic truncate" title={ord.items.map(it => `${it.product.name} (x${it.quantity})`).join(', ')}>
                        Sản phẩm: {ord.items.map(it => `${it.product.name} (x${it.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="p-3 w-[15%] min-w-[130px] text-gray-500 whitespace-nowrap">{formatDateTime(ord.createdAt)}</td>
                    <td className="p-3 w-[13%] min-w-[110px] font-bold text-emerald-800 whitespace-nowrap">{formatVND(ord.totalAmount)}</td>
                    <td className="p-3 w-[12%] min-w-[120px] whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        ord.paymentMethod === 'VNPAY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : ord.paymentMethod === 'VISA' 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {ord.paymentMethod || 'COD'}
                      </span>
                    </td>
                    <td className="p-3 w-[15%] min-w-[140px] whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-[9.5px] font-bold rounded-full whitespace-nowrap inline-block ${getStatusBadgeStyles(ord.status)}`}>
                        {getStatusLabelText(ord.status)}
                      </span>
                    </td>
                    <td className="p-3 w-[13%] min-w-[125px]">
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="rounded border border-amber-200 bg-white p-1 text-[10.5px] outline-none text-gray-700 focus:border-emerald-700 w-full cursor-pointer"
                        id={`update-status-select-${ord.id}`}
                      >
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="paid">Đã thanh toán</option>
                        <option value="preparing">Đang chuẩn bị hàng</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="completed">Hoàn tất</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                      {/* Gửi Mail button removed */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* --- TAB 5: CUSTOMER DIRECTORY SỔ KHÁCH HÀNG --- */}
      {activeTab === 'customers' && (
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs animate-fade-in animate-fade-in">
          <h3 className="font-serif text-lg font-bold text-emerald-950 border-b border-amber-100 pb-3 mb-5">
            Danh Sách Đăng Ký Hệ Thống Fiore
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Display registered users dynamically */}
            {users.map((usr) => {
              const userOrders = orders.filter((o) => o.customerEmail === usr.email);
              const spent = userOrders.reduce((a,c) => a + c.totalAmount, 0);
              return (
                <div key={usr.id} className="rounded-xl border border-amber-200/50 p-4 bg-white flex items-start space-x-4">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-serif text-lg font-bold">
                    {usr.name.charAt(0)}
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-emerald-950 text-sm">{usr.name}</p>
                    <p className="text-stone-400">Email: {usr.email} (SĐT: {usr.phone || 'Chưa cung cấp'})</p>
                    <p className="text-stone-500">Mặc định: {usr.address || 'Chưa thiết lập'}</p>
                    
                    <div className="flex flex-wrap gap-2 pt-2">
                      <span className="p-1 rounded bg-amber-50 font-bold text-amber-900 text-[10px]">Đã mua: {userOrders.length} Đơn</span>
                      <span className="p-1 rounded bg-emerald-50 font-bold text-emerald-800 text-[10px]">Tích lũy: {formatVND(spent)}</span>
                      {/* Gửi Gmail button removed */}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Static high-fidelity sample buyers representing system stats */}
            <div className="rounded-xl border border-amber-200/55 p-4 bg-white flex items-start space-x-4 opacity-80">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-serif text-lg font-bold">
                T
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[#0F2C11] text-sm">Thùy Vân (Hà Nội)</p>
                <p className="text-stone-400">Email: thuyvanngo35@gmail.com (SĐT: 0987654321)</p>
                <p className="text-stone-500">Mặc định: 12 Hàng Khay, Quận Hoàn Kiếm, Hà Nội</p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="p-1 rounded bg-amber-50 font-bold text-amber-900 text-[10px]">Đã mua: 4 Đơn</span>
                  <span className="p-1 rounded bg-emerald-50 font-bold text-emerald-800 text-[10px]">Tích lũy: {formatVND(1850000)}</span>
                  {/* Gửi Gmail button removed */}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/55 p-4 bg-white flex items-start space-x-4 opacity-80">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-serif text-lg font-bold">
                A
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-[#0F2C11] text-sm">An Bình (Gia Định)</p>
                <p className="text-stone-400">Email: anbinh@gmail.com (SĐT: 0914253648)</p>
                <p className="text-stone-500">Mặc định: 34 Nguyễn Bỉnh Khiêm, Quận 1, TP. HCM</p>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="p-1 rounded bg-amber-50 font-bold text-amber-900 text-[10px]">Đã mua: 2 Đơn</span>
                  <span className="p-1 rounded bg-emerald-50 font-bold text-emerald-800 text-[10px]">Tích lũy: {formatVND(890000)}</span>
                  {/* Gửi Gmail button removed */}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Gmail tab rendering section removed */}

      {activeTab === 'security' && (
        <div className="mx-auto max-w-xl rounded-2xl border border-amber-200/60 bg-white p-6 shadow-sm md:p-8 animate-fade-in space-y-6">
          <div className="border-b border-amber-100 pb-4">
            <h3 className="font-serif text-xl font-bold text-emerald-950 flex items-center gap-2">
              <Lock className="text-emerald-800 h-5 w-5 shrink-0" />
              <span>Đổi Mật Khẩu Đăng Nhập Quản Trị</span>
            </h3>
            <p className="text-xs text-stone-400 mt-1">Cập nhật mật khẩu bảo mật riêng để điều hành cửa hàng Fióre</p>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwError && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl font-medium animate-pulse flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-red-500" />
                <span>Mã lỗi: {pwError}</span>
              </div>
            )}
            {pwSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs rounded-xl font-semibold">
                {pwSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Nhập mật khẩu quản trị hiện tại"
                className="w-full rounded-xl border border-amber-200 bg-[#FAF7F0]/30 p-3 text-xs outline-none transition focus:border-emerald-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)"
                className="w-full rounded-xl border border-amber-200 bg-[#FAF7F0]/30 p-3 text-xs outline-none transition focus:border-emerald-700 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmNewPw}
                onChange={(e) => setConfirmNewPw(e.target.value)}
                placeholder="Xác nhận lại mật khẩu mới"
                className="w-full rounded-xl border border-amber-200 bg-[#FAF7F0]/30 p-3 text-xs outline-none transition focus:border-emerald-700 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-800 hover:bg-emerald-990 text-white font-bold py-3 px-4 rounded-xl text-xs transition active:scale-98 cursor-pointer shadow-md mt-2 flex justify-center items-center gap-1.5"
            >
              <Check className="h-4 w-4" /> Cập nhật mật khẩu quản trị
            </button>
          </form>
        </div>
      )}

      {/* --- TAB 7: CUSTOMER CONTACTS - LIÊN HỆ KHÁCH HÀNG --- */}
      {activeTab === 'contacts' && (
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-100 pb-4 gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Mail className="text-emerald-800 h-5 w-5 shrink-0" />
                <span>Liên Hệ Khách Hàng</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Xem tin nhắn của khách từ mục Gửi Lời Nhắn Gửi Tới Fióre ở trang Liên hệ
              </p>
            </div>
            
            {/* Counts overview */}
            <div className="flex flex-wrap gap-2 text-[10px] font-bold">
              <span className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full border border-stone-200">
                Tổng: {contacts.length}
              </span>
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                Chưa đọc: {contacts.filter(c => c.status === 'new').length}
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
                Đã trả lời: {contacts.filter(c => c.status === 'replied').length}
              </span>
            </div>
          </div>

          {/* Search and Filters toolbar */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, nội dung tin nhắn..."
                value={contactSearch}
                onChange={(e) => setContactSearch(e.target.value)}
                className="w-full rounded-xl border border-amber-200 bg-[#FAF7F0]/30 pl-9 pr-4 py-2.5 text-xs outline-none transition focus:border-emerald-700 focus:bg-white"
              />
              {contactSearch && (
                <button 
                  onClick={() => setContactSearch('')}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 font-sans text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex gap-1.5 self-start md:self-auto overflow-x-auto pb-1 md:pb-0">
              {(['all', 'new', 'read', 'replied'] as const).map((filter) => {
                const label = 
                  filter === 'all' ? 'Tất cả' :
                  filter === 'new' ? 'Chưa đọc' :
                  filter === 'read' ? 'Đã đọc' : 'Đã phản hồi';
                
                const count = 
                  filter === 'all' ? contacts.length :
                  contacts.filter(c => c.status === filter).length;

                return (
                  <button
                    key={filter}
                    onClick={() => setContactFilter(filter)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 border ${
                      contactFilter === filter 
                        ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs' 
                        : 'bg-stone-50 text-stone-600 border-stone-200/50 hover:bg-stone-100'
                    }`}
                  >
                    <span>{label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      contactFilter === filter ? 'bg-black text-white' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Messages list */}
          {contacts.filter(c => {
            const matchSearch = 
              c.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
              c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
              c.message.toLowerCase().includes(contactSearch.toLowerCase());
            const matchFilter = contactFilter === 'all' || c.status === contactFilter;
            return matchSearch && matchFilter;
          }).length === 0 ? (
            <div className="text-center py-12 border border-dashed border-amber-200 bg-amber-50/10 rounded-2xl">
              <Mail className="mx-auto h-12 w-12 text-stone-300 stroke-1 mb-3" />
              <p className="text-xs text-stone-500 font-medium">Không tìm thấy yêu cầu liên hệ nào phù hợp</p>
              <button 
                onClick={() => { setContactSearch(''); setContactFilter('all'); }}
                className="mt-3 text-xs font-bold text-emerald-900 hover:underline cursor-pointer"
              >
                Đặt lại bộ lọc tìm kiếm
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {contacts
                .filter(c => {
                  const matchSearch = 
                    c.fullName.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
                    c.message.toLowerCase().includes(contactSearch.toLowerCase());
                  const matchFilter = contactFilter === 'all' || c.status === contactFilter;
                  return matchSearch && matchFilter;
                })
                .map((contact) => {
                  const isSelected = selectedContactId === contact.id;
                  return (
                    <div 
                      key={contact.id}
                      onClick={() => {
                        setSelectedContactId(isSelected ? null : contact.id);
                        // Mark as read if it is new
                        if (contact.status === 'new') {
                          setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, status: 'read' as const } : c));
                        }
                      }}
                      className={`group border rounded-xl p-4 transition-all duration-250 cursor-pointer ${
                        contact.status === 'new' 
                          ? 'border-emerald-200 bg-emerald-50/20 shadow-xs' 
                          : 'border-amber-200/50 bg-white hover:border-amber-300'
                      } ${isSelected ? 'ring-2 ring-emerald-800 border-transparent shadow-md' : ''}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          {/* Profile letter */}
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            contact.status === 'new' 
                              ? 'bg-emerald-800 text-white' 
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {contact.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-emerald-950 text-sm block sm:inline">
                              {contact.fullName}
                            </span>
                            <span className="text-stone-400 font-mono text-[11px] sm:ml-2">
                              ({contact.email})
                            </span>
                          </div>
                        </div>

                        {/* Badges & Date */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 text-right">
                          <span className="text-stone-400 font-mono text-[10px] whitespace-nowrap order-2 sm:order-1">
                            {new Date(contact.createdAt).toLocaleString('vi-VN')}
                          </span>
                          
                          <div className="flex gap-1.5 order-1 sm:order-2">
                            {contact.status === 'new' && (
                              <span className="px-2 py-0.5 text-[9px] bg-red-100 text-red-600 font-black rounded-lg uppercase tracking-wider animate-pulse">
                                Mới
                              </span>
                            )}
                            {contact.status === 'read' && (
                              <span className="px-2 py-0.5 text-[9px] bg-sky-50 text-sky-650 font-bold rounded-lg border border-sky-200/50">
                                Đã xem
                              </span>
                            )}
                            {contact.status === 'replied' && (
                              <span className="px-2 py-0.5 text-[9px] bg-emerald-55 text-emerald-800 font-bold rounded-lg border border-emerald-200/50">
                                Đã trả lời
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Message Content */}
                      <div className="mt-3 text-stone-700 text-xs leading-relaxed font-sans pl-10">
                        <p className={`whitespace-pre-line ${isSelected ? '' : 'line-clamp-2'}`}>
                          {contact.message}
                        </p>
                      </div>

                      {/* Reply visual summary if has reply */}
                      {contact.replyDetail && (
                        <div className="mt-3.5 bg-emerald-50/40 border border-emerald-100 rounded-xl p-3 pl-10 text-xs">
                          <p className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" /> 
                            <span>Fióre Phản hồi:</span>
                            <span className="font-mono text-[10px] text-stone-400 font-medium ml-auto">
                              {new Date(contact.repliedAt || '').toLocaleString('vi-VN')}
                            </span>
                          </p>
                          <p className="text-stone-600 whitespace-pre-line text-[11.5px] italic">
                            "{contact.replyDetail}"
                          </p>
                        </div>
                      )}

                      {/* Expanded Controller Panel */}
                      {isSelected && (
                        <div 
                          onClick={(e) => e.stopPropagation()} 
                          className="mt-4 border-t border-amber-100/60 pt-4 flex flex-col gap-3 pl-10 select-text"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2.5">
                            {/* Left actions: Toggle & Trash */}
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => {
                                  setContacts(prev => prev.map(c => {
                                    if (c.id === contact.id) {
                                      const nextStatus: 'new' | 'read' = c.status === 'new' ? 'read' : 'new';
                                      return { ...c, status: nextStatus };
                                    }
                                    return c;
                                  }));
                                }}
                                className="px-3 py-1.5 border border-stone-200 hover:bg-stone-50 rounded-lg text-xs font-bold text-stone-600 transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Đánh dấu là {contact.status === 'new' ? 'Quen thuộc (Đã xem)' : 'Mới (Chưa xem)'}</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  if (confirm('Bạn chắc chắn muốn xóa thư liên hệ này của khách hàng?')) {
                                    setContacts(prev => prev.filter(c => c.id !== contact.id));
                                    setSelectedContactId(null);
                                  }
                                }}
                                className="px-3 py-1.5 border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Xóa tin nhắn</span>
                              </button>
                            </div>

                            {/* Right actions: Composition triggers */}
                            <div className="flex items-center gap-2">
                              <a 
                                href={`mailto:${contact.email}?subject=Fióre Boutique Florist - Phản hồi thư liên hệ của bạn&body=Kính gửi bạn ${contact.fullName},%0D%0A%0D%0AFióre đã nhận được thông tin liên hệ của bạn gửi tới cửa hàng.%0D%0A%0D%0ANội dung phản hồi:`}
                                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-bold text-stone-800 transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Mail className="h-3.5 w-3.5" />
                                <span>Gửi Mail chính thức</span>
                              </a>

                              <button
                                onClick={() => {
                                  if (replyingToId === contact.id) {
                                    setReplyingToId(null);
                                    setReplyText('');
                                  } else {
                                    setReplyingToId(contact.id);
                                    setReplyText(contact.replyDetail || '');
                                  }
                                }}
                                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-990 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <span>{contact.replyDetail ? 'Sửa câu trả lời' : 'Viết phản hồi nhanh'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Quick reply composing panel */}
                          {replyingToId === contact.id && (
                            <div className="border border-stone-200 bg-stone-50/30 rounded-xl p-3 space-y-2 mt-1">
                              <label className="block text-[10px] font-bold uppercase text-stone-500 tracking-wider">
                                Nội dung tư vấn / phản hồi cho {contact.fullName}
                              </label>
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={3}
                                placeholder="Viết câu trả lời của tiệm gửi đến khách hàng..."
                                className="w-full rounded-lg border border-amber-200 bg-white p-2.5 text-xs outline-none focus:border-emerald-700 leading-relaxed"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                  className="px-2.5 py-1 text-[11px] text-stone-500 hover:text-stone-700 transition cursor-pointer"
                                >
                                  Hủy bỏ
                                </button>
                                <button
                                  onClick={() => {
                                    if (!replyText.trim()) return;
                                    setContacts(prev => prev.map(c => {
                                      if (c.id === contact.id) {
                                        return {
                                          ...c,
                                          status: 'replied' as const,
                                          replyDetail: replyText.trim(),
                                          repliedAt: new Date().toISOString()
                                        };
                                      }
                                      return c;
                                    }));
                                    setReplyText('');
                                    setReplyingToId(null);
                                  }}
                                  disabled={!replyText.trim()}
                                  className="px-3.5 py-1 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-bold rounded-md text-[11px] transition cursor-pointer"
                                >
                                  Lưu phản hồi & Gửi đi
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* --- ADD / EDIT PRODUCT POPUP DIA LOG --- */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-amber-200 min-h-[500px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
              <h4 className="font-serif text-lg font-bold text-emerald-950">
                {editProdItem ? `Chỉnh Sửa Mẫu "${editProdItem.name}"` : 'Thêm Mẫu Thiết Kế Mới'}
              </h4>
              <button
                onClick={() => setShowProductModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-neutral-100 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Tên bó hoa *</label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ví dụ: Bó Hoa Sữa Trắng Trẻ"
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Đơn Giá (VND) *</label>
                  <input
                     type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Kho sẵn có (Số lượng) *</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Danh mục chuyên mục *</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full rounded-lg border border-amber-200 p-2.5 bg-white outline-none focus:border-emerald-700"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Đường dẫn ảnh bìa (URL) *</label>
                  <input
                    type="text"
                    required
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                    className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Mô tả ngắn (Hiển thị thẻ bán)</label>
                <input
                  type="text"
                  value={prodShortDesc}
                  onChange={(e) => setProdShortDesc(e.target.value)}
                  placeholder="Ví dụ: Bó gồm 10 cúc trắng tinh nghịch..."
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Mô tả chi tiết sản phẩm</label>
                <textarea
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="flex gap-4 border-t border-amber-100 pt-3">
                <label className="flex items-center space-x-1.5 font-bold text-stone-600">
                  <input
                    type="checkbox"
                    checked={prodIsNew}
                    onChange={(e) => setProdIsNew(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>Mẫu hoa MỚI ra mắt</span>
                </label>

                <label className="flex items-center space-x-1.5 font-bold text-stone-600">
                  <input
                    type="checkbox"
                    checked={prodIsFeatured}
                    onChange={(e) => setProdIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded text-emerald-800 focus:ring-emerald-700"
                  />
                  <span>Mẫu hoa NỔI BẬT trang chủ</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="rounded-full px-4 py-2 border text-gray-500 hover:bg-neutral-50"
                >
                  Thoát
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-800 px-5 py-2 text-white font-bold hover:bg-emerald-990 cursor-pointer"
                  id="admin-submit-product-btn"
                >
                  {editProdItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

        </div>
      </div>

      {/* --- ADD / EDIT CATEGORY POPUP DIA LOG --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-amber-200">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-4">
              <h4 className="font-serif text-lg font-bold text-emerald-950">
                {editCatItem ? `Sửa Danh Mục "${editCatItem.name}"` : 'Tạo Danh Mục Tươi'}
              </h4>
              <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-500 uppercase mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="Ví dụ: Hoa Chúc Mừng 20/11"
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-500 uppercase mb-1">Mô tả ngắn</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Tuyển chọn hoa tươi cho thầy cô..."
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                />
              </div>

               <div>
                <label className="block font-bold text-stone-500 uppercase mb-1">Đường dẫn ảnh bìa danh mục *</label>
                <input
                  type="text"
                  required
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="rounded-full px-4 py-1.5 border text-gray-500 hover:bg-neutral-50"
                >
                  Thoát
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-800 px-5 py-1.5 text-white font-bold hover:bg-emerald-900 cursor-pointer"
                >
                  {editCatItem ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

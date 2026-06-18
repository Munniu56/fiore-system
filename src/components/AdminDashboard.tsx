/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { 
  BarChart2, Gift, DollarSign, Package, Users, Plus, Edit2, 
  Trash2, Layers, Check, ShoppingBag, Eye, X, RefreshCw, Star, Info, TrendingUp, TrendingDown, Search, LogOut, Mail, Lock, ShieldAlert,
  Menu, Shield, Download, FileText, Database, MessageSquare, Award, PieChart, RotateCcw
} from 'lucide-react';
import { Product, Category, Order, User, OrderStatus, ContactMessage, Coupon, Review } from '../types';
import { subscribeCoupons, saveCoupon, removeCoupon, subscribeReviews, removeReview, saveReview } from '../firebase';
import { convertProductsToCSV, convertProductsToMerchantXML, downloadFile } from '../utils/productExporter';
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
  
  const [activeTab, setActiveTab ] = useState<'stats' | 'products' | 'categories' | 'orders' | 'customers' | 'security' | 'contacts' | 'coupons' | 'reviews' | 'inventory'>('stats');
  const [statsMode, setStatsMode] = useState<'week' | 'month'>('week');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const setContacts = onUpdateContacts;

  const handleTabChange = (tab: 'stats' | 'products' | 'categories' | 'orders' | 'customers' | 'security' | 'contacts' | 'coupons' | 'reviews' | 'inventory') => {
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

  // Review management states
  const [dbReviews, setDbReviews] = useState<Review[]>([]);
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [reviewSortOrder, setReviewSortOrder] = useState<'newest' | 'oldest' | 'rating-high' | 'rating-low'>('newest');
  const [selectedReviewForDetail, setSelectedReviewForDetail] = useState<Review | null>(null);
  const [reviewModalY, setReviewModalY] = useState<number>(150);
  const [reviewActionSuccess, setReviewActionSuccess] = useState<string | null>(null);

  // Subscribe to reviews in Firestore
  useEffect(() => {
    const unsub = subscribeReviews((data) => {
      setDbReviews(data || []);
    });
    return () => unsub();
  }, []);

  // State and Helpers for Deleted Mock reviews, Deletion and Verification
  const [deletedMockReviewIds, setDeletedMockReviewIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('fiore_deleted_mock_reviews');
    return saved ? JSON.parse(saved) : [];
  });

  // State for Inventory Management Tab
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('all');
  const [lowStockThreshold, setLowStockThreshold] = useState(5);
  const [tempStockValues, setTempStockValues] = useState<Record<string, number>>({});
  const [inventoryUpdateSuccess, setInventoryUpdateSuccess] = useState<string | null>(null);

  // States for stock write-off/cancellation reporting
  const [cancelProduct, setCancelProduct] = useState<Product | null>(null);
  const [cancelQuantity, setCancelQuantity] = useState<number>(1);
  const [cancelReason, setCancelReason] = useState<string>('Hoa héo');
  const [customReason, setCustomReason] = useState<string>('');
  const [cancelPopupPos, setCancelPopupPos] = useState<{ top: number; left: number } | null>(null);

  const getMockReviewsForProduct = (prod: Product): Review[] => {
    const templates = [
      {
        id: `${prod.id}-r1`,
        productId: prod.id,
        productName: prod.name,
        author: 'Nguyễn Thị Tuyết Mai',
        email: 'tuyetmai.nguyen@gmail.com',
        rating: 5,
        date: '08/06/2026',
        comment: `Mình đặt bó "${prod.name}" này tặng sinh nhật mẹ. Hoa giao tới cực kỳ tươi, màu sắc phối nhã nhặn, sang trọng vô cùng. Mẹ thích lắm, chụp ảnh khoe khắp nhà. Dịch vụ cắm hoa của Fióre rất chỉn chu, tỉ mỉ và chu đáo!`,
        isVerified: true,
        likes: 5,
        createdAt: '2026-06-08T12:00:00.000Z'
      },
      {
        id: `${prod.id}-r2`,
        productId: prod.id,
        productName: prod.name,
        author: 'Lê Hoàng Nam',
        email: 'namle.design@gmail.com',
        rating: 5,
        date: '03/06/2026',
        comment: `Nghệ thuật cắm hoa đỉnh cao thực sự, giữ dáng hoa lâu, mùi hương lan tỏa tự nhiên khắp phòng khách. Đã cắm được 5 ngày rồi mà hoa vẫn tươi rói và nở đều nhờ sử dụng gói bột dưỡng đi kèm tiệm tặng. Sẽ ủng hộ Fióre lâu dài!`,
        isVerified: true,
        likes: 3,
        createdAt: '2026-06-03T14:30:00.000Z'
      },
      {
        id: `${prod.id}-r3`,
        productId: prod.id,
        productName: prod.name,
        author: 'Trần Minh Quân',
        email: 'quan.tran@vnpay.vn',
        rating: 4,
        date: '28/05/2026',
        comment: `Sản phẩm "${prod.name}" giao hỏa tốc cực kỳ đúng giờ dù hôm đó trời mưa to. Bạn shipper lịch sự, bọc ruy băng lụa cẩn thận chống ẩm sương cho hoa. Rất hài lòng về sự tận tâm của đội ngũ!`,
        isVerified: true,
        likes: 2,
        createdAt: '2026-05-28T09:15:00.000Z'
      }
    ];
    return templates.slice(0, Math.min(templates.length, prod.reviewsCount || 3)) as Review[];
  };

  const handleDeleteReview = async (review: any) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa nhận xét đánh giá này của khách hàng "${review.author}" trên sản phẩm "${review.productName}"?`)) {
      if (review.isCustom) {
        try {
          await removeReview(review.id);
          setReviewActionSuccess(`Đã xóa thành công đánh giá của ${review.author} khỏi cơ sở dữ liệu.`);
          setTimeout(() => setReviewActionSuccess(null), 3000);
          if (selectedReviewForDetail?.id === review.id) {
            setSelectedReviewForDetail(null);
          }
        } catch (err) {
          alert('Lỗi khi xóa đánh giá: ' + String(err));
        }
      } else {
        const updated = [...deletedMockReviewIds, review.id];
        setDeletedMockReviewIds(updated);
        localStorage.setItem('fiore_deleted_mock_reviews', JSON.stringify(updated));
        setReviewActionSuccess(`Đã xóa thành công đánh giá hệ thống của ${review.author}.`);
        setTimeout(() => setReviewActionSuccess(null), 3000);
        if (selectedReviewForDetail?.id === review.id) {
          setSelectedReviewForDetail(null);
        }
      }
    }
  };

  const handleToggleVerify = async (review: any) => {
    if (review.isCustom) {
      try {
        const updated: Review = {
          id: review.id,
          productId: review.productId,
          productName: review.productName,
          author: review.author,
          email: review.email,
          rating: review.rating,
          date: review.date,
          comment: review.comment,
          likes: review.likes || 0,
          createdAt: review.createdAt || new Date().toISOString(),
          isVerified: !review.isVerified
        };
        await saveReview(updated);
        setReviewActionSuccess(`Đã cập nhật trạng thái kiểm duyệt của khách hàng ${review.author}.`);
        setTimeout(() => setReviewActionSuccess(null), 3000);
        if (selectedReviewForDetail?.id === review.id) {
          setSelectedReviewForDetail({ ...selectedReviewForDetail, isVerified: !review.isVerified });
        }
      } catch (err) {
        alert('Lỗi khi kiểm duyệt đánh giá: ' + String(err));
      }
    } else {
      alert('Đánh giá mẫu hệ thống mặc định luôn được kiểm duyệt xác minh!');
    }
  };

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
  const [imageLoadError, setImageLoadError] = useState(false);
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
  const [catImageLoadError, setCatImageLoadError] = useState(false);

  // Search filter states
  const [prodSearch, setProdSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null);

  // --- COUPON/PROMOTION MANAGEMENT STATES ---
  const [adminCoupons, setAdminCoupons] = useState<Coupon[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editCouponItem, setEditCouponItem] = useState<Coupon | null>(null);

  // Form states
  const [couponCode, setCouponCode] = useState('');
  const [couponDesc, setCouponDesc] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState(1);
  const [couponMinOrder, setCouponMinOrder] = useState(0);
  const [couponMaxDiscount, setCouponMaxDiscount] = useState<number | undefined>(undefined);
  const [couponIsActive, setCouponIsActive] = useState(true);

  React.useEffect(() => {
    const unsubscribe = subscribeCoupons((loaded) => {
      setAdminCoupons(loaded);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenCouponModal = (c?: Coupon) => {
    if (c) {
      setEditCouponItem(c);
      setCouponCode(c.code);
      setCouponDesc(c.description);
      setCouponType(c.discountType);
      setCouponValue(c.discountValue);
      setCouponMinOrder(c.minOrderValue);
      setCouponMaxDiscount(c.maxDiscount || undefined);
      setCouponIsActive(c.isActive);
    } else {
      setEditCouponItem(null);
      setCouponCode('');
      setCouponDesc('');
      setCouponType('percentage');
      setCouponValue(10);
      setCouponMinOrder(0);
      setCouponMaxDiscount(undefined);
      setCouponIsActive(true);
    }
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      alert('Vui lòng nhập mã ưu đãi!');
      return;
    }

    const payload: Coupon = {
      id: editCouponItem?.id || `cpn-${Date.now()}`,
      code: couponCode.trim().toUpperCase(),
      description: couponDesc.trim(),
      discountType: couponType,
      discountValue: Number(couponValue),
      minOrderValue: Number(couponMinOrder),
      maxDiscount: couponMaxDiscount ? Number(couponMaxDiscount) : null,
      isActive: couponIsActive,
    };

    await saveCoupon(payload);
    setShowCouponModal(false);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này khỏi hệ thống?')) {
      await removeCoupon(id);
    }
  };

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

  const completedOrPaidOrders = orders.filter(o => o.status === 'completed' || o.paymentStatus === 'Paid');
  const averageOrderValue = completedOrPaidOrders.length > 0 
    ? totalRevenue / completedOrPaidOrders.length 
    : 0;

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

  // Calculate preceding 7 days to get actual growth comparison
  const preceding7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const currentWeekTotal = last7DaysData.reduce((sum, d) => sum + d.val, 0);

  const previousWeekTotal = preceding7Days.map((dateObj) => {
    return orders
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
  }).reduce((sum, val) => sum + val, 0);

  // --- REAL-TIME 12 MONTH REVENUE ---
  const last12Months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    return d;
  });

  const last12MonthsData = last12Months.map((dateObj) => {
    const month = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const label = `T${month + 1}/${String(year).slice(-2)}`;

    const monthlyRevenue = orders
      .filter((o) => {
        if (o.status !== 'completed' && o.status !== 'paid') {
          return false;
        }
        if (!o.createdAt) return false;
        const oDate = new Date(o.createdAt);
        return oDate.getFullYear() === year && oDate.getMonth() === month;
      })
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      label,
      val: monthlyRevenue,
    };
  });

  const currentMonthTotal = last12MonthsData[11]?.val || 0;
  const previousMonthTotal = last12MonthsData[10]?.val || 0;

  let growthPercentageNum = 0;
  if (statsMode === 'week') {
    if (previousWeekTotal > 0) {
      growthPercentageNum = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
    } else if (currentWeekTotal > 0) {
      growthPercentageNum = 100;
    } else {
      growthPercentageNum = 0;
    }
  } else {
    if (previousMonthTotal > 0) {
      growthPercentageNum = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
      growthPercentageNum = 100;
    } else {
      growthPercentageNum = 0;
    }
  }

  const currentChartData = statsMode === 'week' ? last7DaysData : last12MonthsData;

  const maxDailyRevenue = Math.max(...currentChartData.map(d => d.val), 100000);
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

  const currentChartPoints = currentChartData.map((d, idx) => {
    const N = currentChartData.length;
    const step = N > 1 ? 600 / (N - 1) : 600;
    const x = 50 + idx * step;
    const y = 205 - (d.val / chartMax) * 175;
    return {
      label: d.label,
      val: d.val,
      x,
      y
    };
  });

  let linePath = '';
  if (currentChartPoints.length > 0) {
    linePath = `M ${currentChartPoints[0].x} ${currentChartPoints[0].y}`;
    const N = currentChartData.length;
    const step = N > 1 ? 600 / (N - 1) : 600;
    const controlOffset = step / 2;
    for (let i = 1; i < currentChartPoints.length; i++) {
      const pPrev = currentChartPoints[i - 1];
      const pCurr = currentChartPoints[i];
      linePath += ` C ${pPrev.x + controlOffset} ${pPrev.y}, ${pCurr.x - controlOffset} ${pCurr.y}, ${pCurr.x} ${pCurr.y}`;
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

  // --- COMPUTE REVENUE BY CATEGORY ---
  const revenueByCategory = categories.map((cat) => {
    let rev = 0;
    orders
      .filter(o => o.status === 'completed' || o.paymentStatus === 'Paid')
      .forEach((ord) => {
        ord.items.forEach((it) => {
          if (it.product && it.product.categoryId === cat.id) {
            rev += (it.product.price || 0) * (it.quantity || 1);
          }
        });
      });
    return {
      categoryId: cat.id,
      categoryName: cat.name,
      revenue: rev,
      image: cat.image,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalCompletedOrPaidRevenue = revenueByCategory.reduce((sum, item) => sum + item.revenue, 0);

  const unreadContactsCount = contacts.filter(c => c.status === 'new').length;

  // --- DETAILED FLOWER BUYING REASONS / LÝ DO MUA HOA ---
  const flowerReasonsRawCount: Record<string, number> = {
    'Sinh nhật (Birthday)': 0,
    'Kỷ niệm ngày cưới / Tình cảm (Anniversary)': 0,
    'Chúc mừng / Khai trương (Congratulations)': 0,
    'Lời xin lỗi / Giảng hòa (Apology)': 0,
    'Lời cảm ơn / Biết ơn (Gratitude)': 0
  };

  orders.forEach((order) => {
    if (order.status === 'cancelled') return;

    const rawNote = (order.note || '').toLowerCase();
    if (
      rawNote.includes('sinh nhật') || 
      rawNote.includes('sinh nhat') || 
      rawNote.includes('sn') || 
      rawNote.includes('birthday') || 
      rawNote.includes('tuổi') || 
      rawNote.includes('tuoi')
    ) {
      flowerReasonsRawCount['Sinh nhật (Birthday)']++;
    } else if (
      rawNote.includes('kỷ niệm') || 
      rawNote.includes('ky niem') || 
      rawNote.includes('anniversary') || 
      rawNote.includes('yêu') || 
      rawNote.includes('yeu') || 
      rawNote.includes('vợ') || 
      rawNote.includes('chồng') || 
      rawNote.includes('love')
    ) {
      flowerReasonsRawCount['Kỷ niệm ngày cưới / Tình cảm (Anniversary)']++;
    } else if (
      rawNote.includes('khai trương') || 
      rawNote.includes('khai truong') || 
      rawNote.includes('chúc mừng') || 
      rawNote.includes('chuc mung') || 
      rawNote.includes('congrat') || 
      rawNote.includes('thắng') || 
      rawNote.includes('thăng') || 
      rawNote.includes('tặng') || 
      rawNote.includes('tang')
    ) {
      flowerReasonsRawCount['Chúc mừng / Khai trương (Congratulations)']++;
    } else if (
      rawNote.includes('xin lỗi') || 
      rawNote.includes('xin loi') || 
      rawNote.includes('sorry') || 
      rawNote.includes('lỗi')
    ) {
      flowerReasonsRawCount['Lời xin lỗi / Giảng hòa (Apology)']++;
    } else {
      const charCodeSum = order.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      const mod = charCodeSum % 5;
      if (mod === 0) {
        flowerReasonsRawCount['Sinh nhật (Birthday)']++;
      } else if (mod === 1) {
        flowerReasonsRawCount['Kỷ niệm ngày cưới / Tình cảm (Anniversary)']++;
      } else if (mod === 2) {
        flowerReasonsRawCount['Chúc mừng / Khai trương (Congratulations)']++;
      } else if (mod === 3) {
        flowerReasonsRawCount['Lời xin lỗi / Giảng hòa (Apology)']++;
      } else {
        flowerReasonsRawCount['Lời cảm ơn / Biết ơn (Gratitude)']++;
      }
    }
  });

  const totalReasonsWithActiveOrders = Object.values(flowerReasonsRawCount).reduce((sum, val) => sum + val, 0) || 1;
  const flowerReasonsList = Object.entries(flowerReasonsRawCount).map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalReasonsWithActiveOrders) * 105) > 100 // adjust or use standard
      ? Math.round((count / totalReasonsWithActiveOrders) * 100)
      : Math.round((count / totalReasonsWithActiveOrders) * 100)
  })).sort((a, b) => b.count - a.count);

  // --- TOP 3 LOYAL CUSTOMERS / TOP 3 KHÁCH HÀNG THÂN THIẾT ---
  const customerSummaryMap: Record<string, {
    email: string;
    name: string;
    phone: string;
    address: string;
    orderCount: number;
    totalSpent: number;
    lastOrderDate: string;
  }> = {};

  orders.forEach((order) => {
    if (order.status === 'cancelled') return;
    const emailKey = (order.customerEmail || 'no-email@fiore.vn').trim().toLowerCase();
    if (!customerSummaryMap[emailKey]) {
      customerSummaryMap[emailKey] = {
        email: order.customerEmail || 'no-email@fiore.vn',
        name: order.customerName || order.recipientName || 'Khách hàng ẩn danh',
        phone: order.recipientPhone || 'N/A',
        address: order.shippingAddress || 'N/A',
        orderCount: 0,
        totalSpent: 0,
        lastOrderDate: order.createdAt
      };
    }

    const val = customerSummaryMap[emailKey];
    val.orderCount += 1;
    val.totalSpent += order.totalAmount || 0;
    if (new Date(order.createdAt) > new Date(val.lastOrderDate)) {
      val.lastOrderDate = order.createdAt;
    }
  });

  const uniqueUsersMapForLoyal: Record<string, User> = {};
  users.forEach((usr) => {
    if (!usr.email) return;
    const emailKey = usr.email.trim().toLowerCase();
    // Keep user record with phone and address if possible, otherwise use first
    if (!uniqueUsersMapForLoyal[emailKey]) {
      uniqueUsersMapForLoyal[emailKey] = usr;
    } else {
      if ((usr.phone && !uniqueUsersMapForLoyal[emailKey].phone) || (usr.address && !uniqueUsersMapForLoyal[emailKey].address)) {
        uniqueUsersMapForLoyal[emailKey] = usr;
      }
    }
  });
  const uniqueUsersList = Object.values(uniqueUsersMapForLoyal);

  const topLoyalCustomersList = uniqueUsersList.map((usr) => {
    const userOrders = orders.filter((o) => o.customerEmail && o.customerEmail.toLowerCase() === usr.email.toLowerCase());
    const validOrders = userOrders.filter(
      (o) => o.status !== 'cancelled' && (o.paymentStatus === 'Paid' || o.status === 'completed' || o.paymentMethod === 'COD')
    );
    const totalSpent = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    return {
      email: usr.email,
      name: usr.name,
      phone: usr.phone || 'Chưa cung cấp',
      address: usr.address || 'Chưa thiết lập',
      orderCount: validOrders.length,
      totalSpent: totalSpent
    };
  })
  .sort((a, b) => b.totalSpent - a.totalSpent || b.orderCount - a.orderCount)
  .slice(0, 3);

  // --- RETURNING CUSTOMER RATE / TỶ LỆ KHÁCH HÀNG QUAY LẠI ---
  const uniqueCustomerEmailsCount = Object.keys(customerSummaryMap).length;
  const returningCustomersCount = Object.values(customerSummaryMap).filter(c => c.orderCount >= 2).length;
  const customerReturnRate = uniqueCustomerEmailsCount > 0 
    ? (returningCustomersCount / uniqueCustomerEmailsCount) * 100 
    : 0;

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
    setImageLoadError(false);
    setProdShortDesc('');
    setProdDesc('');
    setProdStock(15);
    setProdIsFeatured(false);
    setProdIsNew(true);
    setShowProductModal(true);
    setTimeout(() => {
      const el = document.getElementById('admin-product-inline-form-box') || document.getElementById('admin-btn-add-product');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  };

  const openEditProduct = (p: Product) => {
    setEditProdItem(p);
    setProdName(p.name);
    setProdPrice(p.price);
    setProdCategory(p.categoryId);
    setProdImage(p.image);
    setImageLoadError(false);
    setProdShortDesc(p.shortDesc);
    setProdDesc(p.description);
    setProdStock(p.stock);
    setProdIsFeatured(p.isFeatured);
    setProdIsNew(p.isNew);
    setShowProductModal(true);
    setTimeout(() => {
      const el = document.getElementById('admin-product-inline-form-box');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
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
    setCatImageLoadError(false);
    setShowCategoryModal(true);
  };

  const openEditCategory = (c: Category) => {
    setEditCatItem(c);
    setCatName(c.name);
    setCatDesc(c.description);
    setCatImage(c.image);
    setCatImageLoadError(false);
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
      {/* Mobile Control Bar and Hamburger Menu Toggle Block (< lg) */}
      <div className="lg:hidden w-full bg-white border border-amber-200/60 rounded-2xl p-4 mb-4 flex flex-col gap-3 relative z-30 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-900 text-amber-400 h-9 w-9 rounded-xl flex items-center justify-center font-bold">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-400">Không gian quản trị</p>
              <h2 className="text-sm font-bold text-gray-800 font-serif flex items-center gap-1.5">
                <span>Fióre Admin</span>
                <span className="text-[9px] font-sans font-bold bg-amber-400 px-1.5 py-0.5 rounded text-emerald-950">
                  {activeTab === 'stats' && 'Thống kê'}
                  {activeTab === 'products' && 'Sản phẩm'}
                  {activeTab === 'categories' && 'Danh mục'}
                  {activeTab === 'orders' && 'Đơn hàng'}
                  {activeTab === 'customers' && 'Khách hàng'}
                  {activeTab === 'coupons' && 'Ưu đãi & Khuyến mãi'}
                  {activeTab === 'contacts' && 'Liên hệ'}
                  {activeTab === 'reviews' && 'Đánh giá'}
                  {activeTab === 'security' && 'Bảo mật/MK'}
                  {activeTab === 'inventory' && 'Quản lý kho'}
                </span>
              </h2>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-200/50 text-emerald-900 hover:bg-neutral-100 transition cursor-pointer shrink-0"
            id="admin-mobile-nav-toggle-btn"
          >
            {isMobileNavOpen ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
          </button>
        </div>

        {/* Expanded Hamburger navigation options */}
        {isMobileNavOpen && (
          <div className="border-t border-amber-100 pt-3 mt-1 flex flex-col gap-1.5 animate-fade-in" id="admin-mobile-nav-options">
            <button
              onClick={() => { handleTabChange('stats'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'stats' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <BarChart2 className="mr-2.5 h-4 w-4 shrink-0" /> Báo cáo thống kê
            </button>
            <button
              onClick={() => { handleTabChange('products'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'products' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <Package className="mr-2.5 h-4 w-4 shrink-0" /> Quản lý sản phẩm
            </button>
            <button
              onClick={() => { handleTabChange('inventory'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'inventory' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <Database className="mr-2.5 h-4 w-4 shrink-0" /> Quản lý kho
            </button>
            <button
              onClick={() => { handleTabChange('categories'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'categories' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <Layers className="mr-2.5 h-4 w-4 shrink-0" /> Quản lý danh mục
            </button>
            <button
              onClick={() => { handleTabChange('orders'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                activeTab === 'orders' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <div className="flex items-center">
                <ShoppingBag className="mr-2.5 h-4 w-4 shrink-0" /> 
                <span>Quản lý đơn hàng</span>
              </div>
              {(confirmedOrdersCount + paidOrdersCount + preparingOrdersCount) > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-emerald-950 rounded-full font-bold animate-pulse">{confirmedOrdersCount + paidOrdersCount + preparingOrdersCount}</span>
              )}
            </button>
            <button
              onClick={() => { handleTabChange('coupons'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'coupons' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <Gift className="mr-2.5 h-4 w-4 shrink-0 text-rose-500" /> Quản lý ưu đãi
            </button>
            <button
              onClick={() => { handleTabChange('customers'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'customers' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <Users className="mr-2.5 h-4 w-4 shrink-0" /> Sổ khách hàng
            </button>
            <button
              onClick={() => { handleTabChange('contacts'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center justify-between text-xs font-semibold transition cursor-pointer ${
                activeTab === 'contacts' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <div className="flex items-center">
                <Mail className="mr-2.5 h-4 w-4 shrink-0" />
                <span>Liên hệ khách hàng</span>
              </div>
              {unreadContactsCount > 0 && (
                <span className="px-1.5 py-0.5 text-[9px] bg-amber-500 text-emerald-950 rounded-full font-bold animate-pulse">{unreadContactsCount}</span>
              )}
            </button>
            <button
              onClick={() => { handleTabChange('reviews'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'reviews' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <MessageSquare className="mr-2.5 h-4 w-4 shrink-0" /> Quản lý đánh giá
            </button>
            <button
              onClick={() => { handleTabChange('security'); setIsMobileNavOpen(false); }}
              className={`w-full rounded-xl px-4 py-3 flex items-center text-xs font-semibold transition cursor-pointer ${
                activeTab === 'security' ? 'bg-emerald-100/60 text-emerald-950 font-bold' : 'text-stone-700 hover:bg-amber-100/40'
              }`}
            >
              <Lock className="mr-2.5 h-4 w-4 shrink-0" /> Bảo mật & Mật khẩu
            </button>
            
            {onAdminLogout && (
              <div className="pt-2 border-t border-amber-100 mt-2">
                <button
                  onClick={() => { setIsMobileNavOpen(false); onAdminLogout(); }}
                  className="w-full rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 text-xs font-bold text-red-650 transition hover:bg-red-100 flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Đăng xuất hệ thống</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Sticky Sidebar on Desktop */}
        <aside className="hidden lg:flex w-full lg:w-60 lg:shrink-0 lg:sticky lg:top-[76px] lg:h-[calc(100vh-110px)] flex-col justify-between lg:border-r border-amber-200/60 lg:pr-4 bg-[#FAF7F0] z-20">
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
                onClick={() => handleTabChange('inventory')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'inventory' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
                id="admin-inventory-tab"
              >
                <Database className="mr-2 h-4 w-4 shrink-0 text-emerald-700" /> Quản lý kho
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
                onClick={() => handleTabChange('coupons')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'coupons' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
                id="admin-coupons-tab"
              >
                <Gift className="mr-2 h-4 w-4 shrink-0 text-rose-500" /> Quản lý ưu đãi
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
                onClick={() => handleTabChange('reviews')}
                className={`w-full rounded-lg px-3.5 py-2 flex items-center transition cursor-pointer ${
                  activeTab === 'reviews' ? 'bg-emerald-100/60 text-emerald-950 font-bold shadow-xs' : 'text-stone-700 hover:bg-amber-100/40 hover:text-emerald-850'
                }`}
                id="admin-reviews-tab"
              >
                <MessageSquare className="mr-2 h-4 w-4 shrink-0 text-amber-600" /> Quản lý đánh giá
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

            {/* Card 5: Giá trị đơn hàng trung bình (AOV) */}
            <div className="rounded-2xl border border-amber-200/60 bg-white p-4 sm:p-5 shadow-xs flex items-center space-x-3 sm:space-x-4 w-fit min-w-max transition-all" id="admin-kpi-aov">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#C8A96B] shrink-0">
                <BarChart2 className="h-5.5 w-5.5 sm:h-6 sm:w-6" strokeWidth={2.5} />
              </div>
              <div className="min-w-0 pr-1">
                <p className="text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-stone-400 break-words whitespace-normal">Giá trị ĐH trung bình (AOV)</p>
                <p className="text-sm sm:text-base md:text-lg lg:text-sm xl:text-lg font-black text-emerald-950 tracking-tight mt-0.5 whitespace-nowrap" title={formatVND(averageOrderValue)}>
                  {formatVND(averageOrderValue)}
                </p>
              </div>
            </div>

          </div>

          {/* Interactive Responsive SVG Charts */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            
            {/* Sales revenue over time */}
            <div className="lg:col-span-12 rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-amber-100/60 pb-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div>
                    <h3 className="font-serif text-base font-bold text-emerald-950">
                      {statsMode === 'week' ? 'Biểu đồ doanh thu thực tế theo tuần' : 'Biểu đồ doanh thu thực tế theo tháng'}
                    </h3>
                    <p className="text-xs text-stone-400">Tổng quan thu nhập tích lũy lũy tiến</p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-auto">
                    <button
                      onClick={() => { setStatsMode('week'); setHoveredChartIdx(null); }}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                        statsMode === 'week'
                          ? 'bg-[#1F3D2B] text-white border-[#1F3D2B]'
                          : 'bg-[#FAF7F0] text-stone-600 border-[#C8A96B]/20 hover:bg-stone-100'
                      }`}
                    >
                      Xem theo tuần
                    </button>
                    <button
                      onClick={() => { setStatsMode('month'); setHoveredChartIdx(null); }}
                      className={`px-3 py-1 text-xs font-bold rounded-full transition-all border cursor-pointer ${
                        statsMode === 'month'
                          ? 'bg-[#1F3D2B] text-white border-[#1F3D2B]'
                          : 'bg-[#FAF7F0] text-stone-600 border-[#C8A96B]/20 hover:bg-stone-100'
                      }`}
                    >
                      Xem theo từng tháng
                    </button>
                  </div>
                </div>
                <div className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full font-bold self-start sm:self-auto ${
                  growthPercentageNum >= 0 
                    ? 'text-emerald-800 bg-emerald-50' 
                    : 'text-rose-800 bg-rose-50'
                }`}>
                  {growthPercentageNum >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-rose-600" />
                  )}
                  <span>
                    {growthPercentageNum >= 0 ? '+' : ''}
                    {growthPercentageNum.toFixed(1)}% tăng trưởng
                  </span>
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
                  {hoveredChartIdx !== null && currentChartPoints[hoveredChartIdx] && (
                    <line 
                      x1={currentChartPoints[hoveredChartIdx].x} 
                      y1="30" 
                      x2={currentChartPoints[hoveredChartIdx].x} 
                      y2="205" 
                      stroke="#C8A96B" 
                      strokeWidth="1.5" 
                      strokeDasharray="4 4" 
                    />
                  )}

                  {/* Data coordinates circles points */}
                  {currentChartPoints.map((pt, idx) => (
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
                        x={pt.x - 20} 
                        y="15" 
                        width="40" 
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
                {hoveredChartIdx !== null && currentChartPoints[hoveredChartIdx] && (
                  <div 
                    className="absolute pointer-events-none bg-[#1F3D2B] text-[#F8F5EF] text-xs font-sans rounded-xl py-2 px-3 shadow-xl border border-[#C8A96B]/60 flex flex-col items-center -translate-x-1/2 -translate-y-[110%] transition-transform duration-200 ease-out animate-in fade-in"
                    style={{
                      left: `${((currentChartPoints[hoveredChartIdx].x) / 700) * 100}%`,
                      top: `${((currentChartPoints[hoveredChartIdx].y) / 240) * 100}%`,
                    }}
                  >
                    <span className="text-[9px] text-[#C8A96B] font-extrabold uppercase tracking-widest">
                      {statsMode === 'week' ? 'Ngày' : 'Tháng'} {currentChartPoints[hoveredChartIdx].label}
                    </span>
                    <span className="font-extrabold mt-0.5 whitespace-nowrap text-[11px]">
                      {formatVND(currentChartPoints[hoveredChartIdx].val)}
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

          {/* Doanh thu theo danh mục sản phẩm */}
          <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs mt-6" id="admin-category-revenue-chart">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-100 pb-3 mb-6 gap-3">
              <div>
                <h3 className="font-serif text-base font-bold text-emerald-950 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>Doanh thu theo danh mục sản phẩm</span>
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">Phân tích dòng tiền thu về theo từng nhóm danh mục hoa nghệ thuật</p>
              </div>
              <div className="text-xs font-bold text-emerald-950 bg-[#FAF7F0] px-3 py-1.5 rounded-lg border border-[#C8A96B]/20">
                Tổng doanh thu tính theo danh mục: {formatVND(totalCompletedOrPaidRevenue)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {revenueByCategory.map((catItem, idx) => {
                const percent = totalCompletedOrPaidRevenue > 0 
                  ? Math.round((catItem.revenue / totalCompletedOrPaidRevenue) * 105) // let's adjust or use correct mathematical percent
                  : 0;
                const actualPercentToShow = totalCompletedOrPaidRevenue > 0 
                  ? Math.round((catItem.revenue / totalCompletedOrPaidRevenue) * 100) 
                  : 0;

                return (
                  <div key={catItem.categoryId} className="border border-amber-100/50 rounded-xl bg-[#FAF7F0]/40 p-4 hover:border-[#C8A96B]/60 hover:bg-[#FAF7F0]/80 transition duration-300 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden shrink-0 border border-[#C8A96B]/20 bg-white flex items-center justify-center">
                          {catItem.image ? (
                            <img 
                              src={catItem.image} 
                              alt={catItem.categoryName} 
                              className="h-full w-full object-cover animate-fade-in"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-[#C8A96B] bg-amber-50">
                              Fióre
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-serif text-xs font-black text-emerald-950 truncate" title={catItem.categoryName}>{catItem.categoryName}</h4>
                          <p className="text-[10px] text-stone-400">Danh mục #{idx + 1}</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-baseline mt-4 mb-1.5">
                        <span className="text-sm font-black text-emerald-950">{formatVND(catItem.revenue)}</span>
                        <span className="text-[11px] font-extrabold text-[#C8A96B]">{actualPercentToShow}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden mt-1">
                      <div 
                        className="bg-[#1F3D2B] h-full rounded-full transition-all duration-500" 
                        style={{ width: `${actualPercentToShow}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
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

          {/* PHẦN BÁO CÁO MỚI: LÝ DO MUA HOA, KHÁCH HÀNG THÂN THIẾT & QUAY LẠI */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8" id="admin-custom-reports-section">
            
            {/* 1. Biểu đồ tròn - Lý do mua hoa */}
            <div className="lg:col-span-5 rounded-2xl border border-amber-200/60 bg-white p-5 shadow-xs flex flex-col justify-between animate-fade-in" id="admin-reasons-pie-chart">
              <div>
                <h3 className="font-serif text-sm font-bold text-emerald-950 border-b border-amber-100 pb-2.5 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-800" strokeWidth={2.5} />
                    <span>Lý do mua hoa (Pie Chart)</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Thống kê note</span>
                </h3>

                {/* Hand-drawn SVG Donut chart for reasons */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative h-44 w-44 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                      {/* Background circle track */}
                      <circle
                        cx="100"
                        cy="100"
                        r="70"
                        fill="transparent"
                        stroke="#FAF7F0"
                        strokeWidth="24"
                      />

                      {/* Reasons segments */}
                      {(() => {
                        let cumulativePercent = 0;
                        const colors = ['#1F3D2B', '#C8A96B', '#2563EB', '#EF4444', '#10B981'];
                        return flowerReasonsList.map((item, idx) => {
                          const pct = item.percentage;
                          if (pct === 0) return null;
                          const strokeDashoffset = 439.82 - (pct / 100) * 439.82;
                          const currentAngle = (cumulativePercent / 100) * 360;
                          cumulativePercent += pct;
                          return (
                            <circle
                              key={item.name}
                              cx="100"
                              cy="100"
                              r="70"
                              fill="transparent"
                              stroke={colors[idx % colors.length]}
                              strokeWidth="24"
                              strokeDasharray="439.82"
                              strokeDashoffset={strokeDashoffset}
                              style={{
                                transformOrigin: 'center',
                                transform: `rotate(${currentAngle}deg)`
                              }}
                              className="transition-all duration-300 hover:stroke-[27px] cursor-pointer"
                            />
                          );
                        });
                      })()}
                    </svg>

                    {/* Central hole label stats */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none bg-white rounded-full w-24 h-24 m-auto shadow-xs border border-amber-100/50">
                      <span className="text-[8px] uppercase font-extrabold text-stone-400 tracking-wider">Tổng đơn active</span>
                      <span className="font-serif text-xl font-black text-emerald-950 leading-none my-0.5">
                        {orders.filter(o => o.status !== 'cancelled').length}
                      </span>
                      <span className="text-[8px] font-mono text-stone-400/90 font-bold">mục đích</span>
                    </div>
                  </div>

                  {/* Segment Legend item list with indicators */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-5 text-[10.5px] font-bold w-full">
                    {flowerReasonsList.map((item, idx) => {
                      const colors = ['#1F3D2B', '#C8A96B', '#2563EB', '#EF4444', '#10B981'];
                      return (
                        <div key={item.name} className="flex items-center space-x-1.5 min-w-0">
                          <span 
                            className="h-2 w-2 rounded-full inline-block shrink-0" 
                            style={{ backgroundColor: colors[idx % colors.length] }}
                          ></span>
                          <span className="text-stone-600 truncate" title={`${item.name} (${item.count} đơn)`}>
                            {item.name.split(' (')[0]}: <span className="text-emerald-950 font-extrabold">{item.percentage}%</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-100/50 text-[10px] text-stone-400 italic text-center">
                Mục đích tặng hoa được phân tích tự động từ nội dung lời chúc hoặc phân phối ngẫu nhiên nếu bỏ trống.
              </div>
            </div>

            {/* 2. Top 3 khách hàng & Tỷ lệ quay lại (Right Column) */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between animate-fade-in">
              
              {/* Card Tỷ lệ quay lại (Customer Return rate) */}
              <div className="border border-amber-200/60 rounded-2xl bg-white p-5 shadow-xs" id="admin-customer-retention-rate">
                <h3 className="font-serif text-sm font-bold text-emerald-950 border-b border-amber-100 pb-2.5 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4 text-emerald-800" />
                    <span>Tỷ lệ khách hàng quay lại (Retention)</span>
                  </span>
                  <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Đo lường trung thành</span>
                </h3>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background dial track */}
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FAF7F0" strokeWidth="10" />
                        {/* Highlight progress meter */}
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="40" 
                          fill="transparent" 
                          stroke="#1F3D2B" 
                          strokeWidth="10" 
                          strokeDasharray="251.32" 
                          strokeDashoffset={251.32 - (customerReturnRate / 100) * 251.32}
                          strokeLinecap="round"
                          className="transition-all duration-500"
                        />
                      </svg>
                      {/* Percent float absolute panel */}
                      <span className="absolute text-xs font-black text-emerald-950 font-sans">
                        {customerReturnRate.toFixed(1)}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-serif text-xs font-black text-emerald-950">Chất lượng giữ chân khách hàng</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                        Có <span className="font-bold text-[#C8A96B]">{returningCustomersCount} trên {uniqueCustomerEmailsCount}</span> khách hàng đã đặt mua từ 2 đơn hàng thành công trở lên tại Fióre.
                      </p>
                    </div>
                  </div>

                  <div className="border border-emerald-100/60 rounded-xl bg-emerald-50/50 p-3 text-center shrink-0 w-full sm:w-auto">
                    <span className="text-[9px] uppercase font-bold text-emerald-800 tracking-wider block">Chỉ số</span>
                    <span className="text-sm font-black text-emerald-950 font-sans block mt-0.5">
                      {customerReturnRate >= 30 ? 'Cực tốt' : customerReturnRate >= 15 ? 'Khá' : 'Cần cải thiện'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bảng Top 3 khách hàng thân thiết */}
              <div className="border border-amber-200/60 rounded-2xl bg-white p-5 shadow-xs flex-1 flex flex-col justify-between" id="admin-loyal-customer-table">
                <div>
                  <h3 className="font-serif text-sm font-bold text-emerald-950 border-b border-amber-100 pb-2.5 mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Award className="h-4.5 w-4.5 text-amber-600" strokeWidth={2.5} />
                      <span>Top 3 Khách hàng thân thiết</span>
                    </span>
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold uppercase font-mono">Dòng tiền cao nhất</span>
                  </h3>

                  {topLoyalCustomersList.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-stone-100 text-stone-400 font-extrabold uppercase text-[9.5px]">
                            <th className="py-2.5 pl-1 text-center w-10">Hạng</th>
                            <th className="py-2.5">Khách hàng</th>
                            <th className="py-2.5 text-center w-16">Số đơn</th>
                            <th className="py-2.5 text-right pr-2">Tổng chi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-50">
                          {topLoyalCustomersList.map((c, idx) => (
                            <tr key={`${c.email || 'no-email'}-${idx}`} className="hover:bg-[#FAF7F0]/40 transition duration-150">
                              <td className="py-2.5 pl-1 text-center">
                                <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-black ${
                                  idx === 0 
                                    ? 'bg-[#1F3D2B] text-white' 
                                    : idx === 1 
                                    ? 'bg-[#C8A96B] text-white' 
                                    : 'bg-stone-100 text-stone-600'
                                }`}>
                                  {idx + 1}
                                </span>
                              </td>
                              <td className="py-2.5 min-w-[140px]">
                                <p className="font-bold text-emerald-950 truncate max-w-[170px]" title={c.name}>{c.name}</p>
                                <p className="text-[10px] text-stone-400 truncate max-w-[170px]" title={c.email}>{c.email}</p>
                                <p className="text-[9px] text-stone-400/80 font-semibold">{c.phone}</p>
                              </td>
                              <td className="py-2.5 text-center font-bold text-stone-700 font-mono">
                                {c.orderCount}
                              </td>
                              <td className="py-2.5 text-right pr-2 font-black text-emerald-850 font-sans">
                                {formatVND(c.totalSpent)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-stone-400 italic">
                      Chưa ghi nhận dữ liệu giao dịch thành công để tính toán khách hàng thân thiết.
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 text-[10.5px] text-stone-400 font-medium flex justify-between items-center bg-[#FAF7F0]/40 px-3 py-2 rounded-xl border border-amber-100/30">
                  <span>Hệ thống phân hạng tự động theo lũy kế doanh thu thực chi.</span>
                  <span className="font-extrabold text-[#C8A96B] cursor-help hover:underline">Xem tiêu chí</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* --- TAB 2: PRODUCTS CATALOGUE ADMIN --- */}
      {activeTab === 'products' && (
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs animate-fade-in">
          
          {/* Linked Product Files Export & Synchronization Panel */}
          <div className="mb-6 p-4 rounded-xl border border-amber-150 bg-gradient-to-r from-amber-50/40 to-stone-50/50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-emerald-150 text-emerald-800 mt-0.5 shrink-0">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">Liên kết dữ liệu &amp; Xuất danh mục sản phẩm</h4>
                <p className="text-stone-500 text-[11px] mt-0.5 leading-relaxed">
                  Tải xuống cấu trúc tệp liên kết thời gian thực trực tiếp từ hệ thống dữ liệu Fióre. Hỗ trợ đồng bộ hóa danh mục hoa tươi với các nền tảng quảng cáo và phần mềm kế toán.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto shrink-0 justify-end">
              {/* Direct Excel CSV Export */}
              <button
                onClick={() => {
                  const csvData = convertProductsToCSV(products, categories);
                  downloadFile(csvData, 'fiore_products_catalog.csv', 'text/csv;charset=utf-8;');
                }}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-bold text-stone-700 hover:text-emerald-900 hover:border-emerald-700 transition cursor-pointer shadow-xs"
              >
                <FileText className="h-3.5 w-3.5 text-amber-600" />
                <span>Xuất Excel (.csv)</span>
              </button>

              {/* Feed XML RSS Google Merchant Center */}
              <button
                onClick={() => {
                  const siteUrl = window.location.origin;
                  const xmlFeed = convertProductsToMerchantXML(products, categories, siteUrl);
                  downloadFile(xmlFeed, 'google_merchant_feed.xml', 'application/xml;charset=utf-8;');
                }}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-bold text-stone-700 hover:text-emerald-900 hover:border-emerald-700 transition cursor-pointer shadow-xs"
              >
                <Download className="h-3.5 w-3.5 text-emerald-600" />
                <span>XML RSS Feed</span>
              </button>

              {/* JSON raw backup */}
              <button
                onClick={() => {
                  const jsonData = JSON.stringify(products, null, 2);
                  downloadFile(jsonData, 'fiore_products_backup.json', 'application/json;charset=utf-8;');
                }}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-200 bg-white px-3 py-1.5 text-[11px] font-bold text-stone-700 hover:text-emerald-900 hover:border-emerald-700 transition cursor-pointer shadow-xs"
              >
                <Database className="h-3.5 w-3.5 text-indigo-600" />
                <span>Sao lưu tệp (.json)</span>
              </button>
            </div>
          </div>

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
              className="inline-flex items-center justify-center rounded-full bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-990 transition cursor-pointer"
              id="admin-btn-add-product"
            >
              <Plus className="mr-1.5 h-4 w-4" /> Thêm sản phẩm mới
            </button>
          </div>

          {/* Inline Add/Edit Product panel */}
          {showProductModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="mb-8 rounded-2xl border-2 border-emerald-805/20 bg-[#FAF9F5] p-6 shadow-sm overflow-hidden"
              id="admin-product-inline-form-box"
            >
              <div className="flex items-center justify-between border-b border-amber-100 pb-3 mb-5">
                <h4 className="font-serif text-base font-bold text-[#1F3D2B] flex items-center gap-2">
                  <Plus className="h-4 w-4 text-emerald-800" />
                  <span>{editProdItem ? `Chỉnh Sửa Mẫu "${editProdItem.name}"` : 'Thêm Mẫu Thiết Kế Mới'}</span>
                </h4>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="rounded-full px-3 py-1 text-[11px] text-gray-500 hover:bg-stone-200 hover:text-gray-950 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  ✕ Hủy bỏ / Đóng
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Tên bó hoa *</label>
                    <input
                      type="text"
                      required
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      placeholder="Ví dụ: Bó Hoa Sữa Trắng Trẻ"
                      className="w-full rounded-lg border border-amber-200 bg-white p-2.5 outline-none focus:border-[#1F3D2B]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Danh mục chuyên mục *</label>
                    <select
                      value={prodCategory}
                      onChange={(e) => setProdCategory(e.target.value)}
                      className="w-full rounded-lg border border-amber-200 p-2.5 bg-white outline-none focus:border-[#1F3D2B]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Đơn Giá (VND) *</label>
                    <input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => setProdPrice(Number(e.target.value))}
                      className="w-full rounded-lg border border-amber-200 bg-white p-2.5 outline-none focus:border-[#1F3D2B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Kho sẵn có (Số lượng) *</label>
                    <input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => setProdStock(Number(e.target.value))}
                      className="w-full rounded-lg border border-amber-200 bg-white p-2.5 outline-none focus:border-[#1F3D2B]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-stone-500 uppercase tracking-wide text-xs">Ảnh bìa (URL) *</label>
                      <label className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-100 flex items-center space-x-0.5 transition font-sans">
                        <Plus className="h-2.5 w-2.5" />
                        <span>Tải ảnh từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 2 * 1024 * 1024) {
                                alert("Kích thước ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.");
                                return;
                              }
                              const reader = new FileReader();
                              reader.onload = (evt) => {
                                if (evt.target?.result) {
                                  setProdImage(evt.target.result as string);
                                  setImageLoadError(false);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={prodImage}
                      onChange={(e) => {
                        setProdImage(e.target.value);
                        setImageLoadError(false);
                      }}
                      placeholder="Dán liên kết URL hoặc chọn tải ảnh từ máy"
                      className="w-full rounded-lg border border-amber-200 bg-white p-2.5 outline-none focus:border-[#1F3D2B] text-xs"
                    />
                  </div>
                </div>

                {/* Live Image Preview & Other Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 rounded-xl border border-dashed border-amber-200 bg-[#FAF7F0] p-3 flex flex-col items-center">
                    <span className="block font-bold text-[#1F3D2B] uppercase tracking-wide mb-1.5 text-[10px] self-start font-sans">Xem trước ảnh sản phẩm hiển thị</span>
                    <div className="relative w-full h-32 rounded-lg bg-white border border-amber-100 flex items-center justify-center overflow-hidden shadow-xs select-none">
                      {prodImage ? (
                        <img
                          src={imageLoadError ? 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=600' : prodImage}
                          alt="Xem trước ảnh sản phẩm"
                          className="w-full h-full object-cover transition-all"
                          referrerPolicy="no-referrer"
                          onError={() => setImageLoadError(true)}
                        />
                      ) : (
                        <div className="text-gray-400 text-center flex flex-col items-center p-4">
                          <svg className="w-8 h-8 text-amber-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[11px]">Chưa nhập địa chỉ liên kết ảnh sản phẩm</span>
                        </div>
                      )}

                      {imageLoadError && (
                        <div className="absolute inset-0 bg-red-50/95 flex flex-col items-center justify-center p-2 text-center">
                          <span className="text-red-700 font-bold text-[10px]">Lỗi tải ảnh URL.</span>
                          <span className="text-stone-500 text-[9px] mt-0.5">Đặt về mẫu hoa hệ thống mặc định</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-3">
                    <div>
                      <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Mô tả ngắn (Hiển thị thẻ bán)</label>
                      <input
                        type="text"
                        value={prodShortDesc}
                        onChange={(e) => setProdShortDesc(e.target.value)}
                        placeholder="Ví dụ: Bó gồm 10 cúc trắng tinh nghịch..."
                        className="w-full rounded-lg border border-amber-200 bg-white p-2.5 outline-none focus:border-[#1F3D2B]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-500 uppercase tracking-wide mb-1">Mô tả chi tiết sản phẩm</label>
                      <textarea
                        value={prodDesc}
                        onChange={(e) => setProdDesc(e.target.value)}
                        rows={3}
                        className="w-full rounded-lg border border-amber-200 bg-white p-2.5 outline-none focus:border-[#1F3D2B]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-amber-100 pt-4">
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-1.5 font-bold text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsNew}
                        onChange={(e) => setProdIsNew(e.target.checked)}
                        className="h-4 w-4 rounded text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>Mẫu hoa MỚI ra mắt</span>
                    </label>

                    <label className="flex items-center space-x-1.5 font-bold text-stone-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prodIsFeatured}
                        onChange={(e) => setProdIsFeatured(e.target.checked)}
                        className="h-4 w-4 rounded text-emerald-800 focus:ring-emerald-700"
                      />
                      <span>Mẫu hoa NỔI BẬT trang chủ</span>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowProductModal(false)}
                      className="rounded-full px-5 py-2 border text-gray-500 hover:bg-neutral-150 transition cursor-pointer font-bold bg-white"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="rounded-full bg-emerald-800 hover:bg-emerald-990 px-6 py-2 text-white font-bold transition cursor-pointer shadow-xs"
                      id="admin-submit-product-btn"
                    >
                      {editProdItem ? 'Cập nhật sản phẩm' : 'Đăng bán sản phẩm'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}

          {/* Grid visual list for administration */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-amber-200/40 min-w-[700px] lg:min-w-full">
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

          {/* Desktop view table */}
          <div className="hidden md:block overflow-x-auto">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card responsive view */}
          <div className="block md:hidden space-y-4">
            {filteredOrders.length === 0 ? (
              <p className="text-center text-xs text-stone-400 py-6">Không tìm thấy đơn hàng phù hợp</p>
            ) : (
              filteredOrders.map((ord) => (
                <div key={ord.id} className="rounded-xl border border-amber-200/50 bg-neutral-50/50 p-4 space-y-2.5 shadow-xs" id={`admin-order-card-${ord.id}`}>
                  
                  {/* Card Header: Order ID & Date */}
                  <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                    <span className="font-mono font-bold text-xs text-emerald-950 bg-amber-100 px-2.5 py-0.5 rounded">
                      #{ord.id}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {formatDateTime(ord.createdAt)}
                    </span>
                  </div>

                  {/* Customer Information detail */}
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-stone-800">
                      Khách nhận: <span className="text-emerald-950 font-extrabold">{ord.recipientName}</span>
                    </p>
                    <p className="text-stone-605">
                      SĐT nhận: <span className="font-semibold text-gray-800">{ord.recipientPhone}</span>
                    </p>
                    <p className="text-stone-500 leading-normal">
                      Địa chỉ: <span className="font-medium text-gray-700">{ord.shippingAddress}</span>
                    </p>
                  </div>

                  {/* Items list with calculations */}
                  <div className="bg-white rounded-lg border border-pink-100/60 p-2.5 space-y-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Danh sách mẫu thiết kế</p>
                    {ord.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-start text-xs border-b border-pink-50 last:border-b-0 pb-1.5 last:pb-0">
                        <span className="truncate text-gray-800 max-w-[170px]" title={it.product.name}>
                          {it.product.name}
                        </span>
                        <span className="text-stone-500 text-[11px] shrink-0 font-medium">
                          x{it.quantity} - <span className="font-bold text-rose-700">{formatVND(it.product.price)}</span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Note / greetings */}
                  {ord.note && (
                    <div className="bg-rose-50/80 border border-rose-100/60 rounded-lg p-2.5 text-[11px] text-rose-800 leading-relaxed">
                      <p className="font-bold mb-0.5">🎁 Lời chúc / Thiệp gửi kèm:</p>
                      <p className="italic">"{ord.note}"</p>
                    </div>
                  )}

                  {/* Pricing and status summary */}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <div>
                      <p className="text-[9px] text-stone-400 uppercase font-semibold tracking-wider">Tổng đơn hàng</p>
                      <p className="font-black text-rose-700 text-[13.5px] mt-0.5">{formatVND(ord.totalAmount)}</p>
                    </div>
                    
                    <div className="text-right space-y-1 bg-white border border-amber-100/40 p-1.5 rounded-lg">
                      <span className={`inline-block px-2 py-0.5 text-[9px] font-extrabold rounded ${
                        ord.paymentMethod === 'VNPAY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : ord.paymentMethod === 'VISA'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {ord.paymentMethod || 'COD'}
                      </span>
                      <div>
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full ${getStatusBadgeStyles(ord.status)}`}>
                          {getStatusLabelText(ord.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct status selection actions */}
                  <div className="pt-2.5 border-t border-amber-100">
                    <label htmlFor={`update-status-select-mobile-${ord.id}`} className="block text-[10px] font-bold uppercase text-stone-400 mb-1">Cập nhật tiến trình đơn:</label>
                    <select
                      id={`update-status-select-mobile-${ord.id}`}
                      value={ord.status}
                      onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                      className="w-full rounded-xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs font-semibold outline-none text-emerald-950 focus:border-emerald-700 cursor-pointer min-h-[44px]"
                    >
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="preparing">Đang chuẩn bị hàng</option>
                      <option value="shipping">Đang giao hàng</option>
                      <option value="completed">Hoàn tất</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>

                </div>
              ))
            )}
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
              const userOrders = orders.filter((o) => o.customerEmail && o.customerEmail.toLowerCase() === usr.email.toLowerCase());
              const validOrders = userOrders.filter(
                (o) => o.status !== 'cancelled' && (o.paymentStatus === 'Paid' || o.status === 'completed' || o.paymentMethod === 'COD')
              );
              const totalSpent = validOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
              const roundedSpent = Math.round(totalSpent / 1000) * 1000;
              const redeemedPointsSum = validOrders.reduce((sum, o) => sum + (o.redeemedPoints || 0), 0);
              const earnedPoints = Math.max(0, Math.floor(roundedSpent / 50000) - redeemedPointsSum);

              let tierName = 'Thẻ Bạc';
              let tierColor = 'bg-stone-50 border-stone-200 text-stone-700';
              if (totalSpent >= 5000000) {
                tierName = 'Thẻ Kim Cương';
                tierColor = 'bg-indigo-50 border-indigo-200 text-indigo-700';
              } else if (totalSpent >= 3000000) {
                tierName = 'Thẻ Vàng';
                tierColor = 'bg-amber-50 border-amber-200 text-amber-800';
              }

              return (
                <div key={usr.id} className="rounded-xl border border-amber-200/50 p-4 bg-white flex items-start space-x-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
                  <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-serif text-lg font-bold shrink-0">
                    {usr.name.charAt(0)}
                  </div>
                  <div className="space-y-1 text-xs flex-1">
                    <p className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                      {usr.name}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${tierColor}`}>
                        {tierName}
                      </span>
                    </p>
                    <p className="text-stone-400">Email: {usr.email} (SĐT: {usr.phone || 'Chưa cung cấp'})</p>
                    <p className="text-stone-500">Mặc định: {usr.address || 'Chưa thiết lập'}</p>
                    
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="px-2 py-1 rounded bg-amber-50 border border-amber-100 font-bold text-amber-900 text-[10px]">
                        Đã mua: {userOrders.length} Đơn
                      </span>
                      <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-100 font-bold text-emerald-800 text-[10px]">
                        Tích lũy: {formatVND(totalSpent)}
                      </span>
                      <span className="px-2 py-1 rounded bg-rose-50 border border-rose-100 font-bold text-rose-700 text-[10px]">
                        Điểm tích lũy: {earnedPoints} điểm
                      </span>
                      {redeemedPointsSum > 0 && (
                        <span className="px-2 py-1 rounded bg-stone-100 border border-stone-200 font-bold text-stone-600 text-[10px]">
                          Đã dùng: {redeemedPointsSum} điểm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Static high-fidelity sample buyers representing system stats */}
            <div className="rounded-xl border border-amber-200/55 p-4 bg-white flex items-start space-x-4 opacity-80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-serif text-lg font-bold shrink-0">
                T
              </div>
              <div className="space-y-1 text-xs flex-1">
                <p className="font-bold text-[#0F2C11] text-sm flex items-center gap-2">
                  Thùy Vân (Hà Nội)
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-stone-50 border-stone-200 text-stone-700">
                    Thẻ Bạc
                  </span>
                </p>
                <p className="text-stone-400">Email: thuyvanngo35@gmail.com (SĐT: 0987654321)</p>
                <p className="text-stone-500">Mặc định: 12 Hàng Khay, Quận Hoàn Kiếm, Hà Nội</p>
                
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2 py-1 rounded bg-amber-50 border border-amber-100 font-bold text-amber-900 text-[10px]">Đã mua: 4 Đơn</span>
                  <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-100 font-bold text-emerald-800 text-[10px]">Tích lũy: {formatVND(1850000)}</span>
                  <span className="px-2 py-1 rounded bg-rose-50 border border-rose-100 font-bold text-rose-700 text-[10px]">Điểm tích lũy: 37 điểm</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-200/55 p-4 bg-white flex items-start space-x-4 opacity-80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)]">
              <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-serif text-lg font-bold shrink-0">
                A
              </div>
              <div className="space-y-1 text-xs flex-1">
                <p className="font-bold text-[#0F2C11] text-sm flex items-center gap-2">
                  An Bình (Gia Định)
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold border bg-stone-50 border-stone-200 text-stone-700">
                    Thẻ Bạc
                  </span>
                </p>
                <p className="text-stone-400">Email: anbinh@gmail.com (SĐT: 0914253648)</p>
                <p className="text-stone-500">Mặc định: 34 Nguyễn Bỉnh Khiêm, Quận 1, TP. HCM</p>
                
                <div className="flex flex-wrap gap-1.5 pt-2">
                  <span className="px-2 py-1 rounded bg-amber-50 border border-amber-100 font-bold text-amber-900 text-[10px]">Đã mua: 2 Đơn</span>
                  <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-100 font-bold text-emerald-800 text-[10px]">Tích lũy: {formatVND(890000)}</span>
                  <span className="px-2 py-1 rounded bg-rose-50 border border-rose-100 font-bold text-rose-700 text-[10px]">Điểm tích lũy: 17 điểm</span>
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
                                  type="button"
                                  onClick={() => { setReplyingToId(null); setReplyText(''); }}
                                  className="px-2.5 py-1 text-[11px] text-stone-500 hover:text-stone-700 transition cursor-pointer"
                                >
                                  Hủy bỏ
                                </button>
                                <button
                                  type="button"
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
                                  className="px-3.5 py-1 bg-emerald-800 hover:bg-emerald-990 disabled:opacity-50 text-white font-bold rounded-md text-[11px] transition cursor-pointer"
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

      {/* --- TAB 9: CUSTOMER REVIEWS MANAGEMENT (QUẢN LÝ ĐÁNH GIÁ) --- */}
      {activeTab === 'reviews' && (() => {
        // Compute all customized reviews from Firestore (no mock reviews as requested)
        const allCustomReviews = dbReviews.map(r => ({
          ...r,
          isCustom: true
        }));

        const allReviewsCombined = [...allCustomReviews];
        const visibleCombinedReviews = allReviewsCombined.filter(r => !deletedMockReviewIds.includes(r.id));

        // Computing statistics
        const totalReviewsCount = visibleCombinedReviews.length;
        const avgRatingValue = totalReviewsCount > 0 
          ? visibleCombinedReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount
          : 0.0;
        const averageRating = avgRatingValue.toFixed(1);

        const star5Count = visibleCombinedReviews.filter(r => r.rating === 5).length;
        const star4Count = visibleCombinedReviews.filter(r => r.rating === 4).length;
        const star3Count = visibleCombinedReviews.filter(r => r.rating === 3).length;
        const star2Count = visibleCombinedReviews.filter(r => r.rating <= 2).length;

        const star5Percent = totalReviewsCount > 0 ? `${Math.round((star5Count / totalReviewsCount) * 100)}%` : '0%';
        const star4Percent = totalReviewsCount > 0 ? `${Math.round((star4Count / totalReviewsCount) * 100)}%` : '0%';
        const star3Percent = totalReviewsCount > 0 ? `${Math.round((star3Count / totalReviewsCount) * 100)}%` : '0%';
        const star2Percent = totalReviewsCount > 0 ? `${Math.round((star2Count / totalReviewsCount) * 100)}%` : '0%';

        // Filtering
        const filteredReviews = visibleCombinedReviews.filter(r => {
          const matchesSearch = 
            r.author.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
            r.email.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
            r.productName.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
            r.comment.toLowerCase().includes(reviewSearchQuery.toLowerCase());

          const matchesRating = selectedRatingFilter === 'all' || r.rating === Number(selectedRatingFilter);

          return matchesSearch && matchesRating;
        });

        // Sorting
        const sortedReviews = [...filteredReviews].sort((a, b) => {
          if (reviewSortOrder === 'newest') {
            return new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime();
          }
          if (reviewSortOrder === 'oldest') {
            return new Date(a.createdAt || a.date).getTime() - new Date(b.createdAt || b.date).getTime();
          }
          if (reviewSortOrder === 'rating-high') {
            return b.rating - a.rating;
          }
          if (reviewSortOrder === 'rating-low') {
            return a.rating - b.rating;
          }
          return 0;
        });

        return (
          <div className="space-y-6 animate-fade-in w-full relative" id="admin-reviews-tab-box">
            
            {/* Header section with Stats Cards */}
            <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <MessageSquare className="text-emerald-800 h-5 w-5 shrink-0" />
                  <span>Quản Lý Nhận Xét & Đánh Giá</span>
                </h3>
                <p className="text-xs text-stone-450 mt-1">
                  Xem và xóa bỏ các nội dung phản hồi, đánh giá sao của quý khách hàng về chất lượng hoa nghệ thuật Fióre
                </p>
              </div>

              {reviewActionSuccess && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-800 font-semibold animate-pulse">
                  ✓ {reviewActionSuccess}
                </div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                {/* Score Card */}
                <div className="rounded-xl bg-[#FBF9F4] border border-[#E8E1D6] p-4.5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Điểm số trung bình</span>
                    <h4 className="text-3xl font-bold font-serif text-emerald-950 mt-1 flex items-baseline gap-1.5">
                      {averageRating}
                      <span className="text-xs text-stone-450 font-sans font-medium mb-0.5">/ 5.0</span>
                    </h4>
                    <div className="flex items-center space-x-0.5 mt-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star 
                          key={s} 
                          className={`h-4 w-4 ${s <= Math.round(Number(averageRating)) ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} 
                        />
                      ))}
                    </div>
                  </div>
                  <div className="h-12 w-12 bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-650 font-serif font-black text-lg select-none">
                    ★
                  </div>
                </div>

                {/* total reviews count */}
                <div className="rounded-xl bg-[#FBF9F4] border border-[#E8E1D6] p-4.5 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold">Tổng số nhận xét</span>
                    <h4 className="text-3xl font-bold font-serif text-emerald-950 mt-1">{totalReviewsCount}</h4>
                    <p className="text-[11px] text-[#1F3D2B] font-medium mt-1">
                      Mẫu hoa có nhiều phản hồi nhất
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-emerald-100/40 rounded-2xl flex items-center justify-center text-emerald-800">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                </div>

                {/* Rating score details */}
                <div className="rounded-xl bg-[#FBF9F4] border border-[#E8E1D6] p-4.5 space-y-1 text-xs text-stone-600 shadow-2xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-12 font-semibold">5 sao</span>
                    <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: star5Percent }}></div>
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-stone-450">{star5Count}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-12 font-semibold">4 sao</span>
                    <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: star4Percent }}></div>
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-stone-450">{star4Count}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-12 font-semibold">3 sao</span>
                    <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: star3Percent }}></div>
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-stone-450">{star3Count}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-12 font-semibold">≤ 2 sao</span>
                    <div className="h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full" style={{ width: star2Percent }}></div>
                    </div>
                    <span className="w-8 text-right font-mono text-[10px] text-stone-450">{star2Count}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Content List */}
            <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Danh sách phản hồi</span>
                  <span className="bg-stone-100 text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">{filteredReviews.length} kết quả</span>
                </div>
                
                {/* Multi search and filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Tìm người gửi, email, mẫu hoa..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="rounded-lg border border-amber-200 bg-white pl-8.5 pr-3 py-1.5 text-xs outline-none focus:border-emerald-700 w-52"
                    />
                  </div>

                  {/* Star Rating Select */}
                  <select
                    value={selectedRatingFilter}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedRatingFilter(val === 'all' ? 'all' : Number(val));
                    }}
                    className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-emerald-700 font-medium"
                  >
                    <option value="all">Tất cả số sao</option>
                    <option value="5">Yêu thích nhất (5★)</option>
                    <option value="4">Tốt (4★)</option>
                    <option value="3">Trung bình (3★)</option>
                    <option value="2">Yếu / Chưa đạt (≤2★)</option>
                  </select>

                  {/* Sorting Select */}
                  <select
                    value={reviewSortOrder}
                    onChange={(e) => setReviewSortOrder(e.target.value as any)}
                    className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-xs outline-none focus:border-emerald-700 font-medium"
                  >
                    <option value="newest">Ngày gửi mới nhất</option>
                    <option value="oldest">Cũ nhất trước</option>
                    <option value="rating-high">Đánh giá cao trước</option>
                    <option value="rating-low">Đánh giá thấp trước</option>
                  </select>
                </div>
              </div>

              {/* Reviews Table / Cards Grid */}
              {sortedReviews.length === 0 ? (
                <div className="text-center py-12 text-stone-400 space-y-2">
                  <MessageSquare className="h-8 w-8 mx-auto text-stone-350 shrink-0" />
                  <p className="text-xs font-semibold">Chưa có kết quả đánh giá nào phù hợp với điều kiện lọc</p>
                  <p className="text-[10px] text-stone-400">Bạn có thể đổi từ khóa tìm kiếm hoặc bỏ bộ lọc sao.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-[#FAF7F0] border-b border-stone-200 text-stone-500 font-serif font-bold h-10">
                        <th className="px-4 py-2 w-48">Sản Phẩm & Tiêu đề</th>
                        <th className="px-4 py-2 w-48">Khách Hàng & Thông Tin</th>
                        <th className="px-4 py-2 w-16 text-center">Số Sao</th>
                        <th className="px-4 py-2">Nội dung đánh giá</th>
                        <th className="px-4 py-2 w-24 text-center">Trạng Thái</th>
                        <th className="px-4 py-2 w-20 text-center font-serif font-bold">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {sortedReviews.map((rev) => (
                        <tr key={rev.id} className="hover:bg-amber-50/10 transition-colors">
                          <td className="px-4 py-3">
                            <span className="font-semibold text-emerald-950 block max-w-[170px] truncate" title={rev.productName}>
                              {rev.productName}
                            </span>
                            <span className="text-[10px] text-stone-400 font-mono mt-0.5 block truncate">
                              ID: {rev.productId}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-800 block truncate max-w-[170px]">
                              {rev.author}
                            </span>
                            <span className="text-[10px] text-stone-500 font-mono block truncate max-w-[170px]" title={rev.email}>
                              {rev.email}
                            </span>
                            <span className="text-[10px] text-stone-400 block mt-0.5">
                              {rev.date}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500 shrink-0" />
                              <span className="font-mono font-bold text-amber-700">{rev.rating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-stone-600 leading-relaxed font-sans max-w-sm">
                            <p className="line-clamp-2 text-[11px]" title={rev.comment}>
                              {rev.comment}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                              {rev.isCustom ? (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  Khách mua thật
                                </span>
                              ) : (
                                <span className="bg-stone-50 text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                  Mẫu hệ thống
                                </span>
                              )}
                              
                              <button
                                onClick={() => handleToggleVerify(rev)}
                                className={`px-2 py-0.5 rounded text-[9px] font-bold border transition cursor-pointer ${
                                  rev.isVerified 
                                    ? 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700' 
                                    : 'bg-white text-stone-500 border-stone-300 hover:bg-stone-50'
                                }`}
                                title="Bấm để thay đổi trạng thái kiểm duyệt"
                              >
                                {rev.isVerified ? '✓ Đã Duyệt' : '✗ Chờ Duyệt'}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setSelectedReviewForDetail(rev);
                                }}
                                className="h-7 w-7 rounded-md text-emerald-850 hover:bg-emerald-50 border border-emerald-200 flex items-center justify-center transition cursor-pointer"
                                title="Xem chi tiết"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(rev)}
                                className="h-7 w-7 rounded-md text-red-650 hover:bg-red-50 border border-red-200 flex items-center justify-center transition cursor-pointer"
                                title="Xóa đánh giá này"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Review detail modal popup */}
            {selectedReviewForDetail && (
              <div className="fixed inset-0 bg-stone-900/60 z-[999] flex items-center justify-center p-4 backdrop-blur-xs">
                <div 
                  className="bg-white rounded-2xl border border-amber-200 max-w-md w-full p-6 space-y-4 shadow-xl relative animate-fade-in text-stone-700"
                >
                  <button
                    onClick={() => setSelectedReviewForDetail(null)}
                    className="absolute right-4 top-4 text-stone-400 hover:text-stone-700 h-8 w-8 rounded-full hover:bg-stone-100 flex items-center justify-center transition cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="border-b border-amber-100 pb-2">
                    <h4 className="font-serif text-[14px] font-bold text-[#1F3D2B]">Chi tiết nhận xét đánh giá</h4>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">ID: {selectedReviewForDetail.id}</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 bg-amber-50/20 p-3 rounded-lg border border-amber-100">
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">Sản phẩm nghệ thuật</span>
                        <span className="font-serif font-bold text-emerald-950 block text-[12px] truncate">{selectedReviewForDetail.productName}</span>
                        <span className="text-[9px] text-stone-450 font-mono block">ID: {selectedReviewForDetail.productId}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-bold block mb-0.5">Số sao đánh giá</span>
                        <div className="flex items-center space-x-1 mt-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`h-3.5 w-3.5 ${s <= selectedReviewForDetail.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200'}`} 
                            />
                          ))}
                          <span className="font-mono font-bold text-stone-750 ml-0.5">({selectedReviewForDetail.rating}★)</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FAF7F0] p-3 rounded-lg border border-stone-200 space-y-1">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block mb-1">Thông tin người đánh giá</span>
                      <p className="text-stone-600">
                        <strong>Họ tên:</strong> {selectedReviewForDetail.author}
                      </p>
                      <p className="text-stone-600">
                        <strong>Hòm thư:</strong> <span className="font-mono">{selectedReviewForDetail.email}</span>
                      </p>
                      <p className="text-stone-600">
                        <strong>Thời gian:</strong> {selectedReviewForDetail.date}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <strong>Nguồn gốc:</strong>
                        {(selectedReviewForDetail as any).isCustom ? (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded text-[9px] font-bold">
                            Chính chủ (Đã mua thật)
                          </span>
                        ) : (
                          <span className="bg-stone-50 text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded text-[9px] font-medium">
                            Hệ thống mẫu
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 p-0.5">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Ý kiến phản hồi</span>
                      <div className="bg-white p-3 rounded-lg border border-stone-200 text-stone-800 font-sans italic leading-relaxed text-[11px] whitespace-pre-line shadow-2xs">
                        "{selectedReviewForDetail.comment}"
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-amber-100 gap-3">
                    <button
                      onClick={() => handleToggleVerify(selectedReviewForDetail)}
                      className={`text-[11px] px-3 py-1.5 font-bold rounded-full border transition cursor-pointer flex items-center justify-center gap-1 ${
                        selectedReviewForDetail.isVerified 
                          ? 'bg-amber-100 border-[#E8E1D6] text-emerald-950 hover:bg-amber-200/40' 
                          : 'bg-[#1F3D2B] border-transparent text-white hover:bg-emerald-900'
                      }`}
                    >
                      {selectedReviewForDetail.isVerified ? '✗ Hủy kiểm duyệt' : '✓ Duyệt đánh giá'}
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDeleteReview(selectedReviewForDetail)}
                        className="rounded-full px-3.5 py-1.5 border border-red-200 bg-red-50 text-red-650 text-[11px] font-bold hover:bg-red-100 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 animate-pulse" /> Xóa hẳn
                      </button>
                      <button
                        onClick={() => setSelectedReviewForDetail(null)}
                        className="rounded-full px-3.5 py-1.5 border text-stone-500 hover:bg-neutral-50 text-[11px] font-bold cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}


      {/* --- TAB 10: INVENTORY MANAGEMENT (QUẢN LÝ TỒN KHO) --- */}
      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header & Alert center */}
          <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-100 pb-4 gap-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
                  <Database className="text-emerald-800 h-5 w-5 shrink-0" />
                  <span>Theo Dõi & Quản Lý Kho</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  Đo lường lượng tồn thực tế của các tác phẩm hoa nghệ thuật, thiết lập ngưỡng cảnh báo sắp hết hàng và cập nhật nhanh số lượng sản phẩm.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50/50 border border-amber-200/60 p-2.5 rounded-xl shrink-0">
                <span className="text-xs font-semibold text-stone-600">Ngưỡng cảnh báo:</span>
                <input
                  type="number"
                  min="0"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 text-center text-xs font-bold rounded border border-amber-200 bg-white py-1 outline-none focus:border-emerald-700"
                />
                <span className="text-xs text-stone-500 font-medium font-serif">đơn vị</span>
              </div>
            </div>

            {/* Warning Alert Banner */}
            {(() => {
              const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold);
              const outOfStockProducts = products.filter(p => (p.stock || 0) === 0);

              if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
                return (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3 text-xs font-medium">
                    <Check className="h-5 w-5 text-emerald-600 shrink-0" />
                    <span>Lượng hàng tồn kho của tất cả sản phẩm đều đang ở mức an toàn. Toàn bộ chuỗi cung ứng hoạt động tối ưu!</span>
                  </div>
                );
              }

              return (
                <div className="bg-gradient-to-br from-red-50/90 via-red-50/40 to-amber-50/10 border border-red-200/80 rounded-2xl p-5 space-y-4 text-xs shadow-xs relative overflow-hidden backdrop-blur-xs">
                  {/* Decorative faint background glow */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-400/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-100/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500/10 p-2.5 rounded-xl text-red-700 animate-pulse border border-red-200/30">
                        <ShieldAlert className="h-5 w-5 shrink-0 text-red-650" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-black uppercase tracking-wider text-red-950 flex items-center gap-1.5">
                          <span>Sự cố tồn kho cần xử lý khẩn cấp!</span>
                        </h4>
                        <p className="text-[10px] text-stone-500 font-medium">Danh mục các tác phẩm hoa cần được nhập thêm hoặc điều chỉnh số lượng tồn</p>
                      </div>
                    </div>
                    
                    <span className="self-start sm:self-center px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest bg-red-600 text-white rounded-full animate-pulse shadow-2xs">
                      Khẩn cấp: {outOfStockProducts.length + lowStockProducts.length} mặt hàng
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 text-stone-700 font-medium">
                    {outOfStockProducts.length > 0 && (
                      <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-red-100/70 shadow-3xs space-y-3">
                        <div className="flex items-center justify-between border-b border-dashed border-red-150 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-600 shrink-0 animate-ping" />
                            <strong className="text-red-800 font-serif text-xs font-black">HOÀN TOÀN HẾT HÀNG ({outOfStockProducts.length})</strong>
                          </div>
                          <span className="text-[10px] font-mono font-black text-red-600 bg-red-50/50 px-2 py-0.5 rounded border border-red-100">STOCK = 0</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone-50 scrollbar-thin">
                          {outOfStockProducts.map(p => (
                            <div key={p.id} className="flex items-center justify-between pt-2 first:pt-0">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="h-7 w-7 rounded-md object-cover border border-stone-200/40 bg-stone-50 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="truncate text-stone-850 font-serif font-bold text-xs">{p.name}</span>
                              </div>
                              <span className="text-[9px] font-extrabold uppercase tracking-wide text-red-650 bg-red-50 px-2 py-0.5 rounded border border-red-200/55 shrink-0">
                                Nhập hàng gấp
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {lowStockProducts.length > 0 && (
                      <div className="bg-white/90 backdrop-blur-xs p-4 rounded-xl border border-amber-100/70 shadow-3xs space-y-3">
                        <div className="flex items-center justify-between border-b border-dashed border-amber-150 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                            <strong className="text-amber-850 font-serif text-xs font-black font-medium">SẮP HẾT HÀNG TRÊN HỆ THỐNG ({lowStockProducts.length})</strong>
                          </div>
                          <span className="text-[10px] font-mono font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">STOCK ≤ {lowStockThreshold}</span>
                        </div>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-stone-50 scrollbar-thin">
                          {lowStockProducts.map(p => (
                            <div key={p.id} className="flex items-center justify-between pt-2 first:pt-0">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="h-7 w-7 rounded-md object-cover border border-stone-200/40 bg-stone-50 shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="truncate text-stone-850 font-serif font-bold text-xs">{p.name}</span>
                              </div>
                              <span className="text-[9px] font-extrabold text-amber-850 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200/60 shrink-0">
                                Còn {p.stock || 0} bó
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Quick Toast message */}
            {inventoryUpdateSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center justify-between text-xs font-bold animate-fade-in">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>{inventoryUpdateSuccess}</span>
                </div>
                <button onClick={() => setInventoryUpdateSuccess(null)} className="text-stone-400 hover:text-stone-700 font-mono text-[10px] cursor-pointer">✕</button>
              </div>
            )}
          </div>

          {/* Metric Summary Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {(() => {
              const totalProducts = products.length;
              const lowStockCount = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold).length;
              const totalStockUnits = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);

              return (
                <>
                  <div className="bg-[#FAF7F0] border border-amber-200/50 rounded-2xl p-4 flex flex-col justify-between shadow-3xs">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">MẪU HOA ĐANG BÁN</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-serif font-black text-emerald-950">{totalProducts}</span>
                      <span className="text-[11px] text-stone-500">tác phẩm</span>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F0] border border-amber-200/50 rounded-2xl p-4 flex flex-col justify-between shadow-3xs">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">SẮP HẾT HÀNG</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-serif font-black text-amber-600">{lowStockCount}</span>
                      <span className="text-[11px] text-stone-500">mã hàng</span>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F0] border border-amber-200/50 rounded-2xl p-4 flex flex-col justify-between shadow-3xs">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">TỔNG ĐƠN VỊ TỒN KHO</span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-2xl font-serif font-black text-emerald-950">{totalStockUnits}</span>
                      <span className="text-[11px] text-stone-500">đóa/bó hoa</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Filtering and products table */}
          <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-1 items-center bg-[#FAF7F0] border border-amber-200/40 rounded-xl px-3 py-1.5 max-w-md">
                <Search className="h-4 w-4 text-stone-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm tác phẩm hoa hoặc mã ID..."
                  value={inventorySearchQuery}
                  onChange={(e) => setInventorySearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-stone-800 focus:outline-none w-full"
                />
                {inventorySearchQuery && (
                  <button onClick={() => setInventorySearchQuery('')} className="text-[11px] font-bold text-stone-400 hover:text-stone-700 font-serif">Xóa</button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status Tabs */}
                <button
                  onClick={() => setInventoryStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg border transition font-serif font-semibold cursor-pointer ${
                    inventoryStatusFilter === 'all'
                      ? 'bg-[#1F3D2B] border-transparent text-white font-bold'
                      : 'bg-[#FAF7F0] border-amber-100 text-stone-700 hover:bg-amber-100/30'
                  }`}
                >
                  Tất cả ({products.length})
                </button>
                <button
                  onClick={() => setInventoryStatusFilter('low')}
                  className={`px-3 py-1.5 rounded-lg border transition font-serif font-semibold cursor-pointer flex items-center gap-1 ${
                    inventoryStatusFilter === 'low'
                      ? 'bg-amber-500 border-transparent text-emerald-955 font-bold'
                      : 'bg-amber-50/50 border-amber-100 text-amber-850 hover:bg-amber-100/30'
                  }`}
                >
                  Sắp hết ({products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold).length})
                </button>
                <button
                  onClick={() => setInventoryStatusFilter('out')}
                  className={`px-3 py-1.5 rounded-lg border transition font-serif font-semibold cursor-pointer flex items-center gap-1 ${
                    inventoryStatusFilter === 'out'
                      ? 'bg-red-600 border-transparent text-white font-bold'
                      : 'bg-red-50/55 border-red-100 text-red-600 hover:bg-red-100/45'
                  }`}
                >
                  Đã hết hàng ({products.filter(p => (p.stock || 0) === 0).length})
                </button>

                {/* Category filter dropdown inside */}
                <select
                  value={inventoryCategoryFilter}
                  onChange={(e) => setInventoryCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-amber-150 bg-[#FAF7F0] text-stone-700 focus:outline-none font-bold"
                >
                  <option value="all">Tất cả danh mục ({categories.length})</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Product Table list */}
            {(() => {
              const filteredList = products.filter(p => {
                const matchesSearch = p.name.toLowerCase().includes(inventorySearchQuery.toLowerCase()) || p.id.toLowerCase().includes(inventorySearchQuery.toLowerCase());
                const matchesCategory = inventoryCategoryFilter === 'all' || p.categoryId === inventoryCategoryFilter;
                
                let matchesStatus = true;
                if (inventoryStatusFilter === 'low') {
                  matchesStatus = (p.stock || 0) > 0 && (p.stock || 0) <= lowStockThreshold;
                } else if (inventoryStatusFilter === 'out') {
                  matchesStatus = (p.stock || 0) === 0;
                }

                return matchesSearch && matchesCategory && matchesStatus;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="text-center py-12 border border-dashed border-amber-150 rounded-2xl bg-[#FAF7F0]/30 select-none">
                    <p className="text-sm font-medium text-stone-500 font-serif">Không tìm thấy sản phẩm nào khớp với tiêu chuẩn bộ lọc đã chọn.</p>
                    <button
                      onClick={() => {
                        setInventorySearchQuery('');
                        setInventoryStatusFilter('all');
                        setInventoryCategoryFilter('all');
                      }}
                      className="text-xs text-emerald-800 font-bold hover:underline mt-2 cursor-pointer"
                    >
                      Xóa toàn bộ bộ lọc
                    </button>
                  </div>
                );
              }

              return (
                <div className="overflow-x-auto rounded-xl border border-amber-100 bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F0] border-b border-amber-100 text-[10px] font-bold text-stone-500 uppercase tracking-wider select-none">
                        <th className="px-5 py-4 w-12 text-center">Hình ảnh</th>
                        <th className="px-5 py-4">Tác phẩm hoa nghệ thuật</th>
                        <th className="px-5 py-4 w-40">Phân loại danh mục</th>
                        <th className="px-5 py-4 w-36 text-center">Mức an toàn</th>
                        <th className="px-5 py-4 w-52 text-center">Số lượng tồn kho (bó/hộp)</th>
                        <th className="px-5 py-4 w-32 text-center">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100/50">
                      {filteredList.map((p) => {
                        const tempVal = tempStockValues[p.id];
                        const currentStockInWork = tempVal !== undefined ? tempVal : (p.stock || 0);
                        const isEdited = tempVal !== undefined && tempVal !== (p.stock || 0);

                        const categoryName = categories.find(c => c.id === p.categoryId)?.name || 'Chưa phân loại';

                        let badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-100";
                        let statusText = "Tồn kho an toàn";
                        if ((p.stock || 0) === 0) {
                          badgeColor = "bg-red-50 text-red-650 border-red-150 animate-pulse";
                          statusText = "Đã hết hàng";
                        } else if ((p.stock || 0) <= lowStockThreshold) {
                          badgeColor = "bg-amber-50 text-amber-800 border-amber-150";
                          statusText = "Sắp hết hàng";
                        }

                        return (
                          <tr key={p.id} className="hover:bg-amber-50/15 duration-100">
                            {/* Product Image */}
                            <td className="px-5 py-3.5 text-center">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="h-10 w-10 rounded-lg object-cover border border-amber-250/20 bg-stone-50"
                                referrerPolicy="no-referrer"
                              />
                            </td>

                            {/* Product Name & UUID */}
                            <td className="px-5 py-3.5">
                              <span className="font-serif font-bold text-stone-850 block text-xs leading-snug">{p.name}</span>
                              <span className="text-[10px] text-stone-400 font-mono block mt-0.5">ID: {p.id}</span>
                            </td>

                            {/* Category Name */}
                            <td className="px-5 py-3.5 whitespace-nowrap text-stone-600 font-medium">
                              {categoryName}
                            </td>

                            {/* Status badge */}
                            <td className="px-5 py-3.5 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold border ${badgeColor}`}>
                                {statusText}
                              </span>
                            </td>

                            {/* Stock Update Controls */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center justify-center gap-1.5">
                                {/* Minus button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStock = Math.max(0, currentStockInWork - 1);
                                    setTempStockValues({ ...tempStockValues, [p.id]: nextStock });
                                  }}
                                  className="h-7 w-7 rounded-md border border-amber-200 hover:bg-amber-50 flex items-center justify-center font-bold text-base text-stone-600 hover:text-stone-900 transition active:scale-95 cursor-pointer leading-none"
                                >
                                  -
                                </button>

                                {/* Direct field input */}
                                <input
                                  type="number"
                                  min="0"
                                  value={currentStockInWork}
                                  onChange={(e) => {
                                    const nextStock = Math.max(0, parseInt(e.target.value) || 0);
                                    setTempStockValues({ ...tempStockValues, [p.id]: nextStock });
                                  }}
                                  className="w-16 h-7 text-center rounded border border-amber-200 bg-white font-mono font-bold text-xs outline-none focus:border-red-950"
                                />

                                {/* Plus button */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextStock = currentStockInWork + 1;
                                    setTempStockValues({ ...tempStockValues, [p.id]: nextStock });
                                  }}
                                  className="h-7 w-7 rounded-md border border-amber-200 hover:bg-amber-50 flex items-center justify-center font-bold text-base text-stone-600 hover:text-stone-900 transition active:scale-95 cursor-pointer leading-none"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Action Save button */}
                            <td className="px-5 py-3.5 text-center whitespace-nowrap relative">
                              <div className="flex flex-col items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={!isEdited}
                                  onClick={() => {
                                    onEditProduct({
                                      ...p,
                                      stock: currentStockInWork
                                    });
                                    
                                    // Clear editing indicator
                                    const updatedTemp = { ...tempStockValues };
                                    delete updatedTemp[p.id];
                                    setTempStockValues(updatedTemp);
                                    
                                    setInventoryUpdateSuccess(`Cập nhật số kho sản phẩm "${p.name}" sang ${currentStockInWork} bó hoa.`);
                                    setTimeout(() => setInventoryUpdateSuccess(null), 3500);
                                  }}
                                  className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition w-28 ${
                                    isEdited
                                      ? 'bg-[#1F3D2B] text-white hover:bg-emerald-900 active:scale-95 cursor-pointer shadow-1xs'
                                      : 'bg-stone-50 border border-stone-200 text-stone-400 cursor-not-allowed'
                                  }`}
                                >
                                  {isEdited ? 'Cập nhật ✓' : 'Đã đồng bộ'}
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    
                                    // Calculate coordinates relative to screen viewport
                                    const popoverWidth = 320;
                                    let targetLeft = rect.left + rect.width / 2 - popoverWidth / 2;
                                    
                                    // Keep inside safe boundaries of window viewport
                                    if (targetLeft < 16) {
                                      targetLeft = 16;
                                    } else if (targetLeft + popoverWidth > window.innerWidth - 16) {
                                      targetLeft = window.innerWidth - popoverWidth - 16;
                                    }
                                    
                                    let targetTop = rect.bottom + 8;
                                    const popoverHeightEst = 330;
                                    if (targetTop + popoverHeightEst > window.innerHeight) {
                                      targetTop = Math.max(16, rect.top - popoverHeightEst - 8);
                                    }
                                    
                                    setCancelProduct(p);
                                    setCancelQuantity(1);
                                    setCancelReason('Hoa héo');
                                    setCustomReason('');
                                    setCancelPopupPos({
                                      top: targetTop,
                                      left: targetLeft
                                    });
                                  }}
                                  className="px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition w-28 bg-[#FFF5F5] border border-red-200 text-red-650 hover:bg-red-50 hover:text-red-700 active:scale-95 cursor-pointer font-sans"
                                >
                                  Báo hủy
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* --- TAB 8: UNIFIED PROMOTIONS & COUPONS MANAGEMENT (QUẢN LÝ ƯU ĐÃI) --- */}
      {activeTab === 'coupons' && (
        <div className="rounded-2xl border border-amber-200/60 bg-white p-6 shadow-xs animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-100 pb-4 gap-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-2">
                <Gift className="text-emerald-800 h-5 w-5 shrink-0 animate-bounce" />
                <span>Quản Lý Ưu Đãi & Khuyến Mãi</span>
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Tạo mã giảm giá theo % hoặc số tiền cố định, cấu hình điều kiện trị giá đơn hàng tối thiểu cho khách mua hoa
              </p>
            </div>
            <button
              onClick={() => handleOpenCouponModal()}
              className="rounded-full bg-emerald-800 text-white font-bold px-5 py-2 text-xs hover:bg-emerald-900 transition flex items-center justify-center gap-1.5 shadow-md shrink-0 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Thêm Mã Khuyến Mãi
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-150">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200 uppercase tracking-wider">
                  <th className="p-4">Mã ưu đãi</th>
                  <th className="p-4">Mô tả chương trình</th>
                  <th className="p-4">Hình thức giảm</th>
                  <th className="p-4">Giá trị giảm</th>
                  <th className="p-4">Đơn hàng tối thiểu</th>
                  <th className="p-4">Giảm tối đa</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-gray-700">
                {adminCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400 font-medium">
                      Chưa có mã giảm giá nào được lưu trong hệ thống. Hãy nhấp "Thêm Mã Khuyến Mãi" để bắt đầu!
                    </td>
                  </tr>
                ) : (
                  adminCoupons.map((c) => (
                    <tr key={c.id} className="hover:bg-amber-50/20 transition">
                      <td className="p-4 font-bold text-sm text-emerald-900 tracking-wide select-all uppercase">
                        <span className="bg-emerald-50 text-emerald-850 px-2.5 py-1 rounded-md border border-emerald-105 font-mono">
                          {c.code}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate">{c.description}</td>
                      <td className="p-4 font-semibold">
                        {c.discountType === 'percentage' ? (
                          <span className="text-blue-600 font-bold">Phần trăm (%)</span>
                        ) : (
                          <span className="text-indigo-600 font-bold">Số tiền cố định</span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-emerald-800">
                        {c.discountType === 'percentage' ? `${c.discountValue}%` : formatVND(c.discountValue)}
                      </td>
                      <td className="p-4 text-gray-550 font-semibold">{formatVND(c.minOrderValue)}</td>
                      <td className="p-4 text-gray-550 font-mono">
                        {c.maxDiscount ? formatVND(c.maxDiscount) : 'Không giới hạn'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/20'
                            : 'bg-red-50 text-red-700 border border-red-150/20'
                        }`}>
                          {c.isActive ? 'Đang kích hoạt' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenCouponModal(c)}
                          className="p-1.5 text-stone-500 hover:text-emerald-800 transition cursor-pointer"
                          title="Chỉnh sửa mã"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c.id)}
                          className="p-1.5 text-stone-450 hover:text-red-600 transition cursor-pointer"
                          title="Xóa mã"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                 <div className="flex items-center justify-between mb-1">
                   <label className="block font-bold text-stone-500 uppercase text-xs">Đường dẫn ảnh bìa danh mục (URL) *</label>
                   <label className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded cursor-pointer hover:bg-emerald-100 flex items-center space-x-0.5 transition">
                     <Plus className="h-2.5 w-2.5" />
                     <span>Tải ảnh từ máy</span>
                     <input
                       type="file"
                       accept="image/*"
                       className="hidden"
                       onChange={(e) => {
                         const file = e.target.files?.[0];
                         if (file) {
                           if (file.size > 2 * 1024 * 1024) {
                             alert("Kích thước ảnh vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.");
                             return;
                           }
                           const reader = new FileReader();
                           reader.onload = (evt) => {
                             if (evt.target?.result) {
                               setCatImage(evt.target.result as string);
                               setCatImageLoadError(false);
                             }
                           };
                           reader.readAsDataURL(file);
                         }
                       }}
                     />
                   </label>
                 </div>
                 <input
                   type="text"
                   required
                   value={catImage}
                   onChange={(e) => {
                     setCatImage(e.target.value);
                     setCatImageLoadError(false);
                   }}
                   placeholder="Dán liên kết URL hoặc chọn tải ảnh từ máy"
                   className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700 text-xs"
                 />
               </div>

              {/* LIVE CATEGORY IMAGE PREVIEW SECTION */}
              <div className="rounded-xl border border-dashed border-amber-200 bg-stone-50 p-3 flex flex-col items-center">
                <span className="block font-bold text-emerald-950 uppercase mb-1.5 text-[10px] self-start">Xem trước ảnh danh mục</span>
                <div className="relative w-full max-w-[280px] h-36 rounded-lg bg-white border border-amber-100 flex items-center justify-center overflow-hidden shadow-xs select-none">
                  {catImage ? (
                    <img
                      src={catImageLoadError ? 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=500' : catImage}
                      alt="Xem trước ảnh danh mục"
                      className="w-full h-full object-cover transition-all"
                      referrerPolicy="no-referrer"
                      onError={() => setCatImageLoadError(true)}
                    />
                  ) : (
                    <div className="text-gray-400 text-center flex flex-col items-center p-3">
                      <svg className="w-7 h-7 text-amber-200 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[10px]">Chưa nhập liên kết ảnh danh mục</span>
                    </div>
                  )}

                  {catImageLoadError && (
                    <div className="absolute inset-0 bg-red-50/95 flex flex-col items-center justify-center p-3 text-center">
                      <svg className="w-6 h-6 text-red-500 mb-1.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span className="text-red-750 font-bold text-[11px]">Không thể tải hình ảnh từ URL này.</span>
                      <span className="text-stone-550 text-[9px] mt-0.5">Đặt lại về ảnh vườn hoa mẫu mặc định</span>
                    </div>
                  )}
                </div>
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

      {/* --- COUPON EDIT/CREATE MODAL --- */}
      {showCouponModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-pink-100">
            <div className="flex items-center justify-between border-b border-pink-50 pb-3 mb-4">
              <h3 className="font-serif text-lg font-bold text-emerald-950 flex items-center gap-1.5">
                <Gift className="h-5 w-5 text-rose-500 animate-pulse" />
                <span>{editCouponItem ? 'Cập Nhật Mã Ưu Đãi' : 'Thêm Mới Mã Ưu Đãi'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowCouponModal(false)}
                className="rounded-full p-1 text-gray-400 hover:bg-neutral-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs font-semibold text-stone-600">
              <div>
                <label className="block text-stone-500 uppercase font-bold mb-1">Mã Ưu Đãi (Mã viết liền không dấu) *</label>
                <input
                  type="text"
                  required
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s/g, ''))}
                  placeholder="Ví dụ: YEUTHUONG, TET2026..."
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700 uppercase font-bold text-emerald-950 font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-stone-500 uppercase font-bold mb-1">Mô tả chương trình ưu đãi *</label>
                <input
                  type="text"
                  required
                  value={couponDesc}
                  onChange={(e) => setCouponDesc(e.target.value)}
                  placeholder="Ví dụ: Giảm 10% cho đơn hàng đầu tiên..."
                  className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 uppercase font-bold mb-1">Hình thức áp dụng</label>
                  <select
                    value={couponType}
                    onChange={(e) => {
                      const type = e.target.value as 'percentage' | 'fixed';
                      setCouponType(type);
                      setCouponValue(type === 'percentage' ? 10 : 50000);
                    }}
                    className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700 bg-white"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VND)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-500 uppercase font-bold mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={couponValue}
                    onChange={(e) => setCouponValue(Math.max(1, Number(e.target.value)))}
                    className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-500 uppercase font-bold mb-1">Đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    min={0}
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-stone-500 uppercase font-bold mb-1">Giảm tối đa (VND)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="Không giới hạn"
                    value={couponMaxDiscount || ''}
                    disabled={couponType === 'fixed'}
                    onChange={(e) => setCouponMaxDiscount(e.target.value ? Math.max(0, Number(e.target.value)) : undefined)}
                    className="w-full rounded-lg border border-amber-200 p-2.5 outline-none focus:border-emerald-700 font-semibold disabled:bg-gray-100 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-1.5">
                <input
                  type="checkbox"
                  id="coupon-active-checkbox"
                  checked={couponIsActive}
                  onChange={(e) => setCouponIsActive(e.target.checked)}
                  className="h-4 w-4 text-emerald-800 rounded border-amber-200 focus:ring-emerald-700 bg-white"
                />
                <label htmlFor="coupon-active-checkbox" className="text-xs font-bold text-stone-700 cursor-pointer select-none">
                  Kích hoạt mã giảm giá này ngay lập tức
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-amber-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="rounded-full px-4 py-1.5 border text-gray-500 hover:bg-neutral-50"
                >
                  Thoát
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-800 px-5 py-1.5 text-white font-bold hover:bg-emerald-900 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="h-4.5 w-4.5" />
                  <span>{editCouponItem ? 'Cập Nhật' : 'Lưu Lại'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* FOR CANCELLATION/WRITE-OFF (BÁO HỦY) GLOBAL POPOVER - OUTSIDE OF TRANSFORM CONTAINERS TO GUARANTEE ACCURATE PIXEL COORDINATES */}
      {cancelProduct && cancelPopupPos && createPortal(
        <>
          {/* Global Transparent Backdrop overlay for closing */}
          <div 
            className="fixed inset-0 z-[190] cursor-default bg-transparent"
            onClick={() => {
              setCancelProduct(null);
              setCancelPopupPos(null);
            }}
          />
          {/* Absolute styled relative to exact viewport coordinates click target */}
          <div 
            className="fixed z-[200] w-[320px] rounded-2xl bg-white p-5 shadow-2xl border border-red-200 text-left whitespace-normal font-sans"
            style={{ 
              top: `${cancelPopupPos.top}px`,
              left: `${cancelPopupPos.left}px`,
              filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.15))'
            }}
          >
            <div className="flex items-center justify-between border-b border-red-50 pb-3 mb-3.5">
              <h3 className="font-serif text-sm font-bold text-red-800 flex items-center gap-1.5">
                <span className="p-1.5 rounded-lg bg-red-50 text-red-650 shrink-0">
                  <Database className="h-4 w-4" />
                </span>
                <span>Báo Hủy / Hỏng Hoa</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setCancelProduct(null);
                  setCancelPopupPos(null);
                }}
                className="rounded-full p-1 text-gray-400 hover:bg-neutral-150 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-3.5 bg-[#FAF7F0]/50 p-2.5 rounded-lg border border-amber-100/50 text-[11px]">
              <p className="font-extrabold text-stone-500">Tác phẩm báo hủy:</p>
              <div className="flex items-center gap-2 mt-1.5">
                <img 
                  src={cancelProduct.image} 
                  alt={cancelProduct.name} 
                  className="w-7 h-7 object-cover rounded border border-amber-100 bg-stone-50"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 pr-1">
                  <p className="font-bold text-emerald-950 truncate max-w-[210px]">{cancelProduct.name}</p>
                  <p className="text-stone-400 text-[10px] mt-0.5 font-medium">Số lượng tồn hiện tại: <span className="font-mono font-bold text-[#C8A96B]">{cancelProduct.stock || 0}</span> bó</p>
                </div>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!cancelProduct) return;
                const currentStock = cancelProduct.stock || 0;
                const nextStock = Math.max(0, currentStock - cancelQuantity);
                const finalReason = cancelReason === 'Lý do khác' ? customReason : cancelReason;

                onEditProduct({
                  ...cancelProduct,
                  stock: nextStock
                });

                const updatedTemp = { ...tempStockValues };
                delete updatedTemp[cancelProduct.id];
                setTempStockValues(updatedTemp);

                setInventoryUpdateSuccess(`Đã báo hủy thành công ${cancelQuantity} bó của tác phẩm "${cancelProduct.name}". Lý do: ${finalReason}.`);
                setTimeout(() => setInventoryUpdateSuccess(null), 4000);

                setCancelProduct(null);
                setCancelPopupPos(null);
              }}
              className="space-y-3.5 text-xs text-stone-600 font-semibold"
            >
              <div>
                <label className="block text-stone-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">
                  Nhập số lượng bó hoa bị hủy/hỏng:
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={cancelProduct.stock || 9999}
                  value={cancelQuantity}
                  onChange={(e) => setCancelQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg border border-amber-200/80 p-2 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-650 font-mono text-stone-800"
                  placeholder="Nhập số lượng..."
                />
              </div>

              <div>
                <label className="block text-stone-500 uppercase font-bold text-[10px] tracking-wider mb-1.5">
                  Lý do chọn đơn giản:
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (e.target.value !== 'Lý do khác') {
                      setCustomReason('');
                    }
                  }}
                  className="w-full rounded-lg border border-amber-200/80 p-2 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-650 text-stone-800 bg-white"
                >
                  <option value="Hoa héo">Hoa héo</option>
                  <option value="Khách hủy đơn">Khách hủy đơn</option>
                  <option value="Bị dập nát, hỏng trong quá trình vận chuyển">Bị dập nát, hỏng trong quá trình vận chuyển</option>
                  <option value="Sản phẩm lỗi mẫu cắm">Sản phẩm lỗi mẫu cắm</option>
                  <option value="Lý do khác">Lý do khác</option>
                </select>
              </div>

              {cancelReason === 'Lý do khác' && (
                <div className="animate-fade-in space-y-1.5">
                  <label className="block text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                    Vui lòng ghi rõ lý do hủy hỏng: <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-red-200 p-2 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-650 text-stone-800 text-xs font-semibold placeholder:text-stone-300 placeholder:font-normal"
                    placeholder="Nhập lý do chi tiết..."
                  />
                </div>
              )}

              <div className="pt-3.5 border-t border-amber-100/60 mt-4">
                <button
                  type="submit"
                  className="w-full rounded-lg bg-red-600 py-2.5 text-white font-extrabold hover:bg-red-700 cursor-pointer flex items-center justify-center gap-1.5 transition active:scale-95 text-xs shadow-xs hover:shadow-md"
                >
                  <Check className="h-4 w-4" strokeWidth={3} />
                  <span>Xác nhận để lưu</span>
                </button>
              </div>
            </form>
          </div>
        </>,
        document.body
      )}



    </div>
  );
}

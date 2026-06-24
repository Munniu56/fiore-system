/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Truck, CheckCircle2, Clock, Ban, AlertCircle, Calendar, Sparkles, Star, MessageSquare } from 'lucide-react';
import { Order, OrderStatus, Product, Review } from '../types';
import { subscribeReviews, saveReview } from '../firebase';

interface ReviewFormItemProps {
  product: Product;
  order: Order;
}

function ReviewFormItem({ product, order }: ReviewFormItemProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState(order.customerName || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Vui lòng viết một chút nội dung nhận xét của bạn.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const emailLower = (order.customerEmail || 'khachhang@fiore.vn').trim().toLowerCase();
      const newRev: Review = {
        id: `${product.id}-order-${order.id || 'gen'}-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        author: author.trim() || 'Khách hàng Fióre',
        email: emailLower,
        rating: rating,
        date: new Date().toLocaleDateString('vi-VN'),
        createdAt: new Date().toISOString(),
        comment: comment.trim(),
        isVerified: true,
        likes: 0
      };
      
      await saveReview(newRev);
    } catch (err) {
      console.error("Save review error:", err);
      setErrorMsg('Không thể lưu đánh giá của bạn. Vui lòng kiểm tra lại kết nối mạng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 bg-white border border-pink-100 rounded-xl p-3.5 space-y-3 px-4 transition-all focus-within:shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-pink-50 pb-2">
        <span className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5 text-rose-500" />
          Viết nhận xét ý kiến của bạn:
        </span>
        
        {/* Interactive Star Selection */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-0.5 focus:outline-none transition-transform hover:scale-115 cursor-pointer"
            >
              <Star
                className={`h-4.5 w-4.5 ${
                  star <= (hoverRating ?? rating)
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-stone-200'
                }`}
              />
            </button>
          ))}
          <span className="text-[10.5px] font-bold text-amber-600 ml-1.5 uppercase tracking-wide">
            {rating === 5 ? 'Tuyệt vời' : rating === 4 ? 'Hài lòng' : rating === 3 ? 'Bình thường' : rating === 2 ? 'Tạm ổn' : 'Chưa tốt'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tên người viết</label>
          <input
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            disabled={isSubmitting}
            placeholder="Nhập tên của bạn..."
            className="w-full rounded-lg border border-pink-50 p-2 text-xs bg-neutral-50/50 outline-none focus:bg-white focus:border-rose-300"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Hòm thư email (Tự động theo đơn hàng)</label>
          <input
            type="text"
            disabled
            value={order.customerEmail || 'Chưa định danh'}
            className="w-full rounded-lg border border-pink-50 p-2 text-xs bg-neutral-100/70 text-gray-400 select-none outline-none cursor-not-allowed"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nội dung cảm nhận / góp ý</label>
        <textarea
          rows={2}
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={isSubmitting}
          placeholder="Chia sẻ trải nghiệm của bạn về độ tươi, sắc sảo, tính nghệ thuật hay tác phong đóng gói hỏa tốc..."
          className="w-full rounded-lg border border-pink-50 p-2 text-xs bg-neutral-50/50 outline-none focus:bg-white focus:border-rose-300 resize-none"
        />
      </div>

      {errorMsg && (
        <p className="text-[10.5px] font-semibold text-rose-600">⚠️ {errorMsg}</p>
      )}

      <div className="flex justify-end pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#1F3D2B] hover:bg-[#2c533c] tracking-wide px-4 py-1.5 text-[10px] font-semibold text-white transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi nhận xét đánh giá'}
        </button>
      </div>
    </form>
  );
}

interface OrderTrackerProps {
  orders: Order[];
  onNavigate: (view: string) => void;
}

export default function OrderTracker({ orders, onNavigate }: OrderTrackerProps) {
  const [searchOrderId, setSearchOrderId] = useState('');
  const [typedOrder, setTypedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  useEffect(() => {
    const unsub = subscribeReviews((revs) => {
      setAllReviews(revs);
    });
    return () => unsub();
  }, []);

  const handleSearchOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    if (!searchOrderId.trim()) {
      setTypedOrder(null);
      return;
    }
    const found = orders.find((o) => o.id.toLowerCase() === searchOrderId.trim().toLowerCase());
    setTypedOrder(found || null);
  };

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
        return 'bg-gray-50 text-gray-600 border border-gray-200';
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

  const getStepsAndIndex = (ordObj: Order | null) => {
    if (!ordObj) {
      return {
        stepsList: [
          { title: 'Đã xác nhận', desc: 'Đơn hàng đã được xác nhận', icon: AlertCircle },
          { title: 'Đang chuẩn bị hàng', desc: 'Nghệ nhân đang gói hoa', icon: Clock },
          { title: 'Đang giao hỏa tốc', desc: 'Shipper đang giao hàng', icon: Truck },
          { title: 'Hoàn tất', desc: 'Đã giao thành công', icon: CheckCircle2 },
        ],
        activeIndex: 0
      };
    }

    const isVisa = ordObj.paymentMethod === 'VISA';
    const isVnpay = ordObj.paymentMethod === 'VNPAY';
    const isPaidOnline = isVisa || isVnpay;

    const stepsList = [
      {
        title: isPaidOnline ? 'Đã thanh toán' : 'Đã xác nhận',
        desc: isVnpay 
          ? 'Thanh toán thành công qua VNPAY Sandbox' 
          : isVisa 
            ? 'Thanh toán thành công qua thẻ Visa' 
            : 'Tổng đài đã duyệt & xác nhận đơn',
        icon: isPaidOnline ? CheckCircle2 : AlertCircle
      },
      {
        title: 'Đang chuẩn bị hàng',
        desc: 'Nghệ nhân đang chuẩn bị nguyên vật liệu gói hoa',
        icon: Clock
      },
      {
        title: 'Đang giao hỏa tốc',
        desc: 'Shipper chuyên nghiệp đang di chuyển giao hàng',
        icon: Truck
      },
      {
        title: 'Hoàn tất giao hoa',
        desc: 'Giao hoa thành công tốt đẹp tới người nhận',
        icon: CheckCircle2
      }
    ];

    let activeIndex = 0;
    const s = ordObj.status;
    if (s === 'confirmed' || s === 'paid') {
      activeIndex = 0;
    } else if (s === 'preparing') {
      activeIndex = 1;
    } else if (s === 'shipping') {
      activeIndex = 2;
    } else if (s === 'completed') {
      activeIndex = 3;
    } else {
      activeIndex = -1;
    }

    return { stepsList, activeIndex };
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const dt = new Date(dateStr);
      return `${dt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${dt.toLocaleDateString('vi-VN')}`;
    } catch {
      return dateStr;
    }
  };

  // Pick order to display: if active typed order exists, display it; else if user has orders, select the latest order.
  const displayOrder = typedOrder || (orders.length > 0 ? orders[orders.length - 1] : null);
  const { stepsList, activeIndex } = getStepsAndIndex(displayOrder);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      <div className="text-center max-w-xl mx-auto mb-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900">Theo Dõi Tiến Trình Giao Hoa</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cập nhật hành trình vận chuyển thời gian thực từ khâu chuẩn bị búp hoa tới tay các khách quý
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Left Side: Lookup interface */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Lookup Input Box */}
          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-xs">
            <h3 className="font-serif text-base font-bold text-gray-800 mb-3.5">Truy vấn mã đơn hoa</h3>
            <form onSubmit={handleSearchOrder} className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-300">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                placeholder="Ví dụ: ORD-171..."
                className="w-full rounded-full border border-pink-100 bg-neutral-50 pl-9 pr-20 py-2.5 text-xs outline-none focus:bg-white focus:border-rose-400"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 rounded-full bg-rose-600 px-4 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
                id="search-order-btn"
              >
                Tra cứu
              </button>
            </form>
            {searched && !typedOrder && searchOrderId && (
              <p className="mt-2 text-xs text-red-500 font-semibold text-center">Không tìm thấy mã đơn "{searchOrderId}" trên hệ thống.</p>
            )}
          </div>

          {/* Customer History Node (if signed in and has purchases) */}
          <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-xs">
            <h3 className="font-serif text-base font-bold text-gray-800 border-b border-pink-50 pb-2.5 mb-3 flex items-center justify-between">
              <span>Lịch sử đặt hoa</span>
              <span className="rounded-full bg-pink-100 px-2 py-0.5 text-[9px] font-bold text-rose-700">
                {orders.length} Đơn
              </span>
            </h3>

            {orders.length > 0 ? (
              <div className="space-y-3.5 max-h-64 overflow-y-auto pr-1">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setTypedOrder(ord);
                      setSearchOrderId(ord.id);
                      setSearched(false);
                    }}
                    className={`cursor-pointer rounded-xl border p-3 text-left transition ${
                      displayOrder?.id === ord.id
                        ? 'border-rose-400 bg-pink-50/20 shadow-xs'
                        : 'border-pink-50 hover:bg-neutral-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-800">{ord.id}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold ${getStatusBadgeStyles(ord.status)}`}>
                        {getStatusLabelText(ord.status)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center"><Calendar className="mr-1 h-3 w-3" />{formatDateTime(ord.createdAt)}</p>
                    <div className="mt-2 flex justify-between items-end">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] text-gray-500 line-clamp-1 max-w-[130px]">{ord.items.map(it => it.product.name).join(', ')}</span>
                        {((ord.promotionDiscount && ord.promotionDiscount > 0) || (ord.discountAmount && ord.discountAmount > 0) || ord.couponCode) && (
                          <span className="text-[8.5px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5 select-none bg-emerald-50 px-1 py-0.5 rounded-sm w-fit">
                            <Sparkles className="h-2.5 w-2.5 text-emerald-500 shrink-0 animate-pulse" /> Đã áp dụng ưu đãi
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-extrabold text-rose-600 shrink-0">{formatVND(ord.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400 italic">Bạn chưa thực hiện giao dịch mua bán hoa tươi nào.</p>
                <button
                  onClick={() => onNavigate('catalog')}
                  className="mt-3.5 inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-rose-700 cursor-pointer"
                >
                  Mua hoa ngay
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Detailed visual milestones tracking */}
        <div className="lg:col-span-8">
          {displayOrder ? (
            <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
              
              {/* Header Info of Active order */}
              <div className="border-b border-pink-50 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-bold">Mã số đơn hoa</span>
                    <span className="font-mono text-base font-bold text-gray-900 bg-pink-50 px-2 py-0.5 rounded-md">{displayOrder.id}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center"><Calendar className="mr-1 h-3.5 w-3.5" />Thời gian xác lập: {formatDateTime(displayOrder.createdAt)}</p>
                </div>
                
                <div className="sm:text-right">
                  <span className="text-xs text-gray-400 block font-bold uppercase mb-1">Phương thức thanh toán</span>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {displayOrder.paymentMethod === 'COD' 
                      ? 'Thanh toán COD khi giao hoa' 
                      : displayOrder.paymentMethod === 'VNPAY'
                        ? 'Đã thanh toán VNPAY SandBox'
                        : 'Thanh toán thẻ Visa trực tuyến'}
                  </span>
                </div>
              </div>

              {/* Visual Multi-step Progress bar */}
              {displayOrder.status === 'cancelled' ? (
                <div className="rounded-xl bg-red-50 p-4 border border-red-100 flex items-start space-x-3 text-red-800 mb-8">
                  <Ban className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Đơn hàng này đã bị hủy bỏ</h4>
                    <p className="text-xs text-red-600 mt-1">Đơn hoa của quý khách bị đình chỉ bởi lý do thay đổi từ phía khách hàng hoặc bất khả kháng thời tiết. Chúng tôi chân thành tạ lỗi.</p>
                  </div>
                </div>
              ) : (
                <div className="mb-10 mt-6 px-4">
                  
                  {/* Dynamic Desktop horizontal bar indicator status tracker */}
                  <div className="hidden sm:grid sm:grid-cols-4 gap-4 relative">
                    <div className="absolute top-4 left-0 h-1 bg-gray-100 w-full -z-10 rounded-full"></div>
                    <div 
                      className="absolute top-4 left-0 h-1 bg-rose-600 transition-all duration-500 -z-10 rounded-full"
                      style={{ width: `${activeIndex >= 0 ? (activeIndex / 3) * 100 : 0}%` }}
                    ></div>

                    {stepsList.map((st, idx) => {
                      const isActive = activeIndex >= idx;
                      const IconComponent = st.icon;
                      return (
                        <div key={idx} className="text-center group flex flex-col items-center">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full transition duration-300 border ${
                            isActive
                              ? 'bg-rose-600 text-white border-rose-600 shadow-md scale-110'
                              : 'bg-white text-gray-400 border-pink-100 group-hover:border-pink-300'
                          }`}>
                            <IconComponent className="h-4.5 w-4.5" />
                          </div>
                          <h4 className={`text-xs font-bold mt-2.5 ${isActive ? 'text-rose-700' : 'text-gray-400'}`}>
                            {st.title}
                          </h4>
                          <p className={`text-[10px] mt-1 px-1 line-clamp-2 leading-snug ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                            {st.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Mobile vertical layout list steps */}
                  <div className="sm:hidden space-y-6">
                    {stepsList.map((st, idx) => {
                      const isActive = activeIndex >= idx;
                      const IconComponent = st.icon;
                      return (
                        <div key={idx} className="flex space-x-3.5 items-start">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full shrink-0 border ${
                            isActive
                              ? 'bg-rose-600 text-white border-rose-600'
                              : 'bg-gray-100 text-gray-400 border-gray-100'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className={`text-xs font-bold ${isActive ? 'text-rose-700' : 'text-gray-400'}`}>
                              {st.title}
                            </h4>
                            <p className={`text-[10px] mt-0.5 leading-snug ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                              {st.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}

              {/* Delivery Destination details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-pink-50/20 rounded-2xl p-5 border border-pink-50/50 text-xs text-gray-600 mb-6">
                <div>
                  <h4 className="font-bold text-gray-900 uppercase tracking-wide flex items-center mb-2.5">
                    <MapPin className="mr-1.5 h-4.5 w-4.5 text-rose-500" />
                    Địa Chỉ Giao Nhận Hoa
                  </h4>
                  <p className="font-bold text-gray-800">{displayOrder.recipientName}</p>
                  <p className="mt-1">Số điện thoại: {displayOrder.recipientPhone}</p>
                  <p className="mt-1 font-medium text-gray-700">{displayOrder.shippingAddress}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 uppercase tracking-wide flex items-center mb-2.5">
                    <AlertCircle className="mr-1.5 h-4.5 w-4.5 text-rose-500" />
                    Bút Tích Ghi Chú Đơn Hoa
                  </h4>
                  <div className="rounded-lg bg-white p-3 border border-pink-50 italic text-gray-500 min-h-[50px] leading-relaxed">
                    {displayOrder.note ? displayOrder.note : 'Không có lời chúc hoặc viết thiệp đính kèm.'}
                  </div>
                </div>
              </div>

              {/* Order items list recapitulatory detail */}
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3">Sản phẩm trong đơn hàng</h4>
                <div className="rounded-xl border border-pink-50 divide-y divide-pink-50 overflow-hidden bg-neutral-50/30">
                  {displayOrder.items.map((it) => (
                    <div key={it.product.id} className="p-4 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 select-none">
                          <img src={it.product.image} className="h-12 w-12 rounded-lg object-cover border border-pink-50 bg-[#1F3D2B]/5" referrerPolicy="no-referrer" />
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{it.product.name}</p>
                            <p className="text-gray-400">Đơn giá: {formatVND(it.product.price)} x{it.quantity}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-gray-800">{formatVND(it.product.price * it.quantity)}</span>
                      </div>
                    </div>
                  ))}

                  {(() => {
                    const subtotal = displayOrder.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
                    const ptsDiscount = (displayOrder.redeemedPoints || 0) * 1000;
                    const totalDiscount = displayOrder.discountAmount || 0;
                    const couponDiscount = Math.max(0, totalDiscount - ptsDiscount);
                    const shippingFee = 30000; // Phí hỏa tốc flat 30.000đ

                    return (
                      <div className="bg-pink-50/10 p-4 border-t border-pink-50/80 text-xs space-y-2.5">
                        <div className="flex justify-between items-center text-gray-600 font-medium pb-2 border-b border-pink-100/30">
                          <span>Tạm tính (Giá gốc sản phẩm):</span>
                          <span>{formatVND(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-gray-600 font-medium">
                          <span>Phí vận chuyển hỏa tốc:</span>
                          <span>{formatVND(shippingFee)}</span>
                        </div>
                        {couponDiscount > 0 && (
                          <div className="flex justify-between items-center text-emerald-800 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              Mã Giảm Giá / Ưu Đãi {displayOrder.couponCode ? `(${displayOrder.couponCode})` : ''}:
                            </span>
                            <span className="font-semibold text-emerald-700">-{formatVND(couponDiscount)}</span>
                          </div>
                        )}
                        {((displayOrder.promotionDiscount && displayOrder.promotionDiscount > 0) || (subtotal > 1000000)) && (
                          <div className="flex justify-between items-center text-rose-600 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                              Ưu đãi đơn hàng &gt; 1 triệu:
                            </span>
                            <span className="font-semibold text-rose-600">-{formatVND(displayOrder.promotionDiscount || 50000)}</span>
                          </div>
                        )}
                        {ptsDiscount > 0 && (
                          <div className="flex justify-between items-center text-emerald-800 font-medium">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              Giá trị quy đổi của thẻ thành viên ({displayOrder.redeemedPoints} điểm):
                            </span>
                            <span className="font-semibold text-emerald-700">-{formatVND(ptsDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center font-bold text-gray-800 border-t border-dashed border-pink-100/60 pt-3 text-sm mt-1">
                          <span>Tổng cộng thanh toán:</span>
                          <span className="text-rose-600 text-base">{formatVND(displayOrder.totalAmount)}</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Move assessment/review section below the "Giao hàng hỏa tốc nội thành" block */}
                  {displayOrder.status === 'completed' && (
                    <div className="p-4 border-t border-pink-50 bg-neutral-50/10 space-y-4">
                      <p className="font-serif font-black text-[#1F3D2B] text-xs uppercase tracking-wider flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-rose-500 animate-pulse" />
                        ĐÁNH GIÁ SẢN PHẨM ĐÃ MUA
                      </p>
                      <div className="space-y-4">
                        {displayOrder.items.map((it) => {
                          const userEmailClean = (displayOrder.customerEmail || '').trim().toLowerCase();
                          const existingReview = allReviews.find(
                            r => r.productId === it.product.id && r.email.trim().toLowerCase() === userEmailClean
                          );

                          return (
                            <div key={it.product.id} className="bg-white/95 backdrop-blur-xs border border-pink-50/65 rounded-xl p-3.5 space-y-2">
                              {existingReview ? (
                                <div className="space-y-1.5 bg-pink-50/10 p-3 rounded-lg border border-pink-50/35">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-emerald-800 text-[10.5px] flex items-center gap-1.5">
                                      <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                                      Cảm ơn bạn đã gửi đánh giá cho tác phẩm hoa này!
                                    </span>
                                    <div className="flex items-center gap-0.5">
                                      {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                          key={s}
                                          className={`h-3 w-3 ${s <= existingReview.rating ? 'fill-amber-400 text-amber-500' : 'text-stone-200'}`}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-gray-700 italic text-xs leading-relaxed">"{existingReview.comment}"</p>
                                </div>
                              ) : (
                                <ReviewFormItem 
                                  product={it.product} 
                                  order={displayOrder}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-pink-100 bg-white p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-pink-100 text-rose-500 mb-4">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="font-serif text-lg font-bold text-gray-800">Cổng tra cứu bưu phẩm Fiore</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                Nhập mã bưu phẩm hoặc chọn từ sổ bưu điện lịch sử bên trái để xem tiến độ đóng gói hoa nghệ thuật.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

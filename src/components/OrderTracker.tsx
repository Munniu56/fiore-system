/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, MapPin, Truck, CheckCircle2, Clock, Ban, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerProps {
  orders: Order[];
  onNavigate: (view: string) => void;
}

export default function OrderTracker({ orders, onNavigate }: OrderTrackerProps) {
  const [searchOrderId, setSearchOrderId] = useState('');
  const [typedOrder, setTypedOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

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
                      <span className="text-[10px] text-gray-500 line-clamp-1 max-w-[130px]">{ord.items.map(it => it.product.name).join(', ')}</span>
                      <span className="text-xs font-extrabold text-rose-600">{formatVND(ord.totalAmount)}</span>
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
                    <div key={it.product.id} className="flex items-center justify-between p-3 text-xs">
                      <div className="flex items-center space-x-3 select-none">
                        <img src={it.product.image} className="h-10 w-10 rounded-md object-cover" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-gray-800">{it.product.name}</p>
                          <p className="text-gray-400">Đơn giá: {formatVND(it.product.price)} x{it.quantity}</p>
                        </div>
                      </div>
                      <span className="font-extrabold text-gray-800">{formatVND(it.product.price * it.quantity)}</span>
                    </div>
                  ))}
                  <div className="p-3 text-right bg-pink-50/10 text-xs font-semibold text-gray-700">
                    Giao hàng hỏa tốc nội thành: <span className="font-bold text-rose-600">{formatVND(displayOrder.totalAmount)}</span>
                  </div>
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

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, Truck, ClipboardList, ShieldAlert, BadgeCheck, CheckCircle2 } from 'lucide-react';
import { CartItem } from '../types';
import { createVnpayPaymentUrl } from '../vnpayConfig';

interface CheckoutViewProps {
  cartItems: CartItem[];
  defaultUserEmail: string;
  onPlaceOrder: (recipientData: {
    id?: string;
    recipientName: string;
    recipientPhone: string;
    recipientEmail?: string;
    shippingAddress: string;
    note: string;
    paymentMethod: 'COD' | 'VISA' | 'VNPAY';
    cardDetails?: {
      cardNumber: string;
      cardName: string;
      expiry: string;
      cvv: string;
    }
  }) => void;
  onNavigate: (view: string) => void;
  sentEmailOrderIds?: string[];
}

export default function CheckoutView({
  cartItems,
  defaultUserEmail,
  onPlaceOrder,
  onNavigate,
  sentEmailOrderIds = [],
}: CheckoutViewProps) {
  
  // Recipient details state
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientEmail, setRecipientEmail] = useState(defaultUserEmail || '');
  const [shippingAddress, setShippingAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VISA' | 'VNPAY'>('COD');

  useEffect(() => {
    if (defaultUserEmail) {
      setRecipientEmail(defaultUserEmail);
    }
  }, [defaultUserEmail]);

  // Visa card simulation details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // Local validation tracking
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessScreen, setIsSuccessScreen] = useState(false);

  // Visa validation messages
  const [visaSuccessMsg, setVisaSuccessMsg] = useState<string | null>(null);
  const [visaErrorMsg, setVisaErrorMsg] = useState<string | null>(null);

  // Placed order success info capture states
  const [placedOrderCode, setPlacedOrderCode] = useState('');
  const [placedTotalAmount, setPlacedTotalAmount] = useState(0);
  const [placedEmail, setPlacedEmail] = useState('');
  const [placedNote, setPlacedNote] = useState('');

  // Auto-detect and populate success screens if returning from VNPAY sandbox
  useEffect(() => {
    const vnpaySuccessInfoStr = localStorage.getItem('fiore_vnpay_success_info');
    if (vnpaySuccessInfoStr) {
      try {
        const info = JSON.parse(vnpaySuccessInfoStr);
        setPlacedOrderCode(info.id);
        setPlacedTotalAmount(info.totalAmount);
        setPlacedEmail(info.email);
        setPlacedNote(info.note);

        setRecipientName(info.recipientName || '');
        setRecipientPhone(info.recipientPhone || '');
        setShippingAddress(info.shippingAddress || '');
        setRecipientEmail(info.email || '');
        setPaymentMethod('VNPAY');

        setIsSuccessScreen(true);
        localStorage.removeItem('fiore_vnpay_success_info');
      } catch (err) {
        console.error('Error handling VNPAY success info in CheckoutView:', err);
      }
    }
  }, []);

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  };

  const SHIPPING_FEE = 30000;
  const DISCOUNT_MOCK = calculateSubtotal() > 1000000 ? 50000 : 0;
  const totalAmount = calculateSubtotal() + SHIPPING_FEE - DISCOUNT_MOCK;

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!recipientName.trim()) newErrors.recipientName = 'Họ tên người nhận không được để trống';
    if (!recipientPhone.trim()) {
      newErrors.recipientPhone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(recipientPhone.trim())) {
      newErrors.recipientPhone = 'Số điện thoại không hợp lệ (yêu cầu 10-11 chữ số)';
    }
    if (!recipientEmail.trim()) {
      newErrors.recipientEmail = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.trim())) {
      newErrors.recipientEmail = 'Địa chỉ email không đúng định dạng';
    }
    if (!shippingAddress.trim()) newErrors.shippingAddress = 'Địa chỉ giao hàng không được để trống';

    if (paymentMethod === 'VISA') {
      if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Số thẻ Visa giả định phải đúng 16 ký tự';
      }
      if (!cardName.trim()) newErrors.cardName = 'Tên in trên thẻ không được trống';
      if (!expiry.trim() || !/^\d{2}\/\d{2}$/.test(expiry)) {
        newErrors.expiry = 'Hợp lệ: MM/YY';
      }
      if (!cvv.trim() || cvv.length !== 3) {
        newErrors.cvv = 'Mã CVV phải gồm 3 chữ số';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setVisaErrorMsg(null);
    setVisaSuccessMsg(null);
    if (!validateForm()) return;

    setIsSubmitting(true);

    const generatedId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    setPlacedOrderCode(generatedId);
    setPlacedTotalAmount(totalAmount);
    setPlacedEmail(recipientEmail || 'guest@fiore.vn');
    setPlacedNote(note.trim());

    if (paymentMethod === 'VISA') {
      const formattedCardNum = cardNumber.replace(/\s/g, '');
      const formattedCardName = cardName.trim().toUpperCase();
      const formattedExpiry = expiry.trim();
      const formattedCvv = cvv.trim();

      if (
        formattedCardNum !== '4111111111111111' ||
        formattedCardName !== 'NGUYEN VAN A' ||
        formattedExpiry !== '12/30' ||
        formattedCvv !== '123'
      ) {
        setIsSubmitting(false);
        setVisaErrorMsg('Thông tin thẻ không hợp lệ.');
        return;
      } else {
        setVisaSuccessMsg('Thanh toán thành công (Demo).');
      }
    }

    if (paymentMethod === 'VNPAY') {
      // Store all critical checkout attributes for callback restoration
      const pendingOrder = {
        id: generatedId,
        recipientName,
        recipientPhone,
        shippingAddress,
        note,
        paymentMethod,
        cartItems,
        totalAmount,
        recipientEmail: recipientEmail || 'guest@fiore.vn'
      };
      localStorage.setItem('fiore_pending_vnpay_order', JSON.stringify(pendingOrder));
      
      // Redirect current page immediately to VNPAY Sandbox (same tab, no new tab)
      const vnpayUrl = createVnpayPaymentUrl(generatedId, totalAmount);
      window.location.href = vnpayUrl;
      return;
    }

    // Simulate standard card processing network delay
    setTimeout(() => {
      onPlaceOrder({
        id: generatedId,
        recipientName,
        recipientPhone,
        recipientEmail,
        shippingAddress,
        note,
        paymentMethod,
        cardDetails: paymentMethod === 'VISA' ? { cardNumber, cardName, expiry, cvv } : undefined,
      });
      setIsSubmitting(false);
      if (paymentMethod !== 'VNPAY') {
        setIsSuccessScreen(true);
      }
    }, 1800);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* VNPAY Redirect Modal Overlay with Click Safeguard */}
      {isSubmitting && paymentMethod === 'VNPAY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-3xl border border-pink-100 bg-white p-8 text-center shadow-2xl space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <svg className="animate-spin h-8 w-8 text-rose-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            
            <div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Đang chuyển hướng VNPAY</h3>
              <p className="mt-3 text-xs text-gray-500 leading-relaxed animate-pulse">
                Hệ thống đang khởi tạo giao dịch cho đơn hàng <span className="font-bold text-rose-600 font-mono">{placedOrderCode}</span> với số tiền <span className="font-extrabold text-gray-800">{formatVND(placedTotalAmount)}</span>.
              </p>
            </div>

            <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100/50 text-[11px] text-gray-600 text-left space-y-1.55">
              <p className="font-bold text-rose-800">⚠️ Thông tin kết nối môi trường thanh toán:</p>
              <p>Môi trường bảo mật VNPAY Sandbox đang khởi tạo kết nối trực tiếp trong trang hiện tại.</p>
              <p className="font-semibold text-rose-700">Nếu trình duyệt không tự chuyển hướng, quý khách vui lòng bấm nút dưới đây để thanh toán:</p>
            </div>

            <div className="flex flex-col gap-2.5">
              <a
                href={createVnpayPaymentUrl(placedOrderCode, placedTotalAmount)}
                target="_self"
                className="inline-flex w-full items-center justify-center rounded-full bg-rose-600 py-3.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
              >
                💳 Tiếp tục đến VNPAY Sandbox
              </a>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitting(false);
                }}
                className="text-[11px] text-gray-400 hover:text-rose-500 font-medium transition cursor-pointer pt-1"
              >
                Quay lại điền thông tin đơn hàng
              </button>
            </div>

            <p className="text-[9px] text-gray-400">
              * Sau khi thanh toán thành công trên VNPAY Sandbox, bạn sẽ được tự động chuyển hướng quay lại đây để nhận thông báo Đơn hàng thành công.
            </p>
          </div>
        </div>
      )}

      {isSuccessScreen ? (
        <div className="mx-auto max-w-lg rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-6">
            <CheckCircle2 className="h-10 w-10 animate-ping" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-gray-900">Đặt Hoa Thành Công!</h2>
          <p className="mt-3 text-sm text-gray-500">
            Cảm ơn bạn đã lựa chọn tiệm hoa <span className="font-semibold text-rose-500">Fióre</span>. Đơn hàng của bạn đã được tiếp nhận và phản hồi tới hệ thống xử lý hoa tươi.
          </p>

          <div className="mt-6 rounded-2xl bg-neutral-50 p-5 text-left border border-gray-100 space-y-2 text-xs">
            <p><span className="text-gray-400 font-medium">Mã số đơn hàng:</span> <span className="font-bold text-rose-600">{placedOrderCode}</span></p>
            <p><span className="text-gray-400 font-medium">Email:</span> <span className="font-bold text-gray-800">{placedEmail}</span></p>
            <p><span className="text-gray-400 font-medium">Người nhận:</span> <span className="font-bold text-gray-800">{recipientName}</span></p>
            <p><span className="text-gray-400 font-medium">Số điện thoại:</span> <span className="font-bold text-gray-800">{recipientPhone}</span></p>
            <p><span className="text-gray-400 font-medium">Địa chỉ nhận:</span> <span className="font-semibold text-gray-700">{shippingAddress}</span></p>
            <p><span className="text-gray-400 font-medium">Hình thức:</span> <span className="font-bold text-rose-600">{paymentMethod === 'COD' ? 'Thanh toán COD khi nhận hoa' : paymentMethod === 'VNPAY' ? 'Đã thanh toán VNPAY SandBox' : 'Đã thanh toán Visa (Mô phỏng)'}</span></p>
            {placedNote && (
              <p><span className="text-gray-400 font-medium">Ghi chú đơn hàng & Viết thiệp miễn phí:</span> <span className="font-semibold text-gray-700 italic">"{placedNote}"</span></p>
            )}
            <p className="border-t border-gray-150 pt-2 mt-2"><span className="text-gray-400 font-medium">Tổng số tiền:</span> <span className="font-extrabold text-rose-600 text-sm">{formatVND(placedTotalAmount)}</span></p>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={() => {
                onNavigate('orders');
              }}
              className="w-full rounded-full bg-rose-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-rose-700 transition cursor-pointer"
            >
              Theo dõi lộ trình đơn hàng
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full rounded-full border border-pink-100 bg-white py-3 text-sm font-semibold text-gray-700 hover:bg-pink-50 transition cursor-pointer"
            >
              Quay lại trang chủ
            </button>
          </div>

          {/* Email sending status indicator at the bottom */}
          {sentEmailOrderIds.includes(placedOrderCode) && (
            <div className="mt-5 flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/80 py-2.5 px-4 rounded-xl border border-emerald-100 animate-fade-in shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Đã gửi mail xác nhận đơn hoa thành công!</span>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-12" id="checkout-form">
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
              <h2 className="font-serif text-2xl font-bold text-gray-900 border-b border-pink-50 pb-4 mb-6 flex items-center">
                <Truck className="mr-2.5 h-6 w-6 text-rose-500" />
                Thông Tin Nhận Hoa & Giao Hàng
              </h2>

              <div className="space-y-5">
                
                {/* Recipient Name Input */}
                <div>
                  <label htmlFor="recipientName" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Họ và tên người nhận hoa <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="recipientName"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Nhập họ tên đầy đủ..."
                    className={`w-full rounded-lg border bg-neutral-50/50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-1 ${
                      errors.recipientName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-pink-50 focus:border-rose-400 focus:ring-rose-400'
                    }`}
                  />
                  {errors.recipientName && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.recipientName}</p>
                  )}
                </div>

                {/* Recipient Phone and Optional Shipping Address split */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="recipientPhone" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Số điện thoại di động <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="recipientPhone"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      placeholder="Ví dụ: 0912345678"
                      className={`w-full rounded-lg border bg-neutral-50/50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-1 ${
                        errors.recipientPhone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-pink-50 focus:border-rose-400 focus:ring-rose-400'
                      }`}
                    />
                    {errors.recipientPhone && (
                      <p className="mt-1 text-xs text-red-500 font-semibold">{errors.recipientPhone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="recipientEmail" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                      Email nhận hóa đơn & thông tin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="recipientEmail"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="Nhập địa chỉ email lấy hóa đơn..."
                      className={`w-full rounded-lg border bg-neutral-50/50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-1 ${
                        errors.recipientEmail ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-pink-50 focus:border-rose-400 focus:ring-rose-400'
                      }`}
                    />
                    {errors.recipientEmail && (
                      <p className="mt-1 text-xs text-red-500 font-semibold">{errors.recipientEmail}</p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="shippingAddress" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    Địa chỉ nhận hoa chính xác <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Số nhà, ngõ ngách, tên đường, phường/xã, quận/huyện..."
                    className={`w-full rounded-lg border bg-neutral-50/50 px-4 py-2.5 text-sm outline-none transition focus:bg-white focus:ring-1 ${
                      errors.shippingAddress ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-pink-50 focus:border-rose-400 focus:ring-rose-400'
                    }`}
                  />
                  {errors.shippingAddress && (
                    <p className="mt-1 text-xs text-red-500 font-semibold">{errors.shippingAddress}</p>
                  )}
                </div>

                {/* Shipping Notes */}
                <div>
                  <label htmlFor="note" className="block text-xs font-bold uppercase tracking-wider text-rose-700 mb-1.5 flex items-center gap-1">
                    <span>🎁 Ghi chú giao hàng & Viết thiệp chúc mừng (Miễn phí)</span>
                  </label>
                  <textarea
                    id="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Nhập nội dung lời chúc tặng kèm hoặc ghi chú thời gian nhận hoa cụ thể..."
                    className="w-full rounded-lg border border-pink-100 bg-neutral-50/50 px-4 py-2.5 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-1 focus:ring-rose-400"
                  />
                </div>

              </div>

              {/* Payment Methods Section */}
              <h3 className="mt-8 font-serif text-xl font-bold text-gray-900 border-b border-pink-50 pb-3 mb-5 flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-rose-500" />
                Phương Thức Thanh Toán
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                
                {/* COD option */}
                <div
                  onClick={() => {
                    setPaymentMethod('COD');
                    setErrors({});
                    setVisaErrorMsg(null);
                    setVisaSuccessMsg(null);
                  }}
                  className={`flex cursor-pointer items-start space-x-3.5 rounded-xl border p-4 transition-all duration-200 ${
                    paymentMethod === 'COD'
                      ? 'border-rose-500 bg-pink-50/20 ring-1 ring-rose-500'
                      : 'border-pink-50 hover:border-pink-100 hover:bg-neutral-50'
                  }`}
                  id="pay-opt-cod"
                >
                  <div className="flex h-5 items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'COD'}
                      onChange={() => {}}
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-pink-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Thanh toán khi giao hoa (COD)</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">Hạnh phúc trao tay. Quý khách kiểm duyệt đúng chất lượng hoa nở trước khâu chi trả.</p>
                  </div>
                </div>

                {/* VISA option */}
                <div
                  onClick={() => {
                    setPaymentMethod('VISA');
                    setErrors({});
                    setVisaErrorMsg(null);
                    setVisaSuccessMsg(null);
                  }}
                  className={`flex cursor-pointer items-start space-x-3.5 rounded-xl border p-4 transition-all duration-200 ${
                    paymentMethod === 'VISA'
                      ? 'border-rose-500 bg-pink-50/20 ring-1 ring-rose-500'
                      : 'border-pink-50 hover:border-pink-100 hover:bg-neutral-50'
                  }`}
                  id="pay-opt-visa"
                >
                  <div className="flex h-5 items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'VISA'}
                      onChange={() => {}}
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-pink-300"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">Thẻ Quốc Tế Visa / Mastercard (Demo)</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-snug">Kết nối tự động mạng thanh toán ảo. Tuyệt đối an toàn cho việc trải nghiệm chức năng.</p>
                  </div>
                </div>

                {/* VNPAY option */}
                <div
                  onClick={() => {
                    setPaymentMethod('VNPAY');
                    setErrors({});
                    setVisaErrorMsg(null);
                    setVisaSuccessMsg(null);
                  }}
                  className={`flex cursor-pointer items-start space-x-3.5 rounded-xl border p-4 transition-all duration-200 ${
                    paymentMethod === 'VNPAY'
                      ? 'border-rose-500 bg-pink-50/20 ring-1 ring-rose-500'
                      : 'border-pink-50 hover:border-pink-100 hover:bg-neutral-50'
                  }`}
                  id="pay-opt-vnpay"
                >
                  <div className="flex h-5 items-center">
                    <input
                      type="radio"
                      checked={paymentMethod === 'VNPAY'}
                      onChange={() => {}}
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-pink-300"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-800">VNPAY Sandbox</p>
                      <img 
                        src="https://sandbox.vnpayment.vn/paymentv2/Images/brands/logo-vnpay.png" 
                        alt="VNPAY" 
                        className="h-4.5 object-contain ml-1 bg-white px-1.5 py-0.5 rounded border border-gray-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1 leading-snug">Cổng thanh toán chính thức ATM, Thẻ quốc tế hoặc quét QR. Được hỗ trợ chính thức Sandbox.</p>
                  </div>
                </div>

              </div>

              {/* Simulated Credit Card Input Form */}
              {paymentMethod === 'VISA' && (
                <div className="mt-6 rounded-2xl bg-[#a8b898]/10 p-5 border border-emerald-100 space-y-4">
                  
                  <div className="flex items-center space-x-2 text-emerald-800">
                    <BadgeCheck className="h-5 w-5 text-emerald-700 shrink-0" />
                    <p className="text-xs font-semibold leading-snug uppercase tracking-wider">Môi Trường Thanh Toán Giả Định An Toàn</p>
                  </div>

                  {/* Visa verification messages */}
                  {visaErrorMsg && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-red-800 text-xs font-bold flex items-center shadow-xs animate-pulse">
                      <ShieldAlert className="w-5 h-5 mr-1.5 shrink-0 text-red-600" />
                      <span>{visaErrorMsg}</span>
                    </div>
                  )}

                  {visaSuccessMsg && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-emerald-800 text-xs font-bold flex items-center shadow-xs">
                      <CheckCircle2 className="w-5 h-5 mr-1.5 shrink-0 text-emerald-600" />
                      <span>{visaSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    
                    {/* Simulated Visa Interactive Card Graphic */}
                    <div className="flex flex-col justify-between rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 p-4 sm:p-5 text-white shadow-md aspect-video w-full max-w-sm mx-auto md:mx-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] uppercase tracking-widest opacity-80">Premium Florist Member</p>
                          <p className="font-serif text-lg font-bold tracking-wide mt-1">Fióre Card</p>
                        </div>
                        <span className="font-serif italic font-bold text-xl opacity-90 text-right">VISA</span>
                      </div>
                      
                      <p className="font-mono text-base tracking-widest my-4">
                        {cardNumber ? cardNumber : '•••• •••• •••• ••••'}
                      </p>

                      <div className="flex justify-between items-end text-[10px]">
                        <div>
                          <p className="uppercase opacity-60">Chủ Thẻ</p>
                          <p className="font-bold tracking-wide uppercase truncate max-w-[120px]">
                            {cardName ? cardName : 'TEN CHU THE'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="uppercase opacity-60">Hạn Thẻ</p>
                          <p className="font-semibold">{expiry ? expiry : 'MM/YY'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Visa Form Inputs */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Số Thẻ (16 chữ số)</label>
                        <input
                          type="text"
                          maxLength={16}
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="4111..."
                          className="w-full rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400"
                        />
                        {errors.cardNumber && <span className="text-[10px] text-red-500 font-semibold">{errors.cardNumber}</span>}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Tên In Trên Thẻ</label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="NGUYEN VAN A..."
                          className="w-full rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400 uppercase"
                        />
                        {errors.cardName && <span className="text-[10px] text-red-500 font-semibold">{errors.cardName}</span>}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Hết hạn (MM/YY)</label>
                          <input
                            type="text"
                            maxLength={5}
                            value={expiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length > 2) {
                                val = val.substring(0,2) + '/' + val.substring(2,4);
                              }
                              setExpiry(val);
                            }}
                            placeholder="12/30"
                            className="w-full rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400"
                          />
                          {errors.expiry && <span className="text-[10px] text-red-500 font-semibold">{errors.expiry}</span>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Mã CVV</label>
                          <input
                            type="password"
                            maxLength={3}
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            className="w-full rounded-lg border border-pink-100 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400"
                          />
                          {errors.cvv && <span className="text-[10px] text-red-500 font-semibold">{errors.cvv}</span>}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Right order panel recap */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-pink-50 pb-3 mb-4 flex items-center">
                <ClipboardList className="mr-2 h-5 w-5 text-rose-500" />
                Tổng Kết Đơn Hoa
              </h2>

              <ul className="divide-y divide-pink-50 text-xs mb-5 max-h-52 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <li key={item.product.id} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center space-x-2.5">
                      <img src={item.product.image} className="h-9 w-9 rounded-md object-cover border border-pink-50" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-gray-800 line-clamp-1">{item.product.name}</p>
                        <p className="text-gray-400">Số lượng: x{item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-700">{formatVND(item.product.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 border-t border-pink-50 pt-4 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Trị giá bó hoa</span>
                  <span className="font-semibold text-gray-800">{formatVND(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold text-gray-800">{formatVND(SHIPPING_FEE)}</span>
                </div>
                {DISCOUNT_MOCK > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Ưu đãi áp dụng</span>
                    <span className="font-bold">-{formatVND(DISCOUNT_MOCK)}</span>
                  </div>
                )}
                
                <div className="border-t border-pink-100 pt-3 flex justify-between items-end">
                  <span className="font-bold text-gray-800 text-sm">Cần thanh toán</span>
                  <span className="font-extrabold text-lg text-rose-600">{formatVND(totalAmount)}</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-full bg-rose-600 py-3 text-xs font-bold text-white shadow-md transition hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
                  id="btn-confirm-order"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang kết nối hệ thống giao hàng...
                    </span>
                  ) : (
                    <span>
                      Xác Nhận Đặt Hoa ({formatVND(totalAmount)})
                    </span>
                  )}
                </button>
              </div>

              <div className="mt-3.5 flex items-start space-x-1.5 text-[9px] text-gray-400">
                <ShieldAlert className="h-3.5 w-3.5 text-gray-300 shrink-0 mt-0.5" />
                <p>Nhấp "Xác Nhận Đặt Hoa" tức bạn đồng ý với các chính sách đổi trả sản phẩm khi bị hoa hỏng hư hỏng do phía vận chuyển.</p>
              </div>

            </div>
          </div>
        </form>
      )}

    </div>
  );
}

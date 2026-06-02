/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trash2, ArrowLeft, CreditCard, ShoppingCart, HelpCircle } from 'lucide-react';
import { CartItem } from '../types';

interface CartViewProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigate: (view: string) => void;
  onProceedToCheckout: () => void;
}

export default function CartView({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigate,
  onProceedToCheckout,
}: CartViewProps) {
  
  const calculateSubtotal = () => {
    return cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
  };

  const SHIPPING_FEE = cartItems.length > 0 ? 30000 : 0; // Flat fee 30k VND
  const DISCOUNT_MOCK = calculateSubtotal() > 1000000 ? 50000 : 0; // Discount 50k VND for orders over 1 million
  const totalAmount = calculateSubtotal() + SHIPPING_FEE - DISCOUNT_MOCK;

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 text-rose-500">
          <ShoppingCart className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="mt-6 font-serif text-2xl font-bold text-gray-900">Giỏ Hàng Đương Trống</h2>
        <p className="mt-2 text-sm text-gray-500">
          Có vẻ như bạn chưa chọn được bó hoa vừa ý. Hãy tham khảo hàng trăm mẫu thiết kế tươi sắc của chúng tôi nhé!
        </p>
        <button
          onClick={() => onNavigate('catalog')}
          className="mt-8 inline-flex items-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700 cursor-pointer"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại cửa hàng
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="font-serif text-3xl font-bold text-gray-900 mb-8" id="cart-title">Giỏ Hàng Của Bạn</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        
        {/* Selected Flowers List */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-pink-50 pb-4 mb-6">
              <span className="text-sm font-medium text-gray-500">{cartItems.length} sản phẩm hoa tươi đã chọn</span>
              <button
                onClick={onClearCart}
                className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline transition"
              >
                Xóa sạch giỏ hàng
              </button>
            </div>

            <div className="divide-y divide-pink-50">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex flex-col py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between gap-4">
                  
                  {/* Miniature & Title */}
                  <div className="flex items-center space-x-4">
                    <div className="h-20 w-106 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-lg bg-pink-50 border border-pink-50">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-gray-800 hover:text-rose-600 transition truncate max-w-[200px] sm:max-w-[280px]">
                        {item.product.name}
                      </h3>
                      <p className="text-xs text-emerald-600 mt-0.5">Sẵn hoa tươi mới</p>
                      <p className="text-sm font-bold text-rose-500 mt-1 sm:hidden">
                        {formatVND(item.product.price)}
                      </p>
                    </div>
                  </div>

                  {/* Operational controls */}
                  <div className="flex items-center justify-between sm:justify-end sm:space-x-8">
                    
                    {/* Unit Price (Desktop only) */}
                    <div className="hidden text-right sm:block">
                      <p className="text-xs text-gray-400">Đơn giá</p>
                      <p className="text-sm font-bold text-gray-700">{formatVND(item.product.price)}</p>
                    </div>

                    {/* Quantity modifier */}
                    <div className="flex items-center border border-pink-100 rounded-full justify-between p-0.5 bg-neutral-50 w-24">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-white"
                      >
                        －
                      </button>
                      <span className="text-xs font-bold text-gray-800">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-gray-500 hover:bg-white"
                      >
                        ＋
                      </button>
                    </div>

                    {/* Computed item pricing */}
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Thành tiền</p>
                      <p className="text-sm font-bold text-rose-600">
                        {formatVND(item.product.price * item.quantity)}
                      </p>
                    </div>

                    {/* Trash/Remove */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition"
                      aria-label="Xóa sản phẩm"
                      id={`remove-item-${item.product.id}`}
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>

                  </div>

                </div>
              ))}
            </div>

            <div className="border-t border-pink-50 pt-5 mt-6">
              <button
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center text-sm font-bold text-rose-700 hover:text-rose-800 hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tiếp tục xem thêm các mẫu hoa khác
              </button>
            </div>
          </div>
        </div>

        {/* Pricing calculations layout */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-2xl border border-pink-100 bg-white p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-pink-50 pb-3 mb-4">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3.5 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Chọn mua ({cartItems.reduce((a,c) => a+c.quantity, 0)} bó)</span>
                <span className="font-semibold text-gray-800">{formatVND(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center">
                  Phí vận chuyển
                  <HelpCircle className="ml-1 h-3.5 w-3.5 text-gray-400 cursor-pointer" title="Phí ship đồng giá áp dụng toàn nội thành" />
                </span>
                <span className="font-semibold text-gray-800">{formatVND(SHIPPING_FEE)}</span>
              </div>
              {DISCOUNT_MOCK > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Ưu đãi (đơn hàng lớn hơn 1 triệu)</span>
                  <span className="font-bold">-{formatVND(DISCOUNT_MOCK)}</span>
                </div>
              )}

              <div className="border-t border-pink-100 pt-3 flex items-end justify-between">
                <span className="font-bold text-gray-800 text-base">Tổng thanh toán</span>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-rose-600" id="cart-total-amount">
                    {formatVND(totalAmount)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Đã gồm VAT & phụ thu nguyên vật liệu</p>
                </div>
              </div>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="mt-6 flex w-full items-center justify-center rounded-full bg-rose-600 py-3 px-4 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700 cursor-pointer"
              id="btn-checkout"
            >
              <CreditCard className="mr-2 h-4.5 w-4.5" />
              Tiến hành thanh toán
            </button>

            <div className="mt-4 rounded-xl bg-pink-50/40 p-3 text-center border border-pink-50">
              <p className="text-xs text-gray-500 leading-snug">
                Bạn muốn tích điểm và quản lý đơn sau này tốt hơn? Hãy <button onClick={() => onNavigate('auth')} className="text-rose-600 underline font-semibold">Đăng nhập</button> trước khi thanh toán.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

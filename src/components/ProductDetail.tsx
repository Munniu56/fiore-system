/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, ShoppingBag, X, Check, Truck, ShieldCheck, CornerUpLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export default function ProductDetail({
  product,
  relatedProducts,
  onAddToCart,
  onClose,
  onSelectProduct,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);

  // Reset quantity when active product shifts
  useEffect(() => {
    setQuantity(1);
    setShowToast(false);
  }, [product]);

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddWithFeedback = () => {
    if (product.stock === 0) return;
    onAddToCart(product, quantity);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2500);
  };

  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Toast Feedback Notification on successful addition representing high-fidelity */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed bottom-8 right-8 z-50 flex items-center space-x-3 rounded-2xl bg-[#1F3D2B] border border-[#C8A96B]/50 px-5 py-4 text-white shadow-2xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C8A96B]/20 text-[#C8A96B] shrink-0">
              <Check className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[13px] text-[#F8F5EF] tracking-tight">
                💐 Đã thêm sản phẩm vào giỏ hàng.
              </span>
              <span className="text-[10.5px] text-pink-100 opacity-90 mt-0.5 font-medium">
                {quantity} x {product.name}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breadcrumb / Back Navigation */}
      <div className="mb-6 flex items-center space-x-2 text-sm text-gray-500">
        <button 
          onClick={onClose} 
          className="flex items-center text-rose-600 font-semibold hover:underline"
        >
          <CornerUpLeft className="mr-1 h-4 w-4" />
          Quay lại danh sách
        </button>
        <span>/</span>
        <span className="capitalize">
          {product.categoryId === 'tinh-yeu' ? 'Hoa Tình Yêu' : 
           product.categoryId === 'sinh-nhat' ? 'Hoa Sinh Nhật' :
           product.categoryId === 'khai-truong' ? 'Hoa Khai Trương' :
           product.categoryId === 'chuc-mung' ? 'Hoa Chúc Mừng' :
           product.categoryId === 'chia-buon' ? 'Hoa Chia Buồn' : 'Hoa Theo Mùa'}
        </span>
        <span>/</span>
        <span className="truncate text-gray-700 font-semibold">{product.name}</span>
      </div>

      {/* Main product detailed section */}
      <div className="grid grid-cols-1 gap-8 rounded-3xl border border-pink-100 bg-white p-6 shadow-md md:p-8 lg:grid-cols-2">
        
        {/* Large Left Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-50 ring-4 ring-pink-50">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover object-center"
          />
          
          <div className="absolute top-4 left-4 flex gap-2">
            {product.isNew && (
              <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Mới</span>
            )}
            {product.isFeatured && (
              <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Nổi bật</span>
            )}
          </div>
        </div>

        {/* Right Info pane */}
        <div className="flex flex-col justify-between">
          <div>
            
            {/* Category / Star Ratings */}
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
                Mã sản phẩm: {product.id}
              </span>
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-gray-800">{product.rating}</span>
                <span>•</span>
                <span className="hover:underline cursor-pointer">{product.reviewsCount} đánh giá từ khách hàng</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="mt-4 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">{product.name}</h1>

            {/* Price Box */}
            <div className="mt-5 rounded-2xl bg-pink-50/50 p-4">
              <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Giá bán trực tuyến</span>
              <div className="mt-1 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-rose-600">{formatVND(product.price)}</span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  Đã bao gồm VAT & thiệp miễn phí
                </span>
              </div>
            </div>

            {/* Short & Long Description */}
            <div className="mt-6 border-b border-pink-100 pb-5">
              <h3 className="text-sm font-bold text-gray-800">Giới thiệu sản phẩm</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed font-medium italic">"{product.shortDesc}"</p>
              <p className="mt-3 text-sm text-gray-500 leading-relaxed">{product.description}</p>
            </div>

            {/* Quality Seals / Delivery Policies */}
            <div className="mt-5 grid grid-cols-2 gap-4 border-b border-pink-100 pb-5 text-xs text-gray-600">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-bold">Giao hoa hỏa tốc</p>
                  <p className="text-gray-400">Giao nhanh 2h tại TP. Huế</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-bold">Đảm bảo tươi hảo hạng</p>
                  <p className="text-gray-400">Hoàn tiền nếu dập héo</p>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-6">
            {/* Quantity Selector & Interactive State */}
            {product.stock > 0 ? (
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end w-full">
                <div className="flex flex-col w-full sm:w-auto shrink-0">
                  <span className="text-xs font-semibold text-gray-400 uppercase mb-1.5">Số lượng chọn mua</span>
                  <div className="flex items-center border border-pink-200 rounded-full w-full sm:w-32 justify-between p-1.5 bg-white min-h-[44px]">
                    <button
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-pink-50 disabled:opacity-40 min-h-[36px] min-w-[36px] cursor-pointer"
                    >
                      －
                    </button>
                    <span className="font-bold text-sm text-gray-800">{quantity}</span>
                    <button
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-pink-50 disabled:opacity-40 min-h-[36px] min-w-[36px] cursor-pointer"
                    >
                      ＋
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full">
                  <span className="text-xs block text-gray-400 mb-1.5 font-medium">Kho còn lại: {product.stock} bó</span>
                  <button
                    onClick={handleAddWithFeedback}
                    className="flex w-full items-center justify-center rounded-full bg-rose-600 py-3.5 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700 cursor-pointer min-h-[46px]"
                    id="add-to-cart-detail"
                  >
                    <ShoppingBag className="mr-2 h-5 w-5 shrink-0" />
                    Thêm vào giỏ hàng - {formatVND(product.price * quantity)}
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-gray-50 p-4 text-center border border-gray-100">
                <p className="font-semibold text-gray-500">Sản phẩm tạm thời hết hàng</p>
                <p className="text-xs text-gray-400 mt-1">Vui lòng quay lại sau hoặc gọi hotline để đặt gói hoa tương tự.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Related Products slider */}
      <div className="mt-16">
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-6">Mẫu Hoa Cùng Chuyên Mục</h2>
        {relatedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectProduct(rel)}
                className="group cursor-pointer rounded-xl border border-pink-50 bg-white p-3 shadow-xs transition hover:border-pink-200 hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden rounded-lg bg-pink-50">
                  <img
                    src={rel.image}
                    alt={rel.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 font-serif text-sm font-bold text-gray-800 group-hover:text-rose-600 truncate">
                  {rel.name}
                </h3>
                <p className="mt-1 text-xs text-rose-600 font-bold">{formatVND(rel.price)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs italic text-gray-400">Không tìm thấy sản phẩm tương đồng.</p>
        )}
      </div>

    </div>
  );
}

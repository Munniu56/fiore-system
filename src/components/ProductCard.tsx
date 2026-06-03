/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Eye, ShoppingCart, Plus } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product, event: React.MouseEvent) => void;
  onViewDetails: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
}: ProductCardProps) {
  
  // Format price helper
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-xs transition-all duration-300 hover:border-pink-200 hover:shadow-lg hover:-translate-y-1"
      id={`product-card-${product.id}`}
    >
      
      {/* Product Image & Overlays */}
      <div className="relative aspect-square overflow-hidden bg-pink-50">
        
        {/* Badge labels */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="inline-flex items-center rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              Mới
            </span>
          )}
          {product.isFeatured && (
            <span className="inline-flex items-center rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              Nổi bật
            </span>
          )}
          {product.stock === 0 && (
            <span className="inline-flex items-center rounded-full bg-gray-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              Hết hàng
            </span>
          )}
        </div>

        {/* Hover quick action overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-black/35 opacity-0 backdrop-blur-subtle transition-all duration-300 group-hover:opacity-100">
          <button
            onClick={() => onViewDetails(product)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-md transition hover:bg-rose-50 hover:text-rose-600 scale-90 group-hover:scale-100 duration-300 cursor-pointer"
            title="Xem chi tiết"
          >
            <Eye className="h-5 w-5" />
          </button>
          
          {product.stock > 0 && (
            <button
              onClick={(e) => onAddToCart(product, e)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition hover:bg-rose-700 scale-90 group-hover:scale-100 duration-300 cursor-pointer"
              title="Thêm vào giỏ hàng"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
          )}
        </div>

        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content Space */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        
        {/* Rating and Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
            {product.categoryId === 'tinh-yeu' ? 'Tình Yêu' : 
             product.categoryId === 'sinh-nhat' ? 'Sinh Nhật' :
             product.categoryId === 'khai-truong' ? 'Khai Trương' :
             product.categoryId === 'chuc-mung' ? 'Chúc Mừng' :
             product.categoryId === 'chia-buon' ? 'Chia Buồn' : 'Theo Mùa'}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-gray-700">{product.rating}</span>
            <span className="text-gray-400">({product.reviewsCount})</span>
          </div>
        </div>

        {/* Title & Desc */}
        <h3 className="mt-2.5 font-serif text-base font-bold text-gray-800 line-clamp-1 group-hover:text-rose-600 transition">
          {product.name}
        </h3>
        
        <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed flex-1">
          {product.shortDesc}
        </p>

        {/* Price & Primary CTA */}
        <div className="mt-4 flex items-center justify-between border-t border-pink-50 pt-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Giá bán</p>
            <p className="text-base font-bold text-rose-600 sm:text-lg">
              {formatVND(product.price)}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {/* View Details Primary Button */}
            <button
              onClick={() => onViewDetails(product)}
              className="rounded-full bg-pink-50 px-3.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-pink-100 cursor-pointer"
            >
              Chi tiết
            </button>

            {product.stock > 0 ? (
              <button
                onClick={(e) => onAddToCart(product, e)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs transition hover:bg-rose-700 cursor-pointer"
                title="Mua ngay"
              >
                <Plus className="h-4 w-4" />
              </button>
            ) : (
              <span className="text-xs font-semibold text-gray-400 italic">Hết</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

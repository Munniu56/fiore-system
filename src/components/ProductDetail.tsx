/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Star, ShoppingBag, X, Check, Truck, ShieldCheck, CornerUpLeft, ThumbsUp, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Order, User, Review } from '../types';
import { subscribeReviews, saveReview } from '../firebase';

interface ExtendedReview extends Review {
  likedByUser?: boolean;
}

// Removed generateInitialReviews function to support 0 mock/sample reviews as requested

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  orders?: Order[];
  currentUser?: User | null;
}

export default function ProductDetail({
  product,
  relatedProducts,
  onAddToCart,
  onClose,
  onSelectProduct,
  orders = [],
  currentUser = null,
}: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [reviewsList, setReviewsList] = useState<ExtendedReview[]>([]);
  const [allReviewsList, setAllReviewsList] = useState<Review[]>([]);
  
  // Review Form States
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewEmail, setNewReviewEmail] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Initialize and reset reviews when active product changes through Firestore Sub
  useEffect(() => {
    setNewReviewAuthor(currentUser ? currentUser.name : '');
    setNewReviewEmail(currentUser ? currentUser.email : '');
    setNewReviewComment('');
    setNewReviewRating(5);
    setReviewSubmitted(false);
    setValidationError('');

    const unsubscribe = subscribeReviews((allReviews) => {
      setAllReviewsList(allReviews);
      const filtered = allReviews.filter(r => 
        r.productId === product.id && 
        (r.isVerified !== false || (currentUser && r.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()))
      );
      setReviewsList(filtered as ExtendedReview[]);
    });

    return () => {
      unsubscribe();
    };
  }, [product, currentUser]);

  const reviewsCount = reviewsList.length;
  const averageRating = reviewsCount > 0
    ? Number((reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
    : 0;

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

  const userHasPaidForThisProduct = currentUser ? orders.some(order => {
    const matchesEmail = order.customerEmail && order.customerEmail.trim().toLowerCase() === currentUser.email.trim().toLowerCase();
    if (!matchesEmail) return false;

    const isPaidOrCompleted = order.paymentStatus === 'Paid' || order.status === 'completed';
    if (!isPaidOrCompleted) return false;

    const hasProduct = order.items && order.items.some(item => item.product && item.product.id === product.id);
    return hasProduct;
  }) : false;

  const alreadyReviewed = currentUser ? allReviewsList.some(r => 
    r.productId === product.id && 
    r.email && r.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
  ) : false;

  const count5 = reviewsList.filter(r => r.rating === 5).length;
  const count4 = reviewsList.filter(r => r.rating === 4).length;
  const count3 = reviewsList.filter(r => r.rating === 3).length;
  const count2 = reviewsList.filter(r => r.rating === 2).length;
  const count1 = reviewsList.filter(r => r.rating === 1).length;

  const totalReviews = reviewsList.length;

  const starBars = [
    { label: '5 sao', percent: totalReviews > 0 ? `${(count5 / totalReviews * 100).toFixed(0)}%` : '0%', count: count5 },
    { label: '4 sao', percent: totalReviews > 0 ? `${(count4 / totalReviews * 100).toFixed(0)}%` : '0%', count: count4 },
    { label: '3 sao', percent: totalReviews > 0 ? `${(count3 / totalReviews * 100).toFixed(0)}%` : '0%', count: count3 },
    { label: '2 sao', percent: totalReviews > 0 ? `${(count2 / totalReviews * 100).toFixed(0)}%` : '0%', count: count2 },
    { label: '1 sao', percent: totalReviews > 0 ? `${(count1 / totalReviews * 100).toFixed(0)}%` : '0%', count: count1 },
  ];

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
              <div 
                onClick={() => {
                  const el = document.getElementById('reviews-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="flex items-center space-x-1 text-sm text-gray-600 cursor-pointer group"
                title="Bấm để xem các đánh giá từ khách hàng"
              >
                <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400 transition duration-200 group-hover:scale-110" />
                <span className="font-bold text-gray-850 group-hover:text-rose-650 transition">{averageRating}</span>
                <span>•</span>
                <span className="text-rose-600 font-semibold group-hover:underline transition">
                  {reviewsList.length} đánh giá từ khách hàng
                </span>
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

      {/* Interactive Customer Reviews Section */}
      <div id="reviews-section" className="mt-16 rounded-3xl border border-pink-100 bg-white p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 border-b border-pink-50 pb-4 mb-6">
          <MessageSquare className="h-5 w-5 text-rose-600" />
          <h2 className="font-serif text-xl font-bold text-gray-900">Nhận Xét & Đánh Giá Từ Khách Hàng</h2>
        </div>

        <div className="flex justify-center">
          {/* Rating Summary Breakdown Stats with hidden right-side submission form/notices as requested */}
          <div className="w-full max-w-md flex flex-col justify-center bg-stone-50/50 rounded-2xl p-6 border border-pink-50 text-center">
            <div className="flex flex-col items-center">
              <span className="text-5xl font-extrabold text-stone-800 leading-none">{averageRating}</span>
              <div className="flex items-center mt-3 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= Math.round(averageRating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-stone-500 mt-2 font-medium">Đánh giá chung dựa trên {reviewsList.length} khách hàng thực tế</p>
            </div>

            {/* Visual Bars represent fidelity */}
            <div className="mt-6 space-y-2 max-w-sm mx-auto w-full">
              {starBars.map((bar, index) => (
                <div key={index} className="flex items-center text-xs text-stone-600 gap-3">
                  <span className="w-10 shrink-0 text-left font-semibold text-stone-500">{bar.label}</span>
                  <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden relative">
                    <div className="h-full rounded-full bg-rose-500" style={{ width: bar.percent }} />
                  </div>
                  <span className="w-8 shrink-0 text-right text-stone-400 font-mono">{bar.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="mt-10 border-t border-pink-50 pt-8">
          <h3 className="font-serif text-lg font-bold text-gray-900 mb-6 flex items-center gap-1.5">
            📋 Đánh giá chi tiết ({reviewsList.length})
          </h3>

          <div className="space-y-6">
            {reviewsList.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl border border-stone-100 bg-stone-50/20 space-y-3.5 text-left shadow-2xs hover:border-pink-100/30 transition duration-200">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-9 w-9 rounded-full bg-pink-100 text-rose-700 font-bold text-sm flex items-center justify-center uppercase shrink-0">
                      {rev.author.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-gray-800">{rev.author}</span>
                        {rev.isVerified && (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 uppercase">
                            ✓ Đã mua hàng
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-0.5">
                        <div className="flex text-amber-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-3 w-3 ${star <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-stone-400">•</span>
                        <span className="text-[10px] text-stone-400 font-mono mt-0.5">{rev.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Like button interactive counter */}
                  <button
                    type="button"
                    onClick={() => {
                      const updatedObjList = reviewsList.map(r => {
                        if (r.id === rev.id) {
                          const updatedLiked = !r.likedByUser;
                          const newLikes = updatedLiked ? r.likes + 1 : r.likes - 1;
                          const updatedObj = {
                            ...r,
                            likedByUser: updatedLiked,
                            likes: newLikes
                          };
                          const { likedByUser, ...cleanObj } = updatedObj;
                          saveReview(cleanObj);
                          return updatedObj;
                        }
                        return r;
                      });
                      setReviewsList(updatedObjList);
                    }}
                    className={`inline-flex items-center space-x-1.5 border rounded-full px-2.5 py-1 text-[10.5px] transition cursor-pointer ${
                      rev.likedByUser 
                        ? 'bg-rose-50 border-rose-200 text-rose-600 font-bold' 
                        : 'bg-white border-stone-200 text-stone-400 hover:text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <ThumbsUp className="h-3 w-3" />
                    <span>Hữu ích ({rev.likes})</span>
                  </button>
                </div>
                
                <p className="text-xs text-stone-600 leading-relaxed pl-1 sm:pl-12 font-medium">
                  "{rev.comment}"
                </p>
              </div>
            ))}
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

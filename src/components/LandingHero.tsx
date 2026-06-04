/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Heart, Gift, Award, ArrowRight } from 'lucide-react';
import { Category } from '../types';

interface LandingHeroProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
  onNavigate: (view: string) => void;
}

export default function LandingHero({
  categories,
  selectedCategory,
  onSelectCategory,
  onNavigate,
}: LandingHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-pink-50/80 to-white pb-12 pt-8 sm:pb-16 lg:pb-24">
      
      {/* Visual decorative circles */}
      <div className="absolute -top-12 left-1/2 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-pink-100/40 blur-3xl sm:-top-20"></div>
      <div className="absolute -right-16 top-1/3 -z-10 h-72 w-72 rounded-full bg-emerald-50/75 blur-2xl"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Banner + Hero Content */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          <div className="text-center lg:col-span-7 lg:text-left">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-pink-100/80 px-3 py-1 text-xs font-semibold text-rose-700">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Giao hoa hỏa tốc trong 2 giờ nội thành</span>
            </div>

            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Gửi Gắm Yêu Thương <br />
              <span className="text-rose-600">Qua Từng Cánh Hoa</span>
            </h1>

            <p className="mt-4 text-base leading-relaxed text-gray-600 sm:text-lg">
              Chào mừng bạn đến với <span className="font-semibold text-rose-600">Fióre</span> - không gian ngập tràn sắc hoa nghệ thuật đỉnh cao. Chúng tôi tin rằng mỗi bông hoa đều mang một tâm sự khác nhau, thay người gửi viết nên những lời chúc ý nghĩa của cuộc sống.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 lg:justify-start">
              <button
                onClick={() => onNavigate('catalog')}
                className="inline-flex items-center rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-rose-700 cursor-pointer"
                id="btn-discover-flowers"
              >
                Khám phá ngay
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  const element = document.getElementById('featured-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center rounded-full border border-pink-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-pink-50"
              >
                Sản phẩm nổi bật
              </button>
            </div>

            {/* Core Values / Features bar */}
            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-pink-100 pt-8 max-w-lg mx-auto lg:mx-0">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-rose-600 mb-2">
                  <Heart className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">100% Hoa Tươi</h4>
                <p className="text-xs text-gray-500 mt-1">Tuyển chọn tươi mới mỗi buổi sớm mai</p>
              </div>
              
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-rose-600 mb-2">
                  <Gift className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Thiết Kế Độc Quyền</h4>
                <p className="text-xs text-gray-500 mt-1">Được thiết kế tỉ mỉ bởi nghệ nhân hoa florists</p>
              </div>

              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-rose-600 mb-2">
                  <Award className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-bold text-gray-800">Tận Tâm Phục Vụ</h4>
                <p className="text-xs text-gray-500 mt-1">Hỗ trợ viết thiệp tay, chụp hình đơn hàng</p>
              </div>
            </div>
          </div>

          {/* Right Showcase Image Banner */}
          <div className="relative mt-8 sm:mx-auto lg:col-span-5 lg:mx-0 lg:mt-0">
            <div className="relative mx-auto w-full max-w-md rounded-2xl border-4 border-pink-50 bg-white p-3 shadow-xl">
              <img
                src="/images/regenerated_image_1780392900313.jpg"
                alt="Tiệm hoa nghệ thuật Fiore"
                referrerPolicy="no-referrer"
                className="h-[420px] w-full rounded-xl object-cover"
              />
              <div className="absolute right-6 bottom-6 translate-y-2 rounded-lg bg-white p-4 shadow-lg border border-pink-50 max-w-[200px]">
                <p className="font-serif text-sm italic text-rose-700">"Trao hoa tươi, khởi đầu hạnh phúc viên mãn."</p>
                <div className="mt-2 flex items-center space-x-1">
                  <div className="h-1 w-8 rounded-full bg-rose-500"></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fiore Team</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Category Navigation Shortcuts */}
        <div className="mt-16 border-t border-pink-100 pt-10">
          <div className="flex flex-col items-center md:flex-row md:justify-between md:items-end mb-8">
            <div className="text-center md:text-left">
              <h2 className="font-serif text-2xl font-bold text-gray-900 sm:text-3xl">Danh Mục Hoa Tại Fióre</h2>
              <p className="text-sm text-gray-500 mt-1">Đa dạng lựa chọn cho mọi dịp lễ kỷ niệm và nhu cầu trang trí</p>
            </div>
            <button
              onClick={() => onNavigate('catalog')}
              className="mt-4 md:mt-0 flex items-center text-rose-600 hover:text-rose-700 font-semibold text-sm transition"
            >
              Xem tất cả danh mục
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onNavigate('catalog');
                  }}
                  className={`group relative flex flex-col items-center justify-center overflow-hidden rounded-xl bg-white p-4 text-center cursor-pointer border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                    isSelected ? 'border-rose-400 bg-pink-50/50' : 'border-pink-100 hover:border-pink-300'
                  }`}
                  id={`cat-card-${cat.id}`}
                >
                  <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full border border-pink-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                    />
                  </div>
                  <h3 className="font-bold text-sm text-gray-800 transition group-hover:text-rose-600">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium group-hover:text-rose-400 mt-0.5">
                    Khám phá →
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

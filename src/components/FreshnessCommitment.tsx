/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Flame, Flower, Heart, RefreshCw, Feather, Award, Smile } from 'lucide-react';
import commitmentHeroImg from '../assets/images/seasonal_flowers_1780554104772.png';

export default function FreshnessCommitment() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      {/* Brand Elegant Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-rose-500 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-rose-500">
          Tuyên ngôn chất lượng tối thượng
        </span>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mt-2">
          Cam Kết <span className="text-rose-600 font-serif font-black">Tươi Mới 24h</span>
        </h1>
        <p className="mt-4 text-base text-gray-600 leading-relaxed font-sans">
          Mỗi cánh hoa, mỗi phiến lá của Fióre đều mang hơi thở nguyên bản tươi mướt từ vùng đất lành Đà Lạt. 
          Chúng tôi bảo đảm tuyệt đối chất lượng sản phẩm trong suốt 24 giờ kể từ thời khắc giao hoa thành phẩm 
          đến tận tay quý khách.
        </p>
      </div>

      {/* Highlights Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        
        {/* Card 1: Tuyển Chọn Từ Nông Trại */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <Award className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">100% Hoa Đà Lạt Loại I</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Nói không với hoa tồn kho, hoa đông lạnh dài ngày. Hoa tươi của Fióre được chăm chút thu hoạch thủ công vào sáng sớm tại các vườn hoa đối tác uy tín nhất ở Đà Lạt.
          </p>
        </div>

        {/* Card 2: Quy trình chăm sóc ngặt nghèo */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <RefreshCw className="h-6 w-6 animate-spin" style={{ animationDuration: '8s' }} />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Bảo dưỡng dưỡng chất</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Sử dụng nước tinh khiết xử lý ion kết hợp gói dinh dưỡng cắm hoa cao cấp để dưỡng cành ổn định, giúp hoa duy trì trạng thái căng tơ, đầy đặn lý tưởng nhất.
          </p>
        </div>

        {/* Card 3: An tâm 1-đổi-1 */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <Smile className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Chính sách 1-Đổi-1</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Trong vòng 24 giờ đầu sau nhận, nếu hoa xảy ra tình trạng héo úa hoặc hư tổn bất thường không do lỗi chăm sóc sai cách, Fióre hỗ trợ đổi mẫu thay thế tương đương lập tức.
          </p>
        </div>

        {/* Card 4: Nghệ nhân cắm tỉ mỉ */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <Feather className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Nâng niu tay tác</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Mỗi bó hoa đều được chế tác tỉ mỉ bởi nghệ nhân cắm hoa giàu tâm huyết nhất của Fióre, đảm bảo độ hài hoà tuyệt đối giữa sắc độ và kiểu giáng nghệ thuật tinh tế.
          </p>
        </div>
      </div>

      {/* Main content body with dynamic illustration details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        {/* Left column photo */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl border-8 border-pink-50 bg-white p-2 shadow-lg overflow-hidden">
            <img
              src={commitmentHeroImg}
              alt="Cam kết chất lượng hoa hỏa tốc"
              className="h-[380px] w-full rounded-2xl object-cover hover:scale-[1.01] transition duration-300"
              referrerPolicy="no-referrer"
            />
            {/* Soft descriptive badge */}
            <div className="absolute bottom-6 right-6 left-6 bg-slate-900/90 text-white p-4 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-xs text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Flower className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">Tiêu chuẩn hoa sạch</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                Nói không tuyệt đối với hóa chất kìm ép tăng trưởng hay giữ tươi độc hại. Mọi bông hoa tại Fióre giữ vững hương thơm nguyên bản tự nhiên tinh khiết nhất.
              </p>
            </div>
          </div>
        </div>

        {/* Right column text details */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            Quy Quy Trình Đảm Bảo Sắc Hoa Rực Rõ 24h
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">1</div>
              <div>
                <h5 className="font-serif font-bold text-gray-800 text-base">Chuỗi Cung Ứng Lạnh Khép Kín</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Hoa tươi sau khi cắt tại nông trại sẽ được ngậm dưỡng chất chống mất nước ngay lập tức và chuyển phát bằng xe tải bảo ôn chuyên dụng về showroom của Fióre tại Sài Gòn luôn giữ dải nhiệt độ tối ưu 16-18°C.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">2</div>
              <div>
                <h5 className="font-serif font-bold text-gray-800 text-base">Vệ Sinh Gốc & Sát Khuẩn Nước Cắm</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Từng cành hoa được tuốt lá sát gốc tỉ mỉ tránh rụng phân hủy trong nước gây vi khuẩn làm thối rễ đầu cành. Nước cắm bình của chúng tôi luôn được vệ sinh định kỳ hằng ngày bằng các chế phẩm sinh học an toàn.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-pink-150 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">3</div>
              <div>
                <h5 className="font-serif font-bold text-gray-800 text-base">Tài Liệu Hướng Dẫn Chăm Sóc Tại Nhà</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Mỗi đơn hàng hoa thành phẩm khi trao đến tay khách quý đều được Fióre gửi kèm tấm thiệp hướng dẫn chăm dưỡng thông minh thực tế (thay nước mát hằng ngày, cắt xéo gốc 45 độ, tránh ánh nắng gắt trực xạ và gió điều hòa thổi trực tiếp).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust guarantees badge block */}
      <div className="bg-emerald-50/50 rounded-3xl p-8 sm:p-12 border border-emerald-100/50 flex flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-emerald-600 mb-4" />
        <h3 className="font-serif text-2xl font-bold text-gray-950">Chất Lượng Đến Từ Sự Tận Tâm Tử Tế</h3>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Fióre tin rằng sứ mệnh của hoa tươi là đem lại khoảnh khắc thăng hoa hạnh phúc trọn vẹn nhất cho bạn và người thương yêu. Vì vậy, chúng tôi cam kết chịu trách nhiệm cao nhất về chất lượng những đóa hoa nghệ thuật tươi bền bỉ của mình.
        </p>
      </div>
    </div>
  );
}

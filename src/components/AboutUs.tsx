/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Flower, Heart, ShieldCheck, Sparkles, Compass, Eye, MapPin } from 'lucide-react';
import aboutUsMain from '../assets/images/seasonal_flowers_1780554104772.png';
import aboutUsBottomBg from '../assets/images/love_flowers_1780554000296.png';

export default function AboutUs() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      {/* Brand Elegant Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          Chào mừng bạn đến với <span className="text-rose-600 font-serif font-black">Fióre</span>
        </h1>
        <p className="mt-4 text-base text-gray-600 leading-relaxed font-sans">
          Fióre không chỉ đơn thuần là một cửa hàng bán hoa tươi trực tuyến. Chúng tôi gửi gắm vào từng sản phẩm 
          một câu chuyện, một lời nhắn gửi chân thành, đồng hành cùng bạn nhân lên niềm vui và xoa dịu nỗi buồn 
          qua ngôn ngữ tinh túy của cỏ cây hoa lá.
        </p>
      </div>

      {/* Intro and Mission & Vision Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        {/* Left visually rich content */}
        <div className="lg:col-span-5 space-y-8">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-xs hover:shadow-md transition duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-pink-50 text-rose-500">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Sứ Mệnh</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Mang đến những thiết kế hoa nghệ thuật duy mỹ, hoa tươi tuyển chọn xuất xứ trực tiếp từ 
              Đà Lạt với chất lượng hoàn mỹ hàng đầu. Giúp kết nối hàng triệu tâm hồn thông qua thông điệp chân thành 
              và trải nghiệm mua sắm hiện đại, tinh gọn từ cửa hàng trực tuyến của chúng tôi.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-xs hover:shadow-md transition duration-300">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-pink-50 text-rose-500">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="font-serif text-xl font-bold text-gray-900">Tầm Nhìn</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Trở thành thương hiệu hoa tươi trực tuyến uy tín hàng đầu cả nước. Không ngừng sáng tạo 
              và tối ưu hoá quy trình bảo quản, vận hành giao hoa hỏa tốc để đảm bảo mọi bông hoa Fióre mang lại 
              đều đạt đến độ tươi nguyên quyến rũ tuyệt mỹ nhất khi chạm đến tay người nhận.
            </p>
          </div>
        </div>

        {/* Right high quality picture from our assets gallery */}
        <div className="lg:col-span-7 relative">
          <div className="relative mx-auto rounded-3xl border-8 border-pink-50 bg-white p-2 shadow-lg overflow-hidden">
            <img
              src={aboutUsMain}
              alt="Học nghệ thuật cắm hoa tại Fiore"
              className="h-[450px] w-full rounded-2xl object-cover hover:scale-[1.02] transition duration-500"
              referrerPolicy="no-referrer"
            />
            {/* Soft decorative badge */}
            <div className="absolute bottom-6 left-6 bg-rose-600 text-white py-2.5 px-4.5 rounded-xl shadow-lg border border-rose-500/30 text-xs font-bold leading-tight">
              🌻 Hoa tươi tuyển chọn <br />
              <span className="text-[10px] font-medium opacity-85">Tươi bền đẹp từ nông trại Đà Lạt</span>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values Section (Bento grid visual) */}
      <div className="bg-pink-50/40 rounded-3xl p-8 sm:p-12 mb-16 border border-pink-100/50">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-rose-500 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-rose-500">Giá trị cốt lõi</span>
          <h2 className="font-serif text-3xl font-bold text-gray-900 mt-2">Nền tảng phát triển của Fióre</h2>
          <p className="text-sm text-gray-500 mt-1">
            Mỗi bó hoa trao đi mang trọn vẹn sự cam kết tuyệt đối về uy tín của toàn thể đội ngũ Fióre
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Chất Lượng */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4 font-bold">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Chất lượng hoàn hảo</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Tất cả các loài hoa hoa tươi tại Fióre đều được thu hoạch trực tiếp tại vùng trồng Đà Lạt, loại bỏ tạp chất và chỉ chọn lọc những bông hoa nở độ đẹp nhất.
            </p>
          </div>

          {/* Card 2: Uy Tín */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4 font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Uy tín bền vững</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Cam kết giao hoa đúng giờ hẹn, đảm bảo hoa hoàn thiện đúng theo nguyên mẫu thiết kế mà khách hàng đã lựa chọn trên catalogue trực tuyến.
            </p>
          </div>

          {/* Card 3: Sáng Tạo */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4 font-bold">
              <Flower className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Sáng tạo không ngừng</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Chúng tôi luôn thiết kế, bổ sung liên tục nhiều chủ đề hoa theo phong cách Hàn Quốc, châu Âu tinh tế để giúp bạn bắt nhịp trào lưu hiện đại nhất.
            </p>
          </div>

          {/* Card 4: Tận Tâm */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4 font-bold">
              <Heart className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Tận tâm phục vụ</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mỗi nhân viên tư vấn của Fióre đều coi hoa tươi như tác phẩm nghệ thuật, trân trọng, nhẹ nhàng đóng gói và chăm sóc từng ý kiến nhỏ từ quý khách hàng.
            </p>
          </div>

        </div>
      </div>

      {/* Decorative Bottom Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-neutral-900 py-16 px-6 sm:px-12 text-center text-white shadow-xl">
        <div className="absolute inset-0 bg-rose-950/80 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${aboutUsBottomBg})` }}></div>
        <div className="relative max-w-2xl mx-auto space-y-4">
          <h3 className="font-serif text-3xl font-semibold" style={{ color: '#C8A96B' }}>Từng Đoá Hoa Đi, Trọn Vẹn Tâm Tình Gửi</h3>
          <p className="text-sm text-pink-100 font-sans leading-relaxed max-w-lg mx-auto">
            Hãy để Fióre đồng hành cùng bạn nâng niu mọi khoảnh khắc vàng ngọc của cuộc sống thông qua những cánh hoa ngát hương.
          </p>
        </div>
      </div>
    </div>
  );
}

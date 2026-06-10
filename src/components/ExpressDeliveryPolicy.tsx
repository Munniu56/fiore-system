/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Truck, Clock, ShieldCheck, Image, MapPin, Sparkles, RotateCcw, Package, Lock, EyeOff } from 'lucide-react';
import deliveryHeroImg from '../assets/images/love_flowers_1780554000296.png';
import congratulationFlowersImg from '../assets/images/congratulation_flowers_1780554058281.png';

export default function ExpressDeliveryPolicy() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      {/* Brand Elegant Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-rose-500 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-rose-500">
          Dịch vụ chuyển phát thượng hạng
        </span>
        <h1 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mt-2">
          Chính Sách <span className="text-rose-600 font-serif font-black">Giao Hoa Hỏa Tốc</span>
        </h1>
        <p className="mt-4 text-base text-gray-600 leading-relaxed font-sans">
          Fióre hiểu rằng mỗi đóa hoa trao đi không chỉ đơn thuần là món quà vật chất, mà còn là tâm tư, 
          hạnh phúc và tình cảm gửi gắm đúng thời điểm. Vì thế, chúng tôi thiết lập quy chuẩn giao hoa hỏa tốc 
          nghiêm ngặt và đẳng cấp nhất, mang lại sự an tâm tuyệt đối cho quý khách.
        </p>
      </div>

      {/* Highlights Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        
        {/* Card 1: Giao hàng thần tốc */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <Clock className="h-6 w-6 animate-pulse" />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Giao hoa siêu tốc trong 2h</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Áp dụng đối với tất cả các dòng hoa tươi cắm mẫu sẵn. Fióre cam kết chuẩn bị và bàn giao shipper di chuyển đến tay người nhận chỉ từ 90 đến 120 phút từ lúc đặt hàng.
          </p>
        </div>

        {/* Card 2: Bảo quản cao cấp */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <Package className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Quy trình giữ nước mát</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Mỗi giỏ hoa, bó hoa hỏa tốc đều được bọc túi giữ ẩm gốc, đặt trong hộp chống xê dịch chuyên dụng giúp hoa giữ nguyên sắc rực rỡ và độ tươi căng tràn đầy sức sống.
          </p>
        </div>

        {/* Card 3: Minh bạch hình ảnh */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <Image className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Chụp ảnh Preview mẫu hoa</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Gửi ảnh thành phẩm thực tế tại cửa hàng để quý khách kiểm duyệt trước khi khởi hành giao. Sau khi giao xong, chụp ảnh báo cáo biên nhận thực tế người nhận hoa.
          </p>
        </div>

        {/* Card 4: Đền bù 200% */}
        <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
          <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
            <RotateCcw className="h-6 w-6" />
          </div>
          <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Cam kết đền bù 200%</h4>
          <p className="text-xs text-gray-500 leading-relaxed">
            Nếu quý khách không hài lòng về chất lượng hoa dập nát, giao lệch mẫu cắm được duyệt, hoặc chậm trễ mốc giờ trọng đại, Fióre cam kết hoàn tiền 100% kèm đền bù voucher cắm hoa mới.
          </p>
        </div>
      </div>

      {/* Main content body with dynamic illustration details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        {/* Left column text details */}
        <div className="lg:col-span-7 space-y-6">
          <h2 className="font-serif text-3xl font-bold text-gray-900">
            Quy Chuẩn Vận Chuyển Đặc Biệt Của Fióre
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">1</div>
              <div>
                <h5 className="font-serif font-bold text-gray-800 text-base">Khung Giờ Hỏa Tốc Hằng Ngày</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Nhận đơn hỏa tốc từ 7:00 AM đến 8:00 PM mỗi ngày. Đơn hàng đặt ngoài khung giờ trên sẽ được sắp xếp và giao ưu tiên vào khung giờ 7:30 AM - 8:30 AM sáng sớm ngày hôm sau.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">2</div>
              <div>
                <h5 className="font-serif font-bold text-gray-800 text-base">Phí Vận Chuyển Ưu Đãi</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Miễn phí hoàn toàn phí vận chuyển giao hỏa tốc (bán kính dưới 8km) cho tất cả chủ đơn hàng hoa tươi có giá trị thanh toán thực tế từ 500.000đ trở lên. Các đơn hàng khác áp dụng mức phí đồng giá ưu đãi chỉ từ 30.000đ - 50.000đ.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">3</div>
              <div>
                <h5 className="font-serif font-bold text-gray-800 text-base">Đội Ngũ Shipper Chuyên Nghiệp</h5>
                <p className="text-sm text-gray-600 mt-1">
                  Đội ngũ giao hoa của chúng tôi được đào tạo kỹ năng nâng niu, hiểu thuộc tính dễ tổn thương của dòng hoa nghệ thuật nhập khẩu. Shipper luôn chủ động liên lạc tinh tế với người nhận hoa để giao đúng tay, giữ trọn vẹn sự bất ngờ hạnh phúc.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right photo */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl border-8 border-pink-50 bg-white p-2 shadow-lg overflow-hidden">
            <img
              src={deliveryHeroImg}
              alt="Giao hoa hỏa tốc chất lượng cao"
              className="h-[380px] w-full rounded-2xl object-cover hover:scale-[1.01] transition duration-300"
              referrerPolicy="no-referrer"
            />
            {/* Soft descriptive badge */}
            <div className="absolute bottom-6 right-6 left-6 bg-slate-900/90 text-white p-4 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-xs text-xs">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="h-4 w-4 text-rose-400 animate-bounce" />
                <span className="font-bold text-white uppercase tracking-wider text-[10px]">Express Delivery Status</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                Nâng niu từng mầm lộc hoa, bảo bọc trong thùng chống rung lắc, giao hoa bằng cả nhiệt huyết của trái tim người người làm nghề cắm hoa tinh tế.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Block */}
      <div className="border-t border-pink-100 pt-16 mb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-rose-500 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-rose-500">
            Bảo mật tối đa
          </span>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mt-2" id="privacy-policy-title">
            Chính Sách <span className="text-rose-600 font-serif font-black">Bảo Mật Thông Tin</span>
          </h2>
          <p className="mt-4 text-base text-gray-600 leading-relaxed font-sans">
            Fióre thấu hiểu sâu sắc rằng thông tin cá nhân là tài sản riêng tư vô cùng nhạy cảm. Chúng tôi cam kết xây dựng một môi trường mua sắm an toàn, tin cậy và bảo mật hoàn hảo nhất cho quý khách thông qua các quy tắc chặt chẽ dưới đây:
          </p>
        </div>

        {/* Highlights Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          
          {/* Card 1: Mã hóa an toàn thông tin */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs" id="privacy-card-encryption">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Mã hóa an toàn thông tin</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mọi dữ liệu thanh toán, thông tin giao nhận và tài khoản đăng ký của bạn đều được truyền tải qua giao thức mã hóa chuẩn cao cấp, bảo vệ toàn vẹn khỏi các rủi ro bên ngoài mạng Internet.
            </p>
          </div>

          {/* Card 2: Không chia sẻ bên thứ ba */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs" id="privacy-card-sharing">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
              <Lock className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Không chia sẻ bên thứ ba</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Fióre cam kết tuyệt đối không bán, thuê mướn, trao đổi hay tiết lộ dữ liệu cá nhân của quý khách cho bất cứ công ty hay đối tác không liên quan, ngoại trừ các đơn vị chuyển phát trực tiếp để phục vụ bàn giao hoa.
            </p>
          </div>

          {/* Card 3: Quyền kiểm soát dữ liệu */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs" id="privacy-card-control">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
              <EyeOff className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Quyền kiểm soát dữ liệu</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Quý khách có toàn quyền cập nhật, thay đổi hoặc yêu cầu xóa bỏ thông tin và lịch sử đơn đặt hàng cá nhân của mình trên hệ thống của Fióre bất kỳ lúc nào chỉ bằng việc liên hệ trực tiếp với bộ phận Chăm sóc khách hàng.
            </p>
          </div>
        </div>

        {/* Main content body with dynamic illustration details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border-8 border-pink-50 bg-white p-2 shadow-lg overflow-hidden">
              <img
                src={congratulationFlowersImg}
                alt="Bảo mật an toàn tin cậy"
                className="h-[380px] w-full rounded-2xl object-cover hover:scale-[1.01] transition duration-300"
                referrerPolicy="no-referrer"
              />
              {/* Soft descriptive badge */}
              <div className="absolute bottom-6 right-6 left-6 bg-slate-900/90 text-white p-4 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-xs text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <Lock className="h-4 w-4 text-rose-400 animate-pulse" />
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">Secure Privacy Protocol</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                  Tôn trọng tính riêng tư và bảo tồn tình cảm trọn vẹn của từng đơn quà tặng ẩn danh. Mọi giao dịch tại Fióre đều được gìn giữ tuyệt mật, bảo chứng cho sự tin cẩn quý giá của bạn.
                </p>
              </div>
            </div>
          </div>

          {/* Scrollable / right col detail processes */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              Quy Trình Quản Lý Và Bảo Mật Tuyệt Đối
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">1</div>
                <div>
                  <h5 className="font-serif font-bold text-gray-800 text-base">Hạn Chế Truy Cập Nội Bộ</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Thông tin đặt hàng chi tiết của người nhận và người gửi chỉ được cung cấp cho nhân viên dịch vụ khách hàng trực tiếp xử lý đơn và thợ cắm hoa hoàn thiện đơn. Chúng tôi liên tục rà soát nhật ký truy cập để đảm bảo tính riêng tư ở mức an toàn tối đa.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">2</div>
                <div>
                  <h5 className="font-serif font-bold text-gray-800 text-base">Bảo Mật Giao Dịch Tài Chính</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Mọi giao dịch ngân hàng điện tử, cổng thanh toán VNPAY, thẻ Visa/Mastercard đều được xử lý trực tiếp qua nền tảng liên kết ngân hàng bảo mật của đối tác, Fióre hoàn toàn không lưu trữ bất kỳ thông tin nào về mật khẩu hoặc mã PIN thẻ của quý khách.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">3</div>
                <div>
                  <h5 className="font-serif font-bold text-gray-800 text-base">Chuẩn Hóa Thông Tin Người Nhận</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Fióre cam kết giữ kín hoàn toàn danh tính người gửi hoa đối với đơn hàng yêu cầu &quot;gửi ẩn danh&quot;. Chúng tôi chỉ cung cấp thông điệp ghi chúc đính kèm tỉ mỉ theo đơn mà không tiết lộ bất kỳ thông tin cá nhân nào khác cho người nhận hoa nếu chưa được khách hàng cho phép.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Resolution Policy Block */}
      <div className="border-t border-pink-100 pt-16 mb-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-rose-500 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-rose-500">
            Tận tâm lắng nghe
          </span>
          <h2 className="font-serif text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mt-2" id="complaint-policy-title">
            Chính Sách <span className="text-rose-600 font-serif font-black">Giải Quyết Khiếu Nại</span>
          </h2>
          <p className="mt-4 text-base text-gray-600 leading-relaxed font-sans">
            Tại Fióre, sự hài lòng trọn vẹn của quý khách là thước đo thành công duy nhất của chúng tôi. Chúng tôi thiết lập quy trình tiếp nhận và xử lý khiếu nại linh hoạt, nhanh chóng và luôn tối ưu vì quyền lợi tối thượng của khách quý.
          </p>
        </div>

        {/* Highlights Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Card 1: Tiếp nhận phản hồi tốc hành */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Tiếp nhận hỏa tốc 24/7</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Mọi phản hồi về chất lượng hoa, thiết kế hoặc thái độ giao hàng đều được tiếp nhận ngay lập tức qua Hotline hoặc Zalo hỗ trợ hoạt động liên tục bất kể ngày đêm.
            </p>
          </div>

          {/* Card 2: Luôn vì quyền lợi khách hàng */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
              <RotateCcw className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Cam kết đền bù bảo đảm</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Sẵn sàng hoàn tiền đến 100% giá trị đơn hàng hoặc thiết kế lại mẫu hoa tương đương thay thế lập tức nếu xảy ra sai sót thuộc trách nhiệm chế tác hoặc giao chở từ Fióre.
            </p>
          </div>

          {/* Card 3: Minh bạch và công bằng */}
          <div className="bg-white rounded-2xl p-6 border border-pink-100 hover:border-rose-300 transition-all duration-300 shadow-xs">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-pink-100 text-rose-600 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-gray-900 mb-2">Thẩm định công bằng</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Quá trình xác minh diễn ra nhanh chóng thông qua hình ảnh hoặc video thực tế do quý khách cung cấp, tuyệt đối không gây phiền hà, không làm mất thời gian của khách quý.
            </p>
          </div>
        </div>

        {/* process details with image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          {/* Left text processes */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-serif text-3xl font-bold text-gray-900">
              Quy Trình 3 Bước Tiếp Nhận Và Giải Quyết Nhẹ Nhàng
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">1</div>
                <div>
                  <h5 className="font-serif font-bold text-gray-800 text-base">Gửi phản hồi trực tiếp</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Quý khách vui lòng lưu chụp hình ảnh hoặc quay video ngắn hiện trạng sản phẩm gặp lỗi ngay khi nhận bông, và gửi qua kênh Chat trực tuyến, Facebook Messenger hoặc số Hotline của Fióre.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">2</div>
                <div>
                  <h5 className="font-serif font-bold text-gray-800 text-base">Đề xuất phương án tối ưu (Trong vòng 30 phút)</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Nhân viên trực tổng đài Chăm sóc khách hàng sẽ liên hệ lại tối đa trong vòng 30 phút để hỏi thăm chân quý và thảo luận giải pháp khắc phục cùng quý khách (Đổi hoa mới/Hoàn tiền).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="h-6 w-6 rounded-full bg-pink-100 text-rose-600 flex items-center justify-center font-bold text-xs shrink-0 mt-1">3</div>
                <div>
                  <h5 className="font-serif font-bold text-gray-800 text-base">Thực thi bù hoàn hỏa tốc</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Điều phối viên tiến hành cắm mới hỏa tốc và chuyển giao tới địa bàn của bạn trong 2 giờ, hoặc tiến hành thủ tục hoàn tiền 100% nhanh chóng thông qua tài khoản ngân hàng.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right photo */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl border-8 border-pink-50 bg-white p-2 shadow-lg overflow-hidden">
              <img
                src={deliveryHeroImg}
                alt="Xử lý khiếu nại tận tâm"
                className="h-[380px] w-full rounded-2xl object-cover hover:scale-[1.01] transition duration-300"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-6 right-6 left-6 bg-slate-900/90 text-white p-4 rounded-xl shadow-lg border border-slate-700/50 backdrop-blur-xs text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">100% Hoàn Hảo</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-sans text-[11px]">
                  Fióre nỗ lực nâng cấp từng chi tiết nhỏ nhất từ dưỡng cành, bọc hoa tới vận chuyển để tối thiểu hóa sai sót. Khi có phản hồi lỗi, chúng tôi tự giác chịu trách nhiệm bằng sự tử tế.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust guarantees badge block */}
      <div className="bg-pink-50/40 rounded-3xl p-8 sm:p-12 border border-pink-100/50 flex flex-col items-center text-center">
        <ShieldCheck className="h-10 w-10 text-emerald-600 mb-4" />
        <h3 className="font-serif text-2xl font-bold text-gray-950">Gửi Trọn Niềm Tin - Trao Trọn Cảm Xúc</h3>
        <p className="text-sm text-gray-600 mt-2 max-w-2xl">
          Fióre cam kết đồng hành cùng bạn trên mọi hành trình giao chuyển. Mọi quy trình từ tạo tác cắm hoa, bảo dưỡng lạnh ẩm đến giao hoa tận địa chỉ đều được tối ưu hoàn thiện tự động bằng cả cái tâm làm hoa.
        </p>
      </div>
    </div>
  );
}

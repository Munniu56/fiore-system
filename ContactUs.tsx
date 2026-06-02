/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ContactUs() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorStatus('');

    if (!fullName.trim() || !email.trim() || !message.trim()) {
      setErrorStatus('Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.');
      return;
    }

    // Trigger fake success but let state reflect real UI change
    setIsSubmitted(true);
    
    // Clear fields
    setFullName('');
    setEmail('');
    setMessage('');

    // Auto clear success banner after 8 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 8000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      
      {/* Title block */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-rose-500 text-xs font-bold uppercase tracking-widest pl-2 border-l-2 border-rose-500">Liên hệ Fióre</span>
        <h1 className="font-serif text-4xl font-bold text-gray-900 mt-2">Liên Kết & Đồng Hành Cùng Bạn</h1>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Đội ngũ chăm sóc khách hàng của Fióre luôn có mặt để phản hồi các thắc mắc của bạn sớm nhất trong vòng 24 giờ.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Official details & Map illustration */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Card containing Store Info details */}
          <div className="bg-white rounded-2xl border border-pink-100 p-8 shadow-xs space-y-6">
            <h3 className="font-serif text-2xl font-bold text-gray-900 border-b border-pink-50 pb-4">
              Fióre Boutique Florist
            </h3>

            <div className="space-y-4">
              {/* Address details */}
              <div className="flex items-start space-x-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-rose-600 shrink-0 mt-0.5">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Địa chỉ</h4>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    34 Trần Thái Tông, Tổ 11, Thuận Hóa, Huế, Việt Nam
                  </p>
                </div>
              </div>

              {/* Hotline Details */}
              <div className="flex items-start space-x-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-rose-600 shrink-0 mt-0.5">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hotline Tư vấn</h4>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">
                    0916044683
                  </p>
                </div>
              </div>

              {/* Email details */}
              <div className="flex items-start space-x-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-100 text-rose-600 shrink-0 mt-0.5">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email hỗ trợ</h4>
                  <p className="text-sm font-medium text-gray-700 mt-0.5 hover:text-rose-600 transition">
                    thuyvanngo35@gmail.com
                  </p>
                </div>
              </div>
            </div>

            {/* Business hours addition for visual density */}
            <div className="bg-pink-50/50 rounded-xl p-4 text-xs text-rose-800 space-y-1 border border-pink-100/50">
              <p className="font-bold">⏰ Giờ mở cửa hoạt động:</p>
              <p className="font-medium text-gray-600 mt-0.5">Thứ hai - Chủ nhật: từ 07:00 - 21:00 (Kể cả ngày Lễ)</p>
            </div>
          </div>

          {/* Interactive Responsive Google Map embedding */}
          <div className="overflow-hidden rounded-2xl border border-pink-100 shadow-sm bg-white p-2">
            <div className="h-64 w-full rounded-xl overflow-hidden relative">
              <iframe
                title="Bản đồ chỉ đường Fióre Boutique Florist"
                src="https://maps.google.com/maps?q=34%20Tr%E1%BA%A7n%20Th%C3%A1i%20T%C3%B4ng,%20T%E1%BB%95%2011,%20Thu%E1%BA%ADn%20H%C3%B3a,%20Hu%E1%BA%BF,%20Vi%E1%BB%87t%20Nam&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-x-0 inset-y-0"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-pink-100 p-8 shadow-xs">
          <h3 className="font-serif text-2xl font-bold text-gray-950 mb-1">Gửi Lời Nhắn Gửi Tới Fióre</h3>
          <p className="text-xs text-gray-500 mb-6">Bạn có thắc mắc về đơn hàng, mẫu cắm riêng hoặc hợp tác doanh nghiệp? Hãy điền mẫu dưới đây.</p>
          
          {/* Submission Feedback Alert */}
          {isSubmitted && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800 flex items-start space-x-3 animate-fade-in shadow-xs">
              <CheckCircle2 className="h-5.5 w-5.5 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-950">Gửi Liên Hệ Thành Công!</h4>
                <p className="text-xs text-emerald-700/90 mt-1">
                  Cảm ơn bạn đã liên hệ với Fióre. Đội ngũ tư vấn sẽ nhanh chóng liên hệ lại qua email hoặc số điện thoại của bạn sớm nhất có thể. Chúc bạn một ngày ngát hương hoa!
                </p>
              </div>
            </div>
          )}

          {/* Error alert validation summary */}
          {errorStatus && (
            <div className="mb-6 rounded-xl bg-amber-50 border border-amber-100 p-4 text-amber-800 flex items-start space-x-3">
              <AlertCircle className="h-5.5 w-5.5 shrink-0 text-amber-600 mt-0.5" />
              <p className="text-xs font-semibold">{errorStatus}</p>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Fullname input field */}
            <div>
              <label htmlFor="contact-fullname" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập đầy đủ tên của bạn"
                className="w-full rounded-lg border border-pink-100 bg-neutral-50/50 py-2.5 px-3.5 text-xs font-medium outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>

            {/* Email input field */}
            <div>
              <label htmlFor="contact-email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ví dụ: nguyenvan@gmail.com"
                className="w-full rounded-lg border border-pink-100 bg-neutral-50/50 py-2.5 px-3.5 text-xs font-medium outline-none transition focus:border-rose-400 focus:bg-white"
              />
            </div>

            {/* Message Body area */}
            <div>
              <label htmlFor="contact-message" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                Nội dung liên hệ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="contact-message"
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Viết lời nhắn gửi hoặc thông tin hỗ trợ chi tiết bạn mong muốn..."
                className="w-full rounded-lg border border-pink-100 bg-neutral-50/50 py-2.5 px-3.5 text-xs font-medium outline-none transition focus:border-rose-400 focus:bg-white resize-none"
              />
            </div>

            {/* Submit handle line button */}
            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white py-2.5 px-5 font-bold text-xs cursor-pointer shadow-xs transition duration-200"
              >
                <Send className="h-4 w-4" />
                <span>Gửi liên hệ</span>
              </button>
            </div>
          </form>

        </div>

      </div>

    </div>
  );
}

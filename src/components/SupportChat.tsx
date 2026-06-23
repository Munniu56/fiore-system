import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, CornerDownLeft, Sparkles, Smile } from 'lucide-react';
import { Product } from '../types';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  proposedProducts?: Product[];
}

interface SupportChatProps {
  products: Product[];
  onViewProduct?: (productId: string) => void;
}

interface BotResult {
  text: string;
  proposedProducts?: Product[];
}

export default function SupportChat({ products = [], onViewProduct }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'bot',
      text: 'Xin chào 🌷\nFióre Boutique Florist rất hân hạnh được hỗ trợ bạn.\nBạn cần tư vấn về sản phẩm nào?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of message logs
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const getCategoryName = (catId: string): string => {
    switch (catId) {
      case 'tinh-yeu': return 'Hoa tình yêu';
      case 'sinh-nhat': return 'Hoa sinh nhật';
      case 'khai-truong': return 'Hoa khai trương';
      case 'chuc-mung': return 'Hoa chúc mừng';
      case 'chia-buon': return 'Hoa chia buồn';
      case 'theo-mua': return 'Hoa theo mùa';
      default: return 'Hoa thiết kế';
    }
  };

  // Handle default responses based on keywords or exact options
  const getBotResponse = (userText: string): BotResult => {
    const text = userText.toLowerCase().trim();

    // 1. General Greetings & Hellos
    if (
      text === 'xin chào' || 
      text === 'chào' || 
      text === 'chao' || 
      text === 'chào shop' ||
      text === 'chao shop' ||
      text === 'hello' || 
      text === 'hi' || 
      text === 'alo' || 
      text.startsWith('chào bạn') || 
      text.startsWith('bắt đầu') ||
      text.startsWith('xin chao')
    ) {
      return {
        text: 'Xin chào 🌷\nChào mừng bạn đến với Fióre Boutique Florist.\nMình có thể giúp bạn tìm hoa, tư vấn sản phẩm hoặc hỗ trợ đặt hàng.'
      };
    }

    // 2. Specific Navigations Support
    if (text.includes('muốn xem sản phẩm') || text.includes('xem san pham') || text.includes('muon xem san pham')) {
      return {
        text: 'Bạn có thể vào mục Sản Phẩm trên thanh menu để xem toàn bộ các mẫu hoa hiện có. 🌷'
      };
    }
    if (text.includes('muốn liên hệ') || text.includes('muon lien he') || text.includes('gửi thông tin liên hệ')) {
      return {
        text: 'Bạn có thể truy cập trang Liên Hệ hoặc liên hệ trực tiếp qua email và số điện thoại của cửa hàng. 📞'
      };
    }

    // 3. Recommendation query check
    const isAskingRecommendation = 
      text.includes('gợi ý') || 
      text.includes('goi y') || 
      text.includes('tư vấn') || 
      text.includes('tu van') || 
      text.includes('đề xuất') || 
      text.includes('de xuat') || 
      text.includes('chọn hoa') || 
      text.includes('chon hoa') ||
      text.includes('tặng') || 
      text.includes('tang') || 
      text.includes('dưới') || 
      text.includes('duoi') || 
      text.includes('đẹp') || 
      text.includes('dep') || 
      text.includes('phù hợp') || 
      text.includes('phu hop');

    if (isAskingRecommendation || 
        text === 'hoa sinh nhật' || text === 'hoa sinh nhat' ||
        text === 'hoa tình yêu' || text === 'hoa tinh yeu' ||
        text === 'hoa khai trương' || text === 'hoa khai truong' ||
        text === 'hoa chúc mừng' || text === 'hoa chuc mung' ||
        text === 'hoa chia buồn' || text === 'hoa chia buon'
    ) {
      let filtered = [...products];
      let categoryLabel = '';

      // Check categories
      if (text.includes('sinh nhật') || text.includes('sinh nhat') || text.includes('mẹ') || text.includes('tặng mẹ')) {
        filtered = filtered.filter(p => p.categoryId === 'sinh-nhat');
        categoryLabel = 'hoa sinh nhật';
      } else if (text.includes('tình yêu') || text.includes('tinh yeu') || text.includes('người yêu') || text.includes('nguoi yeu') || text.includes('vợ') || text.includes('bạn gái') || text.includes('bồ') || text.includes('tương tư') || text.includes('cưới') || text.includes('cuoi') || text.includes('cô dâu') || text.includes('co dau') || text.includes('cầm tay') || text.includes('hôn lễ')) {
        filtered = filtered.filter(p => p.categoryId === 'tinh-yeu');
        categoryLabel = 'hoa tình yêu/ngày cưới';
      } else if (text.includes('khai trương') || text.includes('khai truong')) {
        filtered = filtered.filter(p => p.categoryId === 'khai-truong');
        categoryLabel = 'hoa khai trương';
      } else if (text.includes('chúc mừng') || text.includes('chuc mung') || text.includes('tốt nghiệp') || text.includes('tot nghiep')) {
        filtered = filtered.filter(p => p.categoryId === 'chuc-mung');
        categoryLabel = 'hoa chúc mừng';
      } else if (text.includes('chia buồn') || text.includes('chia buon') || text.includes('đám tang') || text.includes('dam tang') || text.includes('phúng viếng')) {
        filtered = filtered.filter(p => p.categoryId === 'chia-buon');
        categoryLabel = 'hoa chia buồn';
      }

      // Check prices / budget
      if (text.includes('dưới 500') || text.includes('duoi 500')) {
        filtered = filtered.filter(p => p.price < 500000);
        categoryLabel = categoryLabel ? `${categoryLabel} dưới 500.000 VNĐ` : 'mẫu hoa dưới 500.000 VNĐ';
      } else if (
        text.includes('500.000') || 
        text.includes('1 triệu') || 
        text.includes('1 trieu') ||
        text.includes('500k') ||
        text.includes('1tr')
      ) {
        filtered = filtered.filter(p => p.price >= 500000 && p.price <= 1000000);
        categoryLabel = categoryLabel ? `${categoryLabel} từ 500.000đ đến 1 triệu VNĐ` : 'mẫu hoa tầm trung từ 500.000đ đến 1.000.000 VNĐ';
      }

      // If unfiltered, select general featured/new
      if (filtered.length === products.length) {
        filtered = products.filter(p => p.isFeatured || p.isNew);
        categoryLabel = 'hoa nổi bật được yêu thích';
      }

      const picked = filtered.slice(0, 4);

      if (picked.length > 0) {
        let replyText = `🌷 Fióre xin gợi ý một số mẫu ${categoryLabel || 'hoa tuyển chọn'} được yêu thích nhất:\n\n`;
        picked.forEach((p, idx) => {
          replyText += `${idx + 1}. ${p.name}\n   Giá: ${p.price.toLocaleString('vi-VN')} VNĐ\n\n`;
        });
        replyText += `Bạn có muốn xem thêm các mẫu ${categoryLabel || 'hoa'} khác không?`;

        return {
          text: replyText,
          proposedProducts: picked
        };
      } else {
        return {
          text: `Dạ, hiện tại tiệm chưa có mẫu hoa nào lý tưởng với khoảng giá này. Bạn có muốn xem thêm mẫu hoa Chúc Mừng hoặc các tuyệt tác sinh nhật khác không? ✨`
        };
      }
    }

    // 4. Working Hours
    if (
      text.includes('giờ mở cửa') || 
      text.includes('gio mo cua') || 
      text.includes('mở cửa lúc mấy giờ') || 
      text.includes('mo cua luc may gio') || 
      text.includes('mấy giờ đóng') || 
      text.includes('may gio dong') || 
      text.includes('hoạt động') || 
      text.includes('hoat dong') ||
      text.includes('giờ làm việc') ||
      text.includes('gio lam viec')
    ) {
      return {
        text: '⏰ Fióre Boutique Florist hân hạnh phục vụ quý khách:\n• Giờ làm việc: 7:00 AM - 9:00 PM\n• Hoạt động liên tục mỗi ngày (kể cả Thứ 7, Chủ Nhật và các ngày Lễ)!'
      };
    }

    // 5. Ordering Guide
    if (
      text.includes('đặt hàng') || 
      text.includes('dat hang') || 
      text.includes('hướng dẫn đặt') || 
      text.includes('huong dan dat') || 
      text.includes('mua thế nào') || 
      text.includes('mua the nao') || 
      text.includes('đặt hoa') || 
      text.includes('dat hoa') ||
      text.includes('làm sao đặt') ||
      text.includes('lam sao dat')
    ) {
      return {
        text: '🛒 Đặt mua hoa tại website cực kỳ nhanh gọn:\n1. Chọn sản phẩm yêu thích trên trang chủ.\n2. Click "Chọn mua" để thêm sản phẩm vào Giỏ Hàng.\n3. Xem lại giỏ hàng, điền địa chỉ giao, ghi chú thiệp tặng rồi chọn Thanh toán online hoặc COD!'
      };
    }

    // 6. Payment methods
    if (
      text.includes('thanh toán') || 
      text.includes('thanh toan') || 
      text.includes('trả tiền') || 
      text.includes('tra tien') || 
      text.includes('chuyển khoản') || 
      text.includes('chuyen khoan') || 
      text.includes('momo') || 
      text.includes('cod')
    ) {
      return {
        text: '💳 Fióre hỗ trợ nhiều hình thức thanh toán thuận tiện cho quý khách:\n• Giao hàng thu tiền tận nơi (COD)\n• Thanh toán chuyển khoản trực tuyến khi hoàn tất điền đơn hàng.\nShop sẽ liên hệ xác nhận ngay sau khi nhận đơn!'
      };
    }

    // 7. Shipping Fee & Delivery Location
    if (
      text.includes('giao hàng') || 
      text.includes('giao hang') || 
      text.includes('ship') || 
      text.includes('giao tận nơi') || 
      text.includes('giao tan noi') || 
      text.includes('vận chuyển') || 
      text.includes('van chuyen') || 
      text.includes('phí') || 
      text.includes('phi')
    ) {
      return {
        text: '🚚 Fióre cam kết GIAO HOA TẬN NƠI HỎA TỐC trong nước và khu vực Huế từ 1-2 giờ.\n• MIỄN PHÍ VẬN CHUYỂN toàn bộ các đơn hàng giá trị từ 1.000.000đ trở lên hoặc nằm trong phạm vi bán kính 2km quanh shop!'
      };
    }

    // 8. Contact details
    if (
      text.includes('liên hệ') || 
      text.includes('lien he') || 
      text.includes('sđt') || 
      text.includes('sdt') || 
      text.includes('hotline') || 
      text.includes('điện thoại') || 
      text.includes('dien thoai') || 
      text.includes('số máy') || 
      text.includes('so may') || 
      text.includes('địa chỉ') || 
      text.includes('dia chi') || 
      text.includes('ở đâu') || 
      text.includes('o dau') || 
      text.includes('email') || 
      text.includes('thư') || 
      text.includes('thu') || 
      text.includes('bản đồ') || 
      text.includes('ban do')
    ) {
      return {
        text: '📞 Bạn có thể liên kết trực tiếp với Fióre Boutique Florist qua:\n• Hotline hỗ trợ: 0916044683\n• Địa chỉ tiệm: 34 Trần Thái Tông, Tổ 11, Thuận Hóa, Huế, Việt Nam\n• Email hỗ trợ: thuyvanngo35@gmail.com\n• Bản đồ nhúng rõ nét tại trang Liên Hệ trên menu!'
      };
    }

    // 8.5 Social Media channels
    if (
      text.includes('mạng xã hội') || 
      text.includes('mang xa hoi') || 
      text.includes('facebook') || 
      text.includes('fb') ||
      text.includes('instagram') || 
      text.includes('ig') ||
      text.includes('insta') ||
      text.includes('tiktok') || 
      text.includes('social') ||
      text.includes('fanpage') ||
      text.includes('đường dẫn') ||
      text.includes('duong dan') ||
      text.includes('đường link') ||
      text.includes('duong link') ||
      text.includes('link')
    ) {
      return {
        text: '📱 Các trang mạng xã hội chính thức của Fióre Boutique Florist:\n\n• 👤 Facebook Page: https://www.facebook.com/fioreboutiqueflorist\nKênh cập nhật sớm nhất các mẫu hoa tươi nhập khẩu nghệ thuật tinh tế và ưu đãi hấp dẫn.\n\n• 📸 Instagram Album: https://www.instagram.com/fiore_boutiqueflorist/?hl=en\nNơi ngập tràn hình ảnh sang trọng, lãng mạn đầy tính nghệ thuật sáng tạo của nhà Fióre.\n\n• 🎵 TikTok Video: https://www.tiktok.com/@fiorefloral\nGóc nhỏ sinh động ghi lại những thước phim tỉ mẩn cắm hoa đong đầy xúc cảm.'
      };
    }

    // 9. Order Tracker Quick Option Trigger
    if (text.includes('theo dõi đơn') || text.includes('theo doi don') || text.includes('đơn hàng') || text.includes('don hang') || text.includes('tiến độ')) {
      return {
        text: '🚚 Để theo dõi trạng thái đơn hàng tức thời, quý khách hãy nhấp vào mục "Theo dõi tiến độ đơn hàng" dưới chân trang (Footer), nhập mã đơn hoặc đăng nhập tài khoản Fióre để được cập nhật trực quan nhất!'
      };
    }

    // 10. General flower keyword reply fallback
    if (
      text.includes('fiore') || 
      text.includes('fióre') || 
      text.includes('florist') || 
      text.includes('bó hoa') || 
      text.includes('giỏ hoa') || 
      text.includes('kệ hoa') || 
      text.includes('lẵng hoa') || 
      text.includes('hoa tươi') || 
      text.includes('hoa') || 
      text.includes('shop') || 
      text.includes('tiệm') || 
      text.includes('cửa hàng') || 
      text.includes('đơn')
    ) {
      return {
        text: '🌷 Cảm ơn bạn đã bày tỏ sự quan tâm đến các cánh hoa Fióre! Mình có thể tư vấn mẫu mã cụ thể hoặc điều hướng hỗ trợ, bạn vui lòng đưa ra chi tiết hơn hoặc chọn các nút lựa chọn nhanh nhé.'
      };
    }

    // 11. Out-of-bounds Disclaimer
    return {
      text: 'Xin lỗi, tôi hiện chỉ hỗ trợ các thông tin liên quan đến Fióre Boutique Florist và các sản phẩm, dịch vụ trên website.'
    };
  };

  const handleSend = (userText: string) => {
    if (!userText.trim()) return;

    const userMessage: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    // Simulate standard assistant typing suspense delay (350ms)
    setTimeout(() => {
      const responseResult = getBotResponse(userText);
      const botMessage: Message = {
        id: Math.random().toString(),
        sender: 'bot',
        text: responseResult.text,
        proposedProducts: responseResult.proposedProducts,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 350);
  };

  const renderMessageText = (text: string, isUser: boolean) => {
    if (isUser) return text;
    // Match URLs starting with http:// or https:// and ending with non-space characters
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    if (parts.length === 1) return text;

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline font-bold hover:text-amber-800 break-all inline duration-200"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const quickOptions = [
    'Hoa sinh nhật',
    'Hoa tình yêu',
    'Hoa khai trương',
    'Hoa chúc mừng',
    'Liên hệ cửa hàng',
    'Mạng xã hội Fióre',
    'Theo dõi đơn hàng',
  ];

  return (
    <>
      {/* Absolute Trigger Button at the bottom-right viewport side */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              id="fiore-chat-trigger-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setIsOpen(true)}
              className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 cursor-pointer border border-[#C8A96B]/30"
              style={{ backgroundColor: '#1F3D2B' }}
            >
              <span className="absolute animate-ping inline-flex h-full w-full rounded-full opacity-30 group-hover:opacity-0 transition-opacity" style={{ backgroundColor: '#C8A96B' }}></span>
              <MessageCircle className="h-6 w-6 text-[#F8F5EF] transition-transform duration-300 group-hover:rotate-6" />
              <div className="absolute -top-1 -right-1 bg-[#C8A96B] text-[#1F3D2B] rounded-full p-1 text-[10px] font-extrabold shadow-sm flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 fill-current" />
              </div>
            </motion.button>
          )}

          {isOpen && (
            <motion.div
              id="fiore-support-chatbox-container"
              initial={{ opacity: 0, y: 35, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 35, scale: 0.95 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex h-[480px] w-[340px] flex-col rounded-2xl border bg-[#F8F5EF] shadow-2xl overflow-hidden @container"
              style={{ borderColor: 'rgba(31, 61, 43, 0.12)' }}
            >
              {/* Header section styled with Brand Midnight Green & Gold */}
              <div 
                className="flex items-center justify-between px-4 py-3.5"
                style={{ backgroundColor: '#1F3D2B', borderBottom: '2px solid #C8A96B' }}
              >
                <div className="flex items-center space-x-2.5">
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8F5EF]/10 border border-[#C8A96B]/50 text-[#C8A96B]">
                    <Sparkles className="h-4 w-4" />
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1F3D2B]"></span>
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-[#F8F5EF] tracking-wide leading-tight">Fióre Support</h3>
                    <p className="text-[10px] font-medium text-emerald-400">Đang trực tuyến</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-gray-300 hover:text-white transition-colors duration-200 cursor-pointer"
                  title="Đóng cửa sổ"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Scrolling messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs font-sans leading-relaxed shadow-xs whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-[#1F3D2B] text-white rounded-br-none border border-emerald-900/10'
                          : 'bg-white text-gray-800 rounded-bl-none border border-pink-100/75'
                      }`}
                    >
                      {renderMessageText(msg.text, msg.sender === 'user')}
                      <span
                        className={`block text-[9px] mt-1 text-right font-mono ${
                          msg.sender === 'user' ? 'text-gray-300/85' : 'text-gray-400'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {msg.proposedProducts && msg.proposedProducts.length > 0 && (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-thin self-stretch" style={{ scrollbarWidth: 'thin' }}>
                        {msg.proposedProducts.map((p) => (
                          <div 
                            key={p.id} 
                            className="flex-shrink-0 w-36 bg-white rounded-lg border border-pink-100/80 overflow-hidden flex flex-col hover:border-[#C8A96B] transition-all"
                          >
                            {p.image && (
                              <img 
                                src={p.image} 
                                alt={p.name} 
                                className="h-20 w-full object-cover shrink-0" 
                                referrerPolicy="no-referrer"
                              />
                            )}
                            <div className="p-2 flex flex-col justify-between flex-1 min-w-0">
                              <div>
                                <h4 className="text-[10px] font-bold text-gray-800 line-clamp-1 truncate" title={p.name}>
                                  {p.name}
                                </h4>
                                <span className="text-[8px] text-[#C8A96B] font-semibold block">
                                  {getCategoryName(p.categoryId)}
                                </span>
                              </div>
                              <div className="mt-1.5 pt-1.5 border-t border-gray-50 flex flex-col">
                                <span className="text-[10px] font-bold text-amber-800">
                                  {p.price.toLocaleString('vi-VN')}đ
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onViewProduct) {
                                      onViewProduct(p.id);
                                    }
                                  }}
                                  className="mt-1.5 w-full bg-[#1F3D2B] hover:bg-[#2B523C] text-[#F8F5EF] text-[8px] py-1 rounded transition-colors text-center font-bold tracking-wide uppercase cursor-pointer"
                                >
                                  Chi tiết
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick choices items */}
              <div className="px-4 py-2 bg-white/70 border-t border-[#1F3D2B]/5 max-h-24 overflow-y-auto">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <Smile className="h-3 w-3 text-[#C8A96B]" /> <span>Lựa chọn nhanh</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSend(opt)}
                      className="text-[10px] font-medium bg-[#F8F5EF] hover:bg-[#1F3D2B] hover:text-[#F8F5EF] text-[#234030] border border-[#1F3D2B]/10 rounded-full px-2.5 py-1 transition-all duration-300 cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input field text box area */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                  setInput('');
                }}
                className="flex items-center space-x-2 bg-white p-2.5 border-t border-pink-50"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Hỏi Fióre..."
                  className="flex-1 rounded-xl bg-gray-50 border border-gray-100 px-3.5 py-2 text-xs focus:bg-white focus:border-[#C8A96B] focus:outline-none transition-all text-gray-800 font-sans"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer bg-[#1F3D2B] text-white hover:bg-[#2B523C] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

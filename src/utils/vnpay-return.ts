import { verifyVnpayCallback } from '../vnpayConfig';
import { sendEmailJSOrderPaid } from '../emailjsService';
import { Order, Product, Category } from '../types';
import '../index.css';
import { saveOrder, saveProduct } from '../firebase';

// VNPAY Sandbox Error Messages Map for descriptive feedback
const VNPAY_ERROR_CODES: Record<string, string> = {
  '01': 'Giao dịch đã tồn tại (Duplicate transaction).',
  '02': 'Mã lỗi này chưa được khai báo hoặc không được hỗ trợ từ cổng thanh toán.',
  '04': 'Giao dịch đảo mặt phản hồi chậm thiết kế từ phía ngân hàng.',
  '07': 'Trừ tiền thành công tại ngân hàng nhưng giao dịch phát sinh lỗi khác.',
  '09': 'Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ Internet Banking tại ngân hàng liên kết.',
  '10': 'Khách hàng xác thực thông tin thẻ/tài khoản cá nhân sai quá 3 lần.',
  '11': 'Đã hết hạn chờ thanh toán của phiên giao dịch VNPAY.',
  '12': 'Thẻ hoặc Tài khoản thanh toán của quý khách hiện đang bị khóa.',
  '13': 'Nhập sai mật khẩu xác thực giao dịch OTP quá 3 lần liên tiếp.',
  '24': 'Hủy bỏ giao dịch thanh toán (Khách hàng chủ động hủy tại cổng VNPAY).',
  '51': 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch này.',
  '65': 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch cho phép trong ngày.',
  '75': 'Ngân hàng phát hành hoặc đại lý thanh toán đang bảo trì hệ thống định kỳ.',
  '79': 'Khách hàng nhập sai mã OTP hoặc mã PIN quá số lần hệ thống quy định.',
  '99': 'Các lỗi kỹ thuật khác phát sinh từ hệ thống xử lý cổng giao dịch VNPAY.',
};

// Retrieve query parameters
const params = new URLSearchParams(window.location.search);
const queryObj: Record<string, string> = {};
params.forEach((value, key) => {
  queryObj[key] = value;
});

const vnp_SecureHash = params.get('vnp_SecureHash');
const vnp_ResponseCode = params.get('vnp_ResponseCode');
const vnp_TxnRef = params.get('vnp_TxnRef'); // Order ID
const vnp_TransactionNo = params.get('vnp_TransactionNo');
const vnp_PayDate = params.get('vnp_PayDate') || '';
const vnp_BankCode = params.get('vnp_BankCode') || '';
const vnp_Amount = params.get('vnp_Amount');

const loadingEl = document.getElementById('loading-state');
const contentEl = document.getElementById('result-content');

// Helper to format pay date "YYYYMMDDHHmmss" -> "HH:mm:ss DD/MM/YYYY"
function formatPayDate(payDateStr: string): string {
  if (!payDateStr || payDateStr.length < 14) return payDateStr;
  const year = payDateStr.substring(0, 4);
  const month = payDateStr.substring(4, 6);
  const day = payDateStr.substring(6, 8);
  const hour = payDateStr.substring(8, 10);
  const minute = payDateStr.substring(10, 12);
  const second = payDateStr.substring(12, 14);
  return `${hour}:${minute}:${second} ${day}/${month}/${year}`;
}

// Helper to format currency
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

// Main verification flow
async function handleVnpayReturnVerification() {
  console.log('[VNPAY Return] Khởi chạy kiểm thử phản hồi từ cổng thanh toán');
  console.log('[VNPAY Return] Tham số nhận về:', queryObj);

  if (!vnp_TxnRef) {
    showErrorUI('Không tìm thấy mã số đơn hàng (TxnRef) từ cổng thanh toán VNPAY-Sandbox.');
    return;
  }

  // 1. Verify signatures & response codes
  const isSignatureValid = verifyVnpayCallback(queryObj);
  const isResponsePaid = vnp_ResponseCode === '00';

  if (isSignatureValid && isResponsePaid) {
    console.log('[VNPAY Return] Xác minh mã băm bảo mật thành công! Khởi tạo tiến trình lưu trữ dữ liệu...');

    let orders: Order[] = [];
    try {
      orders = JSON.parse(localStorage.getItem('fiore_orders') || '[]');
    } catch (e) {
      console.error('[VNPAY Return] Sai định dạng orders:', e);
    }

    let order = orders.find((o) => o.id === vnp_TxnRef);
    let successfullyCreatedOrUpdated = false;

    if (!order) {
      // Create from pending info
      const pendingStr = localStorage.getItem('fiore_pending_vnpay_order');
      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          if (pending && pending.id === vnp_TxnRef) {
            let currentUser = null;
            try {
              currentUser = JSON.parse(localStorage.getItem('fiore_current_user') || 'null');
            } catch {}

            order = {
              id: pending.id,
              customerName: currentUser ? currentUser.name : pending.recipientName,
              customerEmail: currentUser ? currentUser.email : pending.recipientEmail || 'guest@fiore.vn',
              recipientName: pending.recipientName,
              recipientPhone: pending.recipientPhone,
              shippingAddress: pending.shippingAddress,
              note: pending.note,
              items: pending.cartItems || [],
              totalAmount: pending.totalAmount,
              paymentMethod: 'VNPAY',
              paymentStatus: 'Paid',
              status: 'paid',
              createdAt: new Date().toISOString(),
              vnp_TransactionNo: vnp_TransactionNo || undefined,
              vnp_PayDate: vnp_PayDate || undefined,
              vnp_BankCode: vnp_BankCode || undefined,
              vnp_Amount: vnp_Amount || undefined,
              couponCode: pending.couponCode || undefined,
              discountAmount: pending.discountAmount || undefined,
              redeemedPoints: pending.redeemedPoints || undefined,
              promotionDiscount: pending.promotionDiscount || undefined,
            };

            orders.push(order);
            successfullyCreatedOrUpdated = true;

            // Deduct store stocks
            let products: Product[] = [];
            try {
              products = JSON.parse(localStorage.getItem('fiore_products') || '[]');
            } catch {}

            if (products.length > 0) {
              const updatedProds: Product[] = [];
              for (const p of products) {
                const itemDeducted = (pending.cartItems || []).find((it: any) => it.product.id === p.id);
                if (itemDeducted) {
                  const updatedP = { ...p, stock: Math.max(0, p.stock - itemDeducted.quantity) };
                  try {
                    await saveProduct(updatedP);
                    console.log(`[VNPAY Return] Successfully deducted stock for ${p.id} to ${updatedP.stock} in Firestore`);
                  } catch (err) {
                    console.error(`[VNPAY Return] Failed to save deducted stock in Firestore for ${p.id}:`, err);
                  }
                  updatedProds.push(updatedP);
                } else {
                  updatedProds.push(p);
                }
              }
              localStorage.setItem('fiore_products', JSON.stringify(updatedProds));
            }

            // Reset customer shopping cart state upon purchase completion
            localStorage.setItem('fiore_cart', '[]');
            console.log('[VNPAY Return] Tạo đơn hàng mới từ giỏ hàng pending thành công.');
          }
        } catch (err) {
          console.error('[VNPAY Return] Lỗi phục hồi pending order:', err);
        }
      }
    } else {
      // Order already exists — just mark it as paid
      order.paymentStatus = 'Paid';
      order.status = 'paid';
      order.vnp_TransactionNo = vnp_TransactionNo || undefined;
      order.vnp_PayDate = vnp_PayDate || undefined;
      order.vnp_BankCode = vnp_BankCode || undefined;
      order.vnp_Amount = vnp_Amount || undefined;
      successfullyCreatedOrUpdated = true;
      console.log('[VNPAY Return] Cập nhật đơn hàng tích hợp có sẵn thành công.');
    }

    if (successfullyCreatedOrUpdated && order) {
       try {
    // Đồng bộ đơn hàng lên Firebase Firestore
    await saveOrder(order);

    console.log(
      '[VNPAY Return] Đã lưu đơn hàng lên Firebase:',
      order.id
    );
  } catch (firebaseErr) {
    console.error(
      '[VNPAY Return] Lỗi khi lưu Firebase:',
      firebaseErr
    );
  }

  // Backup LocalStorage
  localStorage.setItem(
    'fiore_orders',
    JSON.stringify(orders)
  );

  // Xóa dữ liệu tạm
  localStorage.removeItem(
    'fiore_pending_vnpay_order'
  );

      // Auto-trigger confirmation email notification via EmailJS
      let currentUserProfile = null;
      try {
        currentUserProfile = JSON.parse(localStorage.getItem('fiore_current_user') || 'null');
      } catch {}

      try {
        const mailResult = await sendEmailJSOrderPaid(order, currentUserProfile);
        if (mailResult.success) {
          console.log('[VNPAY Return EmailJS] Đã gửi thư xác nhận thành công đơn hàng số #', order.id);
        } else {
          console.warn('[VNPAY Return EmailJS] Không gửi được thư tự động:', mailResult.error);
        }
      } catch (mailErr) {
        console.error('[VNPAY Return EmailJS] Gặp sự cố không mong muốn khi gửi email:', mailErr);
      }

      showSuccessUI(order);
    } else {
      showErrorUI('Không phục hồi được thông tin giỏ hàng tạm thời để tạo đơn.');
    }
  } else {
    // Failure outcome mapped with messages
    let failReason = 'Chữ ký bảo mật không khớp hoặc yêu cầu bị từ chối.';
    if (vnp_ResponseCode && VNPAY_ERROR_CODES[vnp_ResponseCode]) {
      failReason = VNPAY_ERROR_CODES[vnp_ResponseCode];
    } else if (vnp_ResponseCode && vnp_ResponseCode !== '00') {
      failReason = `Giao dịch thất bại với mã lỗi hệ thống: vnp_ResponseCode = ${vnp_ResponseCode}`;
    }
    showErrorUI(failReason);
  }
}

// 2. BUILD SUCCESS INTERFACE DOM
function showSuccessUI(order: Order) {
  if (loadingEl) loadingEl.style.display = 'none';
  if (!contentEl) return;

  const displayAmount = vnp_Amount ? Number(vnp_Amount) / 100 : order.totalAmount;
  const displayDateStr = formatPayDate(vnp_PayDate);

  contentEl.innerHTML = `
    <div class="space-y-8 animate-fade-in">
      
      <!-- Icon Success header with custom rings -->
      <div class="relative flex items-center justify-center">
        <div class="absolute w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 animate-ping opacity-60"></div>
        <div class="relative w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
          <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="font-serif text-3xl font-bold text-gray-900 tracking-tight">Thanh Toán Thành Công</h2>
        <p class="text-sm text-gray-500">Cảm ơn bạn đã lựa chọn tiệm hoa <span class="font-semibold text-rose-500">Fióre</span>. Giao dịch VNPAY của quý khách đã hoàn tất.</p>
      </div>

      <!-- Transaction details billing list -->
      <div class="bg-[#FAF8F5] rounded-2xl p-5 border border-rose-100/30 text-left space-y-3.5 text-xs">
        <div class="flex items-center justify-between border-b border-rose-100/50 pb-2">
          <span class="text-gray-400 font-medium">Mã đơn hàng:</span>
          <span class="font-bold text-rose-800 font-mono text-sm">${order.id}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-400 font-medium">Mã giao dịch VNPAY:</span>
          <span class="font-semibold text-gray-800 font-mono">${vnp_TransactionNo || 'N/A'}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-400 font-medium">Ngân hàng thanh toán:</span>
          <span class="font-bold text-gray-800 font-mono text-[11px] bg-white border border-gray-150 px-2 py-0.5 rounded">${vnp_BankCode || 'NCB'}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-400 font-medium">Số tiền giao dịch:</span>
          <span class="font-extrabold text-emerald-600 text-sm font-mono">${formatVND(displayAmount)}</span>
        </div>
        <div class="flex items-center justify-between pt-1 border-t border-rose-100/10">
          <span class="text-gray-400 font-medium">Thời gian thanh toán:</span>
          <span class="font-semibold text-gray-600">${displayDateStr || 'Trong ngày'}</span>
        </div>
      </div>

      <!-- Interactive Actions Navigation -->
      <div class="flex flex-col sm:flex-row gap-3 pt-4 w-full">
        <a href="/index.html" class="flex-1 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 active:scale-[0.98] transition cursor-pointer">
          🌸 Về trang chủ
        </a>
        <a href="/index.html?view=orders" class="flex-1 inline-flex items-center justify-center rounded-full border border-rose-200 bg-white px-5 py-3.5 text-xs font-bold text-rose-700 shadow-xs hover:bg-rose-50/50 active:scale-[0.98] transition cursor-pointer">
          📦 Xem đơn hàng
        </a>
      </div>

    </div>
  `;

  contentEl.classList.remove('hidden');
  setTimeout(() => {
    contentEl.classList.remove('scale-95', 'opacity-0');
    contentEl.classList.add('scale-100', 'opacity-100');
  }, 50);
}

// 3. BUILD ERROR INTERFACE DOM
function showErrorUI(errorMessage: string) {
  if (loadingEl) loadingEl.style.display = 'none';
  if (!contentEl) return;

  contentEl.innerHTML = `
    <div class="space-y-8 animate-fade-in text-center">
      
      <!-- Icon Failure header with warning indicators -->
      <div class="relative flex items-center justify-center">
        <div class="absolute w-20 h-20 rounded-full bg-rose-50 border border-rose-100 animate-pulse opacity-80"></div>
        <div class="relative w-16 h-16 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
          <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      </div>

      <div class="space-y-2">
        <h2 class="font-serif text-3xl font-bold text-slate-950 tracking-tight">Thanh Toán Thất Bại</h2>
        <p class="text-sm text-gray-500 leading-relaxed">Tiếc quá! Giao dịch của bạn thông qua <span class="font-semibold text-rose-500">VNPAY Sandbox</span> không thể thực hiện thành công.</p>
      </div>

      <!-- Descriptive error reason text -->
      <div class="bg-rose-50/50 rounded-2xl p-5 border border-rose-100 text-left space-y-1">
        <p class="text-[10.5px] uppercase font-bold tracking-wider text-rose-800">Chi tiết nguyên nhân:</p>
        <p class="text-[12.5px] leading-relaxed text-rose-950 font-medium italic">"${errorMessage}"</p>
      </div>

      <!-- Action options for recovery -->
      <div class="flex flex-col sm:flex-row gap-3 pt-4 w-full">
        <a href="/index.html?view=checkout" class="flex-1 inline-flex items-center justify-center rounded-full bg-rose-600 px-5 py-3.5 text-xs font-bold text-white shadow-md hover:bg-rose-700 active:scale-[0.98] transition cursor-pointer">
          🛒 Quay lại giỏ hàng
        </a>
        <a href="/index.html?view=checkout" class="flex-1 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3.5 text-xs font-bold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-[0.98] transition cursor-pointer">
          💳 Thanh toán lại
        </a>
      </div>

    </div>
  `;

  contentEl.classList.remove('hidden');
  setTimeout(() => {
    contentEl.classList.remove('scale-95', 'opacity-0');
    contentEl.classList.add('scale-100', 'opacity-100');
  }, 50);
}

// Kick off the processor on DOM load
window.addEventListener('DOMContentLoaded', handleVnpayReturnVerification);

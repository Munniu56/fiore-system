import emailjs from '@emailjs/browser';
import { Order } from './types';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

// Read parameters from user configuration or fallback to requested production keys
export const getEmailJSConfig = (): EmailJSConfig => {
  return {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qt6j7iz',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_7fo9udp',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'JQRh7NC5GOl4J9yB6',
  };
};

/**
 * Sends a single elegant automated email confirmation to the customer using EmailJS.
 */
export const sendEmailJSOrderPaid = async (
  order: Order,
  currentUser?: { name: string; phone: string; email: string } | null
): Promise<{ success: boolean; error?: string }> => {
  const config = getEmailJSConfig();

  // Determine standard payment method string as requested
  let mappedPaymentMethod = 'Thanh toán trực tiếp khi nhận hoa (COD)';
  if (order.paymentMethod === 'VISA') {
    mappedPaymentMethod = 'Thẻ quốc tế Visa';
  } else if (order.paymentMethod === 'VNPAY') {
    mappedPaymentMethod = 'VNPAY Sandbox';
  }

  // Format cart items beautifully for the customer
  const cartItemsText = order.items
    .map(
      (item) =>
        `- ${item.product.name} (x${item.quantity}) — ${item.product.price.toLocaleString(
          'vi-VN'
        )}đ`
    )
    .join('\n');

  // Format order total
  const orderTotalText = order.totalAmount.toLocaleString('vi-VN') + ' đ';

  // Map the exact 13 variables required by the template:
  const templateParams = {
    order_id: order.id,
    sender_name: currentUser ? currentUser.name : (order.recipientName || 'Khách hàng Fióre'),
    sender_phone: currentUser ? currentUser.phone : order.recipientPhone,
    sender_email: order.customerEmail || 'customer@fiore.vn',
    recipient_name: order.recipientName,
    recipient_phone: order.recipientPhone,
    recipient_address: order.shippingAddress,
    delivery_date: 'Giao hàng trong ngày (hoặc theo ghi chú)',
    delivery_time: 'Khung giờ linh hoạt (hoặc theo ghi chú)',
    card_message: order.note || 'Không có ghi chú thiệp',
    cart_items: cartItemsText,
    order_total: orderTotalText,
    payment_method: mappedPaymentMethod,
  };

  console.log('[Fióre EmailJS] Đang truyền các tham số gửi email xác nhận:', templateParams);

  try {
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );
    console.log('[Fióre EmailJS] Gửi email thành công!', response.status, response.text);
    return { success: true };
  } catch (error: any) {
    console.error('[Fióre EmailJS] Lỗi gửi email:', error);
    return {
      success: false,
      error: error?.text || error?.message || 'Không thể gửi email qua máy chủ EmailJS',
    };
  }
};

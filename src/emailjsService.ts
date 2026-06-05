import emailjs from '@emailjs/browser';
import { Order } from './types';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

// Read parameters from environment variables with fallback
export const getEmailJSConfig = (): EmailJSConfig => {
  return {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
  };
};

/**
 * Send an elegant automated email notification when an order is updated to Paid.
 * This utilizes EmailJS when configured, and supports a lovely simulation fallback
 * so the system can be fully evaluated/viewed without requiring initial setup keys.
 */
export const sendEmailJSOrderPaid = async (
  order: Order,
  recipientEmail: string
): Promise<{ success: boolean; simulated: boolean; error?: string }> => {
  const config = getEmailJSConfig();
  
  // Format items table for neat reading in email
  const itemsText = order.items
    .map(
      (item) =>
        `- ${item.product.name} (SL: ${item.quantity}) - Đơn giá: ${item.product.price.toLocaleString(
          'vi-VN'
        )}đ`
    )
    .join('\n');

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eaeaea;">
      <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 14px; text-align: left; color: #333333;">
        <strong>${item.product.name}</strong>
      </td>
      <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 14px; text-align: center; color: #333333;">
        ${item.quantity}
      </td>
      <td style="padding: 10px 0; font-family: Arial, sans-serif; font-size: 14px; text-align: right; color: #1F3D2B; font-weight: bold;">
        ${(item.product.price * item.quantity).toLocaleString('vi-VN')} đ
      </td>
    </tr>
  `
    )
    .join('');

  const totalStr = order.totalAmount.toLocaleString('vi-VN') + ' đ';
  const subTotalStr = order.items
    .reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0)
    .toLocaleString('vi-VN') + ' đ';

  // Build the template parameters exactly matching what a clean HTML-enabled EmailJS template would consume
  const templateParams = {
    to_email: recipientEmail,
    customer_name: order.customerName,
    recipient_name: order.recipientName,
    recipient_phone: order.recipientPhone,
    shipping_address: order.shippingAddress,
    order_id: order.id,
    payment_method: order.paymentMethod,
    note: order.note || 'Không có ghi chú',
    items_summary: itemsText,
    items_html: itemsHtml,
    subtotal: subTotalStr,
    shipping_fee: '30.000 đ',
    discount:
      order.totalAmount <
      order.items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0) + 30000
        ? '-50.000 đ'
        : '0 đ',
    total_amount: totalStr,
    created_at: new Date(order.createdAt).toLocaleString('vi-VN'),
  };

  // If EmailJS is NOT setup, run the simulation gracefully and inform the user
  if (!config.serviceId || !config.templateId || !config.publicKey) {
    console.log(
      '%c[Fióre EmailJS Simulation]',
      'color: #10b981; font-weight: bold; font-size: 12px;',
      'EmailJS chưa được cấu hình. Chạy chế độ giả thiết để gửi thư xác nhận thành công tới:',
      recipientEmail,
      templateParams
    );
    return {
      success: true,
      simulated: true,
    };
  }

  try {
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );
    console.log('Gửi email qua EmailJS thành công!', response.status, response.text);
    return {
      success: true,
      simulated: false,
    };
  } catch (error: any) {
    console.error('EmailJS Error:', error);
    return {
      success: false,
      simulated: false,
      error: error?.text || error?.message || 'Có lỗi xảy ra khi liên kết máy chủ EmailJS',
    };
  }
};

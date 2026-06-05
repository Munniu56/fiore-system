import emailjs from '@emailjs/browser';
import { Order } from './types';

export interface EmailJSConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
}

export const getEmailJSConfig = (): EmailJSConfig => {
  return {
    serviceId:
      import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_qt6j7iz',

    templateId:
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_7fo9udp',

    publicKey:
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'JQRh7NC5GOl4J9yB6',
  };
};

export const sendEmailJSOrderPaid = async (
  order: Order,
  currentUser?: {
    name: string;
    phone: string;
    email: string;
  } | null
): Promise<{ success: boolean; error?: string }> => {
  console.log('[EmailJS] sendEmailJSOrderPaid được gọi');

  const config = getEmailJSConfig();

  let mappedPaymentMethod = 'Thanh toán trực tiếp khi nhận hoa (COD)';

  if (order.paymentMethod === 'VISA') {
    mappedPaymentMethod = 'Thẻ quốc tế Visa';
  } else if (order.paymentMethod === 'VNPAY') {
    mappedPaymentMethod = 'VNPAY Sandbox';
  }

  const cartItemsText = order.items
    .map(
      (item) =>
        `• ${item.product.name} x${item.quantity} - ${item.product.price.toLocaleString(
          'vi-VN'
        )}đ`
    )
    .join('\n');

  const orderTotalText =
    order.totalAmount.toLocaleString('vi-VN') + ' đ';

  const customerEmail =
    order.customerEmail ||
    currentUser?.email ||
    '';

  const templateParams = {
    customer_name:
      currentUser?.name ||
      order.recipientName ||
      'Khách hàng',

    order_id: order.id,

    receiver_name:
      order.recipientName,

    receiver_phone:
      order.recipientPhone,

    shipping_address:
      order.shippingAddress,

    payment_method:
      mappedPaymentMethod,

    order_items:
      cartItemsText,

    note:
      order.note ||
      'Không có lời nhắn',

    total_price:
      orderTotalText,

    to_email:
      customerEmail,
  };

  console.log(
    '[EmailJS] Config:',
    config
  );

  console.log(
    '[EmailJS] Customer email:',
    customerEmail
  );

  console.log(
    '[EmailJS] Template params:',
    templateParams
  );

  if (!customerEmail) {
    console.error(
      '[EmailJS] Không tìm thấy email khách hàng'
    );

    return {
      success: false,
      error: 'Không tìm thấy email khách hàng',
    };
  }

  try {
    const response = await emailjs.send(
      config.serviceId,
      config.templateId,
      templateParams,
      config.publicKey
    );

    console.log(
      '[EmailJS] Gửi email thành công',
      response
    );

    return {
      success: true,
    };
  } catch (error: any) {
    console.error(
      '[EmailJS ERROR]',
      error
    );

    return {
      success: false,
      error:
        error?.text ||
        error?.message ||
        'Không thể gửi email',
    };
  }
};
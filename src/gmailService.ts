/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, app } from './firebase';
import { Order } from './types';

const provider = new GoogleAuthProvider();
// Request the Gmail scopes that we configured
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');

// Use in-memory variable to track if signing in
let isSigningIn = false;
let cachedAccessToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('fiore_gmail_access_token') : null;
let cachedUser: FirebaseUser | null = null;

// Listeners to update UI of status changes
const listeners: ((user: FirebaseUser | null, token: string | null) => void)[] = [];

export const subscribeToGmailAuth = (callback: (user: FirebaseUser | null, token: string | null) => void) => {
  listeners.push(callback);
  // Immediate trigger of existing cached state
  callback(cachedUser, cachedAccessToken);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach(cb => cb(cachedUser, cachedAccessToken));
};

export const handleUnauthorized = () => {
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fiore_gmail_access_token');
  }
  notifyListeners();
};

// Initialize auth listener
export const initGmailAuth = () => {
  return onAuthStateChanged(auth, async (user) => {
    cachedUser = user;
    if (!user) {
      cachedAccessToken = null;
    }
    notifyListeners();
  });
};

export const googleSignIn = async () => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Không lấy được Token truy cập Google OAuth.');
    }
    cachedAccessToken = credential.accessToken;
    if (typeof window !== 'undefined') {
      localStorage.setItem('fiore_gmail_access_token', credential.accessToken);
    }
    cachedUser = result.user;
    notifyListeners();
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (err) {
    console.error('Đăng nhập Google thất bại:', err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fiore_gmail_access_token');
  }
  cachedUser = null;
  notifyListeners();
};

export const getGmailAccessToken = () => {
  return cachedAccessToken;
};

// Simple base64url encoder supporting Unicode (UTF-8) characters safely
function base64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binString = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends order confirmation email via Gmail REST API
 */
export const sendOrderNotificationEmail = async (order: Order, recipientEmail: string): Promise<boolean> => {
  if (!cachedAccessToken) {
    console.error('Không tìm thấy Access Token Gmail. Cần đăng nhập bằng Google.');
    return false;
  }

  try {
    const fromName = "Fiore Boutique de Fleurs";
    const subject = `[Fióre] Xác nhận đơn hàng #${order.id} - Cảm ơn quý khách!`;
    
    // Nice elegant HTML message
    const orderItemsHTML = order.items.map(item => `
      <tr style="border-bottom: 1px solid #f1f1f1;">
        <td style="padding: 12px 0; font-family: sans-serif; font-size: 14px; text-align: left; color: #333333;">
          <strong>${item.product.name}</strong><br/>
          <span style="font-size: 12px; color: #777;">${item.product.shortDesc || ''}</span>
        </td>
        <td style="padding: 12px 0; font-family: sans-serif; font-size: 14px; text-align: center; color: #333333;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; font-family: sans-serif; font-size: 14px; text-align: right; color: #333333; font-weight: bold;">
          ${(item.product.price * item.quantity).toLocaleString('vi-VN')} đ
        </td>
      </tr>
    `).join('');

    const formattedTotal = order.totalAmount.toLocaleString('vi-VN');

    const htmlBody = `
      <div style="background-color: #f9f9f9; padding: 30px 15px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: 1px solid #eef2ee;">
          
          <!-- Banner Header -->
          <div style="background-color: #1F3D2B; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; font-family: Georgia, serif; font-size: 32px; margin: 0; letter-spacing: 2px;">Fióre</h1>
            <p style="color: #C8A96B; font-size: 10px; font-family: sans-serif; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 5px 0 0 0;">Boutique de Fleurs</p>
          </div>

          <!-- Body -->
          <div style="padding: 30px; line-height: 1.6; color: #444444;">
            <h2 style="font-family: Georgia, serif; font-size: 20px; color: #1F3D2B; margin-top: 0;">Chào bạn ${order.customerName},</h2>
            <p style="font-size: 15px; margin-bottom: 20px;">
              Cảm ơn bạn đã lựa chọn những đóa hoa tươi thắm từ <strong>Fióre Boutique de Fleurs</strong>. Chúng tôi rất hân hạnh được đồng hành truyền tải trọn vẹn thông điệp yêu thương của bạn.
            </p>

            <!-- Order Details Box -->
            <div style="background-color: #fbf9f6; border-left: 4px solid #C8A96B; padding: 15px 20px; border-radius: 4px; margin-bottom: 25px;">
              <h3 style="font-family: sans-serif; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #1F3D2B; margin: 0 0 10px 0;">Thông tin đơn hàng #${order.id}</h3>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Người nhận:</strong> ${order.recipientName}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Số điện thoại:</strong> ${order.recipientPhone}</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Địa chỉ giao:</strong> ${order.shippingAddress}</p>
              ${order.note ? `<p style="margin: 3px 0; font-size: 13px; font-style: italic; color: #7c5c1d;"><strong>Lời chúc trên thiệp:</strong> "${order.note}"</p>` : ''}
              <p style="margin: 3px 0; font-size: 13px;"><strong>Phương thức thanh toán:</strong> ${order.paymentMethod} (${order.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chờ thanh toán'})</p>
              <p style="margin: 3px 0; font-size: 13px;"><strong>Thời gian đặt hàng:</strong> ${new Date(order.createdAt).toLocaleString('vi-VN')}</p>
            </div>

            <!-- Items Table -->
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <thead>
                <tr style="border-bottom: 2px solid #1F3D2B;">
                  <th style="padding: 8px 0; text-align: left; font-family: sans-serif; font-size: 13px; text-transform: uppercase; color: #1F3D2B;">Sản phẩm</th>
                  <th style="padding: 8px 0; text-align: center; font-family: sans-serif; font-size: 13px; text-transform: uppercase; color: #1F3D2B; width: 60px;">SL</th>
                  <th style="padding: 8px 0; text-align: right; font-family: sans-serif; font-size: 13px; text-transform: uppercase; color: #1F3D2B; width: 100px;">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHTML}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px 0 5px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #555;">Tạm tính:</td>
                  <td style="padding: 15px 0 5px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #555;">${order.items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0).toLocaleString('vi-VN')} đ</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 5px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #555;">Phí vận chuyển:</td>
                  <td style="padding: 5px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #555;">30.000 đ</td>
                </tr>
                ${order.totalAmount < order.items.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0) + 30000 ? `
                <tr>
                  <td colspan="2" style="padding: 5px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #e51c23;">Giảm giá thân thiết:</td>
                  <td style="padding: 5px 0; text-align: right; font-family: sans-serif; font-size: 14px; color: #e51c23;">-50.000 đ</td>
                </tr>
                ` : ''}
                <tr style="border-top: 1px solid #1F3D2B;">
                  <td colspan="2" style="padding: 15px 0; text-align: right; font-family: sans-serif; font-size: 16px; font-weight: bold; color: #1F3D2B;">Tổng cộng:</td>
                  <td style="padding: 15px 0; text-align: right; font-family: sans-serif; font-size: 18px; font-weight: bold; color: #1F3D2B;">${formattedTotal} đ</td>
                </tr>
              </tbody>
            </table>

            <!-- Support footer -->
            <div style="border-top: 1px solid #eeeeee; padding-top: 20px; text-align: center; font-size: 12px; color: #888888; font-family: sans-serif;">
              <p style="margin: 5px 0;">Nếu quý khách có bất kỳ thắc mắc nào, vui lòng liên hệ qua hotline hoặc trực tiếp reply email này.</p>
              <p style="margin: 5px 0; color: #1F3D2B; font-weight: bold;">Fióre - Trao hoa tươi, Gửi vạn lời yêu mến.</p>
            </div>

          </div>

          <!-- Footer bottom -->
          <div style="background-color: #fbfbfb; padding: 20px; text-align: center; border-top: 1px solid #f1f1f1; font-size: 11px; color: #999999;">
            <p style="margin: 0;">&copy; 2026 Fióre Boutique de Fleurs. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">Hà Nội &bull; TP. Hồ Chí Minh &bull; Việt Nam</p>
          </div>

        </div>
      </div>
    `;

    const rfc2822Parts = [
      `From: "${fromName}" <${cachedUser?.email || 'me'}>`,
      `To: ${recipientEmail}`,
      `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      `Content-Transfer-Encoding: 7bit`,
      ``,
      htmlBody
    ];

    const messageString = rfc2822Parts.join('\n');
    const rawBase64 = base64urlEncode(messageString);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        raw: rawBase64
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
        console.warn('Phiên đăng nhập Gmail (Google Access Token) đã hết hạn. Đã tự động đăng xuất và xóa cache token. Xin hãy đăng nhập lại bằng Google để tiếp tục.');
      } else {
        const errTxt = await response.text();
        console.warn('Không thể gửi thư qua Gmail API:', errTxt);
      }
      return false;
    }

    console.log('Gửi email xác nhận đơn hàng thành công qua Gmail API!');
    return true;
  } catch (error) {
    console.error('Lỗi trong sendOrderNotificationEmail:', error);
    return false;
  }
};

/**
 * Lists the user's sent / incoming flow messages search subject:Fióre
 */
export const fetchRecentGmailLogs = async () => {
  if (!cachedAccessToken) return [];

  try {
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=Fióre', {
      headers: {
        'Authorization': `Bearer ${cachedAccessToken}`
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
        console.warn('Phiên đăng nhập Gmail đã hết hạn. Đã tự động giải phóng cấu hình.');
      } else {
        const errText = await response.text();
        console.warn('Không thể tải nhật ký thư từ Gmail API:', errText);
      }
      return [];
    }

    const listData = await response.json();
    if (!listData.messages || listData.messages.length === 0) {
      return [];
    }

    // Fetch details for each message
    const details = await Promise.all(
      listData.messages.map(async (msg: any) => {
        const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=To&metadataHeaders=From&metadataHeaders=Date`, {
          headers: {
            'Authorization': `Bearer ${cachedAccessToken}`
          }
        });
        if (!detailRes.ok) return null;
        return detailRes.json();
      })
    );

    return details.filter(d => d !== null).map((d: any) => {
      const subjectHeader = d.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'subject');
      const toHeader = d.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'to');
      const fromHeader = d.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'from');
      const dateHeader = d.payload?.headers?.find((h: any) => h.name.toLowerCase() === 'date');
      return {
        id: d.id,
        snippet: d.snippet || '',
        subject: subjectHeader ? subjectHeader.value : '(Không có tiêu đề)',
        to: toHeader ? toHeader.value : 'Người nhận',
        from: fromHeader ? fromHeader.value : 'Tôi',
        date: dateHeader ? dateHeader.value : '',
        labelIds: d.labelIds || []
      };
    });
  } catch (error) {
    console.error('Lỗi fetchRecentGmailLogs:', error);
    return [];
  }
};

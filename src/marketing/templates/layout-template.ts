/**
 * layout-template.ts
 * 
 * Only contains common high-end boutique florist layout components:
 * - Header with Fióre logo and sage gradient
 * - Content wrapping logic (Page background #FAF7F2, border-radius 12px)
 * - Footer with brand info and contact details
 * - CTA button rendering helper
 * - Unsubscribe section
 */

export interface EmailProduct {
  name: string;
  price: number;
  shortDesc: string;
  imageUrl: string;
}

/**
 * Resolves static or relative image URLs to final production app URL.
 */
export function resolveImageUrl(url: string, appUrl: string): string {
  if (url.startsWith("http")) {
    return url;
  }
  let cleanUrl = url;
  if (cleanUrl.startsWith("src/")) {
    cleanUrl = cleanUrl.substring(4);
  }
  if (cleanUrl.startsWith("/")) {
    cleanUrl = cleanUrl.substring(1);
  }
  const base = appUrl.endsWith("/") ? appUrl : `${appUrl}/`;
  return `${base}${cleanUrl}`;
}

export function formatPrice(price: number): string {
  try {
    return price.toLocaleString("vi-VN") + "đ";
  } catch (e) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
  }
}

/**
 * Generates the CTA button (form tròn, bo góc)
 */
export function generateCtaButtonHtml(appUrl: string): string {
  return `
    <!-- CTA Button (Nút bo tròn) -->
    <div style="text-align: center; margin: 35px 0 15px 0;">
      <a href="${appUrl}" target="_blank" class="btn-cta-rounded" style="display: inline-block; padding: 16px 45px; background-color: #52796F; color: #ffffff !important; font-size: 14px; font-weight: bold; text-transform: uppercase; text-decoration: none; letter-spacing: 2.5px; border-radius: 999px; box-shadow: 0 4px 12px rgba(82, 121, 111, 0.2); transition: all 0.3s ease;">
        ĐẶT HOA NGAY
      </a>
    </div>
  `;
}

/**
 * Generates the 2-4 product grid cards beautifully with border-radius 12px.
 */
export function generateProductGridHtml(products: EmailProduct[], appUrl: string): string {
  if (!products || products.length === 0) {
    return "";
  }

  let html = `
    <!-- Product Grid Header -->
    <div style="text-align: center; margin-top: 35px; margin-bottom: 25px;">
      <div style="height: 1px; background-color: #E2EFE0; width: 60px; margin: 0 auto 15px auto;"></div>
      <h3 style="font-family: Georgia, serif; color: #2F3E36; font-size: 16px; font-weight: normal; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px;">
        🌸 Tuyệt Tác Thiết Kế Fióre
      </h3>
      <p style="font-size: 11px; color: #84A98C; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Sản phẩm nghệ thuật độc quyền giới hạn</p>
    </div>

    <!-- Product Grid Table (Giao diện Bo Góc 12px) -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
  `;

  for (let i = 0; i < products.length; i += 2) {
    html += `<tr>`;
    
    // Column 1
    const p1 = products[i];
    html += `
      <td class="col-stack col-padded" width="50%" valign="top" style="padding: 10px 8px;">
        <div style="background-color: #fafcf9; border: 1px solid #E2EFE0; border-radius: 12px; overflow: hidden; height: 100%; box-shadow: 0 4px 10px rgba(0,0,0,0.01);">
          <!-- Product Image (Bo góc phía trên 12px) -->
          <div style="display: block; overflow: hidden; height: 170px; border-top-left-radius: 11px; border-top-right-radius: 11px;">
            <img src="${resolveImageUrl(p1.imageUrl, appUrl)}" alt="${p1.name}" width="100%" height="170" style="width: 100%; height: 170px; object-fit: cover; display: block; border: 0;" referrerPolicy="no-referrer">
          </div>
          <!-- Product Info -->
          <div style="padding: 15px; text-align: left;">
            <h4 style="font-family: Georgia, serif; font-size: 14px; font-weight: bold; color: #2F3E36; margin: 0 0 6px 0; line-height: 1.4; height: 38px; overflow: hidden;">${p1.name}</h4>
            <p style="font-size: 12px; color: #5F5E5C; line-height: 1.5; margin: 0 0 12px 0; height: 50px; overflow: hidden;">${p1.shortDesc}</p>
            <div style="font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 13.5px; font-weight: bold; color: #52796F; border-top: 1px solid #FAF7F2; padding-top: 12px; margin-top: 5px; margin-bottom: 12px;">
              ${formatPrice(p1.price)}
            </div>
            <!-- Nút Đặt hoa ngay dưới mỗi sản phẩm -->
            <div style="text-align: center;">
              <a href="${appUrl}" target="_blank" style="display: block; padding: 10px 15px; background-color: #52796F; color: #ffffff !important; font-size: 11px; font-weight: bold; text-transform: uppercase; text-decoration: none; letter-spacing: 1.5px; border-radius: 6px; box-shadow: 0 2px 5px rgba(82, 121, 111, 0.15);">
                ĐẶT HOA NGAY
              </a>
            </div>
          </div>
        </div>
      </td>
    `;
    
    // Column 2
    if (i + 1 < products.length) {
      const p2 = products[i+1];
      html += `
        <td class="col-stack col-padded" width="50%" valign="top" style="padding: 10px 8px;">
          <div style="background-color: #fafcf9; border: 1px solid #E2EFE0; border-radius: 12px; overflow: hidden; height: 100%; box-shadow: 0 4px 10px rgba(0,0,0,0.01);">
            <!-- Product Image (Bo góc phía trên 12px) -->
            <div style="display: block; overflow: hidden; height: 170px; border-top-left-radius: 11px; border-top-right-radius: 11px;">
              <img src="${resolveImageUrl(p2.imageUrl, appUrl)}" alt="${p2.name}" width="100%" height="170" style="width: 100%; height: 170px; object-fit: cover; display: block; border: 0;" referrerPolicy="no-referrer">
            </div>
            <!-- Product Info -->
            <div style="padding: 15px; text-align: left;">
              <h4 style="font-family: Georgia, serif; font-size: 14px; font-weight: bold; color: #2F3E36; margin: 0 0 6px 0; line-height: 1.4; height: 38px; overflow: hidden;">${p2.name}</h4>
              <p style="font-size: 12px; color: #5F5E5C; line-height: 1.5; margin: 0 0 12px 0; height: 50px; overflow: hidden;">${p2.shortDesc}</p>
              <div style="font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 13.5px; font-weight: bold; color: #52796F; border-top: 1px solid #FAF7F2; padding-top: 12px; margin-top: 5px; margin-bottom: 12px;">
                ${formatPrice(p2.price)}
              </div>
              <!-- Nút Đặt hoa ngay dưới mỗi sản phẩm -->
              <div style="text-align: center;">
                <a href="${appUrl}" target="_blank" style="display: block; padding: 10px 15px; background-color: #52796F; color: #ffffff !important; font-size: 11px; font-weight: bold; text-transform: uppercase; text-decoration: none; letter-spacing: 1.5px; border-radius: 6px; box-shadow: 0 2px 5px rgba(82, 121, 111, 0.15);">
                  ĐẶT HOA NGAY
                </a>
              </div>
            </div>
          </div>
        </td>
      `;
    } else {
      html += `<td class="col-stack-empty" width="50%" style="padding: 10px 8px;"></td>`;
    }

    html += `</tr>`;
  }

  html += `</table>`;
  return html;
}

/**
 * 5. Mã giảm giá Early Bird (Early Bird Coupon Block)
 */
export function generateCouponBlockHtml(code: string, title: string, discount: string, limit: string): string {
  return `
    <!-- Early Bird Coupon Box -->
    <div style="background-color: #FAF7F2; border: 1.5px dashed #84A98C; border-radius: 12px; padding: 25px 20px; text-align: center; margin: 35px 0; box-sizing: border-box;">
      <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #52796F; font-weight: bold; display: block; margin-bottom: 5px;">👑 Early-Bird Đặc Quyền</span>
      <h3 style="font-family: Georgia, serif; font-size: 17px; color: #2F3E36; margin: 0 0 10px 0; font-weight: normal; letter-spacing: 0.5px;">${title}</h3>
      <div style="margin: 15px 0;">
        <span style="border: 1px solid #84A98C; padding: 8px 18px; border-radius: 6px; background-color: #ffffff; letter-spacing: 2px; font-family: monospace; font-size: 18px; color: #52796F; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">${code}</span>
      </div>
      <p style="font-size: 13px; font-weight: bold; color: #52796F; margin: 5px 0 0px 0; text-transform: uppercase; letter-spacing: 1px;">${discount}</p>
      <p style="font-size: 12px; color: #5F5E5C; margin: 6px 0 0 0; font-style: italic; line-height: 1.4;">* ${limit}</p>
    </div>
  `;
}

/**
 * Wraps custom email body into the newly requested Fióre Boutique Florist layout.
 */
export function wrapInFioreBrandLayout(
  email: string,
  contentHtml: string,
  preheader: string,
  bannerUrl?: string
): string {
  const appUrl = process.env.APP_URL || "https://fi-o-re.vercel.app/";
  const unsubscribeUrl = `https://fi-o-re.vercel.app/api/marketing/unsubscribe?email=${encodeURIComponent(email)}`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fióre Boutique Florist</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF7F2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #EAE6DF;
      border-radius: 12px;
      overflow: hidden;
    }
    .preheader {
      display: none;
      font-size: 1px;
      color: #FAF7F2;
      line-height: 1px;
      max-height: 0px;
      max-width: 0px;
      opacity: 0;
      overflow: hidden;
    }
    .header-gradient {
      background: linear-gradient(135deg, #52796F 0%, #354F52 100%);
      padding: 45px 25px;
      text-align: center;
      border-top-left-radius: 12px;
      border-top-right-radius: 12px;
    }
    .logo-text {
      font-family: 'Playfair Display', Georgia, Garamond, serif;
      font-size: 32px;
      font-weight: 300;
      letter-spacing: 8px;
      color: #FFFFFF;
      text-transform: uppercase;
      text-decoration: none;
      margin: 0;
      display: inline-block;
    }
    .logo-sub {
      font-size: 11px;
      letter-spacing: 5px;
      color: #E2EFE0;
      text-transform: uppercase;
      margin-top: 10px;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }
    .content-body {
      padding: 40px 30px;
      background-color: #ffffff;
      color: #3F3E3C;
      font-size: 15px;
      line-height: 1.8;
    }
    .btn-cta-rounded {
      display: inline-block;
      padding: 16px 45px;
      background-color: #52796F;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: none;
      letter-spacing: 2.5px;
      border-radius: 999px;
      margin: 30px auto 10px auto;
      text-align: center;
      box-shadow: 0 4px 12px rgba(82, 121, 111, 0.2);
    }
    .footer {
      background-color: #2F3E36;
      color: #FAF7F2;
      padding: 40px 30px;
      text-align: center;
      font-size: 11px;
      line-height: 1.6;
    }
    .footer-title {
      font-family: Georgia, serif;
      font-size: 14px;
      color: #FAF7F2;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .footer-divider {
      height: 1px;
      background-color: rgba(250, 247, 242, 0.15);
      margin: 25px auto;
      width: 80%;
    }
    .unsubscribe-text {
      color: rgba(250, 247, 242, 0.5);
      font-size: 10.5px;
      margin-top: 15px;
    }
    .col-stack {
      display: table-cell;
    }
    @media screen and (max-width: 580px) {
      .col-stack {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      .col-padded {
        padding: 8px 0 !important;
      }
    }
  </style>
</head>
<body style="background-color: #FAF7F2; padding: 20px 0; margin: 0;">
  <span class="preheader">${preheader}</span>
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF7F2; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Main Email Card (Bo góc 12px) -->
        <div class="email-container" style="background-color: #ffffff; border: 1px solid #EAE6DF; border-radius: 12px; overflow: hidden; max-width: 600px; width: 100%; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          
          <!-- Header thương hiệu (Brand Header, Gradient xanh sage & Fióre logo) -->
          <div class="header-gradient" style="background: linear-gradient(135deg, #52796F 0%, #354F52 100%); padding: 45px 25px; text-align: center; border-top-left-radius: 12px; border-top-right-radius: 12px;">
            <a href="${appUrl}" target="_blank" class="logo-text" style="font-family: 'Playfair Display', Georgia, serif; font-size: 32px; font-weight: 300; letter-spacing: 8px; color: #FFFFFF; text-transform: uppercase; text-decoration: none; display: inline-block;">F i ó r e</a>
            <div class="logo-sub" style="font-size: 11px; letter-spacing: 5px; color: #E2EFE0; text-transform: uppercase; margin-top: 10px;">Boutique Florist</div>
          </div>

          <!-- Banner chiến dịch (Banner campaign) -->
          ${bannerUrl ? `
          <div style="display: block; overflow: hidden; width: 100%; max-height: 240px;">
            <a href="${appUrl}" target="_blank" style="display: block; border: 0;">
              <img src="${resolveImageUrl(bannerUrl, appUrl)}" alt="Campaign Banner" width="100%" style="width: 100%; display: block; border: 0; object-fit: cover; max-height: 240px;" referrerPolicy="no-referrer">
            </a>
          </div>
          ` : ""}
          
          <!-- Content Body -->
          <div class="content-body" style="padding: 40px 30px; background-color: #ffffff;">
            ${contentHtml}
          </div>

          <!-- Thông tin liên hệ -->
          <div class="footer" style="background-color: #2F3E36; color: #FAF7F2; padding: 40px 30px; text-align: center; font-size: 11px; line-height: 1.6;">
            <div class="footer-title" style="font-family: Georgia, serif; font-size: 14px; color: #FAF7F2; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">Fióre Boutique Florist</div>
            <div style="color: rgba(250, 247, 242, 0.7); max-width: 440px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-size: 12px; line-height: 1.7;">
              Giao hoa tươi nghệ thuật &amp; dịch vụ thiết kế uy tín hàng đầu.<br>
              <strong style="color: #FAF7F2;">Showroom:</strong> 34 Trần Thái Tông, Thuận Hoá, Thành phố Huế.<br>
              <strong style="color: #FAF7F2;">Hotline:</strong> 0916044683 | <strong style="color: #FAF7F2;">Email:</strong> thuyvanngo35@gmail.com
            </div>
            
            <!-- Footer & Unsubscribe link -->
            <div class="footer-divider" style="height: 1px; background-color: rgba(250, 247, 242, 0.15); margin: 25px auto; width: 80%;"></div>

            <div style="font-size: 11px; color: rgba(250, 247, 242, 0.6); line-height: 1.6;">
              Email này được tự động gửi đến thành viên <strong style="color: #FAF7F2;">${email}</strong> theo yêu cầu nhận thông tin ưu đãi từ Fióre.<br>
              Để dừng nhận tin, quý khách có thể hủy đăng ký bất cứ lúc nào.
            </div>
            <div class="unsubscribe-text" style="color: rgba(250, 247, 242, 0.5); font-size: 11px; margin-top: 15px;">
              <a href="${unsubscribeUrl}" target="_blank" class="unsubscribe-link" style="color: #84A98C; text-decoration: none;">Hủy đăng ký nhận tin tại đây (Unsubscribe)</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

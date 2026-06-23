import {
  EmailProduct,
  generateProductGridHtml,
  generateCouponBlockHtml,
  generateCtaButtonHtml,
  wrapInFioreBrandLayout,
  resolveImageUrl,
  formatPrice,
} from "./layout-template";

export const womenVietnamBannerUrl = "https://nhahoa.com.vn/wp-content/uploads/2021/04/background-nha-hoa-gui-trao-cam-xuc_optimized.png";

export const womenVietnamProducts: EmailProduct[] = [
  {
    name: "Sắc Hồng Yêu Thương",
    price: 650000,
    shortDesc: "Sự kết hợp tinh tế tuyệt hảo giữa đóa hồng sen và thạch thảo dạt dào kính ý.",
    imageUrl: "src/assets/images/birthday_flower_4_1780802992378.png",
  },
  {
    name: "Hương Sen Tinh Khiết",
    price: 950000,
    shortDesc: "Bình gốm thủ công cắm hoa sen hồng ngát hương mang vẻ trang nhã thuần khiết.",
    imageUrl: "src/assets/images/lotus_roses_basket_1780803336996.png",
  },
  {
    name: "Bó Hoa Cát Tường Fióre Thượng Hạng",
    price: 890000,
    shortDesc: "Tuyển lựa hoa cát tường hồng phối mộc thô gửi trọn lành bình yên an khang.",
    imageUrl: "src/assets/images/pink_white_roses_bouquet_1780802619397.png",
  },
  {
    name: "Bó Hồng Juliet Kiêu Sa",
    price: 680000,
    shortDesc: "Hồng nhung đỏ rực rỡ tượng trưng tình trao yêu thương bền lâu vĩnh cửu.",
    imageUrl: "src/assets/images/heart_red_roses_bouquet_1780802636263.png",
  },
];

export function getWomenVietnamTemplate(
  recipientEmail: string,
  recipientName: string,
  gender: "Nam" | "Nữ" | "Chưa cung cấp"
): { subject: string; html: string } {
  const appUrl = process.env.APP_URL || "https://fi-o-re.vercel.app/";
  const greeting = recipientName && recipientName !== "Quý khách nhận tin" ? `Kính gửi anh/chị ${recipientName}` : "Kính chào Quý khách quý";

  const subject = "💝 Gửi Trọn Tôn Vinh: Ngày Phụ Nữ Việt Nam 20/10 cùng Fióre";
  const preheader = "Chào mừng 20/10 với bộ sưu tập hoa nghệ thuật độc quyền cao cấp dành riêng cho những đoá hoa rạng ngời.";

  const p1 = womenVietnamProducts[0];
  const p2 = womenVietnamProducts[1];

  const contentHtml = `

<h2 style="color:#2D3A2E;margin-top:0;font-size:20px;font-family:Georgia,serif;">
          Sắp Đến Ngày Phụ Nữ Việt Nam 20/10 Rồi Bạn Ơi! 🌷
        </h2>

        <p style="color:#4A5568;line-height:1.7;">${greeting},</p>

        <p style="color:#4A5568;line-height:1.7;">
          Chỉ còn vài ngày nữa là đến <strong>Ngày Phụ Nữ Việt Nam 20/10</strong>. Đây là dịp để gửi những lời yêu
          thương, sự quan tâm và lòng biết ơn đến những người phụ nữ tuyệt vời trong cuộc sống của chúng ta.
        </p>

        <p style="color:#4A5568;line-height:1.7;">
          Fióre Boutique Florist đã chuẩn bị bộ sưu tập hoa 20/10 with những thiết kế sang trọng, tinh tế và đầy cảm xúc
          để giúp bạn trao gửi yêu thương một cách trọn vẹn nhất.
        </p>

        <div
          style="
      background:white;
      border-radius:10px;
      padding:24px;
      margin:24px 0;
      border-left:4px solid #52796F;
    "
        >
          <h3
            style="
        color:#52796F;
        margin-top:0;
        font-size:14px;
        text-transform:uppercase;
        letter-spacing:1px;
        padding-bottom:12px;
        border-bottom:1px solid #E5E7EB;
      "
          >
            Bộ Sưu Tập Hoa 20/10
          </h3>

          <div style="text-align: center; margin-top: 35px; margin-bottom: 25px;">
      <div style="height: 1px; background-color: #E2EFE0; width: 60px; margin: 0 auto 15px auto;"></div>
      <h3 style="font-family: Georgia, serif; color: #2F3E36; font-size: 16px; font-weight: normal; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: 2px;">
        🌸 Tuyệt Tác Thiết Kế Fióre
      </h3>
      <p style="font-size: 11px; color: #84A98C; text-transform: uppercase; letter-spacing: 1px; margin: 0;">Sản phẩm nghệ thuật độc quyền giới hạn</p>
    </div>

    <!-- Product Grid Table (Giao diện Bo Góc 12px) -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
  <tr>
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
    </tr>
  </table>
          <div
  style="
    margin-top:15px;
    padding:18px;
    border:2px dashed #84A98C;
    border-radius:10px;
    text-align:center;
    background:#F8FAF8;
  "
>
  <p
    style="
      margin:0;
      font-weight:bold;
      color:#2D3A2E;
      font-size:16px;
    "
  >
    🎁 ƯU ĐÃI ĐẶT SỚM DÀNH RIÊNG CHO 20/10
  </p>

  <p
    style="
      margin:10px 0;
      color:#52796F;
      font-size:15px;
    "
  >
    Mã ưu đãi:
  </p>

  <div
    style="
      display:inline-block;
      background:#52796F;
      color:white;
      padding:8px 18px;
      border-radius:6px;
      font-weight:bold;
      letter-spacing:1px;
      margin-bottom:10px;
    "
  >
    VIETWOMEN20
  </div>

  <p
    style="
      margin:0;
      color:#4A5568;
      font-size:14px;
      line-height:1.6;
    "
  >
    Giảm ngay <strong>15%</strong> tổng hóa đơn cho các đơn hàng đặt trước ngày <strong>15/10</strong>.
  </p>
</div>


        <div
          style="
      background:#F3F4F6;
      border-radius:8px;
      padding:16px;
      margin-top:24px;
      text-align:center;
    "
        >
          
          <p style="margin:0;color:#4B5563;font-size:13px;">Bạn cần tư vấn chọn hoa theo ngân sách?</p>

          <p
            style="
  margin:6px 0 0;
  color:#52796F;
  font-weight:bold;
  font-size:16px;
"
          >
            📞 0916 044 683
          </p>
        </div>

        <p
          style="
      text-align:center;
      font-size:13px;
      color:#84A98C;
      margin-top:20px;
      font-style:italic;
    "
        >
          Những đóa hoa đẹp nhất luôn là cầu nối cho những lời yêu thương chân thành nhất.
        </p>
        
      </div>

      <p
        style="
    text-align:center;
    font-size:13px;
    color:#84A98C;
    margin-top:20px;
    font-style:italic;
  "
      >
        Một bó hoa đẹp không chỉ là món quà mà còn là lời cảm ơn chân thành nhất dành cho những người phụ nữ yêu thương
        trong cuộc đời bạn.
      </p>
`;

  return {
    subject,
    html: wrapInFioreBrandLayout(recipientEmail, contentHtml, preheader, womenVietnamBannerUrl),
  };
}

import {
  EmailProduct,
  generateProductGridHtml,
  generateCouponBlockHtml,
  generateCtaButtonHtml,
  wrapInFioreBrandLayout,
} from "./layout-template";

export const valentineBannerUrl = "https://nhahoa.com.vn/wp-content/uploads/2021/04/background-nha-hoa-gui-trao-cam-xuc_optimized.png";

export const valentineProducts: EmailProduct[] = [
  {
    name: "Bó Hồng Juliet Kiêu Sa",
    price: 680000,
    shortDesc: "Bó hoa gồm 18 đóa hồng nhung Juliet nhập khẩu phối lá bạc sang trọng.",
    imageUrl: "src/assets/images/heart_red_roses_bouquet_1780802636263.png",
  },
  {
    name: "Bó Hoa Cát Tường Fióre Thượng Hạng",
    price: 890000,
    shortDesc: "Bó hoa tươi nghệ thuật phối sắc hồng dâu và cát tường dịu dịu quý sắc.",
    imageUrl: "src/assets/images/pink_white_roses_bouquet_1780802619397.png",
  },
  {
    name: "Mây Hồng Thơ Mộng",
    price: 590000,
    shortDesc: "Sự nhịp nhàng giữa hoa hồng kem pastel ngọt ngào và cẩm tú cầu hồng bồng bềnh.",
    imageUrl: "src/assets/images/pink_roses_single_red_center_1780802659012.png",
  },
  {
    name: "Love Forever",
    price: 1200000,
    shortDesc: "Gồm 50 đoá hồng Ecuador đỏ rực thắm thắp sáng trời đông thơ mộng.",
    imageUrl: "src/assets/images/red_roses_bouquet_1780716878432.png",
  },
];

export function getValentineTemplate(
  recipientEmail: string,
  recipientName: string
): { subject: string; html: string } {
  const appUrl = process.env.APP_URL || "https://fi-o-re.vercel.app/";
  const greeting = recipientName && recipientName !== "Quý khách nhận tin" ? `Kính gửi anh/chị ${recipientName}` : "Kính chào Quý khách quý";

  const subject = "💝 Valentine ngọt ngào: Lời bộc bạch lãng mạn tinh khôi từ Fióre";
  const preheader = "Gợi ý những giỏ hoa hồng Ecuador sang trọng đầy mê hoặc dành cho người thương yêu của bạn.";

  const contentHtml = `

  <h2 style="color:#2D3A2E;margin-top:0;font-size:20px;font-family:Georgia,serif;">
    Sắp Đến Lễ Tình Nhân Valentine Rồi Bạn Ơi! 💝
  </h2>

  <p style="color:#4A5568;line-height:1.7;">
    ${greeting},
  </p>

  <p style="color:#4A5568;line-height:1.7;">
    Chỉ còn vài ngày nữa là đến <strong>Lễ Tình Nhân Valentine 14/02</strong>.
    Đây là dịp hoàn hảo để gửi gắm những lời yêu thương chân thành đến người đặc biệt nhất trong trái tim bạn.
  </p>

  <p style="color:#4A5568;line-height:1.7;">
    Fióre Boutique Florist đã chuẩn bị bộ sưu tập hoa Valentine độc quyền với những thiết kế sang trọng, tinh tế và đầy cảm xúc để giúp bạn tạo nên một ngày lễ đáng nhớ.
  </p>

  <div style="
    background:white;
    border-radius:10px;
    padding:24px;
    margin:24px 0;
    border-left:4px solid #52796F;
  ">
    <h3 style="
      color:#52796F;
      margin-top:0;
      font-size:14px;
      text-transform:uppercase;
      letter-spacing:1px;
      padding-bottom:12px;
      border-bottom:1px solid #E5E7EB;
    ">
      Bộ Sưu Tập Hoa Valentine
    </h3>

${generateProductGridHtml(valentineProducts, appUrl)}

<div style="
  margin-top:15px;
  padding-top:15px;
  border-top:2px solid #52796F;
  text-align:center;
">
  <p style="
    margin:0;
    font-weight:bold;
    color:#2D3A2E;
    font-size:15px;
  ">
    🎁 ƯU ĐÃI ĐẶT SỚM (EARLY BIRD)
  </p>

  <p style="
    margin:5px 0 0;
    color:#52796F;
    font-size:14px;
  ">
    Nhập mã

    <strong style="
      background:#FAF7F2;
      padding:2px 6px;
      border:1px dashed #52796F;
      border-radius:4px;
    ">
      VALENTINE10
    </strong>

    giảm ngay 10% tổng hóa đơn khi đặt trước ngày 12/02.
  </p>
</div>

  </div>

  <div style="text-align:center;margin:30px 0 10px 0;">
    <a
      href="${appUrl}"
      style="
        background:#52796F;
        color:white;
        padding:14px 35px;
        text-decoration:none;
        border-radius:30px;
        font-weight:bold;
        font-size:15px;
        display:inline-block;
        letter-spacing:1px;
      "
    >
      ĐẶT HOA HÔM NAY
    </a>
  </div>

  <div style="
    background:#F3F4F6;
    border-radius:8px;
    padding:16px;
    margin-top:24px;
    text-align:center;
  ">
    <p style="
      margin:0;
      color:#4B5563;
      font-size:13px;
    ">
      Bạn cần tư vấn quà tặng Valentine theo ngân sách?
    </p>

<p style="
  margin:6px 0 0;
  color:#52796F;
  font-weight:bold;
  font-size:16px;
">
  📞 0916 044 683
</p>

  </div>

  <p style="
    text-align:center;
    font-size:13px;
    color:#84A98C;
    margin-top:20px;
    font-style:italic;
  ">
    Mỗi bó hoa tại Fióre được thiết kế thủ công với số lượng giới hạn mỗi ngày để đảm bảo chất lượng và tính nghệ thuật cao nhất.
  </p>
`;

  return {
    subject,
    html: wrapInFioreBrandLayout(recipientEmail, contentHtml, preheader, valentineBannerUrl),
  };
}

import {
  EmailProduct,
  generateProductGridHtml,
  generateCouponBlockHtml,
  generateCtaButtonHtml,
  wrapInFioreBrandLayout,
} from "./layout-template";

export const womenDayBannerUrl = "https://nhahoa.com.vn/wp-content/uploads/2021/04/background-nha-hoa-gui-trao-cam-xuc_optimized.png";

export const womenDayProducts: EmailProduct[] = [
  {
    name: "Vườn Hoa Bé Nhỏ",
    price: 390000,
    shortDesc: "Món quà tinh nghịch rực rỡ ngập sắc hồng của cúc họa mộc dịu dàng.",
    imageUrl: "src/assets/images/birthday_flower_2_1780802966479.png",
  },
  {
    name: "Ngọt Ngào Tuổi Mới",
    price: 480000,
    shortDesc: "Các búp hồng kem nhạt đan xen cẩm chướng bồng bềnh dâng đầy sức trẻ.",
    imageUrl: "src/assets/images/birthday_flower_1_1780802950170.png",
  },
  {
    name: "Tulip Hồng Kiêu Sa",
    price: 850000,
    shortDesc: "10 cành hoa Tulip Hà Lan chính hiệu mộc mạc và sang trọng thanh cao.",
    imageUrl: "src/assets/images/red_tulips_bouquet_1780802677184.png",
  },
  {
    name: "Mây Hồng Thơ Mộng",
    price: 590000,
    shortDesc: "Phối hợp ngẫu hứng giữa hồng Ohara kem ấm áp cùng tú cầu hồng lãng mạn.",
    imageUrl: "src/assets/images/pink_roses_single_red_center_1780802659012.png",
  },
];

export function getWomenDayTemplate(
  recipientEmail: string,
  recipientName: string
): { subject: string; html: string } {
  const appUrl = process.env.APP_URL || "https://fi-o-re.vercel.app/";
  const greeting = recipientName && recipientName !== "Quý khách nhận tin" ? `Kính gửi anh/chị ${recipientName}` : "Kính chào Quý khách quý";

  const subject = "🌸 Quốc Tế Phụ Nữ 08/03: Tôn vinh những điều tuyệt diệu nhất";
  const preheader = "Trọn bộ sưu tập những đoá hoa thanh nhã dành tặng mẹ, tặng vợ và những người phụ nữ yêu thương.";

  const contentHtml = `

  <h2 style="color:#2D3A2E;margin-top:0;font-size:20px;font-family:Georgia,serif;">
    Sắp Đến Quốc Tế Phụ Nữ 08/03 Rồi Bạn Ơi! 🌸
  </h2>

  <p style="color:#4A5568;line-height:1.7;">
    ${greeting},
  </p>

  <p style="color:#4A5568;line-height:1.7;">
    Chỉ còn vài ngày nữa là đến <strong>Ngày Quốc Tế Phụ Nữ 08/03</strong>.
    Đây là dịp đặc biệt để gửi những lời yêu thương, trân trọng và biết ơn đến mẹ, vợ, người yêu, chị em và những người phụ nữ tuyệt vời xung quanh bạn.
  </p>

  <p style="color:#4A5568;line-height:1.7;">
    Fióre Boutique Florist đã chuẩn bị bộ sưu tập hoa 08/03 với những thiết kế tinh tế, thanh lịch và đầy cảm xúc để giúp bạn trao gửi những điều đẹp đẽ nhất.
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
      Bộ Sưu Tập Hoa 08/03
    </h3>

${generateProductGridHtml(womenDayProducts, appUrl)}

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
      WOMEN83
    </strong>

    giảm ngay 10% tổng hóa đơn khi đặt trước ngày 05/03.
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
      Bạn cần tư vấn chọn hoa 08/03 theo ngân sách?
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
    Một bó hoa đẹp không chỉ là món quà mà còn là lời cảm ơn chân thành nhất dành cho những người phụ nữ yêu thương trong cuộc đời bạn.
  </p>
`;

  return {
    subject,
    html: wrapInFioreBrandLayout(recipientEmail, contentHtml, preheader, womenDayBannerUrl),
  };
}

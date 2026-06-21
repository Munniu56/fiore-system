import {
  EmailProduct,
  generateProductGridHtml,
  generateCouponBlockHtml,
  generateCtaButtonHtml,
  wrapInFioreBrandLayout,
} from "./layout-template";

export const teachersDayBannerUrl = "https://nhahoa.com.vn/wp-content/uploads/2021/04/background-nha-hoa-gui-trao-cam-xuc_optimized.png";

export const teachersDayProducts: EmailProduct[] = [
  {
    name: "Nắng Mai Ấm Áp",
    price: 450000,
    shortDesc: "Hướng dương đại đóa rực rỡ mang năng lượng vươn lên tươi sáng ngày mới.",
    imageUrl: "src/assets/images/sunflower_roses_box_1780803336996.png", // fallback or specific sunflower image
  },
  {
    name: "Vinh Quang Đất Trời",
    price: 1100000,
    shortDesc: "Lẵng tre mộc thiết kế tinh xảo gửi lời tri ân hướng đạo sâu sắc Thầy Cô.",
    imageUrl: "src/assets/images/congrats_flower_stand_1780803318891.png",
  },
  {
    name: "Phong Văn Đắc Chí",
    price: 1300000,
    shortDesc: "Lan hồ điệp vàng mang ánh mặt trời vinh quang rực rỡ và đài cát tao nhã.",
    imageUrl: "src/assets/images/lotus_roses_basket_1780803336996.png",
  },
  {
    name: "Lan Hồ Điệp Phú Quý",
    price: 1800000,
    shortDesc: "Chậu 5 cành lan hồ điệp trắng tuyết uốn dáng cung đình tột bậc sang quý sếp.",
    imageUrl: "src/assets/images/opening_flower_1_1780803528050.png",
  },
];

// Let's also check if user has custom sunflower_roses_box_1780803353575.png in the state
// Yes! In recipient edit, we had: src/assets/images/sunflower_roses_box_1780803353575.png. Let's fix that.
teachersDayProducts[0].imageUrl = "src/assets/images/sunflower_roses_box_1780803353575.png";

export function getTeachersDayTemplate(
  recipientEmail: string,
  recipientName: string
): { subject: string; html: string } {
  const appUrl = process.env.APP_URL || "https://fi-o-re.vercel.app/";
  const greeting = recipientName && recipientName !== "Quý khách nhận tin" ? `Kính gửi anh/chị ${recipientName}` : "Kính chào Quý khách quý";

  const subject = "🌻 Tri Ân Sâu Sắc: Chúc mừng Ngày Nhà Giáo Việt Nam 20/11 cùng Fióre";
  const preheader = "Gửi trọn lòng biết ơn nghĩa tình cao đẹp tới những người đưa đò thầm lặng bằng sắc hoa tươi tắn rực rỡ.";

  const contentHtml = `

  <h2 style="color:#2D3A2E;margin-top:0;font-size:20px;font-family:Georgia,serif;">
    Sắp Đến Ngày Nhà Giáo Việt Nam 20/11 Rồi Bạn Ơi! 🌻
  </h2>

  <p style="color:#4A5568;line-height:1.7;">
    ${greeting},
  </p>

  <p style="color:#4A5568;line-height:1.7;">
    Chỉ còn vài ngày nữa là đến
    <strong>Ngày Nhà Giáo Việt Nam 20/11</strong>.
    Đây là dịp để gửi lời tri ân chân thành đến những người thầy, người cô đã
    đồng hành và dìu dắt chúng ta trên hành trình trưởng thành.
  </p>

  <p style="color:#4A5568;line-height:1.7;">
    Fióre Boutique Florist đã chuẩn bị những thiết kế hoa tươi sang trọng,
    tinh tế và đầy ý nghĩa để giúp bạn gửi gắm lòng biết ơn một cách trọn vẹn nhất.
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
      Bộ Sưu Tập Hoa 20/11
    </h3>

${generateProductGridHtml(
  teachersDayProducts,
  appUrl
)}

<div
  style="
    margin-top:15px;
    padding-top:15px;
    border-top:2px solid #52796F;
    text-align:center;
  "
>
  <p
    style="
      margin:0;
      font-weight:bold;
      color:#2D3A2E;
      font-size:15px;
    "
  >
    🎁 ƯU ĐÃI ĐẶT SỚM (EARLY BIRD)
  </p>

  <p
    style="
      margin:5px 0 0;
      color:#52796F;
      font-size:14px;
    "
  >
    Nhập mã

    <strong
      style="
        background:#FAF7F2;
        padding:2px 6px;
        border:1px dashed #52796F;
        border-radius:4px;
      "
    >
      TEACHERS20
    </strong>

    giảm ngay 10% tổng hóa đơn khi đặt trước ngày 15/11.
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

  <div
    style="
      background:#F3F4F6;
      border-radius:8px;
      padding:16px;
      margin-top:24px;
      text-align:center;
    "
  >
    <p
      style="
        margin:0;
        color:#4B5563;
        font-size:13px;
      "
    >
      Bạn cần tư vấn thiết kế riêng theo ngân sách?
    </p>

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
`;

  return {
    subject,
    html: wrapInFioreBrandLayout(recipientEmail, contentHtml, preheader, teachersDayBannerUrl),
  };
}

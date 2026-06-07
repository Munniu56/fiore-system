import { Product, Category } from '../types';

/**
 * Utility functions to export and link website products to various external file formats.
 * Supports CSV (Excel), JSON (System backup), and XML (Google Merchant Center RSS feed).
 */

/**
 * Helper to escape CSV cell content properly
 */
function escapeCsv(value: string | number | boolean): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts a list of Products to standard CSV string
 */
export function convertProductsToCSV(products: Product[], categories: Category[]): string {
  const headers = [
    'Mã sản phẩm (ID)',
    'Tên hoa',
    'Danh mục',
    'Giá bán (VND)',
    'Số lượng tồn kho',
    'Đường dẫn hình ảnh (URL)',
    'Mô tả ngắn',
    'Mô tả chi tiết',
    'Đánh giá (Sao)',
    'Số lượt đánh giá',
    'Sản phẩm Nổi bật',
    'Sản phẩm Mới'
  ];

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  const rows = products.map(p => [
    p.id,
    p.name,
    categoryMap.get(p.categoryId) || p.categoryId,
    p.price,
    p.stock,
    p.image,
    p.shortDesc,
    p.description,
    p.rating,
    p.reviewsCount,
    p.isFeatured ? 'Có' : 'Không',
    p.isNew ? 'Có' : 'Không'
  ]);

  const csvContent = [
    '\uFEFF' + headers.join(','), // UTF-8 BOM for Excel Vietnamese characters support
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\r\n');

  return csvContent;
}

/**
 * Converts products to standard XML format (Google Merchant Center RSS Feed)
 * Useful for linking products with search engines & social commercial channels.
 */
export function convertProductsToMerchantXML(products: Product[], categories: Category[], siteUrl: string): string {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const esc = (text: string) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  let xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Fióre Boutique Florist Catalog Feed</title>
    <link>${siteUrl}</link>
    <description>Danh sách sản phẩm hoa tươi cao cấp từ Fióre Boutique Florist liên kết thời gian thực.</description>
`;

  products.forEach(p => {
    const catName = categoryMap.get(p.categoryId) || 'Hoa tươi';
    xml += `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.name)}</g:title>
      <g:description>${esc(p.shortDesc || p.description)}</g:description>
      <g:link>${siteUrl}?view=catalog&amp;product=${p.id}</g:link>
      <g:image_link>${esc(p.image)}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${p.price} VND</g:price>
      <g:google_product_category>6171</g:google_product_category>
      <g:product_type>${esc(catName)}</g:product_type>
      <g:brand>Fióre Boutique Florist</g:brand>
      <g:inventory>${p.stock}</g:inventory>
    </item>\n`;
  });

  xml += `  </channel>
</rss>`;

  return xml;
}

/**
 * Triggers a browser download for a designated text file
 */
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

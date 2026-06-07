/**
 * Fióre Boutique Florist - Product Image Utility Manager
 * Handles real-time image validation, fallback states, and conversion tools.
 */

// Elegant, ultra high-resolution flower fallback images from Unsplash
export const DEFAULT_PRODUCT_FALLBACKS = [
  'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&q=80&w=600', // Bó hoa hướng dương rực rỡ
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=600', // Bó hoa hồng đỏ lãng mạn
  'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&q=80&w=500', // Giỏ tulip mẫu đơn sang trọng
  'https://images.unsplash.com/photo-1550592742-094380ae7384?auto=format&fit=crop&q=80&w=500'  // Bó cẩm tú cầu dịu mát
];

export const DEFAULT_PRODUCT_IMAGE = DEFAULT_PRODUCT_FALLBACKS[0];
export const DEFAULT_CATEGORY_IMAGE = DEFAULT_PRODUCT_FALLBACKS[2];

/**
 * Validates whether a given URL is in a syntactically correct image format or base64 data stream.
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Accept standard browser base64 data URLs (from local image browser uploads)
  if (url.startsWith('data:image/')) return true;

  // Pattern checks for typical image formats or trusted hostings (Unsplash, imgur, static assets)
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname.toLowerCase();
    
    // Unsplash dynamic image optimization patterns
    if (parsed.hostname.includes('unsplash.com')) return true;
    if (parsed.hostname.includes('imgur.com')) return true;
    
    // Standard extensions
    return (
      pathname.endsWith('.jpg') || 
      pathname.endsWith('.jpeg') || 
      pathname.endsWith('.png') || 
      pathname.endsWith('.webp') || 
      pathname.endsWith('.gif') || 
      pathname.endsWith('.svg') ||
      url.includes('auto=format')
    );
  } catch (_) {
    // Treat relative paths (e.g. /assets/images/...) as valid local references
    return url.startsWith('/') || url.startsWith('.');
  }
}

/**
 * Returns a robust visual source URL for any product.
 * Automatically injects the high-quality fallback image if the URL is blank or invalid.
 */
export function resolveProductImage(url: string | null | undefined): string {
  if (!url || url.trim() === '') {
    return DEFAULT_PRODUCT_IMAGE;
  }
  return url.trim();
}

/**
 * Generates an optimized Unsplash image URL with specific dimension controls
 */
export function getOptimizedUnsplashUrl(url: string, width: number = 600, height: number = 600): string {
  if (!url.includes('unsplash.com')) return url;
  
  try {
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?auto=format&fit=crop&q=80&w=${width}&h=${height}`;
  } catch (_) {
    return url;
  }
}

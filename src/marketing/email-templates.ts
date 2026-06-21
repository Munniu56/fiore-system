/**
 * email-templates.ts
 * 
 * Re-routes campaign requests to specific, modularized templates in marketing/templates/.
 * Acts as the centralized entry point / dispatcher without containing actual styling layouts.
 */

import { getValentineTemplate } from "./templates/valentine-template";
import { getWomenDayTemplate } from "./templates/women-day-template";
import { getWomenVietnamTemplate } from "./templates/women-vietnam-template";
import { getTeachersDayTemplate } from "./templates/teachers-day-template";

// Re-export common layout elements for backward compatibility or direct usage elsewhere if required
export {
  wrapInFioreBrandLayout,
  formatPrice,
  resolveImageUrl,
  generateCtaButtonHtml,
  generateProductGridHtml,
  generateCouponBlockHtml,
} from "./templates/layout-template";

export type { EmailProduct } from "./templates/layout-template";

/**
 * Entry point to fetch customized high-end marketing email templates.
 * Dispatches to individual files inside templates/ directory.
 * Preserves gender split logic, exact subjects, and high-convert structures.
 */
export function getEmailTemplate(
  campaignCode: "valentine" | "women_day_intl" | "women_day_vn" | "teachers_day" | string,
  recipientEmail: string,
  recipientName: string,
  gender: "Nam" | "Nữ" | "Chưa điền"
): { subject: string; html: string } {
  
  switch (campaignCode) {
    case "valentine":
      return getValentineTemplate(recipientEmail, recipientName);

    case "women_day_intl":
      return getWomenDayTemplate(recipientEmail, recipientName);

    case "women_day_vn":
      return getWomenVietnamTemplate(recipientEmail, recipientName, gender);

    case "teachers_day":
      return getTeachersDayTemplate(recipientEmail, recipientName);

    default: {
      // Direct fallback to Valentine or a generic aesthetic layout if the holiday is unknown
      return getValentineTemplate(recipientEmail, recipientName);
    }
  }
}

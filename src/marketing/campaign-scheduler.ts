import { getCustomerSegments, Customer, getCampaignRecipients } from "./customer-segments";
import { getEmailTemplate } from "./email-templates";
import { sendEmailViaResend } from "./resend-service";
import { hasEmailReceivedCampaign, recordEmailCampaignSent, logCampaignRun, DispatchResult } from "./campaign-history";

export interface HolidayConfig {
  code: "valentine" | "women_day_intl" | "women_day_vn" | "teachers_day";
  name: string;
  month: number; // 1-indexed
  day: number;
}

export const HOLIDAYS: HolidayConfig[] = [
  { code: "valentine", name: "Valentine (Lễ Tình Nhân)", month: 2, day: 14 },
  { code: "women_day_intl", name: "Quốc tế Phụ nữ", month: 3, day: 8 },
  { code: "women_day_vn", name: "Phụ nữ Việt Nam", month: 10, day: 20 },
  { code: "teachers_day", name: "Ngày Nhà giáo Việt Nam", month: 11, day: 20 },
];

/**
 * Safe conversion of a date to Vietnam Time (ICT, UTC+7)
 */
export function getVietnamTime(date: Date = new Date()): Date {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    const parts = formatter.formatToParts(date);
    const map: Record<string, number> = {};
    parts.forEach((p) => {
      if (p.type !== "literal") {
        map[p.type] = parseInt(p.value, 10);
      }
    });
    return new Date(map.year, map.month - 1, map.day, map.hour, map.minute, map.second);
  } catch (e) {
    // Fallback if Intl.DateTimeFormat with timeZone is not supported
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    return new Date(utc + 3600000 * 7); // Add 7 hours manually
  }
}

/**
 * Main routine to run check and trigger any holiday campaign if it falls within 5 days before the holiday
 * Can be triggered automatically by cron/scheduler or manually for admin dry-run.
 */
export async function checkAndTriggerHolidayCampaigns(overrideDate?: Date): Promise<{
  triggered: boolean;
  campaignCode?: string;
  logsSent?: number;
  errorsLogged?: number;
  message?: string;
}> {
  const vnNow = getVietnamTime(overrideDate || new Date());
  const year = vnNow.getFullYear();

  // Find if there's any holiday coming up in exactly 5 days from now
  const checkDate = new Date(vnNow);
  checkDate.setDate(checkDate.getDate() + 5);

  const targetMonth = checkDate.getMonth() + 1;
  const targetDay = checkDate.getDate();

  const activeHoliday = HOLIDAYS.find(
    (h) => h.month === targetMonth && h.day === targetDay
  );

  if (!activeHoliday) {
    return {
      triggered: false,
      message: `No active holiday found 5 days from check date: ${checkDate.toLocaleDateString("vi-VN")}. (Current VM Vietnam Time: ${vnNow.toLocaleString("vi-VN")})`,
    };
  }

  // Segment customers
  const segments = await getCustomerSegments();
  
  // Use getCampaignRecipients to filter by gender segment guidelines, remove duplicates/unsubscribers
  const targetRecipients: Customer[] = await getCampaignRecipients(segments.all, activeHoliday.code);

  if (targetRecipients.length === 0) {
    return {
      triggered: true,
      campaignCode: activeHoliday.code,
      logsSent: 0,
      errorsLogged: 0,
      message: `Holiday '${activeHoliday.name}' matches rule, but subscription list has 0 matching recipients.`,
    };
  }

  let successCount = 0;
  let errorCount = 0;
  const dispatchResults: DispatchResult[] = [];

  // Loop through target recipients. Check duplications and dispatch
  for (const customer of targetRecipients) {
    const alreadyReceived = await hasEmailReceivedCampaign(
      activeHoliday.code,
      year,
      customer.email
    );

    if (alreadyReceived) {
      dispatchResults.push({
        email: customer.email,
        gender: customer.gender,
        status: "SUCCESS",
        errorMsg: "Email already received this campaign. Auto skipped.",
      });
      successCount++; // count in aggregate success as it's safe and already delivered
      continue;
    }

    // Generate personalized template
    const template = getEmailTemplate(
      activeHoliday.code,
      customer.email,
      customer.name,
      customer.gender
    );

    const emailRes = await sendEmailViaResend({
      to: customer.email,
      subject: template.subject,
      html: template.html,
    });

    if (emailRes.success) {
      successCount++;
      await recordEmailCampaignSent(activeHoliday.code, year, customer.email);
      dispatchResults.push({
        email: customer.email,
        gender: customer.gender,
        status: "SUCCESS",
      });
    } else {
      errorCount++;
      dispatchResults.push({
        email: customer.email,
        gender: customer.gender,
        status: "ERROR",
        errorMsg: emailRes.errorMsg,
      });
    }
  }

  // Log final aggregate statistical report to Firestore
  await logCampaignRun(
    `Chiến dịch ${activeHoliday.name} năm ${year}`,
    successCount,
    errorCount,
    errorCount === 0 ? "SUCCESS" : "FAILED",
    errorCount > 0 ? "Có lỗi xảy ra trong quá trình gửi hàng loạt." : undefined,
    dispatchResults
  );

  return {
    triggered: true,
    campaignCode: activeHoliday.code,
    logsSent: successCount,
    errorsLogged: errorCount,
    message: `Triggered '${activeHoliday.name}' successfully. Delivered: ${successCount}. Errors: ${errorCount}.`,
  };
}

let schedulerTimer: NodeJS.Timeout | null = null;
let lastRanDateString = ""; // Track the last run "YYYY-MM-DD" in Vietnam Time to avoid multiple triggers on the same day

/**
 * Initializes the automated campaign scheduler running inside Server
 */
export function startMarketingScheduler(): void {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  console.log("Starting Fióre marketing scheduler. Checking daily at 08:00 (Vietnam Time)...");

  // Check every 10 minutes for safety and low CPU footprint
  schedulerTimer = setInterval(async () => {
    try {
      const vnNow = getVietnamTime();
      const currentDayStr = vnNow.toISOString().split("T")[0]; // "YYYY-MM-DD"
      
      // Check if it is 08:00 AM in Vietnam and we haven't triggered today
      if (vnNow.getHours() === 8 && lastRanDateString !== currentDayStr) {
        lastRanDateString = currentDayStr;
        console.log(`[Scheduler Trigger] 08:00 AM VN Time detected on ${currentDayStr}. Scanning holiday campaigns...`);
        const result = await checkAndTriggerHolidayCampaigns();
        console.log(`[Scheduler Completed] ${result.message}`);
      }
    } catch (err) {
      console.error("Error in CRM automated scheduler job run:", err);
    }
  }, 10 * 60 * 1000); // 10 minutes interval
}

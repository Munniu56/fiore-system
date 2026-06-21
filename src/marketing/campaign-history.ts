import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Checks if a specific email address has already received this particular holiday campaign in a specific year.
 * Prevents duplicates (chống gửi trùng).
 */
export async function hasEmailReceivedCampaign(
  holidayCode: string,
  year: number,
  email: string
): Promise<boolean> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const docId = `${holidayCode}_${year}_${cleanEmail}`.replace(/[^a-zA-Z0-9_]/g, "_");
    const docRef = doc(db, "marketing_campaigns", docId);
    const snap = await getDoc(docRef);
    return snap.exists();
  } catch (error) {
    console.error("Error checking duplicate email campaign run:", error);
    return false; // Safely default to false on error, or true depending on policy.
  }
}

/**
 * Marks an email as having successfully received the specified campaign.
 */
export async function recordEmailCampaignSent(
  holidayCode: string,
  year: number,
  email: string
): Promise<void> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const docId = `${holidayCode}_${year}_${cleanEmail}`.replace(/[^a-zA-Z0-9_]/g, "_");
    const docRef = doc(db, "marketing_campaigns", docId);
    await setDoc(docRef, {
      id: docId,
      sentAt: new Date().toISOString(),
      year,
      holidayCode,
      email: cleanEmail,
      successCount: 1, // conformant to firestore rules schema types
      errorCount: 0,
    });
  } catch (error) {
    console.error(`Error recording sent status for ${email}:`, error);
  }
}

export interface DispatchResult {
  email: string;
  gender: string;
  status: "SUCCESS" | "ERROR";
  errorMsg?: string;
}

/**
 * Logs the aggregate run execution status to firestore marketing_logs
 */
export async function logCampaignRun(
  campaignName: string,
  successCount: number,
  errorCount: number,
  status: "SUCCESS" | "FAILED",
  errorMsg?: string,
  results: DispatchResult[] = []
): Promise<void> {
  try {
    const logId = `log_${Date.now()}`;
    const docRef = doc(db, "marketing_logs", logId);
    await setDoc(docRef, {
      id: logId,
      campaignName,
      sentDate: new Date().toISOString(),
      successCount,
      errorCount,
      status,
      errorMsg: errorMsg || "",
      results: results.slice(0, 500), // Cap payload to avoid Firestore document limits (1MB)
    });
  } catch (error) {
    console.error("Critical error logging campaign run statistics:", error);
  }
}

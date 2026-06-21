import dotenv from "dotenv";

dotenv.config();

export interface ResendConfig {
  apiKey: string;
  emailFrom: string;
}

export function getResendConfig(): ResendConfig {
  return {
    apiKey: process.env.RESEND_API_KEY || "",
    emailFrom: process.env.EMAIL_FROM || "Fióre Boutique <tin-tuc@fiore.vn>",
  };
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Service handling all Email dispatch actions using Resend API.
 * This is the ONLY email dispatch provider used for marketing in Fióre.
 */
export async function sendEmailViaResend(payload: EmailPayload): Promise<{ success: boolean; errorMsg?: string; messageId?: string }> {
  const { apiKey, emailFrom } = getResendConfig();

  if (!apiKey) {
    return {
      success: false,
      errorMsg: "RESEND_API_KEY is not defined in the environment.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, messageId: data.id };
    } else {
      const errorText = await response.text();
      return {
        success: false,
        errorMsg: `Resend API Error (HTTP ${response.status}): ${errorText}`,
      };
    }
  } catch (error: any) {
    return {
      success: false,
      errorMsg: `Connection error: ${error.message || error}`,
    };
  }
}

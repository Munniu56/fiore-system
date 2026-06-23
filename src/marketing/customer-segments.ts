import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase";

export interface Customer {
  email: string;
  name: string;
  gender: "Nam" | "Nữ" | "Chưa điền";
}

/**
 * Fetch all unsubscribed emails from Firestore
 */
export async function getUnsubscribedEmails(): Promise<Set<string>> {
  const unsubscribed = new Set<string>();
  try {
    const q = collection(db, "unsubscribers");
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = doc.data();
      const email = (data.email || doc.id || "").trim().toLowerCase();
      if (email) {
        unsubscribed.add(email);
      }
    });
  } catch (error) {
    console.error("Error fetching unsubscribers:", error);
  }
  return unsubscribed;
}

/**
 * Fetch and segment customers, excluding any who have unsubscribed.
 * Resolves duplicates between subscribers and registered users (preferring registered user's gender).
 */
export async function getCustomerSegments(): Promise<{
  all: Customer[];
  nam: Customer[];
  nu: Customer[];
  chuaDien: Customer[];
}> {
  const unsubscribed = await getUnsubscribedEmails();

  // 1. Fetch registered users from users collection
  const usersList: Customer[] = [];
  const usersEmails = new Set<string>();
  try {
    const q = collection(db, "users");
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = doc.data();
      const email = (data.email || "").trim().toLowerCase();
      if (!email || unsubscribed.has(email)) return;

      // Map raw gender
      let gender: "Nam" | "Nữ" | "Chưa điền" = "Chưa điền";
      if (data.gender === "Nam") {
        gender = "Nam";
      } else if (data.gender === "Nữ") {
        gender = "Nữ";
      }

      usersList.push({
        email,
        name: data.name || "Khách quý",
        gender,
      });
      usersEmails.add(email);
    });
  } catch (error) {
    console.error("Error fetching users for marketing segmentation:", error);
  }

  // 2. Fetch newsletter subscribers from subscribers collection
  const subscribersList: Customer[] = [];
  try {
    const q = collection(db, "subscribers");
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      const data = doc.data();
      const email = (data.email || "").trim().toLowerCase();
      // Skip if empty, unsubscribed, or already handled as a registered user
      if (!email || unsubscribed.has(email) || usersEmails.has(email)) return;

      subscribersList.push({
        email,
        name: "Quý khách nhận tin",
        gender: "Chưa điền", // Default for newsletter-only subscribers
      });
    });
  } catch (error) {
    console.error("Error fetching newsletter subscribers for marketing segmentation:", error);
  }

  // Combine both pools uniquely
  const allCustomers = [...usersList, ...subscribersList];

  // Distribute into respective gender segments
  const nam: Customer[] = [];
  const nu: Customer[] = [];
  const chuaDien: Customer[] = [];

  for (const customer of allCustomers) {
    if (customer.gender === "Nam") {
      nam.push(customer);
    } else if (customer.gender === "Nữ") {
      nu.push(customer);
    } else {
      chuaDien.push(customer);
    }
  }

  return {
    all: allCustomers,
    nam,
    nu,
    chuaDien,
  };
}

/**
 * Filter customers for a given campaign by gender and unsubscribe status, removing duplicate emails.
 */
export async function getCampaignRecipients(
  customers: Customer[],
  campaignCode: string
): Promise<Customer[]> {
  const unsubscribed = await getUnsubscribedEmails();
  
  // Deduplicate by email address case-insensitively, and filter unsubscribed
  const seenEmails = new Set<string>();
  const uniqueCustomers: Customer[] = [];

  for (const customer of customers) {
    const email = customer.email.trim().toLowerCase();
    if (!email) continue;
    if (unsubscribed.has(email)) continue;

    if (!seenEmails.has(email)) {
      seenEmails.add(email);
      uniqueCustomers.push(customer);
    }
  }

  // Filter based on campaign gender rules
  return uniqueCustomers.filter((customer) => {
    const gender = customer.gender;
    if (campaignCode === "valentine" || campaignCode === "women_day_intl") {
      // Nam và Chưa điền
      return gender === "Nam" || gender === "Chưa điền";
    }
    if (campaignCode === "women_day_vn" || campaignCode === "teachers_day") {
      // Nam, Nữ, Chưa điền
      return gender === "Nam" || gender === "Nữ" || gender === "Chưa điền";
    }
    // Default fallback: allow all
    return true;
  });
}


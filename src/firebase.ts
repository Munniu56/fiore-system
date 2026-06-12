import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  collection,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  limit,
  writeBatch,
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { Product, Category, Order, User, ContactMessage, Coupon, Review } from "./types";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = initializeFirestore(
  app,
  { experimentalForceLongPolling: true },
  firebaseConfig.firestoreDatabaseId,
); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- DEEP UNDEFINED SANITIZATION HELPER ---
export function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => cleanUndefined(item)) as unknown as T;
  }
  if (typeof obj === "object") {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// --- DB SEEDING UTILITY ---
export async function seedDatabaseIfNeeded(
  initialProducts: Product[],
  initialCategories: Category[],
  sampleOrders: Order[],
  sampleUsers: User[],
) {
  try {
    const productsSnap = await getDocs(
      query(collection(db, "products"), limit(1)),
    );
    if (productsSnap.empty) {
      console.log("Seeding initial products to Firestore...");
      const batch = writeBatch(db);
      initialProducts.forEach((p) => {
        const docRef = doc(db, "products", p.id);
        batch.set(docRef, cleanUndefined(p));
      });
      await batch.commit();
    } else {
      // Check if the newly requested special product exists, if not, sync it
      const specialDocRef = doc(db, "products", "pro-gg-1");
      const specialDoc = await getDoc(specialDocRef);
      if (!specialDoc.exists()) {
        const targetProd = initialProducts.find((p) => p.id === "pro-gg-1");
        if (targetProd) {
          console.log(
            "Syncing special product pro-gg-1 to existing Firestore active database...",
          );
          await setDoc(specialDocRef, cleanUndefined(targetProd));
        }
      }

      // Force update love flower product images to match the design sequence in the active database
      try {
        const loveProducts = initialProducts.filter(
          (p) => p.categoryId === "tinh-yeu",
        );
        const loveBatch = writeBatch(db);
        loveProducts.forEach((p) => {
          const docRef = doc(db, "products", p.id);
          loveBatch.update(docRef, { image: p.image });
        });
        await loveBatch.commit();
        console.log(
          "Successfully updated all Love Flowers category product images in Firestore!",
        );
      } catch (syncErr) {
        console.error(
          "Error synchronizing love flower images to Firestore:",
          syncErr,
        );
      }

      // Force update birthday flower product images to match the design sequence in the active database
      try {
        const birthdayProducts = initialProducts.filter(
          (p) => p.categoryId === "sinh-nhat",
        );
        const birthdayBatch = writeBatch(db);
        birthdayProducts.forEach((p) => {
          const docRef = doc(db, "products", p.id);
          birthdayBatch.update(docRef, { image: p.image });
        });
        await birthdayBatch.commit();
        console.log(
          "Successfully updated all Birthday Flowers category product images in Firestore!",
        );
      } catch (syncErr) {
        console.error(
          "Error synchronizing birthday flower images to Firestore:",
          syncErr,
        );
      }

      // Force update congratulatory flower product images to match the design sequence in the active database
      try {
        const congratsProducts = initialProducts.filter(
          (p) => p.categoryId === "chuc-mung",
        );
        const congratsBatch = writeBatch(db);
        congratsProducts.forEach((p) => {
          const docRef = doc(db, "products", p.id);
          congratsBatch.update(docRef, { image: p.image });
        });
        await congratsBatch.commit();
        console.log(
          "Successfully updated all Congratulatory Flowers category product images in Firestore!",
        );
      } catch (syncErr) {
        console.error(
          "Error synchronizing congratulatory flower images to Firestore:",
          syncErr,
        );
      }

      // Force update opening flower product images to match the design sequence in the active database
      try {
        const openingProducts = initialProducts.filter(
          (p) => p.categoryId === "khai-truong",
        );
        const openingBatch = writeBatch(db);
        openingProducts.forEach((p) => {
          const docRef = doc(db, "products", p.id);
          openingBatch.update(docRef, { image: p.image });
        });
        await openingBatch.commit();
        console.log(
          "Successfully updated all Opening/Inauguration Flowers category product images in Firestore!",
        );
      } catch (syncErr) {
        console.error(
          "Error synchronizing opening flower images to Firestore:",
          syncErr,
        );
      }

      // Force update condolence/sympathy flower product images to match the design sequence in the active database
      try {
        const condolenceProducts = initialProducts.filter(
          (p) => p.categoryId === "chia-buon",
        );
        const condolenceBatch = writeBatch(db);
        condolenceProducts.forEach((p) => {
          const docRef = doc(db, "products", p.id);
          condolenceBatch.update(docRef, { image: p.image });
        });
        await condolenceBatch.commit();
        console.log(
          "Successfully updated all Condolence Flowers category product images in Firestore!",
        );
      } catch (syncErr) {
        console.error(
          "Error synchronizing condolence flower images to Firestore:",
          syncErr,
        );
      }

      // Force update seasonal flower product images to match the design sequence in the active database
      try {
        const seasonalProducts = initialProducts.filter(
          (p) => p.categoryId === "theo-mua",
        );
        const seasonalBatch = writeBatch(db);
        seasonalProducts.forEach((p) => {
          const docRef = doc(db, "products", p.id);
          seasonalBatch.update(docRef, { image: p.image });
        });
        await seasonalBatch.commit();
        console.log(
          "Successfully updated all Seasonal Flowers category product images in Firestore!",
        );
      } catch (syncErr) {
        console.error(
          "Error synchronizing seasonal flower images to Firestore:",
          syncErr,
        );
      }
    }

    const categoriesSnap = await getDocs(
      query(collection(db, "categories"), limit(1)),
    );
    if (categoriesSnap.empty) {
      console.log("Seeding initial categories to Firestore...");
      const batch = writeBatch(db);
      initialCategories.forEach((c) => {
        const docRef = doc(db, "categories", c.id);
        batch.set(docRef, cleanUndefined(c));
      });
      await batch.commit();
    }

    const ordersSnap = await getDocs(query(collection(db, "orders"), limit(1)));
    if (ordersSnap.empty) {
      console.log("Seeding initial orders to Firestore...");
      const batch = writeBatch(db);
      sampleOrders.forEach((o) => {
        const docRef = doc(db, "orders", o.id);
        batch.set(docRef, cleanUndefined(o));
      });
      await batch.commit();
    }

    const usersSnap = await getDocs(query(collection(db, "users"), limit(1)));
    if (usersSnap.empty) {
      console.log("Seeding initial users to Firestore...");
      const batch = writeBatch(db);
      sampleUsers.forEach((u) => {
        const docRef = doc(db, "users", u.id);
        batch.set(docRef, cleanUndefined(u));
      });
      await batch.commit();
    }

    // Synchronize coupons with the exact promo rules requested by the user
    try {
      const cVip: Coupon = {
        id: "KHACHVIP",
        code: "KHACHVIP",
        description: "Ưu đãi khách hàng VIP giảm ngay 100.000đ",
        discountType: "fixed",
        discountValue: 100000,
        minOrderValue: 3000000,
        isActive: true
      };
      const cYeuThuong: Coupon = {
        id: "YEUTHUONG",
        code: "YEUTHUONG",
        description: "Giảm trực tiếp 20.000đ cho đơn từ 500.000đ",
        discountType: "fixed",
        discountValue: 20000,
        minOrderValue: 500000,
        isActive: true
      };

      const syncBatch = writeBatch(db);
      syncBatch.delete(doc(db, "coupons", "FIORE10"));
      syncBatch.delete(doc(db, "coupons", "XUAN2026"));
      syncBatch.set(doc(db, "coupons", "KHACHVIP"), cleanUndefined(cVip));
      syncBatch.set(doc(db, "coupons", "YEUTHUONG"), cleanUndefined(cYeuThuong));
      await syncBatch.commit();
      console.log("Synchronized promo coupons in Firestore successfully!");
    } catch (syncErr) {
      console.error("Error synchronizing coupons in seed check:", syncErr);
    }
  } catch (error) {
    console.error("Error seeding Firestore database:", error);
  }
}

// --- REAL-TIME LISTENERS AND MUTATIONS ---

// Products Async Firestore CRUD & Subscribe
export function subscribeProducts(
  onChange: (products: Product[]) => void,
  onError?: (err: any) => void,
) {
  const collectionRef = collection(db, "products");
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: Product[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Product);
      });
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "products");
    },
  );
}

export async function saveProduct(product: Product) {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, "products", product.id), cleanUndefined(product));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeProduct(productId: string) {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Categories Async Firestore CRUD & Subscribe
export function subscribeCategories(
  onChange: (categories: Category[]) => void,
  onError?: (err: any) => void,
) {
  const collectionRef = collection(db, "categories");
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Category);
      });
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "categories");
    },
  );
}

export async function saveCategory(category: Category) {
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, "categories", category.id), cleanUndefined(category));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeCategory(categoryId: string) {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, "categories", categoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Orders Async Firestore CRUD & Subscribe
export function subscribeOrders(
  onChange: (orders: Order[]) => void,
  onError?: (err: any) => void,
) {
  const collectionRef = collection(db, "orders");
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Order);
      });
      // Sort orders descending by createdAt by default
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "orders");
    },
  );
}

export async function saveOrder(order: Order) {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, "orders", order.id), cleanUndefined(order));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeOrder(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, "orders", orderId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Contacts Async Firestore CRUD & Subscribe
export function subscribeContacts(
  onChange: (contacts: ContactMessage[]) => void,
  onError?: (err: any) => void,
) {
  const collectionRef = collection(db, "contacts");
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as ContactMessage);
      });
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "contacts");
    },
  );
}

export async function saveContact(contact: ContactMessage) {
  const path = `contacts/${contact.id}`;
  try {
    await setDoc(doc(db, "contacts", contact.id), cleanUndefined(contact));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeContact(contactId: string) {
  const path = `contacts/${contactId}`;
  try {
    await deleteDoc(doc(db, "contacts", contactId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Users Async Firestore CRUD & Subscribe
export function subscribeUsers(
  onChange: (users: User[]) => void,
  onError?: (err: any) => void,
) {
  const collectionRef = collection(db, "users");
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as User);
      });
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "users");
    },
  );
}

export async function saveUser(user: User) {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, "users", user.id), cleanUndefined(user));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeUser(userId: string) {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, "users", userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Coupons Async Firestore CRUD & Subscribe
export function subscribeCoupons(
  onChange: (coupons: Coupon[]) => void,
  onError?: (err: any) => void,
) {
  const collectionRef = collection(db, "coupons");
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: Coupon[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Coupon);
      });
      list.sort((a, b) => a.code.localeCompare(b.code));
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "coupons");
    },
  );
}

export async function saveCoupon(coupon: Coupon) {
  const path = `coupons/${coupon.id}`;
  try {
    await setDoc(doc(db, "coupons", coupon.id), cleanUndefined(coupon));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeCoupon(couponId: string) {
  const path = `coupons/${couponId}`;
  try {
    await deleteDoc(doc(db, "coupons", couponId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Reviews Async Firestore CRUD & Subscribe
export function subscribeReviews(
  onChange: (reviews: Review[]) => void,
  onError?: (err: any) => void,
) {
  const collectionRef = collection(db, "reviews");
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: Review[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Review);
      });
      // Sort reviews descending by createdAt
      list.sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime(),
      );
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, "reviews");
    },
  );
}

export async function saveReview(review: Review) {
  const path = `reviews/${review.id}`;
  try {
    await setDoc(doc(db, "reviews", review.id), cleanUndefined(review));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeReview(reviewId: string) {
  const path = `reviews/${reviewId}`;
  try {
    await deleteDoc(doc(db, "reviews", reviewId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}


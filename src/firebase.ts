import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot,
  query,
  limit,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Product, Category, Order, User, ContactMessage } from './types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- DB SEEDING UTILITY ---
export async function seedDatabaseIfNeeded(
  initialProducts: Product[],
  initialCategories: Category[],
  sampleOrders: Order[],
  sampleUsers: User[]
) {
  try {
    const productsSnap = await getDocs(query(collection(db, 'products'), limit(1)));
    if (productsSnap.empty) {
      console.log('Seeding initial products to Firestore...');
      const batch = writeBatch(db);
      initialProducts.forEach((p) => {
        const docRef = doc(db, 'products', p.id);
        batch.set(docRef, p);
      });
      await batch.commit();
    }

    const categoriesSnap = await getDocs(query(collection(db, 'categories'), limit(1)));
    if (categoriesSnap.empty) {
      console.log('Seeding initial categories to Firestore...');
      const batch = writeBatch(db);
      initialCategories.forEach((c) => {
        const docRef = doc(db, 'categories', c.id);
        batch.set(docRef, c);
      });
      await batch.commit();
    }

    const ordersSnap = await getDocs(query(collection(db, 'orders'), limit(1)));
    if (ordersSnap.empty) {
      console.log('Seeding initial orders to Firestore...');
      const batch = writeBatch(db);
      sampleOrders.forEach((o) => {
        const docRef = doc(db, 'orders', o.id);
        batch.set(docRef, o);
      });
      await batch.commit();
    }

    const usersSnap = await getDocs(query(collection(db, 'users'), limit(1)));
    if (usersSnap.empty) {
      console.log('Seeding initial users to Firestore...');
      const batch = writeBatch(db);
      sampleUsers.forEach((u) => {
        const docRef = doc(db, 'users', u.id);
        batch.set(docRef, u);
      });
      await batch.commit();
    }
  } catch (error) {
    console.error('Error seeding Firestore database:', error);
  }
}

// --- REAL-TIME LISTENERS AND MUTATIONS ---

// Products Async Firestore CRUD & Subscribe
export function subscribeProducts(onChange: (products: Product[]) => void, onError?: (err: any) => void) {
  const collectionRef = collection(db, 'products');
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
      handleFirestoreError(err, OperationType.GET, 'products');
    }
  );
}

export async function saveProduct(product: Product) {
  const path = `products/${product.id}`;
  try {
    await setDoc(doc(db, 'products', product.id), product);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeProduct(productId: string) {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Categories Async Firestore CRUD & Subscribe
export function subscribeCategories(onChange: (categories: Category[]) => void, onError?: (err: any) => void) {
  const collectionRef = collection(db, 'categories');
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
      handleFirestoreError(err, OperationType.GET, 'categories');
    }
  );
}

export async function saveCategory(category: Category) {
  const path = `categories/${category.id}`;
  try {
    await setDoc(doc(db, 'categories', category.id), category);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeCategory(categoryId: string) {
  const path = `categories/${categoryId}`;
  try {
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Orders Async Firestore CRUD & Subscribe
export function subscribeOrders(onChange: (orders: Order[]) => void, onError?: (err: any) => void) {
  const collectionRef = collection(db, 'orders');
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as Order);
      });
      // Sort orders descending by createdAt by default
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, 'orders');
    }
  );
}

export async function saveOrder(order: Order) {
  const path = `orders/${order.id}`;
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeOrder(orderId: string) {
  const path = `orders/${orderId}`;
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Contacts Async Firestore CRUD & Subscribe
export function subscribeContacts(onChange: (contacts: ContactMessage[]) => void, onError?: (err: any) => void) {
  const collectionRef = collection(db, 'contacts');
  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const list: ContactMessage[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as ContactMessage);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onChange(list);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, 'contacts');
    }
  );
}

export async function saveContact(contact: ContactMessage) {
  const path = `contacts/${contact.id}`;
  try {
    await setDoc(doc(db, 'contacts', contact.id), contact);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeContact(contactId: string) {
  const path = `contacts/${contactId}`;
  try {
    await deleteDoc(doc(db, 'contacts', contactId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// Users Async Firestore CRUD & Subscribe
export function subscribeUsers(onChange: (users: User[]) => void, onError?: (err: any) => void) {
  const collectionRef = collection(db, 'users');
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
      handleFirestoreError(err, OperationType.GET, 'users');
    }
  );
}

export async function saveUser(user: User) {
  const path = `users/${user.id}`;
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function removeUser(userId: string) {
  const path = `users/${userId}`;
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

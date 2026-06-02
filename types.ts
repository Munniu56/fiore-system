/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  image: string;
  description: string;
  shortDesc: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'confirmed' | 'paid' | 'preparing' | 'shipping' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
  note: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: 'COD' | 'VISA';
  paymentStatus: 'Unpaid' | 'Paid';
  status: OrderStatus;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  isAdmin: boolean;
}

export interface DailySales {
  date: string;
  revenue: number;
  ordersCount: number;
}

export interface BestSeller {
  productName: string;
  quantitySold: number;
  revenue: number;
}

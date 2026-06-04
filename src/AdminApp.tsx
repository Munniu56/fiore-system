import React, { useState, useEffect } from 'react';
import { Product, Category, Order, User, OrderStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { initGmailAuth, subscribeToGmailAuth } from './gmailService';
import { Shield } from 'lucide-react';

export default function AdminApp() {
  // --- STATE INITIALIZATION (SYNCED WITH LATEST CLIENT SITE KEYS) ---
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fiore_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Product[];
        if (parsed.length < INITIAL_PRODUCTS.length) {
          const merged = [...parsed];
          INITIAL_PRODUCTS.forEach(ip => {
            if (!merged.some(p => p.id === ip.id)) {
              merged.push(ip);
            }
          });
          localStorage.setItem('fiore_products', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) {
        return INITIAL_PRODUCTS;
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('fiore_categories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Category[];
        if (parsed.length < INITIAL_CATEGORIES.length || !parsed.some(c => c.id === 'hoa-cuoi')) {
          const merged = [...parsed];
          INITIAL_CATEGORIES.forEach(ic => {
            if (!merged.some(c => c.id === ic.id)) {
              merged.push(ic);
            }
          });
          localStorage.setItem('fiore_categories', JSON.stringify(merged));
          return merged;
        }

        const hasUnsplash = parsed.some((c) => c.image && c.image.includes('unsplash.com'));
        if (hasUnsplash) {
          return parsed.map((c) => {
            const matched = INITIAL_CATEGORIES.find((ic) => ic.id === c.id);
            return matched ? { ...c, image: matched.image } : c;
          });
        }
        return parsed;
      } catch (e) {
        return INITIAL_CATEGORIES;
      }
    }
    return INITIAL_CATEGORIES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('fiore_users');
    if (saved) return JSON.parse(saved);
    
    const sampleUsers: User[] = [
      {
        id: 'usr-1',
        email: 'sample_customer@gmail.com',
        name: 'Nguyễn Trần Khánh Vân',
        phone: '0909111222',
        address: '26 Lê Thanh Nghị, Quận Hai Bà Trưng, Hà Nội',
        isAdmin: false
      }
    ];
    localStorage.setItem('fiore_users', JSON.stringify(sampleUsers));
    return sampleUsers;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fiore_orders');
    if (saved) return JSON.parse(saved);

    const sampleOrders: Order[] = [
      {
        id: 'ORD-171',
        customerName: 'Nguyễn Trần Khánh Vân',
        customerEmail: 'sample_customer@gmail.com',
        recipientName: 'Mẹ Khánh Vân',
        recipientPhone: '0909111222',
        shippingAddress: '26 Lê Thanh Nghị, Quận Hai Bà Trưng, Hà Nội',
        note: 'Chúc Mừng Sinh Nhật Mẹ yêu! Mong mẹ mãi tươi trẻ như đóa hoa hướng dương này.',
        items: [
          {
            product: INITIAL_PRODUCTS[1],
            quantity: 1
          }
        ],
        totalAmount: 480000,
        paymentMethod: 'VISA',
        paymentStatus: 'Paid',
        status: 'completed',
        createdAt: '2026-05-28T14:30:00Z'
      },
      {
        id: 'ORD-198',
        customerName: 'Khách Thảo Vy',
        customerEmail: 'guest_vy@fiore.vn',
        recipientName: 'Lâm Thảo Vy',
        recipientPhone: '0987332211',
        shippingAddress: '159 Trần Hưng Đạo, Quận 1, TP. HCM',
        note: 'Nhờ shop ghi thiệp: "Nhân ngày 8/3 chúc cháu gái học tập tốt và xinh đẹp."',
        items: [
          {
            product: INITIAL_PRODUCTS[0],
            quantity: 1
          },
          {
            product: INITIAL_PRODUCTS[4],
            quantity: 1
          }
        ],
        totalAmount: 1300000,
        paymentMethod: 'COD',
        paymentStatus: 'Unpaid',
        status: 'shipping',
        createdAt: '2026-06-01T08:15:00Z'
      },
      {
        id: 'ORD-205',
        customerName: 'Hoàng Long',
        customerEmail: 'longhcm@gmail.com',
        recipientName: 'Chị Mai Lan',
        recipientPhone: '0911223344',
        shippingAddress: '55 Nguyễn Thị Minh Khai, Quận 3, TP. HCM',
        note: 'Giao giờ hành chính, gọi điện trước khi giao.',
        items: [
          {
            product: INITIAL_PRODUCTS[2],
            quantity: 1
          }
        ],
        totalAmount: 1830000,
        paymentMethod: 'VISA',
        paymentStatus: 'Paid',
        status: 'paid',
        createdAt: '2026-06-02T05:40:00Z'
      }
    ];
    localStorage.setItem('fiore_orders', JSON.stringify(sampleOrders));
    return sampleOrders;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // --- SAVE STATES TO LOCAL STORAGE ---
  useEffect(() => {
    localStorage.setItem('fiore_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fiore_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fiore_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fiore_users', JSON.stringify(users));
  }, [users]);

  // Hook to automatically initialize Google/Gmail auth states in case needed
  useEffect(() => {
    const unsubAuth = initGmailAuth();
    return () => {
      unsubAuth();
    };
  }, []);

  // --- ACTIONS HANDLERS ---
  const handleAddProduct = (prod: Omit<Product, 'id' | 'rating' | 'reviewsCount'>) => {
    const newId = `pro-${Date.now()}`;
    const newProduct: Product = {
      ...prod,
      id: newId,
      rating: 5.0,
      reviewsCount: 0
    };
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleEditProduct = (prod: Product) => {
    setProducts((prev) => prev.map((p) => p.id === prod.id ? prod : p));
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddCategory = (cat: Omit<Category, 'id'>) => {
    const newId = `cat-${Date.now()}`;
    const newCat = { ...cat, id: newId };
    setCategories((prev) => [...prev, newCat]);
  };

  const handleEditCategory = (cat: Category) => {
    setCategories((prev) => prev.map((c) => c.id === cat.id ? cat : c));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id === orderId) {
        const updatedOrder = { ...o, status };
        // Sync custom state updates back
        return updatedOrder;
      }
      return o;
    }));
  };

  const handleLoginSuccess = () => {
    setIsAdminAuthenticated(true);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans">
      {/* Top Banner Navigation bar specifically for isolated Admin Portal */}
      <header className="bg-emerald-950 text-white py-3 px-6 shadow-sm flex items-center justify-between border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400 animate-pulse" />
          <span className="font-serif font-bold tracking-wide text-sm sm:text-base">
            Fióre Boutique de Fleurs <span className="text-emerald-950 font-sans text-xs ml-1 font-bold bg-amber-400 px-2 py-0.5 rounded-full select-none">HỆ THỐNG QUẢN TRỊ</span>
          </span>
        </div>
        <div className="text-xs text-amber-200 font-mono hidden md:block">
          Cổng vận hành độc lập
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
        {isAdminAuthenticated ? (
          <div className="animate-fade-in">
            <AdminDashboard
              products={products}
              categories={categories}
              orders={orders}
              users={users}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onAdminLogout={handleAdminLogout}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center py-12">
            <AdminLogin onLoginSuccess={handleLoginSuccess} />
          </div>
        )}
      </main>

      <footer className="bg-neutral-100 border-t border-neutral-200 py-4 text-center text-xs text-gray-500">
        &copy; 2026 Fióre Flower Shop. Hệ thống vận hành nội bộ bảo mật cao. Quyền truy cập được giám sát.
      </footer>
    </div>
  );
}

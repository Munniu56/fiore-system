import React, { useState, useEffect } from 'react';
import { Product, Category, Order, User, OrderStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { initGmailAuth, subscribeToGmailAuth, googleSignIn, googleSignOut, sendOrderNotificationEmail } from './gmailService';
import { sendEmailJSOrderPaid } from './emailjsService';
import emailjs from '@emailjs/browser';
import { Shield, Mail, CheckCircle } from 'lucide-react';

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

  const [gmailUser, setGmailUser] = useState<any>(null);
  const [gmailToken, setGmailToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('fiore_gmail_access_token') : null;
  });

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
    const unsubSub = subscribeToGmailAuth((gUser, gToken) => {
      setGmailUser(gUser);
      setGmailToken(gToken);
    });
    return () => {
      unsubAuth();
      unsubSub();
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

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    let orderToEmail: Order | undefined;

    setOrders((prev) => {
      const updated = prev.map((o) => {
        if (o.id === orderId) {
          const updatedOrder = { ...o, status };
          if (status === 'paid' && o.status !== 'paid') {
            orderToEmail = updatedOrder;
          }
          return updatedOrder;
        }
        return o;
      });
      localStorage.setItem('fiore_orders', JSON.stringify(updated));
      return updated;
    });

    if (orderToEmail) {
      const targetEmail = orderToEmail.customerEmail || 'thuyvanngo35@gmail.com';
      console.log('Phát hiện đơn hàng Đã thanh toán. Đang kích hoạt EmailJS tự động gửi tới:', targetEmail);
      try {
        const result = await sendEmailJSOrderPaid(orderToEmail);
        if (result.success) {
          alert(`🎉 [Fióre EmailJS] Đã gửi thư điện tử tự động xác nhận hóa đơn cho đơn hàng #${orderToEmail.id} thành công tới khách hàng qua: ${targetEmail}`);
        } else {
          // Fallback to Gmail REST API if possible
          const gmailSent = await sendOrderNotificationEmail(orderToEmail, targetEmail);
          if (gmailSent) {
            alert(`🎉 [Fióre Gmail] Đã tự động dùng Gmail API thay thế để liên hệ khách hàng #${orderToEmail.id} qua ${targetEmail}`);
          } else {
            alert(`⚠️ Có lỗi phát sinh khi truyền tải hóa đơn cho đơn hàng #${orderToEmail.id}: ${result.error || 'Vui lòng kiểm tra cấu hình EmailJS hoặc kết nối Gmail.'}`);
          }
        }
      } catch (err) {
        console.error('Lỗi truyền tải email tự động:', err);
      }
    }
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
        
        {isAdminAuthenticated ? (
          <div className="flex items-center gap-3">
            {gmailUser ? (
              <div className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-500/20 text-xs">
                <CheckCircle className="h-4 w-4 text-amber-300 shrink-0" />
                <span className="text-stone-200 truncate hidden sm:inline max-w-[150px]" title={gmailUser.email}>
                  Gmail: {gmailUser.email}
                </span>
                <button
                  onClick={googleSignOut}
                  className="text-amber-400 hover:text-amber-200 font-bold transition ml-1 cursor-pointer"
                >
                  Huỷ kết nối
                </button>
              </div>
            ) : (
              <button
                onClick={googleSignIn}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:scale-95 transition text-emerald-950 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm cursor-pointer"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>Kết nối Gmail tự động</span>
              </button>
            )}
          </div>
        ) : (
          <div className="text-xs text-amber-200 font-mono hidden md:block">
            Cổng vận hành độc lập
          </div>
        )}
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

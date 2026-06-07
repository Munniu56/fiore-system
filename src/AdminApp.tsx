import React, { useState, useEffect } from 'react';
import { Product, Category, Order, User, OrderStatus, ContactMessage } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import { initGmailAuth, subscribeToGmailAuth, googleSignIn, googleSignOut, sendOrderNotificationEmail } from './gmailService';
import { sendEmailJSOrderPaid } from './emailjsService';
import emailjs from '@emailjs/browser';
import { Shield, Mail, CheckCircle } from 'lucide-react';
import { 
  seedDatabaseIfNeeded,
  subscribeProducts,
  saveProduct,
  removeProduct,
  subscribeCategories,
  saveCategory,
  removeCategory,
  subscribeOrders,
  saveOrder,
  removeOrder,
  subscribeContacts,
  saveContact,
  removeContact,
  subscribeUsers,
  saveUser,
  removeUser
} from './firebase';

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
        let parsed = JSON.parse(saved) as Category[];
        // Filter out deleted 'hoa-cuoi' category if exists in localStorage
        parsed = parsed.filter(c => c.id !== 'hoa-cuoi');

        const hasAllNew = INITIAL_CATEGORIES.every(ic => parsed.some(c => c.id === ic.id));
        if (!hasAllNew || parsed.length > INITIAL_CATEGORIES.length) {
          const merged = INITIAL_CATEGORIES.map(ic => {
            const existing = parsed.find(c => c.id === ic.id);
            return existing ? { ...ic, name: existing.name, description: existing.description } : ic;
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

  const [contacts, setContacts] = useState<ContactMessage[]>(() => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem('fiore_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing contacts from localStorage', e);
      }
    }
    const sampleContacts: ContactMessage[] = [
      {
        id: 'msg-1',
        fullName: 'Phạm Minh Đức',
        email: 'ducpm.designer@gmail.com',
        message: 'Xin chào, tôi muốn đặt hoa hồng thiết kế riêng cho sự kiện cưới vào tháng sau tại Huế. Shop có thể gửi báo giá chi tiết qua email này được không? Xin cảm ơn!',
        createdAt: '2026-06-04T08:15:00Z',
        status: 'new'
      },
      {
        id: 'msg-2',
        fullName: 'Trần Thị Thu Thảo',
        email: 'thuthao9x@yahoo.com',
        message: 'Đơn hàng BST Hoa Khai Trương của tôi giao lúc sáng rất tươi và đẹp, sếp tôi rất thích. Lần sau doanh nghiệp tôi sẽ tiếp tục ủng hộ Fióre!',
        createdAt: '2026-06-03T11:45:00Z',
        status: 'read'
      },
      {
        id: 'msg-3',
        fullName: 'Hoàng Anh Tuấn',
        email: 'tuandep_trai@gmail.com',
        message: 'Shop ơi, mẫu "Nắng mai ấm áp" có thể thay thế hoa hướng dương bằng hoa cẩm tú cầu được không ạ? Giá cả thay đổi như thế nào?',
        createdAt: '2026-06-01T15:20:00Z',
        status: 'replied'
      }
    ];
    localStorage.setItem('fiore_contacts', JSON.stringify(sampleContacts));
    return sampleContacts;
  });

  // --- REAL-TIME FIRESTORE SUBSCRIPTIONS ---
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    let active = true;

    const initializeAndSubscribe = async () => {
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

      // 1. Seed database if completely empty
      await seedDatabaseIfNeeded(INITIAL_PRODUCTS, INITIAL_CATEGORIES, sampleOrders, sampleUsers);

      if (!active) return;

      // 2. Register real-time Firestore database listeners
      const unsubProducts = subscribeProducts((prods) => {
        if (prods.length > 0) setProducts(prods);
      });
      cleanups.push(unsubProducts);

      const unsubCategories = subscribeCategories((cats) => {
        if (cats.length > 0) setCategories(cats);
      });
      cleanups.push(unsubCategories);

      const unsubOrders = subscribeOrders((ords) => {
        setOrders(ords);
      });
      cleanups.push(unsubOrders);

      const unsubContacts = subscribeContacts((conts) => {
        setContacts(conts);
      });
      cleanups.push(unsubContacts);

      const unsubUsers = subscribeUsers((usrs) => {
        if (usrs.length > 0) setUsers(usrs);
      });
      cleanups.push(unsubUsers);
    };

    initializeAndSubscribe();

    return () => {
      active = false;
      cleanups.forEach((unsub) => unsub());
    };
  }, []);

  // Sync state changes to local storage as secondary backup
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

  useEffect(() => {
    localStorage.setItem('fiore_contacts', JSON.stringify(contacts));
  }, [contacts]);

  const [gmailUser, setGmailUser] = useState<any>(null);
  const [gmailToken, setGmailToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('fiore_gmail_access_token') : null;
  });

  // Intercept contact states dispatcher actions to persist updates to Firestore database
  const handleUpdateContacts = async (updateArg: React.SetStateAction<ContactMessage[]>) => {
    let next: ContactMessage[];
    if (typeof updateArg === 'function') {
      next = (updateArg as Function)(contacts);
    } else {
      next = updateArg;
    }

    // Process deletes in Firestore
    const deletedContacts = contacts.filter((c) => !next.some((n) => n.id === c.id));
    for (const dc of deletedContacts) {
      await removeContact(dc.id);
    }

    // Process updates/creates in Firestore
    const changedOrAddedContacts = next.filter((n) => {
      const orig = contacts.find((c) => c.id === n.id);
      return !orig || JSON.stringify(orig) !== JSON.stringify(n);
    });
    for (const cc of changedOrAddedContacts) {
      await saveContact(cc);
    }

    setContacts(next);
  };

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
    saveProduct(newProduct);
  };

  const handleEditProduct = (prod: Product) => {
    saveProduct(prod);
  };

  const handleDeleteProduct = (id: string) => {
    removeProduct(id);
  };

  const handleAddCategory = (cat: Omit<Category, 'id'>) => {
    const newId = `cat-${Date.now()}`;
    const newCat = { ...cat, id: newId };
    saveCategory(newCat);
  };

  const handleEditCategory = (cat: Category) => {
    saveCategory(cat);
  };

  const handleDeleteCategory = (id: string) => {
    removeCategory(id);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const existingOrder = orders.find((o) => o.id === orderId);
    if (!existingOrder) return;

    const updatedOrder: Order = { ...existingOrder, status };
    await saveOrder(updatedOrder);

    if (status === 'paid' && existingOrder.status !== 'paid') {
      const targetEmail = updatedOrder.customerEmail || 'thuyvanngo35@gmail.com';
      console.log('Phát hiện đơn hàng Đã thanh toán. Đang kích hoạt EmailJS tự động gửi tới:', targetEmail);
      try {
        const result = await sendEmailJSOrderPaid(updatedOrder);
        if (result.success) {
          alert(`🎉 [Fióre EmailJS] Đã gửi thư điện tử tự động xác nhận hóa đơn cho đơn hàng #${updatedOrder.id} thành công tới khách hàng qua: ${targetEmail}`);
        } else {
          // Fallback to Gmail REST API if possible
          const gmailSent = await sendOrderNotificationEmail(updatedOrder, targetEmail);
          if (gmailSent) {
            alert(`🎉 [Fióre Gmail] Đã tự động dùng Gmail API thay thế để liên hệ khách hàng #${updatedOrder.id} qua ${targetEmail}`);
          } else {
            alert(`⚠️ Có lỗi phát sinh khi truyền tải hóa đơn cho đơn hàng #${updatedOrder.id}: ${result.error || 'Vui lòng kiểm tra cấu hình EmailJS hoặc kết nối Gmail.'}`);
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
      <header className="sticky top-0 z-50 bg-emerald-950 text-white py-3 px-6 shadow-sm flex items-center justify-between border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-400 animate-pulse" />
          <span className="font-serif font-bold tracking-wide text-sm sm:text-base">
            Fióre Boutique Florist <span className="text-emerald-950 font-sans text-xs ml-1 font-bold bg-amber-400 px-2 py-0.5 rounded-full select-none">HỆ THỐNG QUẢN TRỊ</span>
          </span>
        </div>
        
        {isAdminAuthenticated ? (
          <div className="text-xs text-amber-200 font-mono hidden md:block">
            Cổng vận hành độc lập (Hệ thống bảo mật)
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
              contacts={contacts}
              onUpdateContacts={handleUpdateContacts}
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

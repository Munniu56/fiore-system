/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import LandingHero from './components/LandingHero';
import ProductCard from './components/ProductCard';
import ProductDetail from './components/ProductDetail';
import CartView from './components/CartView';
import CheckoutView from './components/CheckoutView';
import AccountAuth from './components/AccountAuth';
import OrderTracker from './components/OrderTracker';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import SupportChat from './components/SupportChat';

import { verifyVnpayCallback } from './vnpayConfig';

import { Product, Category, CartItem, Order, User, OrderStatus } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data';
import { Sparkles, Flower, Phone, Mail, Clock, MapPin, Heart, ArrowRight, Facebook, Instagram, Calendar, Star, FileText } from 'lucide-react';

export default function App() {
  
  // --- LOCAL PERSISTENCE STATE INITIALIZERS ---
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

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fiore_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fiore_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('fiore_users');
    if (saved) return JSON.parse(saved);
    
    // Initial seedling sample registered users
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

    // Initial seedling rich sample order histories for analytical charts & tracking
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
            product: INITIAL_PRODUCTS[1], // Nắng mai ấm áp
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
            product: INITIAL_PRODUCTS[0], // Bó Hồng Juliet
            quantity: 1
          },
          {
            product: INITIAL_PRODUCTS[4], // Mây Hồng Thơ Mộng
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
            product: INITIAL_PRODUCTS[2], // Lan Hồ Điệp Phú Quý
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

  // --- COMPONENT ACTIVE VIEW ROLES CONTROL ---
  const [currentRole, setCurrentRole] = useState<'customer' | 'admin'>('customer');
  const [currentView, setCurrentView] = useState<string>('home'); // 'home', 'catalog', 'detail', 'cart', 'checkout', 'auth', 'orders', 'admin'
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fiore_admin_authenticated') === 'true';
  });
  
  // Filtering & Realtime Search States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- VNPAY CALLBACK DETECTOR & VALIDATOR ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vnp_SecureHash = params.get('vnp_SecureHash');
    const vnp_ResponseCode = params.get('vnp_ResponseCode');
    const vnp_TxnRef = params.get('vnp_TxnRef');

    if (vnp_SecureHash && vnp_TxnRef) {
      const queryObj: Record<string, string> = {};
      params.forEach((value, key) => {
        queryObj[key] = value;
      });

      const isValid = verifyVnpayCallback(queryObj);
      if (isValid || vnp_ResponseCode === '00') {
        if (vnp_ResponseCode === '00') {
          const pendingOrderStr = localStorage.getItem('fiore_pending_vnpay_order');
          if (pendingOrderStr) {
            try {
              const pending = JSON.parse(pendingOrderStr);
              
              // Ensure we don't duplicate add the same order id
              setOrders((prev) => {
                if (prev.some((o) => o.id === pending.id)) {
                  return prev;
                }
                
                const newOrder: Order = {
                  id: pending.id,
                  customerName: currentUser ? currentUser.name : pending.recipientName,
                  customerEmail: currentUser ? currentUser.email : pending.recipientEmail || 'guest@fiore.vn',
                  recipientName: pending.recipientName,
                  recipientPhone: pending.recipientPhone,
                  shippingAddress: pending.shippingAddress,
                  note: pending.note,
                  items: pending.cartItems || [],
                  totalAmount: pending.totalAmount,
                  paymentMethod: 'VNPAY',
                  paymentStatus: 'Paid',
                  status: 'paid',
                  createdAt: new Date().toISOString(),
                };

                // Deduct inventory stocks
                setProducts((prevProds) => {
                  return prevProds.map((p) => {
                    const itemDeducted = (pending.cartItems || []).find((it: any) => it.product.id === p.id);
                    if (itemDeducted) {
                      return { ...p, stock: Math.max(0, p.stock - itemDeducted.quantity) };
                    }
                    return p;
                  });
                });

                // Clear cart state
                setCartItems([]);

                // Set checkout success info for CheckoutView
                localStorage.setItem('fiore_vnpay_success_info', JSON.stringify({
                  id: pending.id,
                  email: currentUser ? currentUser.email : pending.recipientEmail || 'guest@fiore.vn',
                  recipientName: pending.recipientName,
                  recipientPhone: pending.recipientPhone,
                  shippingAddress: pending.shippingAddress,
                  note: pending.note,
                  totalAmount: pending.totalAmount,
                }));

                // Activate checkout view
                setCurrentView('checkout');

                return [...prev, newOrder];
              });
            } catch (e) {
              console.error('Error parsing pending VNPAY order:', e);
            }
          }
        }
        // Remove pending order
        localStorage.removeItem('fiore_pending_vnpay_order');
        
        // Clean URL params so they disappear elegantly from address bar
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [currentUser]);

  // --- SAVE STATES TO LOCALSTORAGE ---
  useEffect(() => {
    localStorage.setItem('fiore_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fiore_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fiore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('fiore_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fiore_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fiore_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fiore_current_user');
    }
  }, [currentUser]);

  // --- COMPUTE PRODUCTS FILTERING IN REAL TIME ---
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchCategory = selectedCategoryId === '' || prod.categoryId === selectedCategoryId;
      const matchSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prod.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [products, selectedCategoryId, searchQuery]);

  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products.filter(p => p.categoryId === selectedProduct.categoryId && p.id !== selectedProduct.id);
  }, [products, selectedProduct]);

  // --- CORE SYSTEM HANDLERS ---
  const handleAddToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.stock === 0) return;
    
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        // Guard stock ceiling limit
        const secureQty = Math.min(existing.quantity + quantityToAdd, product.stock);
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: secureQty } : item
        );
      }
      return [...prev, { product, quantity: Math.min(quantityToAdd, product.stock) }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    const parentProduct = products.find(p => p.id === productId);
    if (!parentProduct) return;

    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const secureQty = Math.min(newQty, parentProduct.stock);
          return { ...item, quantity: secureQty };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSwitchRole = (role: 'customer' | 'admin') => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('home');
    }
  };

  // Create order placed from Cart/Checkout
  const handlePlaceOrder = (recipientData: {
    id?: string;
    recipientName: string;
    recipientPhone: string;
    shippingAddress: string;
    note: string;
    paymentMethod: 'COD' | 'VISA' | 'VNPAY';
  }) => {
    const sub = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
    const shipping = 30000;
    const discount = sub > 1000000 ? 50000 : 0;
    const finalPrice = sub + shipping - discount;

    const newOrder: Order = {
      id: recipientData.id || `ORD-${Math.floor(100 + Math.random() * 900)}`,
      customerName: currentUser ? currentUser.name : recipientData.recipientName,
      customerEmail: currentUser ? currentUser.email : 'guest@fiore.vn',
      recipientName: recipientData.recipientName,
      recipientPhone: recipientData.recipientPhone,
      shippingAddress: recipientData.shippingAddress,
      note: recipientData.note,
      items: [...cartItems],
      totalAmount: finalPrice,
      paymentMethod: recipientData.paymentMethod,
      paymentStatus: recipientData.paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
      status: recipientData.paymentMethod === 'COD' ? 'confirmed' : 'paid',
      createdAt: new Date().toISOString()
    };

    // Deduct actual products inventory stocks
    setProducts((prevProds) => {
      return prevProds.map((p) => {
        const itemDeducted = cartItems.find((it) => it.product.id === p.id);
        if (itemDeducted) {
          return { ...p, stock: Math.max(0, p.stock - itemDeducted.quantity) };
        }
        return p;
      });
    });

    setOrders((prev) => [...prev, newOrder]);
    setCartItems([]); // Clear cart items on purchase completion!
  };

  // --- ACCOUNT AUTHENTICATION ACTIONS ---
  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    // Sync dynamic role permission
    if (user.isAdmin) {
      setCurrentRole('admin');
      setCurrentView('admin');
      setIsAdminAuthenticated(true);
      localStorage.setItem('fiore_admin_authenticated', 'true');
    } else {
      setCurrentRole('customer');
    }

    // Add into users list if not existed
    setUsers((prev) => {
      if (prev.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
        return prev.map((u) => u.email.toLowerCase() === user.email.toLowerCase() ? user : u);
      }
      return [...prev, user];
    });
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    setCurrentRole('customer');
    setCurrentView('home');
    setIsAdminAuthenticated(false);
    localStorage.removeItem('fiore_admin_authenticated');
  };

  const handleProfileUpdate = (updated: User) => {
    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => u.id === updated.id ? updated : u));
  };

  // --- ADMIN FUNCTIONAL ACTIONS ---
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
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status,
            paymentStatus: status === 'completed' ? 'Paid' : o.paymentStatus
          };
        }
        return o;
      })
    );
  };

  // Common VND price formatting assistant
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/20 antialiased font-sans">
      
      {/* HEADER COMPONENT */}
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onNavigate={(v) => {
          setCurrentView(v);
          window.scrollTo({ top: 0, behavior: 'instant' });
        }}
        onLogout={handleUserLogout}
        onSwitchRole={handleSwitchRole}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
      />

      {/* MAIN VIEWPORT BODY */}
      <main className="flex-grow">
        
        {/* VIEW 1: HOME PAGE */}
        {currentView === 'home' && (
          <div className="animate-fade-in">
            {/* Elegant Hero and Category blocks */}
            <LandingHero
              categories={categories}
              selectedCategory={selectedCategoryId}
              onSelectCategory={(id) => {
                setSelectedCategoryId(id);
                setSearchQuery('');
              }}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* Featured Flowers Grid */}
            <section id="featured-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="mb-10 text-center">
                <span className="inline-flex items-center space-x-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  <span>Nghệ thuật của Florists</span>
                </span>
                <h2 className="mt-2.5 font-serif text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Sản Phẩm Nổi Bật
                </h2>
                <p className="mt-1.5 text-sm text-gray-500">
                  Sản phẩm bán chạy và nổi bật nhất năm được thêu dệt mộc mạc từ tâm hồn nghệ nhân hoa tươi Việt
                </p>
              </div>

              <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {products
                  .filter((p) => p.isFeatured)
                  .slice(0, 6)
                  .map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onAddToCart={(product, e) => {
                        e.stopPropagation();
                        handleAddToCart(product, 1);
                      }}
                      onViewDetails={(product) => {
                        setSelectedProductId(product.id);
                        setCurrentView('detail');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    />
                  ))}
              </div>
              
              <div className="mt-12 text-center">
                <button
                  onClick={() => {
                    setSelectedCategoryId('');
                    setCurrentView('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center rounded-full bg-rose-600/10 px-6 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-600/15 cursor-pointer"
                >
                  Khám phá toàn bộ giỏ hoa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </section>

            {/* Brands Presentation / Mini Banner */}
            <section 
              className="border-y py-16 transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #F6EBD8 0%, #F3E5C8 50%, #EAD7B7 100%)',
                borderColor: 'rgba(31, 61, 43, 0.12)' 
              }}
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
                <span className="font-serif italic text-lg" style={{ color: '#2B523C' }}>"Hương thơm say đắm, sắc màu ngất ngây"</span>
                <h3 className="mt-3 font-serif text-2xl font-bold sm:text-3xl" style={{ color: '#1F3D2B' }}>Câu chuyện từ Tiệm Hoa Fióre</h3>
                <p className="mt-4 text-sm leading-relaxed" style={{ color: '#234030' }}>
                  Bắt đầu từ một xe hoa ngập hương góc đường trung tâm Sài Gòn, Fióre đã phát triển thành cửa hàng đặt mua hoa trực tuyến hàng đầu, kết nối nguồn hoa cao tuyển ở nhà vườn trong nước (Đà Lạt, Sa Đéc, Tây Tựu) phối hoa nhập khẩu cao cấp. Với tôn chỉ 100% hoa tươi chất lượng cao, thiết kế độc bản hài hòa sắc độ và hỗ trợ giao hỏa tốc cực nhanh, chúng tôi cam kết mang lại sự hài lòng tối đa tới tay người nhận.
                </p>
                
                <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs font-bold">
                  <div className="bg-[#F8F5EF]/95 p-4 rounded-xl border shadow-xs transition-transform duration-300 hover:scale-105" style={{ borderColor: 'rgba(31, 61, 43, 0.08)' }}>
                    <p className="text-xl font-extrabold" style={{ color: '#1F3D2B' }}>99k+</p>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: '#234030' }}>Đơn hoa trao gửi</p>
                  </div>
                  <div className="bg-[#F8F5EF]/95 p-4 rounded-xl border shadow-xs transition-transform duration-300 hover:scale-105" style={{ borderColor: 'rgba(31, 61, 43, 0.08)' }}>
                    <p className="text-xl font-extrabold" style={{ color: '#1F3D2B' }}>4.9 ★</p>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: '#234030' }}>Khách hàng đánh giá</p>
                  </div>
                  <div className="bg-[#F8F5EF]/95 p-4 rounded-xl border shadow-xs transition-transform duration-300 hover:scale-105" style={{ borderColor: 'rgba(31, 61, 43, 0.08)' }}>
                    <p className="text-xl font-extrabold" style={{ color: '#1F3D2B' }}>2 Giờ</p>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: '#234030' }}>Giao hoa siêu tốc</p>
                  </div>
                  <div className="bg-[#F8F5EF]/95 p-4 rounded-xl border shadow-xs transition-transform duration-300 hover:scale-105" style={{ borderColor: 'rgba(31, 61, 43, 0.08)' }}>
                    <p className="text-xl font-extrabold" style={{ color: '#1F3D2B' }}>100%</p>
                    <p className="text-[10px] font-semibold mt-1" style={{ color: '#234030' }}>Gói hoa thủ công</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 1: BÀI VIẾT NỔI BẬT */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E8E1D6]">
              <div className="mb-10 text-center">
                <span className="inline-flex items-center space-x-1 rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-[#C8A96B]">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Cảm hứng & Chia sẻ</span>
                </span>
                <h2 className="mt-2.5 font-serif text-3xl font-bold tracking-tight text-[#1F3D2B] sm:text-4xl">
                  Bài viết nổi bật
                </h2>
                <p className="mt-2 text-sm text-[#4F4F4F] max-w-2xl mx-auto">
                  Cập nhật những xu hướng hoa tươi, bí quyết chăm sóc hoa và những câu chuyện ý nghĩa từ Fióre.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                
                {/* Article 1 */}
                <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E1D6] bg-white shadow-[0_4px_20px_rgba(31,61,43,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(31,61,43,0.07)] transition-all duration-300">
                  <div className="relative overflow-hidden aspect-video h-52">
                    <img 
                      src="https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600" 
                      alt="Nghệ thuật chọn hoa cho ngày sinh nhật" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-[#1F3D2B]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                      Hướng dẫn
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center space-x-2 text-[11px] text-[#4F4F4F]/70 mb-2">
                      <Calendar className="h-3.5 w-3.5 text-[#C8A96B]" />
                      <span>02/06/2026</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1F3D2B] h-14 line-clamp-2 leading-snug group-hover:text-[#C8A96B] transition-colors duration-200">
                      Nghệ thuật chọn hoa cho ngày sinh nhật
                    </h3>
                    <p className="mt-2 text-xs text-[#4F4F4F] line-clamp-3 leading-relaxed flex-grow">
                      Mỗi đóa hoa mang một thông điệp riêng biệt. Khám phá bí quyết chọn loài hoa chuẩn xác theo độ tuổi và cung hoàng đạo của người bạn thương yêu.
                    </p>
                    <div className="mt-5 border-t border-[#E8E1D6]/60 pt-4">
                      <button className="inline-flex items-center text-xs font-bold text-[#C8A96B] group-hover:text-[#B28D49] transition-colors cursor-pointer">
                        Đọc thêm
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Article 2 */}
                <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E1D6] bg-white shadow-[0_4px_20px_rgba(31,61,43,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(31,61,43,0.07)] transition-all duration-300">
                  <div className="relative overflow-hidden aspect-video h-52">
                    <img 
                      src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600" 
                      alt="Ý nghĩa các loài hoa trong tình yêu" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-[#1F3D2B]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                      Ý nghĩa hoa
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center space-x-2 text-[11px] text-[#4F4F4F]/70 mb-2">
                      <Calendar className="h-3.5 w-3.5 text-[#C8A96B]" />
                      <span>30/05/2026</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1F3D2B] h-14 line-clamp-2 leading-snug group-hover:text-[#C8A96B] transition-colors duration-200">
                      Ý nghĩa các loài hoa trong tình yêu
                    </h3>
                    <p className="mt-2 text-xs text-[#4F4F4F] line-clamp-3 leading-relaxed flex-grow">
                      Từ sắc đỏ rực rỡ của hoa hồng đến sắc tím thủy chung của cát tường, cùng tìm hiểu ngôn ngữ không lời thêu dệt nên buổi hẹn hò lãng mạn.
                    </p>
                    <div className="mt-5 border-t border-[#E8E1D6]/60 pt-4">
                      <button className="inline-flex items-center text-xs font-bold text-[#C8A96B] group-hover:text-[#B28D49] transition-colors cursor-pointer">
                        Đọc thêm
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Article 3 */}
                <div className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E1D6] bg-white shadow-[0_4px_20px_rgba(31,61,43,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(31,61,43,0.07)] transition-all duration-300">
                  <div className="relative overflow-hidden aspect-video h-52">
                    <img 
                      src="https://images.unsplash.com/photo-1453904300235-0f2f60b15b5d?auto=format&fit=crop&q=80&w=600" 
                      alt="Cách giữ hoa tươi lâu tại nhà" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 bg-[#1F3D2B]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                      Mẹo hay
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center space-x-2 text-[11px] text-[#4F4F4F]/70 mb-2">
                      <Calendar className="h-3.5 w-3.5 text-[#C8A96B]" />
                      <span>28/05/2026</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1F3D2B] h-14 line-clamp-2 leading-snug group-hover:text-[#C8A96B] transition-colors duration-200">
                      Cách giữ hoa tươi lâu tại nhà
                    </h3>
                    <p className="mt-2 text-xs text-[#4F4F4F] line-clamp-3 leading-relaxed flex-grow">
                      Hướng dẫn chi tiết từ nghệ nhân chăm sóc hoa của Fióre cách cắt tỉa gốc, pha dưỡng chất định kỳ giúp bình hoa tươi suốt 2 tuần vẫn vẹn sắc.
                    </p>
                    <div className="mt-5 border-t border-[#E8E1D6]/60 pt-4">
                      <button className="inline-flex items-center text-xs font-bold text-[#C8A96B] group-hover:text-[#B28D49] transition-colors cursor-pointer">
                        Đọc thêm
                        <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION 2: FEEDBACK KHÁCH HÀNG */}
            <section className="py-16 border-t border-[#E8E1D6]" style={{ backgroundColor: '#FCFAF7' }}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 text-center">
                  <span className="inline-flex items-center space-x-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-[#C8A96B] border border-[#E8E1D6]">
                    <span className="flex text-amber-400">★★★★★</span>
                    <span className="ml-1 text-[11px] text-[#4F4F4F]">Phản hồi chân thật</span>
                  </span>
                  <h2 className="mt-2.5 font-serif text-3xl font-bold tracking-tight text-[#1F3D2B] sm:text-4xl">
                    Khách hàng nói gì về Fióre
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                  
                  {/* Testimonial 1 */}
                  <div className="flex flex-col bg-white border border-[#E8E1D6] p-7 rounded-2xl shadow-[0_4px_20px_rgba(31,61,43,0.02)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(31,61,43,0.05)]">
                    <div className="flex text-amber-400 space-x-0.5 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                    </div>
                    <p className="mt-4 text-xs font-medium text-[#4F4F4F] leading-relaxed flex-grow italic">
                      "Hoa rất đẹp, giao hàng đúng giờ và đóng gói cực kỳ cẩn thận. Tôi sẽ ủng hộ lâu dài."
                    </p>
                    <div className="mt-6 flex items-center space-x-3 border-t border-[#E8E1D6]/60 pt-4">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" 
                        alt="Nguyễn Minh Anh" 
                        className="h-10 w-10 rounded-full object-cover border-2 border-[#D9C29C]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#1F3D2B]">Nguyễn Minh Anh</h4>
                        <span className="text-[10px] text-[#C8A96B] font-semibold">Khách hàng thân thiết</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 2 */}
                  <div className="flex flex-col bg-white border border-[#E8E1D6] p-7 rounded-2xl shadow-[0_4px_20px_rgba(31,61,43,0.02)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(31,61,43,0.05)]">
                    <div className="flex text-amber-400 space-x-0.5 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                    </div>
                    <p className="mt-4 text-xs font-medium text-[#4F4F4F] leading-relaxed flex-grow italic">
                      "Tôi rất hài lòng với chất lượng hoa và dịch vụ tư vấn. Nhân viên cắm hoa tỉ mỉ, hiểu đúng ý tưởng của tôi."
                    </p>
                    <div className="mt-6 flex items-center space-x-3 border-t border-[#E8E1D6]/60 pt-4">
                      <img 
                        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200" 
                        alt="Trần Thị Ngọc" 
                        className="h-10 w-10 rounded-full object-cover border-2 border-[#D9C29C]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#1F3D2B]">Trần Thị Ngọc</h4>
                        <span className="text-[10px] text-[#C8A96B] font-semibold">Khách hàng thân thiết</span>
                      </div>
                    </div>
                  </div>

                  {/* Testimonial 3 */}
                  <div className="flex flex-col bg-white border border-[#E8E1D6] p-7 rounded-2xl shadow-[0_4px_20px_rgba(31,61,43,0.02)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(31,61,43,0.05)]">
                    <div className="flex text-amber-400 space-x-0.5 text-sm">
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                      <Star className="h-4 w-4 fill-amber-400 stroke-none" />
                    </div>
                    <p className="mt-4 text-xs font-medium text-[#4F4F4F] leading-relaxed flex-grow italic">
                      "Website dễ sử dụng, hoa nhận được giống hình 100%. Giao hỏa tốc siêu nhanh chỉ trong hơn 1 tiếng."
                    </p>
                    <div className="mt-6 flex items-center space-x-3 border-t border-[#E8E1D6]/60 pt-4">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" 
                        alt="Lê Hoàng Nam" 
                        className="h-10 w-10 rounded-full object-cover border-2 border-[#D9C29C]"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#1F3D2B]">Lê Hoàng Nam</h4>
                        <span className="text-[10px] text-[#C8A96B] font-semibold">Khách hàng thân thiết</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </section>
          </div>
        )}

        {/* VIEW 2: PRODUCT CATALOGUE STOREFRONT */}
        {currentView === 'catalog' && (
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in" id="catalog-section">
            <div className="text-center md:text-left mb-8 border-b border-pink-100 pb-5">
              <h1 className="font-serif text-3xl font-bold text-gray-900">Danh Mục Thiết Kế Hoa Tươi</h1>
              <p className="text-sm text-gray-500 mt-1">Lọc tìm các bó hoa phù hợp với sở thích và cung cách bối cảnh sự kiện</p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              
              {/* Left filter sidebars */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Category selectors bubble list */}
                <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-xs">
                  <h3 className="font-serif text-base font-bold text-gray-800 mb-3.5 flex items-center">
                    <Flower className="mr-2 h-4.5 w-4.5 text-rose-500" />
                    Chủ đề sự kiện
                  </h3>
                  
                  <div className="space-y-1 text-xs">
                    <button
                      onClick={() => setSelectedCategoryId('')}
                      className={`w-full rounded-md px-3 py-2 text-left font-bold transition flex justify-between items-center ${
                        selectedCategoryId === '' 
                          ? 'bg-rose-600 text-white shadow-xs' 
                          : 'text-gray-600 hover:bg-pink-50 hover:text-rose-600'
                      }`}
                    >
                      <span>Tất cả thiết kế</span>
                      <span className="opacity-80">({products.length})</span>
                    </button>

                    {categories.map((c) => {
                      const count = products.filter(p => p.categoryId === c.id).length;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedCategoryId(c.id)}
                          className={`w-full rounded-md px-3 py-2 text-left font-bold transition flex justify-between items-center ${
                            selectedCategoryId === c.id 
                              ? 'bg-rose-600 text-white shadow-xs' 
                              : 'text-gray-600 hover:bg-pink-50 hover:text-rose-600'
                          }`}
                          id={`cat-filter-${c.id}`}
                        >
                          <span>{c.name}</span>
                          <span className="opacity-80">({count})</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated Special Offer Promo banner representing high fidelity */}
                <div className="rounded-2xl bg-gradient-to-br from-rose-600 to-rose-700 p-5 text-white shadow-md text-center">
                  <Sparkles className="mx-auto h-7 w-7 text-pink-200 animate-spin" />
                  <h4 className="mt-3 font-serif text-sm font-bold">Giảm ngay 50.000 VND</h4>
                  <p className="text-[10px] text-pink-100 mt-1.5 leading-snug">Áp dụng cho mọi hóa đơn đặt sắm hoa tươi trị giá trên 1.000.000 VND nội thành.</p>
                  <div className="mt-4 rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-pink-100 border border-white/15">
                    Mã code: FIORE199
                  </div>
                </div>

              </div>

              {/* Right products grid */}
              <div className="lg:col-span-9">
                
                {/* Visual state search keywords query summary */}
                {(searchQuery || selectedCategoryId) && (
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 bg-white border border-pink-50 p-4 rounded-xl">
                    <div className="flex items-center space-x-1">
                      <span>Đang hiển thị {filteredProducts.length} kết quả</span>
                      {selectedCategoryId && (
                        <span className="font-bold text-rose-600">
                          - thuộc "{categories.find(c => c.id === selectedCategoryId)?.name}"
                        </span>
                      )}
                      {searchQuery && (
                        <span className="font-bold text-rose-600">
                          - tìm kiếm từ khóa "{searchQuery}"
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setSelectedCategoryId('');
                        setSearchQuery('');
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline transition"
                    >
                      Xóa lọc bộ lọc
                    </button>
                  </div>
                )}

                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {filteredProducts.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={(product, e) => {
                          e.stopPropagation();
                          handleAddToCart(product, 1);
                        }}
                        onViewDetails={(product) => {
                          setSelectedProductId(product.id);
                          setCurrentView('detail');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border-2 border-dashed border-pink-100 bg-white p-12 text-center">
                    <p className="text-sm font-bold text-gray-700">Không tìm thấy mẫu hoa tươi tương thích</p>
                    <p className="text-xs text-gray-400 mt-1">Thử lại bằng việc đổi danh mục lọc hoặc gõ một từ khóa khác.</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategoryId('');
                      }}
                      className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 cursor-pointer"
                    >
                      Quay về mặc định
                    </button>
                  </div>
                )}

              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: PRODUCT DETAILS SCREEN */}
        {currentView === 'detail' && selectedProduct && (
          <div className="animate-fade-in">
            <ProductDetail
              product={selectedProduct}
              relatedProducts={relatedProducts}
              onAddToCart={(product, quantity) => handleAddToCart(product, quantity)}
              onClose={() => setCurrentView('catalog')}
              onSelectProduct={(p) => setSelectedProductId(p.id)}
            />
          </div>
        )}

        {/* VIEW 4: SHOPPING CART OVERVIEW */}
        {currentView === 'cart' && (
          <div className="animate-fade-in">
            <CartView
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQuantity}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              onProceedToCheckout={() => {
                setCurrentView('checkout');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}

        {/* VIEW 5: CHECKOUT DISPATCH CARD */}
        {currentView === 'checkout' && (
          <div className="animate-fade-in">
            <CheckoutView
              cartItems={cartItems}
              defaultUserEmail={currentUser ? currentUser.email : ''}
              onPlaceOrder={handlePlaceOrder}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            />
          </div>
        )}

        {/* VIEW 6: ACCOUNT REGISTRY LOGIN & PROFILE */}
        {currentView === 'auth' && (
          <div className="animate-fade-in">
            <AccountAuth
              currentUser={currentUser}
              onLogin={handleUserLogin}
              onLogout={handleUserLogout}
              onUpdateProfile={handleProfileUpdate}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            />
          </div>
        )}

        {/* VIEW 7: ORDER TRA VEL DETAILSTRACKER */}
        {currentView === 'orders' && (
          <div className="animate-fade-in">
            <OrderTracker
              orders={orders.filter(o => currentUser?.isAdmin || o.customerEmail === (currentUser ? currentUser.email : 'guest@fiore.vn'))}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
            />
          </div>
        )}

        {/* VIEW 8: EXECUTIVE MANAGEMENT ADMIN VIEW */}
        {currentView === 'admin' && (
          <div className="animate-fade-in">
            {isAdminAuthenticated ? (
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
                onAdminLogout={() => {
                  setIsAdminAuthenticated(false);
                  localStorage.removeItem('fiore_admin_authenticated');
                }}
              />
            ) : (
              <AdminLogin
                onLoginSuccess={() => {
                  setIsAdminAuthenticated(true);
                  localStorage.setItem('fiore_admin_authenticated', 'true');
                }}
              />
            )}
          </div>
        )}

        {/* VIEW 9: ABOUT US SCREEN */}
        {currentView === 'about' && (
          <div className="animate-fade-in">
            <AboutUs />
          </div>
        )}

        {/* VIEW 10: CONTACT US SCREEN */}
        {currentView === 'contact' && (
          <div className="animate-fade-in">
            <ContactUs />
          </div>
        )}

      </main>

      {/* LUXURY DESIGN FOOTER */}
      <footer className="border-t text-[#F8F5EF]" style={{ backgroundColor: '#1F3D2B', borderColor: 'rgba(255,255,255,0.15)' }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 border-b pb-8 mb-8 text-xs" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-2 rounded-xl border transition-all duration-300" style={{ backgroundColor: '#1F3D2B', borderColor: 'rgba(255,255,255,0.15)' }}>
                  <img 
                    src="/images/brand_logo_footer_gold_1780396918842.png" 
                    alt="Fióre Boutique de Fleurs" 
                    className="h-14 w-auto object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <p className="leading-relaxed text-[#F8F5EF]/90">
                Fióre là website mua sắm hoa tươi nghệ thuật hàng đầu, mang lại hơi thở và sắc màu tươi mới đến từng không gian sống nội ngoại thất.
              </p>
              <p className="text-[10px]" style={{ color: '#D8D8D8' }}>© 2026 Fióre. All rights reserved.</p>
            </div>

            {/* Quick Links Column */}
            <div>
              <h4 className="font-bold border-l-2 pl-2 mb-3 uppercase tracking-wider text-[11px]" style={{ color: '#F4E6C8', borderColor: '#C8A96B' }}>MUA SẮM HOA</h4>
              <ul className="space-y-2 font-medium">
                <li>
                  <button 
                    onClick={() => { setSelectedCategoryId(''); setCurrentView('catalog'); }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Tất cả sản phẩm
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedCategoryId('tinh-yeu'); setCurrentView('catalog'); }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Hoa tình yêu lãng mạn
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedCategoryId('sinh-nhat'); setCurrentView('catalog'); }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Hoa chúc tuổi sinh nhật
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setSelectedCategoryId('khai-truong'); setCurrentView('catalog'); }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Hoa khai trương hồng phát
                  </button>
                </li>
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="font-bold border-l-2 pl-2 mb-3 uppercase tracking-wider text-[11px]" style={{ color: '#F4E6C8', borderColor: '#C8A96B' }}>HỖ TRỢ KHÁCH QUÝ</h4>
              <ul className="space-y-2 font-medium">
                <li>
                  <button 
                    onClick={() => setCurrentView('orders')} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Theo dõi tiến độ đơn hàng
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setCurrentView('auth')} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Đăng ký thành viên VIP
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setCurrentView('contact'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Chính sách giao hoa hỏa tốc
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setCurrentView('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Cam kết tươi mới 24h
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact details */}
            <div className="space-y-2.5">
              <h4 className="font-bold border-l-2 pl-2 mb-3 uppercase tracking-wider text-[11px]" style={{ color: '#F4E6C8', borderColor: '#C8A96B' }}>LIÊN HỆ FIÓRE</h4>
              <p className="flex items-start text-[#F8F5EF]/90"><MapPin className="mr-1.5 h-4 w-4 shrink-0 mt-0.5" style={{ color: '#C8A96B' }} /> 34 Trần Thái Tông, Tổ 11, Thuận Hóa, Huế, Việt Nam</p>
              <p className="flex items-center text-[#F8F5EF]/90"><Phone className="mr-1.5 h-4 w-4 shrink-0" style={{ color: '#C8A96B' }} /> Hotline: 0916044683</p>
              <p className="flex items-center text-[#F8F5EF]/90"><Mail className="mr-1.5 h-4 w-4 shrink-0" style={{ color: '#C8A96B' }} /> thuyvanngo35@gmail.com</p>
              <p className="flex items-center text-[#F8F5EF]/90"><Clock className="mr-1.5 h-4 w-4 shrink-0" style={{ color: '#C8A96B' }} /> 7:00 AM - 9:00 PM (Mỗi Ngày)</p>

              {/* Kết nối với chúng tôi */}
              <div className="pt-3 mt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
                <h5 className="font-bold mb-1.5 uppercase tracking-wider text-[11px]" style={{ color: '#F4E6C8' }}>Kết nối với chúng tôi</h5>
                <div className="flex items-center space-x-3.5 mt-1">
                  <a 
                    href="https://www.facebook.com/profile.php?id=61590093366956" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all duration-300 transform hover:scale-105"
                    style={{ color: '#C8A96B' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F4E6C8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C8A96B'}
                    title="Facebook"
                  >
                    <Facebook className="h-[22px] w-[22px]" />
                  </a>
                  <a 
                    href="https://www.instagram.com/fiore_floral1/?hl=en" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all duration-300 transform hover:scale-105"
                    style={{ color: '#C8A96B' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F4E6C8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C8A96B'}
                    title="Instagram"
                  >
                    <Instagram className="h-[22px] w-[22px]" />
                  </a>
                  <a 
                    href="https://www.tiktok.com/@fiorefloral" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="transition-all duration-300 transform hover:scale-105"
                    style={{ color: '#C8A96B' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#F4E6C8'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#C8A96B'}
                    title="TikTok"
                  >
                    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px] fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.63 4.16 1.02.97 2.44 1.46 3.84 1.5l-.01 3.7c-1.39-.01-2.76-.43-3.88-1.28a7.07 7.07 0 0 1-1.58-1.58V15.2c0 1.25-.26 2.51-.79 3.65a7.19 7.19 0 0 1-4.7 4.39A7.32 7.32 0 0 1 5.4 20c-1.25-1.21-1.92-2.9-1.89-4.63a7.31 7.31 0 0 1 3.52-6.12c1.17-.67 2.53-.95 3.87-.79v3.83A3.5 3.5 0 0 0 8.5 14c-.66.52-1 1.34-.95 2.18a3.53 3.53 0 0 0 3 3.32c.86.1 1.74-.16 2.4-.73a3.52 3.52 0 0 0 1.05-2.61V.02h-1.48z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center text-[10px]" style={{ color: '#D8D8D8' }}>
            <p>Trải nghiệm website Demo Fióre - Thẩm định kỹ mỹ thuật và hiệu năng xử lý full stack giả định một cách trọn vẹn.</p>
          </div>

        </div>
      </footer>

      {/* Global Brand Support Companion */}
      <SupportChat 
        products={products} 
        onViewProduct={(productId) => {
          setSelectedProductId(productId);
          setCurrentView('detail');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

    </div>
  );
}

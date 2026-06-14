/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
import ExpressDeliveryPolicy from './components/ExpressDeliveryPolicy';
import FreshnessCommitment from './components/FreshnessCommitment';
import SupportChat from './components/SupportChat';
import brandLogoFooter from './assets/images/logo_footer_green_bg_1780554739638.png';
import blogBirthdayRoses from './assets/images/birthday_rose_tag_1780716864748.png';
import blogRedRoses from './assets/images/red_roses_bouquet_1780716878432.png';
import blogRosesGlassVase from './assets/images/roses_glass_vase_1780716891298.png';

import { verifyVnpayCallback } from './vnpayConfig';
import { initGmailAuth, subscribeToGmailAuth, googleSignIn, googleSignOut, sendOrderNotificationEmail } from './gmailService';
import { sendEmailJSOrderPaid } from './emailjsService';

import { 
  seedDatabaseIfNeeded,
  subscribeProducts,
  subscribeCategories,
  subscribeOrders,
  subscribeContacts,
  subscribeUsers,
  saveProduct,
  removeProduct,
  saveCategory,
  removeCategory,
  saveOrder,
  saveContact,
  removeContact,
  saveUser,
  subscribeReviews
} from './firebase';

import { Product, Category, CartItem, Order, User, OrderStatus, ContactMessage, Review } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from './data';
import { Sparkles, Flower, Phone, Mail, Clock, MapPin, Heart, ArrowRight, Facebook, Instagram, Calendar, Star, FileText, Lock, CheckCircle, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Article {
  id: string;
  title: string;
  date: string;
  category: string;
  image: string;
  shortDesc: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'birthday-roses',
    title: 'Nghệ thuật chọn hoa cho ngày sinh nhật',
    date: '02/06/2026',
    category: 'Hướng dẫn',
    image: blogBirthdayRoses,
    shortDesc: 'Mỗi đóa hoa mang một thông điệp riêng biệt. Khám phá bí quyết chọn loài hoa chuẩn xác theo độ tuổi và cung hoàng đạo của người bạn thương yêu.',
    content: [
      'Mỗi đóa hoa mang một thông điệp riêng biệt, phản ánh tinh tế tấm lòng của người tặng. Ngày sinh nhật là dịp quan trọng nhất để chúng ta bày tỏ sự quan tâm chân thành, tôn vinh cá tính và vị thế của người nhận thông qua những loài hoa phù hợp nhất.',
      'Khi lựa chọn hoa sinh nhật cho phái đẹp (như mẹ, vợ hoặc người yêu), những đóa hoa có tông màu lãng mạn như hồng pastel, đỏ nhung cổ điển hay cát tường dịu dàng luôn được ưu tiên hàng đầu. Theo nghệ nhân cắm hoa của Fióre, sắc hồng thể hiện sự trân quý, ngọt ngào, còn sắc đỏ tượng trưng cho tình yêu mãnh liệt, nồng nàn không phai mờ.',
      'Đối với đối tác hoặc cấp trên, việc ưu tiên các dòng hoa mang ý nghĩa thịnh vượng, may mắn là vô cùng khôn khéo. Các loài hoa như Lan hồ điệp sang trọng, Đồng tiền rực rỡ hay Hoa hướng dương hướng về phía mặt trời sẽ truyền tải trọn vẹn lời chúc mãnh liệt về sự thành công, thăng tiến và vững chãi.',
      'Mẹo nhỏ thú vị từ nghệ gia Fióre: Hãy thử chọn hoa theo cung hoàng đạo hoặc tháng sinh của người nhận! Ví dụ: Bạch Dương tràn đầy năng lượng rất hợp với hoa hồng đỏ kiêu sa; Kim Ngưu yêu thích sự tinh tế sẽ rung động trước cát tường thanh lịch; hay Song Ngư sâu sắc mộng mơ sẽ cực kỳ kết nối với những bông cẩm tú cầu dịu mát.',
      'Dù chọn loài hoa nào, yếu tố tươi mới và sự chỉn chu trong thiết kế thiết kế luôn là chìa khóa. Fióre cam kết tinh tuyển từng cành hoa đạt chuẩn độ nở và hương thơm ngọt ngào nhất để gửi gắm trọn vẹn khoảnh khắc hạnh phúc cho ngày sinh nhật của người bạn thương yêu.'
    ]
  },
  {
    id: 'love-flowers',
    title: 'Ý nghĩa các loài hoa trong tình yêu',
    date: '30/05/2026',
    category: 'Ý nghĩa hoa',
    image: blogRedRoses,
    shortDesc: 'Từ sắc đỏ rực rỡ của hoa hồng đến sắc tím thủy chung của cát tường, cùng tìm hiểu ngôn ngữ không lời thêu dệt nên buổi hẹn hò lãng mạn.',
    content: [
      'Người ta vẫn thường nói hoa tươi là ngôn ngữ không lời thêu dệt nên những buổi hẹn hò lãng mạn nhất. Kể từ thế kỷ 18, mỗi loài hoa đã được trao cho những mật mã riêng biệt để bộc lộ những tình cảm sâu kín nhất của các cặp đôi tình nhân.',
      'Đứng đầu danh sách chắc chắn là Hoa hồng đỏ - biểu tượng bất diệt của thần tình yêu Aphrodite. Nhưng bạn có biết mỗi sắc độ của hoa hồng lại đại diện cho một nấc thang cảm xúc khác nhau? Hồng đỏ rực rỡ là tình cảm cuồng nhiệt, say đắm; Hồng nhạt nhẹ nhàng đại diện cho lời tỏ tình chúm chím thuở ban đầu; trong khi Hồng cam lại biểu thị sự ngưỡng mộ và khao khát kết nối tâm hồn sâu sắc.',
      'Bên cạnh hoa hồng, Hoa Cát tường cũng mang một vị trí trang trọng trong lòng các đôi lứa. Loài hoa nhỏ nhắn với lớp cánh xếp nếp duyên dáng này tượng trưng cho sự dịu dàng, may mắn và gắn kết tự nhiên. Tặng cát tường là cách tinh tế nhất để gửi gắm thông điệp: "Mong tình yêu chúng ta luôn bình yên, thấu hiểu và hạnh phúc dài lâu".',
      'Không thể không nhắc tới Cẩm chướng trắng - loài hoa đại diện cho sự ngây thơ, thuần khiết và chân thành vẹn nguyên. Hay những cành Baby trắng thướt tha như những giọt sương mai, tuy mộc mạc nhưng lại là trợ thủ tuyệt vời tạo điểm nhấn lung linh cho mọi hộp hoa tỏ tình, biểu đạt tình yêu nhẹ nhàng nhưng bền bỉ và thủy chung.',
      'Bày tỏ tình yêu không cần những lời thề non hẹn biển phô trương, chỉ cần một bó hoa tinh tế được cắm tỉa đầy tâm huyết từ đôi tay lành nghề của nghệ nhân Fióre cũng đủ làm rung động trái tim ai đó. Hãy cùng để Fióre giúp bạn ghi dấu ấn khắc khoải ngàn năm.'
    ]
  },
  {
    id: 'fresh-tips',
    title: 'Cách giữ hoa tươi lâu tại nhà',
    date: '28/05/2026',
    category: 'Mẹo hay',
    image: blogRosesGlassVase,
    shortDesc: 'Hướng dẫn chi tiết từ nghệ nhân chăm sóc hoa của Fióre cách cắt tỉa gốc, pha dưỡng chất định kỳ giúp bình hoa tươi suốt 2 tuần vẫn vẹn sắc.',
    content: [
      'Một bình hoa tươi tắn rực rỡ trong không gian sống không chỉ làm đẹp ngôi nhà mà còn mang lại sinh khí hữu hiệu giúp giải tỏa căng thẳng cho gia chủ. Tuy nhiên, làm sao để giữ bình hoa xinh đẹp tươi suốt hai tuần lại là câu hỏi khiến nhiều người bỡ ngỡ.',
      'Bước quan trọng đầu tiên nằm ở khâu xử lý gốc cành. Khi nhận hoa từ Fióre, bạn hãy dùng kéo sắc cắt xéo một góc 45 độ ngay dưới vòi nước chảy hoặc trong chậu nước sạch. Việc cắt vát 45 độ giúp tối đa hóa diện tích tiếp xúc của vết cắt với nước, đồng thời việc cắt trong nước ngăn chặn bọt khí chặn đứng các ống dẫn mạch của cành.',
      'Tiếp theo là công tác dọn dẹp lá gốc. Hãy tỉa bỏ hết tất cả những chiếc lá nằm ở phần cành ngập dưới nước. Lá ngập trong nước rất dễ thối rữa nhanh chóng, tạo điều kiện thuận lợi cho vi khuẩn sinh sôi nảy nở làm đục nước bình và đẩy nhanh quá trình hoa héo rũ.',
      'Về nước cắm hoa: Luôn sử dụng bình nước sạch tinh khiết. Nghệ gia Fióre mách bạn một mẹo cổ điển nhưng vô cùng hiệu quả: Hãy pha thêm vào nước bình một muỗng đường nhỏ (để cung cấp năng lượng cho hoa tiếp tục nở) kết hợp cùng vài giọt nước cốt chanh hoặc giấm trắng (để tăng tính axit, ức chế vi khuẩn). Nếu có gói dưỡng hoa Chrysal kèm theo từ Fióre, hãy hòa tan theo đúng liều lượng chỉ định nhé.',
      'Cuối cùng, vị trí đặt bình hoa chính là mấu chốt. Tránh đặt bình hoa trực tiếp dưới ánh nắng mặt trời gay gắt, luồng gió phả ra từ điều hòa, gần các thiết bị tỏa nhiệt lớn hay gần các giỏ trái cây chín (trái cây chín tỏa ra khí Ethylene thúc đẩy hoa nhanh tàn). Hãy thay nước bình hoa 2 ngày một lần để giữ nước luôn sạch mát, loại bỏ ngay bông héo để bảo vệ sức khỏe cho những đóa hoa còn lại.'
    ]
  }
];

export default function App() {
  
  // --- LOCAL PERSISTENCE STATE INITIALIZERS ---
  const [rawProducts, setRawProducts] = useState<Product[]>(() => {
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

  const [globalReviews, setGlobalReviews] = useState<Review[]>([]);

  const products = useMemo(() => {
    return rawProducts.map(prod => {
      // Average rating and review count from the live Firestore reviews database
      const prodReviews = globalReviews.filter(r => r.productId === prod.id && r.isVerified !== false);
      const reviewsCount = prodReviews.length;
      const rating = reviewsCount > 0
        ? Number((prodReviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1))
        : 0;
      return {
        ...prod,
        rating,
        reviewsCount
      };
    });
  }, [rawProducts, globalReviews]);

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

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fiore_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartToast, setCartToast] = useState<{ show: boolean; message: string; productName?: string; image?: string } | null>(null);
  const toastTimeoutRef = React.useRef<any>(null);

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

  // --- PROGRAMMATIC ROUTER HOOKS ---
  const navigate = useNavigate();
  const location = useLocation();

  // --- COMPONENT ACTIVE VIEW ROLES CONTROL ---
  const [currentRole, setCurrentRole] = useState<'customer' | 'admin'>('customer');
  const [currentView, setCurrentView] = useState<string>('home');
  const [authTab, setAuthTab] = useState<'membership' | 'profile' | 'feedback'>('membership');
  const [showExpressDeliveryPolicyMenu, setShowExpressDeliveryPolicyMenu] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fiore_show_express_delivery_policy_menu') === 'true';
  });
  const [showCommitmentMenu, setShowCommitmentMenu] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('fiore_show_commitment_menu') === 'true';
  });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('fiore_admin_authenticated') === 'true';
  });
  
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

  // --- FIRESTORE REAL-TIME SYNCHRONIZATION EVENT ---
  useEffect(() => {
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

    let active = true;
    let cleanups: (() => void)[] = [];

    const initializeAndSubscribe = async () => {
      // 1. Seed Firestore database with standard defaults if it's completely empty
      await seedDatabaseIfNeeded(INITIAL_PRODUCTS, INITIAL_CATEGORIES, sampleOrders, sampleUsers);
      
      if (!active) return;

      // 2. Attach real-time onSnapshot collection listeners
      const unsubProducts = subscribeProducts((prods) => {
        if (prods.length > 0) setRawProducts(prods);
      });
      cleanups.push(unsubProducts);

      const unsubReviews = subscribeReviews((revs) => {
        setGlobalReviews(revs);
      });
      cleanups.push(unsubReviews);

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

    // Clean up listeners on unmount
    return () => {
      active = false;
      cleanups.forEach((unsub) => unsub());
    };
  }, []);

  // Sync admin authentication changes across windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'fiore_admin_authenticated') {
        const isAuth = localStorage.getItem('fiore_admin_authenticated') === 'true';
        if (isAuth !== isAdminAuthenticated) setIsAdminAuthenticated(isAuth);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAdminAuthenticated]);

  const [gmailUser, setGmailUser] = useState<any>(null);
  const [gmailToken, setGmailToken] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('fiore_gmail_access_token') : null;
  });

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

  // Synchronize URL search param "view" with our client-side view state
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const view = searchParams.get('view');
    if (view && ['orders', 'checkout', 'catalog', 'home', 'about', 'contact', 'auth', 'membership'].includes(view)) {
      if (view === 'membership') {
        setAuthTab('membership');
        setCurrentView('auth');
      } else {
        if (view === 'auth') {
          setAuthTab('profile');
        }
        setCurrentView(view);
      }
      const newUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, []);

  // Listen for navigation events and synchronize with path URL
  useEffect(() => {
    const p = location.pathname;
    if (p === '/admin' || p === '/admin/login' || p.startsWith('/admin/') || p === '/admin.html') {
      setCurrentRole('admin');
      setCurrentView('admin');
    } else {
      setCurrentRole('customer');
      if (currentView === 'admin') {
         setCurrentView('home');
      }
    }
  }, [location.pathname, currentView]);
  
  // Filtering & Realtime Search States
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [sentEmailOrderIds, setSentEmailOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fiore_sent_email_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('fiore_sent_email_orders', JSON.stringify(sentEmailOrderIds));
  }, [sentEmailOrderIds]);

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
              const alreadyExists = orders.some((o) => o.id === pending.id);
              if (!alreadyExists) {
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
                  couponCode: pending.couponCode || null,
                  discountAmount: pending.discountAmount || null,
                  redeemedPoints: pending.redeemedPoints || null,
                };

                // Deduct inventory stocks and synchronize to Firestore
                if (pending.cartItems && pending.cartItems.length > 0) {
                  pending.cartItems.forEach((it: any) => {
                    const match = products.find((prod) => prod.id === it.product.id);
                    if (match) {
                      const updatedProd = {
                        ...match,
                        stock: Math.max(0, match.stock - it.quantity)
                      };
                      saveProduct(updatedProd).catch((err) => {
                        console.error('Error synchronizing VNPAY deducted stock to Firebase:', err);
                      });
                    }
                  });
                }

                setRawProducts((prevProds) => {
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

                setOrders((prev) => [...prev, newOrder]);

                // Auto-send single order confirmation email via EmailJS
                sendEmailJSOrderPaid(newOrder, currentUser)
                  .then((res) => {
                    if (res.success) {
                      console.log(`Email hóa đơn đơn hàng VNPAY ${newOrder.id} đã được gửi tự động qua EmailJS!`);
                      setSentEmailOrderIds((prev) => {
                        if (prev.includes(newOrder.id)) return prev;
                        return [...prev, newOrder.id];
                      });
                    } else {
                      console.warn('Gửi email tự động không thành công qua EmailJS.');
                    }
                  })
                  .catch((err) => {
                    console.error('Lỗi khi gửi email tự động VNPAY qua EmailJS:', err);
                  });
              }
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
  }, [currentUser, orders, gmailToken]);

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

  // Real-time synchronization of cart items to always display the latest product details, tags, and images from the active database
  const syncedCartItems = useMemo(() => {
    return cartItems.map((item) => {
      const match = products.find((p) => p.id === item.product.id);
      return match ? { ...item, product: match } : item;
    });
  }, [cartItems, products]);

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

    // Hiện thông báo bạn đã thêm sản phẩm vào giỏ hàng
    setCartToast({
      show: true,
      message: 'Bạn đã thêm sản phẩm vào giỏ hàng',
      productName: product.name,
      image: product.image
    });

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      setCartToast(null);
    }, 3000);
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
    recipientEmail?: string;
    shippingAddress: string;
    note: string;
    paymentMethod: 'COD' | 'VISA' | 'VNPAY';
    totalAmount?: number;
    couponCode?: string;
    discountAmount?: number;
    redeemedPoints?: number;
  }) => {
    const sub = cartItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);
    const shipping = 30000;
    const discount = sub > 1000000 ? 50000 : 0;
    const finalPrice = recipientData.totalAmount !== undefined ? recipientData.totalAmount : (sub + shipping - discount);

    const newOrder: Order = {
      id: recipientData.id || `ORD-${Math.floor(100 + Math.random() * 900)}`,
      customerName: currentUser ? currentUser.name : recipientData.recipientName,
      customerEmail: currentUser ? currentUser.email : (recipientData.recipientEmail || 'guest@fiore.vn'),
      recipientName: recipientData.recipientName,
      recipientPhone: recipientData.recipientPhone,
      shippingAddress: recipientData.shippingAddress,
      note: recipientData.note,
      items: [...cartItems],
      totalAmount: finalPrice,
      paymentMethod: recipientData.paymentMethod,
      paymentStatus: recipientData.paymentMethod === 'COD' ? 'Unpaid' : 'Paid',
      status: recipientData.paymentMethod === 'COD' ? 'confirmed' : 'paid',
      createdAt: new Date().toISOString(),
      couponCode: recipientData.couponCode,
      discountAmount: recipientData.discountAmount,
      redeemedPoints: recipientData.redeemedPoints
    };

    // Deduct actual products inventory stocks in Firestore
    cartItems.forEach((it) => {
      const match = products.find((prod) => prod.id === it.product.id);
      if (match) {
        const updatedProd = {
          ...match,
          stock: Math.max(0, match.stock - it.quantity)
        };
        saveProduct(updatedProd);
      }
    });

    saveOrder(newOrder);
    setCartItems([]); // Clear cart items on purchase completion!

    // Auto-send single order confirmation email via EmailJS
    sendEmailJSOrderPaid(newOrder, currentUser)
      .then((res) => {
        if (res.success) {
          console.log(`Email hóa đơn đơn hàng ${newOrder.id} đã được gửi tự động qua EmailJS!`);
          setSentEmailOrderIds((prev) => {
            if (prev.includes(newOrder.id)) return prev;
            return [...prev, newOrder.id];
          });
        } else {
          console.warn('Gửi email tự động không thành công qua EmailJS.');
        }
      })
      .catch((err) => {
        console.error('Lỗi khi gửi email tự động qua EmailJS:', err);
      });
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
    const userExists = users.some((u) => u.email.toLowerCase() === user.email.toLowerCase());
    if (userExists) {
      const existingUser = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
      if (existingUser) {
        saveUser({ ...existingUser, ...user });
      }
    } else {
      saveUser(user);
    }
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
    saveUser(updated);
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

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const o = orders.find((order) => order.id === orderId);
    if (!o) return;

    const oldPaymentStatus = o.paymentStatus;
    const oldStatus = o.status;
    const newPaymentStatus = (status === 'completed' || status === 'paid') ? 'Paid' : o.paymentStatus;
    
    const updatedOrder: Order = {
      ...o,
      status,
      paymentStatus: newPaymentStatus
    };

    saveOrder(updatedOrder);

    if (
      (oldPaymentStatus !== 'Paid' && newPaymentStatus === 'Paid') ||
      (oldStatus !== 'paid' && status === 'paid')
    ) {
      const currentToken = localStorage.getItem('fiore_gmail_access_token') || gmailToken;
      if (currentToken) {
        sendOrderNotificationEmail(updatedOrder, updatedOrder.customerEmail)
          .then((success) => {
            if (success) {
              console.log(`Email hóa đơn đơn hàng ${updatedOrder.id} đã được gửi tự động khi chuyển sang Đã thanh toán!`);
            } else {
              console.warn('Gửi email tự động từ dashboard không thành công.');
            }
          })
          .catch((err) => {
            console.error('Lỗi khi gửi email tự động:', err);
          });
      }
    }
  };

  const handleUpdateContacts = (updater: React.SetStateAction<ContactMessage[]>) => {
    setContacts((prev) => {
      const next = typeof updater === 'function' ? (updater as any)(prev) : updater;
      next.forEach((item: ContactMessage) => {
        const prevItem = prev.find((p) => p.id === item.id);
        if (!prevItem || JSON.stringify(prevItem) !== JSON.stringify(item)) {
          saveContact(item);
        }
      });
      prev.forEach((prevItem) => {
        if (!next.some((n: ContactMessage) => n.id === prevItem.id)) {
          removeContact(prevItem.id);
        }
      });
      return next;
    });
  };

  // Common VND price formatting assistant
  const formatVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/20 antialiased font-sans overflow-x-clip">
      
      {/* HEADER COMPONENT */}
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        cartCount={cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
        onNavigate={(v) => {
          if (v === 'admin') {
            navigate('/admin');
          } else {
            if (v === 'membership') {
              setAuthTab('membership');
              setCurrentView('auth');
            } else if (v === 'feedback') {
              setAuthTab('feedback');
              setCurrentView('auth');
            } else {
              if (v === 'auth') {
                setAuthTab('profile');
              }
              setCurrentView(v);
            }
            if (location.pathname !== '/') {
              navigate('/');
            }
            window.scrollTo({ top: 0, behavior: 'instant' });
          }
        }}
        onLogout={handleUserLogout}
        onSwitchRole={(role) => {
          handleSwitchRole(role);
          if (role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentView={currentView}
        showExpressDeliveryPolicyMenu={showExpressDeliveryPolicyMenu}
        showCommitmentMenu={showCommitmentMenu}
        authTab={authTab}
      />

      {/* MAIN VIEWPORT BODY */}
      <main className="flex-grow">
        <Routes>
          <Route path="/admin.html" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/login" element={
            isAdminAuthenticated ? (
              <Navigate to="/admin" replace />
            ) : (
              <div className="animate-fade-in animate-once">
                <AdminLogin
                  onLoginSuccess={() => {
                    setIsAdminAuthenticated(true);
                    localStorage.setItem('fiore_admin_authenticated', 'true');
                    navigate('/admin');
                  }}
                />
              </div>
            )
          } />

          <Route path="/admin" element={
            isAdminAuthenticated ? (
              <div className="animate-fade-in animate-once">
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
                  onAdminLogout={() => {
                    setIsAdminAuthenticated(false);
                    localStorage.removeItem('fiore_admin_authenticated');
                    navigate('/admin/login');
                  }}
                />
              </div>
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } />

          <Route path="*" element={
            <>
        
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

              <div className="grid grid-cols-2 gap-y-6 gap-x-3 xs:gap-y-10 xs:gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
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
                {ARTICLES.map((article) => (
                  <div 
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#E8E1D6] bg-white shadow-[0_4px_20px_rgba(31,61,43,0.03)] hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(31,61,43,0.07)] transition-all duration-300 cursor-pointer"
                  >
                    <div className="relative overflow-hidden aspect-video h-52">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 left-3 bg-[#1F3D2B]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                        {article.category}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center space-x-2 text-[11px] text-[#4F4F4F]/70 mb-2">
                        <Calendar className="h-3.5 w-3.5 text-[#C8A96B]" />
                        <span>{article.date}</span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-[#1F3D2B] h-14 line-clamp-2 leading-snug group-hover:text-[#C8A96B] transition-colors duration-200">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-xs text-[#4F4F4F] line-clamp-3 leading-relaxed flex-grow">
                        {article.shortDesc}
                      </p>
                      <div className="mt-5 border-t border-[#E8E1D6]/60 pt-4">
                        <span className="inline-flex items-center text-xs font-bold text-[#C8A96B] group-hover:text-[#B28D49] transition-colors cursor-pointer">
                          Đọc thêm
                          <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <div className="grid grid-cols-2 gap-y-6 gap-x-3 xs:gap-y-10 xs:gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
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
              orders={orders}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* VIEW 4: SHOPPING CART OVERVIEW */}
        {currentView === 'cart' && (
          <div className="animate-fade-in">
            <CartView
              cartItems={syncedCartItems}
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
              cartItems={syncedCartItems}
              defaultUserEmail={currentUser ? currentUser.email : ''}
              onPlaceOrder={handlePlaceOrder}
              onNavigate={(v) => {
                setCurrentView(v);
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              sentEmailOrderIds={sentEmailOrderIds}
              currentUser={currentUser}
              orders={orders}
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
                if (v === 'admin') {
                  navigate('/admin');
                } else {
                  setCurrentView(v);
                  window.scrollTo({ top: 0, behavior: 'instant' });
                }
              }}
              orders={orders}
              contacts={contacts}
              initialTab={authTab}
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

        {/* VIEW 9: ABOUT US SCREEN */}
        {currentView === 'about' && (
          <div className="animate-fade-in">
            <AboutUs />
          </div>
        )}

        {/* VIEW 10: CONTACT US SCREEN */}
        {currentView === 'contact' && (
          <div className="animate-fade-in">
            <ContactUs onNewContact={(newMsg) => saveContact(newMsg)} />
          </div>
        )}

        {/* VIEW 11: EXPRESS DELIVERY POLICY SCREEN */}
        {currentView === 'express-delivery' && (
          <div className="animate-fade-in">
            <ExpressDeliveryPolicy />
          </div>
        )}

        {/* VIEW 12: FRESHNESS COMMITMENT SCREEN */}
        {currentView === 'commitment' && (
          <div className="animate-fade-in">
            <FreshnessCommitment />
          </div>
        )}

            </>
          } />
        </Routes>
      </main>

      {/* LUXURY DESIGN FOOTER */}
      <footer className="border-t text-[#F8F5EF]" style={{ backgroundColor: '#1F3D2B', borderColor: 'rgba(255,255,255,0.15)' }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4 border-b pb-8 mb-8 text-xs" style={{ borderColor: 'rgba(255,255,255,0.15)' }}>
            
            {/* Branding Column */}
            <div className="space-y-4">
              <div className="flex items-center">
                <div 
                  onClick={() => setCurrentView('home')}
                  className="p-2 rounded-xl border transition-all duration-300 cursor-pointer" 
                  style={{ backgroundColor: '#1F3D2B', borderColor: 'rgba(255,255,255,0.15)' }}
                >
                  <img 
                    src={brandLogoFooter} 
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
                    onClick={() => { 
                      setShowExpressDeliveryPolicyMenu(true);
                      localStorage.setItem('fiore_show_express_delivery_policy_menu', 'true');
                      setCurrentView('express-delivery'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} 
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
                    onClick={() => { 
                      setShowExpressDeliveryPolicyMenu(true);
                      localStorage.setItem('fiore_show_express_delivery_policy_menu', 'true');
                      setCurrentView('express-delivery'); 
                      setTimeout(() => {
                        const el = document.getElementById('privacy-policy-title');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 120);
                    }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Chính sách bảo mật thông tin
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { 
                      setShowExpressDeliveryPolicyMenu(true);
                      localStorage.setItem('fiore_show_express_delivery_policy_menu', 'true');
                      setCurrentView('express-delivery'); 
                      setTimeout(() => {
                        const el = document.getElementById('complaint-policy-title');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        } else {
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }, 120);
                    }} 
                    className="transition-colors duration-200 text-left cursor-pointer"
                    style={{ color: '#F8F5EF' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#C8A96B'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#F8F5EF'}
                  >
                    Chính sách giải quyết khiếu nại
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { 
                      setShowCommitmentMenu(true);
                      localStorage.setItem('fiore_show_commitment_menu', 'true');
                      setCurrentView('commitment'); 
                      window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }} 
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
                    href="https://www.facebook.com/fioreboutiqueflorist" 
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
                    href="https://www.instagram.com/fiore_boutiqueflorist/?hl=en" 
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

      {/* Floating Success Toast when adding to Card */}
      <AnimatePresence>
        {cartToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-6 right-6 z-[9999] flex max-w-sm items-center gap-3.5 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
            style={{ minWidth: '320px' }}
          >
            {cartToast.image ? (
              <img
                src={cartToast.image}
                alt={cartToast.productName}
                className="h-11 w-11 rounded-xl object-cover shadow-sm bg-stone-50"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 animate-pulse">
                <CheckCircle className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600 inline shrink-0" />
                {cartToast.message}
              </p>
              {cartToast.productName && (
                <p className="text-[11px] font-medium text-stone-500 mt-0.5 truncate max-w-[200px]">
                  {cartToast.productName}
                </p>
              )}
            </div>
            <button
              onClick={() => setCartToast(null)}
              className="text-stone-400 hover:text-stone-600 font-bold text-xs p-1 cursor-pointer transition-colors"
            >
              ✕
            </button>
          </motion.div>
        )}

        {/* Article Full View Modal overlay */}
        {selectedArticle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-xs"
            onClick={() => setSelectedArticle(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#E8E1D6] flex flex-col"
            >
              {/* Cover Image Container */}
              <div className="relative h-56 sm:h-72 w-full shrink-0">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title} 
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-transparent" />
                
                {/* Header Overlay */}
                <div className="absolute bottom-5 left-5 right-5 text-white text-left">
                  <span className="inline-block bg-[#C8A96B] text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-2">
                    {selectedArticle.category}
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight leading-snug">
                    {selectedArticle.title}
                  </h2>
                  <div className="flex items-center space-x-2.5 text-[10px] text-stone-200/90 mt-2 font-medium">
                    <Calendar className="h-3.5 w-3.5 text-[#C8A96B]" />
                    <span>{selectedArticle.date}</span>
                    <span>•</span>
                    <span>Tác giả: Nghệ nhân Fióre</span>
                  </div>
                </div>

                {/* Close Button on Top Right */}
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-stone-900/50 text-white hover:bg-stone-900/85 transition cursor-pointer backdrop-blur-xs border border-white/10"
                  aria-label="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="p-5 sm:p-7 space-y-5 overflow-y-auto text-left flex-1">
                <p className="text-[#1F3D2B] font-medium text-xs sm:text-sm border-l-4 border-[#C8A96B] pl-3.5 italic leading-relaxed py-0.5">
                  "{selectedArticle.shortDesc}"
                </p>

                <div className="space-y-3.5 text-stone-600 text-xs sm:text-sm leading-relaxed font-sans">
                  {selectedArticle.content.map((paragraph: string, idx: number) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {/* Article Footer Signature decoration */}
                <div className="pt-5 border-t border-[#E8E1D6]/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-8 w-8 rounded-full bg-pink-50 flex items-center justify-center text-[#C8A96B] shrink-0">
                      <Flower className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#1F3D2B] leading-none">Ban biên tập Fióre</p>
                      <p className="text-[9px] text-stone-400 mt-1 leading-none">Kiến tạo không gian sống đầy cảm hứng</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="px-4 py-2 rounded-full bg-[#1F3D2B] hover:bg-[#152a1d] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                  >
                    Đóng bài viết
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

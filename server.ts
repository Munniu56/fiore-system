import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  getDoc 
} from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";

// Load local environment configuration
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// Initialize Firebase dynamically from config
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

import { startMarketingScheduler, checkAndTriggerHolidayCampaigns } from "./src/marketing/campaign-scheduler";

// Start the high performance daily marketing schedule (08:00 VN time ICT)
startMarketingScheduler();


// ==========================================
// Express API Endpoints
// ==========================================

// Hủy đăng ký nhận bản tin trực tuyến với giao diện Fióre tinh tế
app.get("/api/marketing/unsubscribe", async (req, res) => {
  const email = (req.query.email as string || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fióre - Huỹ nhận tin</title>
        <style>
          body { background: #FAF9F6; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
          .card { background: white; padding: 40px; border-radius: 12px; border: 1px solid #eae6df; max-width: 400px; text-align: center; }
          h2 { color: #8c3b3b; }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>Email không hợp lệ</h2>
          <p>Yêu cầu hủy đăng ký nhận tin gặp lỗi do định dạng thư điện tử chưa chính xác.</p>
        </div>
      </body>
      </html>
    `);
  }

  try {
    const docId = email.replace(/[^a-z0-0]/g, "_");
    await setDoc(doc(db, "unsubscribers", docId), {
      email,
      unsubscribedAt: new Date().toISOString()
    });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hủy đăng ký thành công - Fióre Boutique</title>
        <style>
          body { background: #FAF9F6; font-family: -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; color: #2F2E2C; }
          .card { background: white; padding: 50px 30px; border-radius: 16px; border: 1px solid #eae6df; max-width: 450px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.02); }
          .brand { font-family: Georgia, serif; font-size: 24px; letter-spacing: 4px; color: #1F3D2B; font-weight: bold; margin-bottom: 5px; }
          .sub { font-size: 9px; letter-spacing: 2px; color: #84A98C; text-transform: uppercase; margin-bottom: 30px; }
          h2 { color: #52796F; font-family: Georgia, serif; font-weight: normal; margin-top: 0; }
          p { font-size: 13.5px; line-height: 1.6; color: #5F5E5C; margin-bottom: 30px; }
          .back-btn { display: inline-block; padding: 12px 28px; background: #52796F; color: white; text-decoration: none; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; border-radius: 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand">F i ó r e</div>
          <div class="sub">Artisanal Florist Boutique</div>
          <h2>Hủy Nhận Tin Thành Công</h2>
          <p>Fióre đã xác nhận và loại bỏ địa chỉ <strong>${email}</strong> khỏi tất cả chiến dịch khuyến mãi, sự kiện lễ hội từ nay về sau. Chúng tôi vô cùng trân trọng sự đồng hành tinh khôi của Quý khách cùng tiệm lâu nay.</p>
          <a href="/" class="back-btn">Quay về trang chủ</a>
        </div>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`Error processing unsubscription: ${err.message}`);
  }
});

// Trigger check & gửi chiến dịch ngày lễ tự động hóa (nếu còn 5 ngày) phục vụ nút Admin Dashboard
app.post("/api/marketing/trigger-check", async (req, res) => {
  try {
    const result = await checkAndTriggerHolidayCampaigns();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Gửi tay trực tiếp chiến dịch hoa lễ (hoặc chạy kiểm tra tuỳ biến theo ngày) cho Admin kiểm tra thử
app.post("/api/marketing/send-manual", async (req, res) => {
  const { dateOffset } = req.body; // Can pass custom mock date if needed
  try {
    const customDate = dateOffset ? new Date(dateOffset) : undefined;
    const result = await checkAndTriggerHolidayCampaigns(customDate);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách Logs gửi chiến dịch
app.get("/api/marketing/logs", async (req, res) => {
  try {
    const logsSnap = await getDocs(collection(db, "marketing_logs"));
    const logsList: any[] = [];
    logsSnap.forEach((docRef) => {
      logsList.push({ id: docRef.id, ...docRef.data() });
    });
    // Sắp xếp giảm dần theo thời gian gửi
    logsList.sort((a, b) => new Date(b.sentDate).getTime() - new Date(a.sentDate).getTime());
    res.json(logsList);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy tổng quan trạng thái cấu hình và thời gian hiện tại
app.get("/api/marketing/status", (req, res) => {
  const apiKeyPresent = !!process.env.RESEND_API_KEY;
  const now = new Date();
  
  // Tính lần chạy tới lúc 08:00
  const nextRun = new Date();
  nextRun.setHours(8, 0, 0, 0);
  if (now.getTime() >= nextRun.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  res.json({
    apiKeyConfigured: apiKeyPresent,
    emailFrom: process.env.EMAIL_FROM || "Fióre Boutique <tin-tuc@fiore.vn>",
    serverTimeISO: now.toISOString(),
    serverTimeLocal: now.toLocaleString(),
    nextCheckTimeISO: nextRun.toISOString(),
    nextCheckTimeLocal: nextRun.toLocaleString(),
  });
});

// Đăng ký nhận bản tin khuyến mãi (Newsletter API)
app.post("/api/marketing/subscribe", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Định dạng email không hợp lệ." });
  }

  try {
    const emailLower = email.trim().toLowerCase();
    const subId = emailLower.replace(/[^a-z0-9]/g, "_");
    
    // Lưu vào collection subscribers trong Firestore
    await setDoc(doc(db, "subscribers", subId), {
      id: subId,
      email: emailLower,
      createdAt: new Date().toISOString()
    });

    res.json({ success: true, message: "Đăng ký nhận tin tức Fióre thành công rực rỡ!" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// Vite Integration & Static File Serving
// ==========================================

const initServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files first
    app.use(express.static(distPath));

    // Admin Panel routing
    app.get("/admin", (req, res) => {
      res.sendFile(path.join(distPath, "admin.html"));
    });
    app.get("/admin.html", (req, res) => {
      res.sendFile(path.join(distPath, "admin.html"));
    });

    // VNPay return routing
    app.get("/src/pages/vnpay-return.html", (req, res) => {
      res.sendFile(path.join(distPath, "src/pages/vnpay-return.html"));
    });

    // Fallback index.html for SPA (main app)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fióre Fullstack Server] Đang chạy tại cổng: ${PORT}`);
  });
};

initServer();

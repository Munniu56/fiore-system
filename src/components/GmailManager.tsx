/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, Send, RefreshCw, Inbox, AlertCircle, ExternalLink, 
  FileText, CheckCircle, User, Calendar, Info, Lock, Key, KeyRound, HelpCircle, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as ShopUser, Order } from '../types';

interface GmailManagerProps {
  users: ShopUser[];
  orders: Order[];
  onBackToStats?: () => void;
  prepopulatedEmail?: {
    to: string;
    subject: string;
    body: string;
  } | null;
  onClearPrepopulatedEmail?: () => void;
}

interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  snippet: string;
  bodyText?: string;
  isRead?: boolean;
}

export default function GmailManager({ 
  users, 
  orders, 
  onBackToStats, 
  prepopulatedEmail, 
  onClearPrepopulatedEmail 
}: GmailManagerProps) {
  
  // --- OAUTH & TOKEN STATES ---
  const [clientId, setClientId] = useState<string>(() => {
    return localStorage.getItem('fiore_gmail_client_id') || (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  });
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('fiore_gmail_access_token') || null;
  });
  const [userProfile, setUserProfile] = useState<{ emailAddress: string; messagesTotal: number } | null>(null);
  
  // --- VIEW RANGE STATES ---
  const [activeSubTab, setActiveSubTab] = useState<'inbox' | 'compose' | 'sent' | 'settings'>('inbox');
  const [inboxEmails, setInboxEmails] = useState<GmailMessage[]>([]);
  const [sentEmails, setSentEmails] = useState<GmailMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedMail, setSelectedMail] = useState<GmailMessage | null>(null);
  
  // --- COMPOSE STATES ---
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [selectedShopUser, setSelectedShopUser] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');

  // --- MANUAL ACCESS TOKEN INPUT ---
  const [manualToken, setManualToken] = useState('');
  const [showManualTokenForm, setShowManualTokenForm] = useState(false);

  // --- SAVE CLIENT ID ---
  useEffect(() => {
    if (clientId) {
      localStorage.setItem('fiore_gmail_client_id', clientId);
    } else {
      localStorage.removeItem('fiore_gmail_client_id');
    }
  }, [clientId]);

  // --- DETECT INCOMING PREPOPULATED EMAIL ---
  useEffect(() => {
    if (prepopulatedEmail) {
      setComposeTo(prepopulatedEmail.to);
      setComposeSubject(prepopulatedEmail.subject);
      setComposeBody(prepopulatedEmail.body);
      setSelectedTemplate('custom');
      setActiveSubTab('compose');
      // Clear after applying so it doesn't loop
      if (onClearPrepopulatedEmail) {
        onClearPrepopulatedEmail();
      }
    }
  }, [prepopulatedEmail, onClearPrepopulatedEmail]);

  // --- HELPER: ENCODE UTF-8 TO BASE64URL (GMAIL REQUIREMENT) ---
  const utf8ToB64Url = (str: string) => {
    try {
      const utf8Bytes = new TextEncoder().encode(str);
      const binaryString = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
      return btoa(binaryString)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    } catch (e) {
      // Fallback
      return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }
  };

  // --- FETCH USER PROFILE TO CHECK VALIDITY ---
  const fetchUserProfile = useCallback(async (token: string, silentOnFail: boolean = false) => {
    try {
      setLoading(true);
      if (!silentOnFail) {
        setErrorMsg(null);
      }
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Access Token đã hết hạn hoặc không hợp lệ. Vui lòng kết nối lại tài khoản.');
        }
        let errorDetails = '';
        try {
          const errData = await res.json();
          if (errData?.error?.message) {
            errorDetails = `: ${errData.error.message}`;
          }
        } catch (_) {
          try {
            const errText = await res.text();
            if (errText) errorDetails = `: ${errText}`;
          } catch (__) {}
        }
        throw new Error(`Gmail API error (status ${res.status})${errorDetails}`);
      }
      
      const data = await res.json();
      setUserProfile({
        emailAddress: data.emailAddress,
        messagesTotal: data.messagesTotal
      });
      localStorage.setItem('fiore_gmail_access_token', token);
      setAccessToken(token);
    } catch (err: any) {
      console.error('fetchUserProfile error:', err);
      if (!silentOnFail) {
        setErrorMsg(err.message);
      }
      setUserProfile(null);
      // Remove stale token
      localStorage.removeItem('fiore_gmail_access_token');
      setAccessToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- OAUTH REDIRECT FLOW WITH POPUP ---
  const handleConnectGoogle = () => {
    if (!clientId.trim()) {
      setErrorMsg('Vui lòng cung cấp Google OAuth Client ID trong tab Cấu hình hoặc nhập Access Token thủ công.');
      setActiveSubTab('settings');
      return;
    }
    
    setErrorMsg(null);
    const redirectUri = window.location.origin;
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
      client_id: clientId.trim(),
      redirect_uri: redirectUri,
      response_type: 'token',
      scope: 'https://mail.google.com/ https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.modify',
      state: 'gmail_auth'
    }).toString();

    // Setup popup window
    const popup = window.open(authUrl, 'google_oauth_popup', 'width=550,height=650,left=150,top=100');
    
    // Setup message listener
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data?.type === 'GMAIL_AUTH_SUCCESS' && event.data?.accessToken) {
        fetchUserProfile(event.data.accessToken);
        setSuccessMsg('🎉 Kết nối Gmail thành công!');
        setTimeout(() => setSuccessMsg(null), 5000);
        window.removeEventListener('message', handleOAuthMessage);
      }
    };
    
    window.addEventListener('message', handleOAuthMessage);
  };

  // --- HANDLE LOCAL OAUTH POPUP CALLBACK RETRIEVAL ---
  useEffect(() => {
    // If the window is opener redirect callback hash parser
    if (window.opener && window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const tokenParsed = params.get('access_token');
      const stateParsed = params.get('state');
      
      if (tokenParsed && stateParsed === 'gmail_auth') {
        window.opener.postMessage({ 
          type: 'GMAIL_AUTH_SUCCESS', 
          accessToken: tokenParsed 
        }, window.location.origin);
        window.close();
      }
    }
  }, []);

  // Check on load if we already have an accessToken saved in localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('fiore_gmail_access_token');
    if (savedToken && !userProfile) {
      fetchUserProfile(savedToken, true);
    }
  }, [fetchUserProfile, userProfile]);

  // --- MANUAL ACCESS TOKEN INPUT HANDLER ---
  const handleApplyManualToken = () => {
    if (!manualToken.trim()) return;
    fetchUserProfile(manualToken.trim());
    setManualToken('');
    setShowManualTokenForm(false);
  };

  const handleDisconnect = () => {
    localStorage.removeItem('fiore_gmail_access_token');
    setAccessToken(null);
    setUserProfile(null);
    setInboxEmails([]);
    setSentEmails([]);
    setSelectedMail(null);
  };

  // --- FETCH EMAILS FROM GMAIL API ---
  const fetchEmails = async () => {
    if (!accessToken) return;
    
    try {
      setLoading(true);
      setErrorMsg(null);
      
      // Get messages list from inbox
      const listRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=8&q=label:INBOX', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!listRes.ok) {
        let errorDetails = '';
        try {
          const errData = await listRes.json();
          if (errData?.error?.message) {
            errorDetails = `: ${errData.error.message}`;
          }
        } catch (_) {}
        throw new Error(`Gmail API list error (status ${listRes.status})${errorDetails}`);
      }
      
      const listData = await listRes.json();
      
      if (!listData.messages || listData.messages.length === 0) {
        setInboxEmails([]);
        return;
      }

      // Fetch message details in parallel
      const detailedMails: GmailMessage[] = await Promise.all(
        listData.messages.map(async (msg: { id: string; threadId: string }) => {
          try {
            const detailRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (!detailRes.ok) {
              return {
                id: msg.id,
                threadId: msg.threadId,
                snippet: 'Không thể tải chi tiết của email này.',
                subject: '(Thư không sẵn sàng)',
                from: 'Hệ thống',
                to: 'me',
                date: '',
                bodyText: 'Lỗi tải nội dung chi tiết.'
              };
            }
            const detail = await detailRes.json();
            
            const headers = detail.payload?.headers || [];
            const getHeader = (name: string) => {
              const h = headers.find((header: any) => header.name.toLowerCase() === name.toLowerCase());
              return h ? h.value : '';
            };
            
            return {
              id: detail.id,
              threadId: detail.threadId,
              snippet: detail.snippet || '',
              subject: getHeader('subject') || '(Không tiêu đề)',
              from: getHeader('from') || 'Unknown',
              to: getHeader('to') || 'me',
              date: getHeader('date') || '',
              bodyText: detail.snippet || '' // Simplified body parsing using snippet
            };
          } catch (errDetail) {
            console.error('Error loading email details for msg:', msg.id, errDetail);
            return {
              id: msg.id,
              threadId: msg.threadId,
              snippet: 'Lỗi tải hoặc phân tích nội dung email này.',
              subject: '(Lỗi xử lý thư)',
              from: 'Hệ thống',
              to: 'me',
              date: '',
              bodyText: 'Lỗi tải hoặc phân tích.'
            };
          }
        })
      );
      
      setInboxEmails(detailedMails);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Không thể đồng bộ hộp thư đến: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- SEND GMAIL EMAIL ---
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      setErrorMsg('Bạn cần kết nối Gmail để thực hiện tác vụ này.');
      return;
    }
    
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ địa chỉ nhận, tiêu đề và nội dung.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const emailLines = [
        `To: ${composeTo.trim()}`,
        `Subject: =?utf-8?B?${utf8ToB64Url(composeSubject.trim())}?=`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        'Content-Transfer-Encoding: 7bit',
        '',
        composeBody
      ];

      const rawEmail = utf8ToB64Url(emailLines.join('\r\n'));

      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: rawEmail })
      });

      if (!res.ok) {
        let errorDetails = '';
        try {
          const errData = await res.json();
          if (errData?.error?.message) {
            errorDetails = `: ${errData.error.message}`;
          }
        } catch (_) {
          try {
            const errDetail = await res.text();
            if (errDetail) errorDetails = `: ${errDetail}`;
          } catch (__) {}
        }
        throw new Error(`Send error (status ${res.status})${errorDetails}`);
      }

      // Add to sent emails
      const sentItem: GmailMessage = {
        id: `sent-${Date.now()}`,
        threadId: '',
        from: userProfile?.emailAddress || 'Me',
        to: composeTo,
        subject: composeSubject,
        snippet: composeBody.replace(/<[^>]*>/g, '').substring(0, 100),
        date: new Date().toUTCString()
      };

      setSentEmails(prev => [sentItem, ...prev]);
      setSuccessMsg(`🌱 Gửi email đến "${composeTo}" thành công!`);
      
      // Clear Compose fields
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setSelectedShopUser('');
      setSelectedTemplate('custom');
      
      // Switch back to sent emails
      setTimeout(() => {
        setSuccessMsg(null);
        setActiveSubTab('sent');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('Gửi email thất bại: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- APPLY EMAIL CUSTOM TEMPLATE ---
  const applyTemplate = (tplKey: string, matchedUserEmail: string) => {
    setSelectedTemplate(tplKey);
    setErrorMsg(null);

    // Auto find recipient email if selecting a customer
    if (matchedUserEmail) {
      setComposeTo(matchedUserEmail);
    }

    const currentShopUserObj = users.find(u => u.email.toLowerCase() === matchedUserEmail.toLowerCase()) || users.find(u => u.email === matchedUserEmail);
    const recipientName = currentShopUserObj ? currentShopUserObj.name : 'Quý khách';

    // Find the last order of this user to fill templated parameters
    const userOrders = orders.filter(o => o.customerEmail.toLowerCase() === matchedUserEmail.toLowerCase() || o.recipientPhone === currentShopUserObj?.phone);
    const latestOrder = userOrders.length > 0 ? userOrders[userOrders.length - 1] : null;

    const orderId = latestOrder ? latestOrder.id : 'ORD-123';
    const totalAmountStr = latestOrder ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(latestOrder.totalAmount) : '450.000 đ';
    const itemsStr = latestOrder ? latestOrder.items.map(it => `• ${it.product.name} (x${it.quantity})`).join('<br/>') : '• Bó hồng tươi nghệ thuật (x1)';

    if (tplKey === 'custom') {
      setComposeSubject('');
      setComposeBody('');
    } else if (tplKey === 'welcome') {
      setComposeSubject(`🎁 [Fióre Boutique] Quà tặng chào mừng thành viên mới - Giảm ngay 10%`);
      setComposeBody(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8E1D6; border-radius: 16px; overflow: hidden; background-color: #FCFAF7; color: #333;">
          <div style="background-color: #1F3D2B; padding: 24px; text-align: center; border-bottom: 2px solid #C8A96B;">
            <h1 style="color: #F8F5EF; font-family: Georgia, serif; margin: 0; font-size: 26px; tracking-widest: 1px;">Tiệm Hoa Fióre</h1>
            <p style="color: #C8A96B; margin: 6px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Chào Mừng Bạn Đến Với Thế Giới Hương Sắc</p>
          </div>
          <div style="padding: 24px 32px; background-color: #ffffff;">
            <p style="font-size: 15px; line-height: 1.6; color: #333333;">Xin chào <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4F4F4F;">Chào mừng bạn đến với mái nhà chung đầy hương sắc của Fióre Boutique Florist! Chúng tôi rất vui mừng khi được đồng hành cùng bạn thêu dệt và trao gửi những lời nhắn nhủ vẹn tròn qua từng đoá hoa tươi rực rỡ.</p>
            <div style="background-color: #FCFAF7; border: 1px dashed #C8A96B; border-radius: 12px; padding: 18px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; text-transform: uppercase; font-weight: bold; color: #1F3D2B;">Mã ưu đãi độc quyền của bạn:</p>
              <h2 style="margin: 8px 0; font-size: 28px; font-family: monospace; font-weight: bold; color: #rose-600; text-align: center; color: #E11D48; letter-spacing: 2px;">WELCOMEFIORE</h2>
              <p style="margin: 0; font-size: 11px; color: #777;">(Giảm ngay 10% cho đơn hàng đầu tiên của bạn tại shop. Hạn sử dụng: 30 ngày)</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #4F4F4F;">Hãy bắt đầu hành trình phong vị nghệ thuật cắm hoa tinh tế của riêng bạn cùng Fióre nhé!</p>
            <div style="text-align: center; margin: 28px 0 10px;">
              <a href="${window.location.origin}" style="display: inline-block; background-color: #1F3D2B; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 12px; padding: 12px 28px; border-radius: 8px; border: 1px solid #C8A96B;">Khám Phá Các Mẫu Hoa Mới</a>
            </div>
          </div>
          <div style="background-color: #f1ebd8; padding: 16px; text-align: center; border-t: 1px solid #E8E1D6; font-size: 11px; color: #666;">
            <p style="margin: 0;">Fióre Boutique Florist - 34 Trần Thái Tông, Huế</p>
            <p style="margin: 4px 0 0;">Điện thoại hỗ trợ: 0916.044.683 • Email: thuyvanngo35@gmail.com</p>
          </div>
        </div>
      `);
    } else if (tplKey === 'confirm_order') {
      setComposeSubject(`💐 [Fióre Boutique] Xác nhận đơn hàng thành công #${orderId}`);
      setComposeBody(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8E1D6; border-radius: 16px; overflow: hidden; background-color: #FCFAF7; color: #333;">
          <div style="background-color: #1F3D2B; padding: 24px; text-align: center; border-bottom: 2px solid #C8A96B;">
            <h1 style="color: #F8F5EF; font-family: Georgia, serif; margin: 0; font-size: 26px; tracking-widest: 1px;">Tiệm Hoa Fióre</h1>
            <p style="color: #C8A96B; margin: 6px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Xác Nhận & Đóng Gói Đơn Hàng</p>
          </div>
          <div style="padding: 24px 32px; background-color: #ffffff;">
            <p style="font-size: 15px; line-height: 1.6; color: #333333;">Kính chào <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4F4F4F;">Tiệm hoa Fióre xin chân thành cảm ơn quý khách đã tin cậy lựa chọn hoa tươi nghệ thuật của chúng tôi. Chúng tôi tự hào thông báo rằng đơn hàng <strong>${orderId}</strong> của quý khách đã được tiếp nhận và nhân viên florist đang tiến hành thiết kế hoa tinh tuyển mộc mạc nhất.</p>
            
            <div style="margin: 24px 0; border: 1px solid #E8E1D6; border-radius: 12px; padding: 18px; background-color: #FCFAF7;">
              <h3 style="margin-top: 0; font-size: 13px; uppercase: true; color: #1F3D2B; border-bottom: 1px solid #E8E1D6; pb: 8px;">Thông Tin Chi Tiết Đơn Hàng:</h3>
              <p style="font-size: 13px; margin: 6px 0;"><strong>Mã đơn hàng:</strong> ${orderId}</p>
              <p style="font-size: 13px; margin: 6px 0;"><strong>Các sản phẩm hoa:</strong></p>
              <div style="font-size: 13px; padding-left: 12px; color: #555; background-color: #F8F5EF; border-radius: 8px; padding: 8px 12px;">
                ${itemsStr}
              </div>
              <p style="font-size: 13px; margin: 8px 0 0;"><strong>Tổng thanh toán:</strong> <span style="color: #E11D48; font-weight: bold;">${totalAmountStr}</span></p>
            </div>
            
            <p style="font-size: 14px; line-height: 1.6; color: #4F4F4F;">Đơn hàng sẽ được đóng gói bằng cả sự tỉ mỉ, trân trọng và giao nhanh chóng hỏa tốc trong vòng 2 giờ đến địa chỉ đặt sẵn.</p>
            <p style="font-size: 14px; line-height: 1.5; color: #4F4F4F; font-style: italic; margin-top: 15px;">Chúc quý khách có một trải nghiệm ngát hương hoa vạn an cùng Fióre!</p>
          </div>
          <div style="background-color: #f1ebd8; padding: 16px; text-align: center; border-t: 1px solid #E8E1D6; font-size: 11px; color: #666;">
            <p style="margin: 0;">Fióre Boutique Florist - 34 Trần Thái Tông, Huế</p>
            <p style="margin: 4px 0 0;">Điện thoại hỗ trợ: 0916.044.683 • Email: thuyvanngo35@gmail.com</p>
          </div>
        </div>
      `);
    } else if (tplKey === 'thanks') {
      setComposeSubject(`💝 [Fióre] Lời tri ân ngát hương hoa gửi tới quý khách`);
      setComposeBody(`
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #E8E1D6; border-radius: 16px; overflow: hidden; background-color: #FCFAF7; color: #333;">
          <div style="background-color: #1F3D2B; padding: 24px; text-align: center; border-bottom: 2px solid #C8A96B;">
            <h1 style="color: #F8F5EF; font-family: Georgia, serif; margin: 0; font-size: 26px; tracking-widest: 1px;">Tiệm Hoa Fióre</h1>
            <p style="color: #C8A96B; margin: 6px 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase;">Thư Tri Ân Khách Hàng</p>
          </div>
          <div style="padding: 24px 32px; background-color: #ffffff;">
            <p style="font-size: 15px; line-height: 1.6; color: #333333;">Kính gửi <strong>${recipientName}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4F4F4F;">Mỗi đơn hoa của quý khách là lời động viên, nâng niu to lớn giúp các florist tại Fióre giữ vững ngọn lửa đam mê với nghệ thuật cắm hoa thủ công tinh túy.</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4F4F4F;">Fióre trân trọng kính chúc quý khách hàng luôn ngập tràn niềm vui, cuộc sống ngập tràn sắc hương dịu mát và bình yên bên những người thân yêu nhất.</p>
            <div style="background-color: #FCFAF7; border: 1px dashed #C8A96B; border-radius: 12px; padding: 15px; margin: 20px 0; font-style: italic; text-align: center; color: #555; font-size: 13px;">
              "Không chỉ là bó hoa, đó là trọn tấm lòng nghệ nhân thêu dệt và gửi gắm những an lành trong vắt nhất tới tầm tay người nhận."
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #4F4F4F;">Hãy tiếp tục đồng hành và chia sẻ những khoảnh khắc đáng yêu cùng Fióre quý khách nhé!</p>
          </div>
          <div style="background-color: #f1ebd8; padding: 16px; text-align: center; border-t: 1px solid #E8E1D6; font-size: 11px; color: #666;">
            <p style="margin: 0;">Fióre Boutique Florist - 34 Trần Thái Tông, Huế</p>
            <p style="margin: 4px 0 0;">Điện thoại hỗ trợ: 0916.044.683 • Email: thuyvanngo35@gmail.com</p>
          </div>
        </div>
      `);
    }
  };

  // Auto load inbox on sub-tab navigation
  useEffect(() => {
    if (activeSubTab === 'inbox' && accessToken && inboxEmails.length === 0) {
      fetchEmails();
    }
  }, [activeSubTab, accessToken]);

  return (
    <div className="bg-white rounded-2xl border border-pink-100 p-6 md:p-8 shadow-xs animate-fade-in" id="gmail-manager-root">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-pink-50 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700 uppercase tracking-widest">
              <Mail className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
              <span>Google Workspaces</span>
            </span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-900 mt-2">Dịch Vụ Đồng Bộ Gmail</h2>
          <p className="text-xs text-gray-500 mt-1">Kết nối tài khoản Gmail của bạn để gửi thông báo xác lập, tri ân và hỗ trợ trực tuyến tới bạn tiêu dùng của cửa hàng</p>
        </div>

        {onBackToStats && (
          <button 
            onClick={onBackToStats}
            className="mt-4 md:mt-0 px-4 py-2 text-xs font-bold text-gray-600 hover:text-rose-600 border border-gray-200 rounded-xl hover:bg-neutral-50 cursor-pointer"
          >
            Quay lại báo cáo
          </button>
        )}
      </div>

      {/* FEEDBACK STATUS */}
      {successMsg && (
        <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-emerald-800 flex items-start space-x-3 text-xs leading-relaxed">
          <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-xl bg-rose-50 border border-rose-100 p-4 text-rose-800 flex items-start space-x-3 text-xs leading-relaxed">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <div className="flex-1">
            <p className="font-bold">Đã xảy ra sự cố:</p>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* BEFORE AUTHENTICATION COVER */}
      {!accessToken ? (
        <div className="max-w-xl mx-auto py-12 md:py-16 text-center">
          <div className="flex mx-auto h-16 w-16 items-center justify-center rounded-2xl bg-[#1F3D2B]/5 text-[#1F3D2B] mb-6 border border-[#1F3D2B]/10">
            <Mail className="h-8 w-8 stroke-1" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1F3D2B]">Chưa Kết Nối Tài Khoản Google Gmail</h3>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed max-w-sm mx-auto">
            Để gửi tự động email tri ân, mã khuyến mãi chào mừng thành viên, hoặc thông báo vận hành đơn hoa, vui lòng kết nối tài khoản Gmail của bạn.
          </p>

          <div className="mt-8 space-y-4">
            {/* Standard "Sign in with Google" button */}
            <div className="flex justify-center">
              <button 
                onClick={handleConnectGoogle}
                className="gsi-material-button w-[240px] flex items-center justify-center space-x-2 border border-gray-300 rounded-xl px-4 py-2.5 bg-white text-gray-700 font-bold text-xs shadow-xs hover:bg-neutral-50 active:scale-98 transition duration-200 cursor-pointer"
              >
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4.5 w-4.5 shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
                <span className="text-[11.5px] font-bold text-gray-800">Đăng nhập bằng Google</span>
              </button>
            </div>

            <div className="text-gray-400 font-bold text-[10.5px]">HOẶC</div>

            {/* Manual token testing option (highly friendly for development sandbox) */}
            <div>
              {!showManualTokenForm ? (
                <button
                  onClick={() => setShowManualTokenForm(true)}
                  className="inline-flex items-center space-x-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold border border-rose-100 hover:border-rose-200 rounded-lg px-3.5 py-1.5 hover:bg-rose-50/50 cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  <span>Dùng Access Token thủ công</span>
                </button>
              ) : (
                <div className="bg-pink-50/50 border border-pink-100 rounded-xl p-4 max-w-sm mx-auto text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">Nhập Access Token thử nghiệm</span>
                    <button 
                      onClick={() => setShowManualTokenForm(false)}
                      className="text-gray-400 hover:text-gray-600 text-[10px] font-bold"
                    >
                      Hủy
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="password"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="Dán access_token tại đây..."
                      className="flex-1 rounded border border-pink-100 bg-white py-1 px-2.5 text-xs outline-none focus:border-rose-450 font-mono"
                    />
                    <button
                      onClick={handleApplyManualToken}
                      className="rounded bg-rose-600 text-white font-bold text-[10px] px-3 py-1 cursor-pointer hover:bg-rose-700"
                    >
                      Áp dụng
                    </button>
                  </div>
                  <p className="text-[9.5px] text-gray-500 mt-2.5 leading-relaxed">
                    💡 <strong>Mẹo nhỏ:</strong> Bạn có thể lấy Access Token nhanh trong 1 phút bằng cách truy cập <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-rose-600 underline inline-flex items-center">Google OAuth Playground <ExternalLink className="h-2 w-2 ml-0.5" /></a>, chọn Gmail API v1 và click Authorize!
                  </p>
                </div>
              )}
            </div>
            
            {/* Setup Guidance Block */}
            <div className="bg-[#FCFAF7] border border-pink-50 rounded-2xl p-5 text-left max-w-lg mx-auto mt-6 text-xs text-gray-500">
              <span className="font-bold text-[#1F3D2B] mb-2 block flex items-center"><Info className="h-4 w-4 mr-1 text-[#C8A96B]" /> Hướng dẫn lấy Client ID để test Login:</span>
              <ul className="space-y-1.5 list-decimal list-inside pl-1 text-[11px] leading-relaxed">
                <li>Truy cập vào <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="text-rose-600 underline">Google Cloud Console</a>.</li>
                <li>Tạo một dự án độc lập, kích hoạt <strong>Gmail API</strong>.</li>
                <li>Vào tab <strong>Credentials</strong>, chọn Credentials &gt; OAuth client ID.</li>
                <li>Thêm địa chỉ nguồn được ủy quyền <strong>(Authorized JavaScript origins)</strong> là: <code className="bg-pink-50 text-[10px] p-0.5 rounded font-mono break-all">{window.location.origin}</code></li>
                <li>Dán Client ID thu được vào phần <strong>Cấu hình</strong> góc cuối bên dưới!</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* AFTER AUTHENTICATION PANEL COMPONENT */
        <div>
          {/* USER INFO BAR CONTAINER */}
          <div className="bg-[#1F3D2B] text-white rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-[#C8A96B]/30 mb-6 gap-3 shadow-md">
            <div className="flex items-center space-x-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C8A96B]/25 text-[#C8A96B] shrink-0 border border-[#C8A96B]/35">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-pink-100 uppercase tracking-widest font-bold">Tài khoản Google liên kết</p>
                <p className="text-sm font-extrabold text-[#F8F5EF] mt-0.5">{userProfile?.emailAddress || 'Đang tải profile...'}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
              {loading && <RefreshCw className="h-4.5 w-4.5 text-[#C8A96B] animate-spin" />}
              <button 
                onClick={handleDisconnect}
                className="px-3.5 py-1.5 text-[10.5px] font-bold bg-[#F8F5EF] hover:bg-neutral-100 text-[#1F3D2B] rounded-xl transition cursor-pointer flex items-center space-x-1 border"
              >
                <span>Hủy liên kết</span>
              </button>
            </div>
          </div>

          {/* ACTIVE WORKSPACE SUB NAVIGATION TAB BAR */}
          <div className="flex border-b border-pink-50 mb-6 text-xs font-bold gap-4 overflow-x-auto">
            <button
              onClick={() => { setActiveSubTab('inbox'); setSelectedMail(null); }}
              className={`pb-3 border-b-2 font-bold px-1 whitespace-nowrap flex items-center transition ${
                activeSubTab === 'inbox' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-rose-600'
              }`}
            >
              <Inbox className="h-4 w-4 mr-1.5" /> Thư đến (Inbox)
            </button>
            
            <button
              onClick={() => { setActiveSubTab('compose'); }}
              className={`pb-3 border-b-2 font-bold px-1 whitespace-nowrap flex items-center transition ${
                activeSubTab === 'compose' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-rose-600'
              }`}
            >
              <Send className="h-4 w-4 mr-1.5" /> Soạn thư & Mẫu (Compose)
            </button>

            <button
              onClick={() => { setActiveSubTab('sent'); }}
              className={`pb-3 border-b-2 font-bold px-1 whitespace-nowrap flex items-center transition ${
                activeSubTab === 'sent' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-rose-600'
              }`}
            >
              <FileText className="h-4 w-4 mr-1.5" /> Thư đã gửi (Sent)
            </button>

            <button
              onClick={() => { setActiveSubTab('settings'); }}
              className={`pb-3 border-b-2 font-bold px-1 whitespace-nowrap flex items-center transition ${
                activeSubTab === 'settings' ? 'border-rose-600 text-rose-600' : 'border-transparent text-gray-500 hover:text-rose-600'
              }`}
            >
              <Lock className="h-4 w-4 mr-1.5" /> Cấu hình bảo mật
            </button>
          </div>

          {/* WORKSPACE PANELS */}
          <div>
            
            {/* SUBTAB 1: INBOX */}
            {activeSubTab === 'inbox' && (
              <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Inbox List Column */}
                <div className={`${selectedMail ? 'lg:col-span-5' : 'lg:col-span-12'} transition-all`}>
                  <div className="bg-[#FCFAF7] border border-pink-50 p-4 rounded-2xl mb-4 flex justify-between items-center">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1F3D2B]">Danh sách thư hotlines</span>
                    <button 
                      onClick={fetchEmails}
                      disabled={loading}
                      className="inline-flex items-center space-x-1.5 text-[10.5px] font-bold text-rose-600 hover:text-rose-700 disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>Đồng bộ ngay</span>
                    </button>
                  </div>

                  {loading && inboxEmails.length === 0 ? (
                    <div className="py-12 text-center text-xs text-gray-400">
                      <RefreshCw className="h-7 w-7 text-rose-500 animate-spin mx-auto pb-2" />
                      Đang đồng bộ hộp thư đến từ Google Gmail...
                    </div>
                  ) : inboxEmails.length === 0 ? (
                    <div className="border border-dashed border-pink-50 bg-neutral-50/50 p-10 text-center rounded-2xl">
                      <Inbox className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-bold">Hộp thư đến trống</p>
                      <p className="text-[10px] text-gray-400 mt-1">Không thấy thư nào phù hợp trong hộp thư cá nhân của bạn.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {inboxEmails.map((mail) => (
                        <div
                          key={mail.id}
                          onClick={() => setSelectedMail(mail)}
                          className={`p-4 rounded-xl border transition cursor-pointer text-left text-xs ${
                            selectedMail?.id === mail.id 
                              ? 'bg-[#1F3D2B]/5 border-[#1F3D2B] shadow-xs' 
                              : 'bg-white border-pink-100 hover:bg-pink-50/30'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="font-extrabold text-[#1F3D2B] truncate max-w-[170px]">From: {mail.from}</span>
                            <span className="text-[9px] text-gray-400 shrink-0 font-medium">{mail.date.split(',')[1]?.split(' ')[1] || 'hôm nay'}</span>
                          </div>
                          <div className="font-bold text-gray-800 line-clamp-1 mb-1">{mail.subject}</div>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{mail.snippet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email Viewer Panel Column */}
                {selectedMail && (
                  <div className="lg:col-span-7 bg-[#FCFAF7] border border-pink-100 rounded-2xl p-6 relative">
                    <button 
                      onClick={() => setSelectedMail(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-[11px] font-bold cursor-pointer"
                    >
                      Đóng xem
                    </button>

                    <div className="border-b border-pink-50 pb-4 mb-4 text-left">
                      <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Đọc thư điện tử</span>
                      <h4 className="font-serif text-lg font-bold text-[#1F3D2B] mt-2 leading-snug">{selectedMail.subject}</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-[11px] text-gray-500 font-medium">
                        <p><strong className="text-gray-700">Người gửi:</strong> {selectedMail.from}</p>
                        <p><strong className="text-gray-700">Người nhận:</strong> {selectedMail.to}</p>
                        <p className="sm:col-span-2"><strong className="text-gray-700">Thời gian nhận:</strong> {selectedMail.date}</p>
                      </div>
                    </div>

                    {/* Body container block representation */}
                    <div className="bg-white border text-left p-4 rounded-xl min-h-[160px] text-xs leading-relaxed text-gray-700 font-sans whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {selectedMail.snippet}
                      <p className="text-[10px] text-gray-400 mt-6 border-t pt-4 leading-normal">
                        📧 <i>Lưu ý: Để hiển thị định dạng HTML đầy đủ hoặc các tệp đính kèm của thư, vui lòng đăng nhập vào ứng dụng khách Gmail chính thức để có trải nghiệm tối ưu nhất.</i>
                      </p>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button
                        onClick={() => {
                          setComposeTo(selectedMail.from.match(/<([^>]+)>/)?.[1] || selectedMail.from);
                          setComposeSubject(`Re: ${selectedMail.subject}`);
                          setComposeBody(`\n\n--- Vào lúc ${selectedMail.date}, ${selectedMail.from} đã viết ---\n> ${selectedMail.snippet}`);
                          setActiveSubTab('compose');
                        }}
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700 transition cursor-pointer"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Trả lời (Reply)</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* SUBTAB 2: COMPOSE COHESIVE SYSTEM */}
            {activeSubTab === 'compose' && (
              <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
                
                {/* Templates and Preset Helpers Column */}
                <div className="lg:col-span-4 space-y-5">
                  
                  {/* Select Customer Profile Panel list */}
                  <div className="bg-white p-5 border border-pink-100 rounded-2xl shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-rose-800 flex items-center mb-1"><User className="h-3.5 w-3.5 mr-1 text-[#C8A96B]" /> Chọn người dùng trong sổ</span>
                    <p className="text-[10px] text-gray-400 mb-3.5">Hệ thống sẽ tự động ghép thông tin email của khách hàng được chọn</p>
                    
                    <select
                      value={selectedShopUser}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedShopUser(val);
                        if (val) {
                          setComposeTo(val);
                          // Auto trigger welcome or other templates
                          if (selectedTemplate !== 'custom') {
                            applyTemplate(selectedTemplate, val);
                          }
                        }
                      }}
                      className="w-full text-xs font-bold font-sans rounded-xl border border-pink-100 p-2.5 outline-none bg-[#FCFAF7] hover:bg-white transition"
                    >
                      <option value="">-- Không chọn / Người nhận tự định nghĩa --</option>
                      {users.map(u => (
                        <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  </div>

                  {/* Mail Templates list */}
                  <div className="bg-[#FCFAF7] p-5 border border-pink-100 rounded-2xl shadow-xs space-y-3">
                    <h4 className="text-[10px] uppercase font-bold tracking-wider text-[#1F3D2B] border-b pb-2">Mẫu Thư Cắm Sẵn</h4>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => applyTemplate('custom', composeTo)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg text-left transition border ${
                          selectedTemplate === 'custom' 
                            ? 'bg-[#1F3D2B] text-white border-transparent' 
                            : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/40'
                        }`}
                      >
                        ✏️ Thư tự do (Custom)
                      </button>

                      <button
                        onClick={() => applyTemplate('welcome', composeTo)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg text-left transition border ${
                          selectedTemplate === 'welcome' 
                            ? 'bg-[#1F3D2B] text-white border-transparent' 
                            : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/40'
                        }`}
                      >
                        🎁 Thư Chào mừng TV mới
                      </button>

                      <button
                        onClick={() => applyTemplate('confirm_order', composeTo)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg text-left transition border ${
                          selectedTemplate === 'confirm_order' 
                            ? 'bg-[#1F3D2B] text-white border-transparent' 
                            : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/40'
                        }`}
                      >
                        💐 Thư Xác nhận đơn hàng
                      </button>

                      <button
                        onClick={() => applyTemplate('thanks', composeTo)}
                        className={`w-full py-2 px-3 text-xs font-bold rounded-lg text-left transition border ${
                          selectedTemplate === 'thanks' 
                            ? 'bg-[#1F3D2B] text-white border-transparent' 
                            : 'bg-white text-gray-700 border-pink-100 hover:bg-pink-50/40'
                        }`}
                      >
                        💝 Thư Tri ân khách hàng
                      </button>
                    </div>

                    <div className="rounded-xl bg-pink-100/35 border border-pink-100 p-3 text-[10px] text-rose-800 leading-normal font-medium flex items-start space-x-1.5 mt-4">
                      <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-600" />
                      <span><strong>Ghép nâng cao:</strong> Mẫu thư đơn hàng sẽ tự lấy đơn mới nhất của khách hàng tương ứng để điền số tiền và sản phẩm tự động!</span>
                    </div>
                  </div>

                </div>

                {/* Email Form Container Column */}
                <form onSubmit={handleSendEmail} className="lg:col-span-8 bg-white border border-pink-100 p-6 rounded-2xl shadow-xs space-y-4">
                  <div>
                    <label htmlFor="compose-to" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Người nhận Email (To): <span className="text-red-500">*</span></label>
                    <input
                      id="compose-to"
                      type="email"
                      required
                      value={composeTo}
                      onChange={(e) => setComposeTo(e.target.value)}
                      placeholder="Nhập địa chỉ email khách hàng (ví dụ: khachhang@gmail.com)"
                      className="w-full text-xs font-semibold rounded-xl border border-pink-100 py-2 px-3.5 outline-none transition focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="compose-subject" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tiêu đề (Subject): <span className="text-red-500">*</span></label>
                    <input
                      id="compose-subject"
                      type="text"
                      required
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      placeholder="Nhập tiêu đề thư gửi đi"
                      className="w-full text-xs font-bold rounded-xl border border-pink-100 py-2 px-3.5 outline-none transition focus:border-rose-400"
                    />
                  </div>

                  <div>
                    <label htmlFor="compose-body" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nội dung thư (HTML/Text Body): <span className="text-red-500">*</span></label>
                    <textarea
                      id="compose-body"
                      required
                      rows={12}
                      value={composeBody}
                      onChange={(e) => setComposeBody(e.target.value)}
                      placeholder="Nhập nội dung thông điệp (hỗ trợ nhập mã HTML nâng cao để gửi mẫu phong thư có định dạng màu thương hiệu)..."
                      className="w-full text-xs font-medium rounded-xl border border-pink-100 py-2.5 px-3.5 outline-none transition focus:border-rose-400 font-mono resize-none leading-relaxed"
                    />
                  </div>

                  <div className="pt-2 flex justify-between items-center bg-pink-50/15 p-3 rounded-xl border border-pink-50">
                    <span className="text-[10px] text-gray-400 font-medium">Bố cục: {selectedTemplate === 'custom' ? 'Không định dạng' : 'HTML thương hiệu Fióre'}</span>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center space-x-2 text-white bg-rose-600 hover:bg-rose-700 active:scale-95 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{loading ? 'Đang gửi qua Google...' : 'Gửi Thư Bằng Gmail'}</span>
                    </button>
                  </div>
                </form>

              </div>
            )}

            {/* SUBTAB 3: SENT OUTBOX LIST */}
            {activeSubTab === 'sent' && (
              <div className="animate-fade-in">
                <div className="bg-[#FCFAF7] border border-pink-50 p-4 rounded-2xl mb-4 text-left">
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#1F3D2B]">Lịch sử thư đã gửi thông qua ứng dụng ({sentEmails.length})</span>
                </div>

                {sentEmails.length === 0 ? (
                  <div className="border border-dashed border-pink-50 bg-neutral-50/50 p-12 text-center rounded-2xl">
                    <Send className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500 font-bold">Chưa gửi email nào</p>
                    <p className="text-[10px] text-gray-400 mt-1">Các thư được khởi tạo và gửi thành công trong phiên làm việc hiện có sẽ hiển thị tại đây.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-pink-100 overflow-hidden divide-y divide-pink-50">
                    {sentEmails.map((mail) => (
                      <div key={mail.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center text-left text-xs hover:bg-neutral-50/50 gap-4 transition duration-200">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1.5 flex-wrap">
                            <span className="font-extrabold text-[#1F3D2B]">To: {mail.to}</span>
                            <span className="text-[9.5px] bg-[#CDDFCE] text-[#1F3D2B] font-bold px-1.5 py-0.2 rounded">Thành công</span>
                          </div>
                          <div className="font-bold text-gray-800">{mail.subject}</div>
                          <p className="text-[10px] text-gray-400 line-clamp-1 italic">{mail.snippet}</p>
                        </div>

                        <div className="text-[9.5px] text-gray-400 font-medium shrink-0 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(mail.date).toLocaleTimeString('vi-VN')} ngày {new Date(mail.date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUBTAB 4: SETTINGS/CONFIGS */}
            {activeSubTab === 'settings' && (
              <div className="animate-fade-in text-left max-w-xl mx-auto space-y-6">
                <div className="bg-white border border-pink-100 rounded-2xl p-6 shadow-xs space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-rose-800 flex items-center"><Key className="h-4 w-4 mr-1 text-[#C8A96B]" /> Cấu hình Google Credentials</span>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Cấu hình độc lập Client ID của bạn để kích hoạt hệ thống Google OAuth Login hiển thị trực diện một cách chuyên nghiệp nhất.
                  </p>

                  <div className="space-y-3 pt-2">
                    <div>
                      <label htmlFor="settings-clientid" className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Google Client ID:</label>
                      <input
                        id="settings-clientid"
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="Có dạng: 12345678-abcde.apps.googleusercontent.com"
                        className="w-full text-xs font-mono rounded-xl border border-pink-100 py-2.5 px-3.5 outline-none transition focus:border-rose-400 bg-[#FCFAF7] focus:bg-white"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          localStorage.setItem('fiore_gmail_client_id', clientId);
                          setSuccessMsg('💾 Đã lưu Client ID cấu hình thành công!');
                          setTimeout(() => setSuccessMsg(null), 3000);
                        }}
                        className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white py-2.5 cursor-pointer shadow-xs transition"
                      >
                        Lưu cấu hình Client
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FCFAF7] border border-pink-100 rounded-2xl p-6 space-y-3 text-xs text-gray-500">
                  <span className="font-bold text-[#1F3D2B] flex items-center mb-1"><HelpCircle className="h-4 w-4 mr-1 text-[#C8A96B]" /> FAQs - Tài liệu hỗ trợ:</span>
                  
                  <div className="space-y-3 leading-relaxed">
                    <div>
                      <p className="font-extrabold text-gray-700">1. Làm thế nào để giải quyết lỗi "Redirect URI mismatch" khi login?</p>
                      <p className="text-[11px] text-[#4F4F4F] mt-0.5">
                        Bạn phải copy chính xác URL hiển thị trên thanh địa chỉ của website preview (ví dụ: <code className="bg-white px-1 py-0.2 rounded font-mono border text-[10px]">{window.location.origin}</code>) và dán nó vào mục <strong>Authorized JavaScript origins</strong> trong Google Cloud Console project Credentials.
                      </p>
                    </div>

                    <div>
                      <p className="font-extrabold text-gray-700">2. Quyền lợi bảo mật và lưu trữ?</p>
                      <p className="text-[11px] text-[#4F4F4F] mt-0.5">
                        Toàn bộ Access Token thu được đều được lưu trữ trực tiếp trong bộ nhớ của trình duyệt (localStorage) và chỉ sử dụng để trao đổi cục bộ với API Google của bạn. Chúng tôi hoàn toàn cam kết không lưu trên bất kỳ cơ sở dữ liệu bên thứ ba nào khác!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

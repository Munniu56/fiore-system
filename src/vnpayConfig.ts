import CryptoJS from 'crypto-js';

export const VNPAY_CONFIG = {
  vnp_TmnCode: 'P7JQDHJN',
  vnp_HashSecret: '9TQ1ND38KETO6P5W8R2YNOA7BV05Y01Y',
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
};

export function createVnpayPaymentUrl(orderId: string, amount: number, ipAddr: string = '127.0.0.1') {
  const date = new Date();
  
  // Format Date to YYYYMMDDHHmmss in Vietnam local time structure
  const pad = (n: number) => String(n).padStart(2, '0');
  const createDate = date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds());

  // ReturnUrl where VNPAY redirects back
  const returnUrl = window.location.origin + window.location.pathname;

  const params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
    vnp_Amount: String(amount * 100), // VNPAY expects amount in VND * 100
    vnp_CreateDate: createDate,
    vnp_CurrCode: 'VND',
    vnp_IpAddr: ipAddr,
    vnp_Locale: 'vn',
    vnp_OrderInfo: 'Thanh toan don hang ' + orderId,
    vnp_OrderType: 'other',
    vnp_ReturnUrl: returnUrl,
    vnp_TxnRef: orderId,
  };

  const sortedKeys = Object.keys(params).sort();
  
  const signDataParts: string[] = [];
  const queryParts: string[] = [];

  sortedKeys.forEach((key) => {
    const val = params[key];
    if (val !== undefined && val !== null && val !== '') {
      // VNPAY uses specific encoder: spaces are '+' and other characters urlencoded
      // We encode both key and value
      const encodedKey = encodeURIComponent(key).replace(/%20/g, '+');
      const encodedVal = encodeURIComponent(val).replace(/%20/g, '+');
      signDataParts.push(encodedKey + '=' + encodedVal);
      queryParts.push(encodedKey + '=' + encodedVal);
    }
  });

  const signData = signDataParts.join('&');
  const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.vnp_HashSecret);
  const secureHash = hmac.toString(CryptoJS.enc.Hex);

  queryParts.push('vnp_SecureHash=' + secureHash);

  return VNPAY_CONFIG.vnp_Url + '?' + queryParts.join('&');
}

export function verifyVnpayCallback(queryParams: Record<string, string>): boolean {
  const secureHash = queryParams['vnp_SecureHash'];
  if (!secureHash) return false;

  const signDataParts: string[] = [];
  const sortedKeys = Object.keys(queryParams).sort();

  sortedKeys.forEach((key) => {
    // Only sign parameters that start with vnp_ and are not vnp_SecureHash nor vnp_SecureHashType
    if (key.startsWith('vnp_') && key !== 'vnp_SecureHash' && key !== 'vnp_SecureHashType') {
      const val = queryParams[key];
      if (val !== undefined && val !== null && val !== '') {
        const encodedKey = encodeURIComponent(key).replace(/%20/g, '+');
        const encodedVal = encodeURIComponent(val).replace(/%20/g, '+');
        signDataParts.push(encodedKey + '=' + encodedVal);
      }
    }
  });

  const signData = signDataParts.join('&');
  const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.vnp_HashSecret);
  const calculatedHash = hmac.toString(CryptoJS.enc.Hex);

  return calculatedHash.toLowerCase() === secureHash.toLowerCase();
}

export function createVnpayMockCallbackUrl(orderId: string, amount: number) {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const payDate = date.getFullYear() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds());

  const params: Record<string, string> = {
    vnp_Amount: String(amount * 100),
    vnp_BankCode: 'NCB',
    vnp_BankTranNo: 'VNP' + Math.floor(10000000 + Math.random() * 90000000),
    vnp_CardType: 'ATM',
    vnp_OrderInfo: 'Thanh toan don hang ' + orderId,
    vnp_PayDate: payDate,
    vnp_ResponseCode: '00',
    vnp_TmnCode: VNPAY_CONFIG.vnp_TmnCode,
    vnp_TransactionNo: '14000000',
    vnp_TransactionStatus: '00',
    vnp_TxnRef: orderId,
  };

  const sortedKeys = Object.keys(params).sort();
  const signDataParts: string[] = [];
  const queryParts: string[] = [];

  sortedKeys.forEach((key) => {
    const val = params[key];
    const encodedKey = encodeURIComponent(key).replace(/%20/g, '+');
    const encodedVal = encodeURIComponent(val).replace(/%20/g, '+');
    signDataParts.push(encodedKey + '=' + encodedVal);
    queryParts.push(encodedKey + '=' + encodedVal);
  });

  const signData = signDataParts.join('&');
  const hmac = CryptoJS.HmacSHA512(signData, VNPAY_CONFIG.vnp_HashSecret);
  const secureHash = hmac.toString(CryptoJS.enc.Hex);

  queryParts.push('vnp_SecureHash=' + secureHash);

  return window.location.origin + window.location.pathname + '?' + queryParts.join('&');
}


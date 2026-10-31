import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  CreditCard, 
  Smartphone, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Lock, 
  QrCode, 
  Copy, 
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StoreSettings, PaymentMethodType } from '../types';

const CheckoutView: React.FC = () => {
  const { cart, totalAmount, subtotal, discount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Customer Form State
  const [customerName, setCustomerName] = useState<string>(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState<string>(user?.phone || '');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('bkash');
  const [senderNumber, setSenderNumber] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [screenshotPreview, setScreenshotPreview] = useState<string>('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState<boolean>(false);
  const [copiedNumber, setCopiedNumber] = useState<boolean>(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/store/settings');
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, [cart, navigate]);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Handle Screenshot File Upload
  const handleScreenshotChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Screenshot image must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setScreenshotPreview(base64Data);
      setUploadingScreenshot(true);
      try {
        const res = await fetch('/api/store/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            data: base64Data,
            filename: file.name
          })
        });
        const uploadData = await res.json();
        if (uploadData.success && uploadData.url) {
          setScreenshotUrl(uploadData.url);
        }
      } catch (err) {
        console.error('Failed to upload screenshot:', err);
      } finally {
        setUploadingScreenshot(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  // Convert USD to approximate BDT if needed (1 USD ≈ 120 BDT)
  const bdtAmount = Math.round(totalAmount * 120);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim() || !customerEmail.trim()) {
      setErrorMessage('Please provide your name and email address.');
      return;
    }

    const isManual = ['bkash', 'nagad', 'rocket'].includes(paymentMethod);
    if (isManual) {
      if (!transactionId.trim()) {
        setErrorMessage('Please enter the Transaction ID (TrxID) from your payment receipt.');
        return;
      }
      if (!senderNumber.trim()) {
        setErrorMessage('Please enter the phone number you sent the money from.');
        return;
      }
    }

    setSubmitting(true);

    try {
      // 1. Create the order
      const orderPayload = {
        customer: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          notes: customerNotes
        },
        items: cart.map(item => ({
          productId: item.product._id || item.product.slug,
          title: item.product.title,
          slug: item.product.slug,
          price: item.product.discountPrice !== undefined ? item.product.discountPrice : item.product.price,
          thumbnail: item.product.thumbnail,
          quantity: item.quantity,
          downloadableFiles: item.product.downloadableFiles || [],
          githubRepoUrl: item.product.githubRepoUrl || '',
          sourceCodeZipUrl: item.product.sourceCodeZipUrl || ''
        })),
        paymentMethod,
        currency: 'USD',
        paymentDetails: {
          senderNumber,
          transactionId,
          screenshotUrl
        }
      };

      const res = await fetch('/api/store/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      // If online gateway (SSLCOMMERZ / Card), redirect to payment session
      if (['sslcommerz', 'card'].includes(paymentMethod)) {
        const gwRes = await fetch('/api/store/payment/init-gateway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: data.orderNumber,
            gatewayProvider: 'sslcommerz'
          })
        });
        const gwData = await gwRes.json();
        if (gwData.success && gwData.redirectUrl) {
          clearCart();
          window.location.href = gwData.redirectUrl;
          return;
        } else if (gwData.requiresConfiguration) {
          setErrorMessage(gwData.message);
          setSubmitting(false);
          return;
        }
      }

      // Manual payment order placed
      clearCart();
      navigate(`/order-success/${data.orderNumber}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while creating your order.');
      setSubmitting(false);
    }
  };

  // Get active payment details from settings
  const currentBkash = settings?.bkash || {
    number: '+8801613475871',
    qrImage: '',
    instructions: 'Send money to our bKash personal/merchant number +8801613475871 (01613475871) and enter your TrxID below.',
    enabled: true
  };

  const currentNagad = settings?.nagad || {
    number: '+8801613475871',
    qrImage: '',
    instructions: 'Send money to our Nagad number +8801613475871 (01613475871) via Nagad app or USSD *167# and enter your TrxID.',
    enabled: true
  };

  const currentRocket = settings?.rocket || {
    number: '01900-000000-1',
    qrImage: '',
    instructions: 'Send money via DBBL Rocket and enter the Transaction ID.',
    enabled: true
  };

  return (
    <div className="min-h-screen pt-32 pb-24 text-white">
      {/* Background Accent Glow */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#dc2626]/10 blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-8 text-xs">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shopping Cart</span>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">
            Complete Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#a855f7]">Order</span>
          </h1>
          <p className="text-gray-400 text-xs mt-1">
            Choose your preferred payment method: bKash, Nagad, Rocket, or Visa/MasterCard.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-3">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Customer & Payment Form (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Step 1: Customer Information */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#09090d]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs font-black">
                    1
                  </span>
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Customer Information
                  </h3>
                </div>

                {!user && (
                  <Link
                    to="/my-account"
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Have an account? Log in
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Jasmin Ara Mim"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Email Address (for download delivery) *
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="e.g. client@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="e.g. +880 1700-000000"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-red-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                    Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Specific requests, license domain, etc."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-red-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method Selection */}
            <div className="p-6 md:p-8 rounded-3xl bg-[#09090d]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <span className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center text-xs font-black">
                  2
                </span>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Payment Method
                </h3>
              </div>

              {/* Payment Tabs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* bKash */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-[#E2136E]/20 border-[#E2136E] text-white shadow-[0_0_20px_rgba(226,19,110,0.3)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="block font-black text-sm tracking-tight text-[#E2136E]">bKash</span>
                  <span className="text-[10px] block text-gray-400 mt-1">Manual TrxID</span>
                </button>

                {/* Nagad */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-[#F7931E]/20 border-[#F7931E] text-white shadow-[0_0_20px_rgba(247,147,30,0.3)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="block font-black text-sm tracking-tight text-[#F7931E]">Nagad</span>
                  <span className="text-[10px] block text-gray-400 mt-1">Manual TrxID</span>
                </button>

                {/* Rocket */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('rocket')}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'rocket'
                      ? 'bg-[#8C3494]/20 border-[#8C3494] text-white shadow-[0_0_20px_rgba(140,52,148,0.3)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="block font-black text-sm tracking-tight text-[#c059cb]">Rocket</span>
                  <span className="text-[10px] block text-gray-400 mt-1">DBBL Rocket</span>
                </button>

                {/* Visa / MasterCard / Gateway */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('sslcommerz')}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'sslcommerz' || paymentMethod === 'card'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className="block font-black text-sm tracking-tight text-blue-400">Card / SSL</span>
                  <span className="text-[10px] block text-gray-400 mt-1">Visa / Master</span>
                </button>
              </div>

              {/* bKash Details Box */}
              {paymentMethod === 'bkash' && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a050f] to-[#0c0509] border border-[#E2136E]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Send Money to bKash Personal/Merchant:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-black text-white tracking-wider">
                          {currentBkash.number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentBkash.number)}
                          className="px-2.5 py-1 rounded-md bg-[#E2136E]/20 text-[#E2136E] text-[11px] font-bold flex items-center gap-1 hover:bg-[#E2136E]/30"
                        >
                          <Copy size={12} />
                          <span>{copiedNumber ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Amount to Send:
                      </span>
                      <span className="text-lg font-black text-white">
                        ৳{bdtAmount} BDT <span className="text-xs text-gray-400">(${totalAmount})</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    <strong>Instructions:</strong> Open bKash App &gt; Select "Send Money" &gt; Enter number <strong>{currentBkash.number}</strong> &gt; Enter amount <strong>৳{bdtAmount}</strong> &gt; Confirm with PIN. Copy the Transaction ID (TrxID) and enter it below.
                  </p>

                  {/* QR Code if configured */}
                  {currentBkash.qrImage && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                      <img src={currentBkash.qrImage} alt="bKash QR" className="w-16 h-16 rounded-lg object-cover" />
                      <div className="text-xs">
                        <span className="font-bold text-white block">bKash QR Scanner</span>
                        <span className="text-[10px] text-gray-400">Scan via bKash App for quick payment</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Your bKash Number (Sender) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#E2136E]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. BL92KJ78QA"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#E2136E]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nagad Details Box */}
              {paymentMethod === 'nagad' && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1a0f05] to-[#0c0804] border border-[#F7931E]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Send Money to Nagad Personal:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-black text-white tracking-wider">
                          {currentNagad.number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentNagad.number)}
                          className="px-2.5 py-1 rounded-md bg-[#F7931E]/20 text-[#F7931E] text-[11px] font-bold flex items-center gap-1 hover:bg-[#F7931E]/30"
                        >
                          <Copy size={12} />
                          <span>{copiedNumber ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Amount to Send:
                      </span>
                      <span className="text-lg font-black text-white">
                        ৳{bdtAmount} BDT <span className="text-xs text-gray-400">(${totalAmount})</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    <strong>Instructions:</strong> Open Nagad App or dial *167# &gt; "Send Money" &gt; Enter number <strong>{currentNagad.number}</strong> &gt; Enter amount <strong>৳{bdtAmount}</strong> &gt; Confirm. Copy your Transaction ID.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Your Nagad Number (Sender) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="01XXXXXXXXX"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#F7931E]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 7BG5628K"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-[#F7931E]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Rocket Details Box */}
              {paymentMethod === 'rocket' && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#18051a] to-[#0c030d] border border-[#8C3494]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        DBBL Rocket Account Number:
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xl font-black text-white tracking-wider">
                          {currentRocket.number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(currentRocket.number)}
                          className="px-2.5 py-1 rounded-md bg-[#8C3494]/20 text-purple-300 text-[11px] font-bold flex items-center gap-1 hover:bg-[#8C3494]/30"
                        >
                          <Copy size={12} />
                          <span>{copiedNumber ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                        Amount to Send:
                      </span>
                      <span className="text-lg font-black text-white">
                        ৳{bdtAmount} BDT <span className="text-xs text-gray-400">(${totalAmount})</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    <strong>Instructions:</strong> Dial *322# or use Rocket App &gt; Send Money to <strong>{currentRocket.number}</strong> &gt; Amount <strong>৳{bdtAmount}</strong> &gt; Enter your Transaction ID below.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Your Rocket Number (Sender) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="01XXXXXXXXX-X"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">
                        Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="e.g. 293847291"
                        className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Online Gateway (Visa / Mastercard) Details Box */}
              {['sslcommerz', 'card'].includes(paymentMethod) && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#060c1d] to-[#03060f] border border-blue-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard size={24} className="text-blue-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">SSLCOMMERZ Hosted Payment Gateway</h4>
                      <p className="text-[11px] text-gray-400">Pay securely using Visa, MasterCard, UnionPay, or Internet Banking.</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                    You will be redirected to the secure payment processor to complete your transaction. Your payment will be verified directly on our backend.
                  </p>
                </div>
              )}

              {/* Optional Screenshot Upload for Manual Payments */}
              {['bkash', 'nagad', 'rocket'].includes(paymentMethod) && (
                <div className="pt-2 border-t border-white/10">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Payment Screenshot / Receipt (Optional, speeds up verification)
                  </label>
                  
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                      <Upload size={14} className="text-red-400" />
                      <span>{screenshotPreview ? 'Change Screenshot' : 'Upload Screenshot'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshotChange}
                        className="hidden"
                      />
                    </label>

                    {uploadingScreenshot && (
                      <span className="text-xs text-amber-400 animate-pulse font-semibold">Uploading...</span>
                    )}

                    {screenshotUrl && (
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 size={13} />
                        Screenshot attached!
                      </span>
                    )}
                  </div>

                  {screenshotPreview && (
                    <div className="mt-3 w-32 h-20 rounded-xl overflow-hidden border border-white/10 relative">
                      <img src={screenshotPreview} alt="Screenshot" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order Button (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-[#09090e]/95 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white border-b border-white/10 pb-4">
              Your Order Items ({cart.length})
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => {
                const p = item.product;
                const price = p.discountPrice !== undefined ? p.discountPrice : p.price;
                return (
                  <div key={p._id || p.slug} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <img src={p.thumbnail} alt="" className="w-9 h-7 rounded object-cover flex-shrink-0" />
                      <span className="text-gray-300 truncate font-medium">{p.title}</span>
                    </div>
                    <span className="font-bold text-white flex-shrink-0">${(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Discount</span>
                <span className="font-bold text-emerald-400">-${discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Equivalent BDT</span>
                <span className="font-bold text-white">≈ ৳{bdtAmount} BDT</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase text-white">Total Due</span>
                <span className="text-2xl font-black text-white">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={submitting}
              className={`w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 ${
                submitting
                  ? 'bg-gray-700 cursor-wait'
                  : 'bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] shadow-[0_0_30px_rgba(220,38,38,0.4)]'
              }`}
            >
              <Lock size={14} />
              <span>{submitting ? 'Placing Order...' : 'Place Order & Verify'}</span>
            </button>

            {/* Process Explanation */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-gray-300">
                <Clock size={13} className="text-red-400" />
                <span>Verification & Delivery Process:</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                For bKash, Nagad & Rocket: Your order enters <strong>Pending Verification</strong>. Admin reviews your Transaction ID and approves it within a few minutes. Your digital download link unlocks immediately in your account.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutView;

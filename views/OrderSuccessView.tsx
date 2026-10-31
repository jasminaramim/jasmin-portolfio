import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  Download, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  FileText,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StoreOrder } from '../types';

const OrderSuccessView: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/store/orders/${orderNumber}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load order');
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="min-h-screen pt-40 pb-20 text-center max-w-lg mx-auto px-6 text-white">
        <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-xs">Locating your order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-40 pb-20 text-center max-w-lg mx-auto px-6 text-white">
        <AlertCircle size={44} className="mx-auto text-purple-400 mb-4" />
        <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Order Not Found</h2>
        <p className="text-gray-400 text-xs mb-6">We could not locate order #{orderNumber}.</p>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider"
        >
          <span>Return to Store</span>
        </Link>
      </div>
    );
  }

  const isVerified = order.downloadAccess || order.paymentStatus === 'Paid';
  const isPending = order.paymentStatus === 'Pending Verification';

  return (
    <div className="min-h-screen pt-32 pb-24 text-white">
      {/* Glow */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#a855f7]/15 to-transparent blur-[160px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Top Celebration Card */}
        <div className="text-center mb-10">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ${
            isVerified 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-500/20' 
              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/20'
          }`}>
            {isVerified ? <CheckCircle2 size={40} /> : <Clock size={40} className="animate-pulse" />}
          </div>

          <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block mb-3 ${
            isVerified
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
          }`}>
            {order.paymentStatus}
          </span>

          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight italic">
            {isVerified ? (
              <>Payment <span className="text-emerald-400">Verified!</span></>
            ) : (
              <>Order <span className="text-amber-400">Received!</span></>
            )}
          </h1>

          <p className="text-gray-400 text-xs md:text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Order Reference: <strong className="text-white font-mono">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Status Callout Box */}
        <div className={`p-6 md:p-8 rounded-3xl border mb-10 backdrop-blur-xl ${
          isVerified
            ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_10px_35px_rgba(16,185,129,0.15)]'
            : 'bg-amber-950/20 border-amber-500/30 shadow-[0_10px_35px_rgba(245,158,11,0.15)]'
        }`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                {isVerified ? (
                  <>
                    <Sparkles size={16} className="text-emerald-400" />
                    <span>Your Digital Assets Are Unlocked</span>
                  </>
                ) : (
                  <>
                    <Clock size={16} className="text-amber-400" />
                    <span>Manual Payment Under Verification</span>
                  </>
                )}
              </h3>

              <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
                {isVerified ? (
                  'Your payment has been successfully approved by the admin. You can download your purchased digital files directly below, or access them at any time from your account.'
                ) : (
                  `Your payment of $${order.totalAmount} via ${order.paymentMethod.toUpperCase()} (TrxID: ${order.paymentDetails?.transactionId || 'Submitted'}) is currently being verified by the admin. Verification usually takes 5-15 minutes. Once verified, download links will unlock right here!`
                )}
              </p>
            </div>

            {/* Refresh Verification Status Button */}
            {!isVerified && (
              <button
                onClick={() => fetchOrder(true)}
                disabled={refreshing}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 flex-shrink-0"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                <span>{refreshing ? 'Checking...' : 'Check Status'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Digital Downloads Section */}
        <div className="rounded-3xl bg-[#09090d]/90 border border-white/10 p-6 md:p-8 backdrop-blur-xl mb-10 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Download size={16} className="text-purple-400" />
              <span>Purchased Digital Files ({order.items.length})</span>
            </h3>

            {isVerified && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={13} />
                Download Ready
              </span>
            )}
          </div>

          <div className="space-y-4">
            {order.items.map((item, idx) => {
              const githubUrl = order.deliveredGithubLink || item.githubRepoUrl;
              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-16 h-12 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.title}</h4>
                      <span className="text-[11px] text-gray-400">
                        Single Commercial License &middot; ${item.price}
                      </span>
                    </div>
                  </div>

                  {isVerified ? (
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {githubUrl && (
                        <a
                          href={githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/40 text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={14} />
                          <span>GitHub Repo</span>
                        </a>
                      )}
                      <a
                        href={`/api/store/download/${order.orderNumber}/${idx}`}
                        download
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                      >
                        <Download size={14} />
                        <span>Download ZIP</span>
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-400 text-xs font-semibold">
                      <Clock size={13} className="text-amber-400" />
                      <span>Locked until approval</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {isVerified && (
            <div className="mt-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3.5 text-xs text-emerald-300">
              <CheckCircle2 size={20} className="text-emerald-400 flex-shrink-0" />
              <div>
                <strong className="text-white block font-bold">GitHub Code & ZIP Download Emailed</strong>
                <span className="text-gray-300 text-[11px] block mt-0.5">
                  The verified GitHub repository link and direct source code download package have been delivered to <span className="text-white font-mono">{order.customer.email}</span>.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Order Details & Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Customer & Billing Info */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
              Customer Details
            </h4>
            <div className="flex justify-between text-gray-400">
              <span>Name:</span>
              <strong className="text-white">{order.customer.name}</strong>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Email:</span>
              <strong className="text-white">{order.customer.email}</strong>
            </div>
            {order.customer.phone && (
              <div className="flex justify-between text-gray-400">
                <span>Phone:</span>
                <strong className="text-white">{order.customer.phone}</strong>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Date Placed:</span>
              <strong className="text-white">{new Date(order.createdAt || '').toLocaleString()}</strong>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs border-b border-white/10 pb-2">
              Payment Information
            </h4>
            <div className="flex justify-between text-gray-400">
              <span>Payment Method:</span>
              <strong className="text-white uppercase">{order.paymentMethod}</strong>
            </div>
            {order.paymentDetails?.senderNumber && (
              <div className="flex justify-between text-gray-400">
                <span>Sender Number:</span>
                <strong className="text-white">{order.paymentDetails.senderNumber}</strong>
              </div>
            )}
            {order.paymentDetails?.transactionId && (
              <div className="flex justify-between text-gray-400">
                <span>Transaction ID:</span>
                <strong className="text-white font-mono">{order.paymentDetails.transactionId}</strong>
              </div>
            )}
            <div className="flex justify-between text-gray-400">
              <span>Total Paid:</span>
              <strong className="text-white font-black text-sm">${order.totalAmount}</strong>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <Link
            to="/my-account"
            className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold uppercase tracking-wider transition-colors"
          >
            Go to My Account
          </Link>
          <Link
            to="/store"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white font-black uppercase tracking-widest shadow-xl transition-all"
          >
            Continue Browsing Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessView;

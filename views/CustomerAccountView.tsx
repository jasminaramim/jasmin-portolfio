import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  ShoppingBag, 
  Download, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Mail, 
  Phone, 
  AlertCircle,
  ExternalLink,
  FileArchive,
  ShieldCheck,
  RefreshCw,
  Copy,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { StoreOrder } from '../types';

interface CustomerAccountViewProps {
  defaultTab?: 'purchases' | 'orders' | 'downloads';
}

const CustomerAccountView: React.FC<CustomerAccountViewProps> = ({ defaultTab = 'purchases' }) => {
  const { user, isAuthenticated, login, register, logout, loading: authLoading } = useAuth();

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [submittingAuth, setSubmittingAuth] = useState<boolean>(false);

  // Customer Dashboard State
  const [activeTab, setActiveTab] = useState<'purchases' | 'orders' | 'downloads'>(defaultTab);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [loadingDownloads, setLoadingDownloads] = useState<boolean>(false);
  const [expandedOrderHistory, setExpandedOrderHistory] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Fetch purchases & downloads when logged in
  const fetchData = async () => {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    setLoadingDownloads(true);
    try {
      const [resOrders, resDownloads] = await Promise.all([
        fetch('/api/store/customer/purchases'),
        fetch('/api/store/customer/downloads')
      ]);

      if (resOrders.ok) {
        const dataOrders = await resOrders.json();
        if (Array.isArray(dataOrders)) setOrders(dataOrders);
      }
      if (resDownloads.ok) {
        const dataDownloads = await resDownloads.json();
        if (Array.isArray(dataDownloads)) setDownloads(dataDownloads);
      }
    } catch (e) {
      console.error('Error loading customer dashboard data:', e);
    } finally {
      setLoadingOrders(false);
      setLoadingDownloads(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSubmittingAuth(true);

    try {
      if (authMode === 'login') {
        const res = await login(email, password);
        if (!res.success) setAuthError(res.error || 'Login failed');
      } else {
        if (!name.trim()) {
          setAuthError('Please enter your full name');
          setSubmittingAuth(false);
          return;
        }
        const res = await register(name, email, password, phone);
        if (!res.success) setAuthError(res.error || 'Registration failed');
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-40 pb-20 text-center max-w-md mx-auto px-6 text-white">
        <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400 text-xs font-mono">Authenticating session...</p>
      </div>
    );
  }

  // If not logged in, display Login / Register interface
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-36 pb-24 text-white">
        <div className="max-w-md mx-auto px-6 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black uppercase tracking-tight italic">
              Customer <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-[#a855f7]">Dashboard</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">
              Log in to view your purchases, check payment verification, and download digital source packages.
            </p>
          </div>

          <div className="rounded-3xl bg-[#09090d]/95 border border-white/10 p-8 backdrop-blur-xl shadow-2xl">
            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/5 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-2 rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-2 rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 mb-4">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-gray-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-gray-300 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white font-black uppercase tracking-widest text-xs shadow-[0_0_25px_rgba(220,38,38,0.4)] transition-all hover:opacity-90 mt-2"
              >
                {submittingAuth
                  ? 'Processing...'
                  : authMode === 'login'
                  ? 'Sign In to Account'
                  : 'Create My Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // When logged in: Customer Dashboard with "My Purchases"
  return (
    <div className="min-h-screen pt-32 pb-24 text-white">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* User Welcome Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-[#09090d]/90 border border-white/10 backdrop-blur-xl mb-8 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-[#a855f7] flex items-center justify-center text-white font-black text-xl shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-white">
                {user?.name}
              </h2>
              <span className="text-xs text-gray-400 font-mono">{user?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold transition-colors"
              title="Refresh Purchases"
            >
              <RefreshCw size={14} className={loadingOrders ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={logout}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors"
            >
              <LogOut size={13} />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-8 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'purchases'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <ShoppingBag size={14} />
            <span>My Purchases ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
              activeTab === 'downloads'
                ? 'bg-red-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white bg-white/5'
            }`}
          >
            <Download size={14} />
            <span>Direct Downloads ({downloads.length})</span>
          </button>
        </div>

        {/* TAB 1: MY PURCHASES (MAIN VIEW) */}
        {activeTab === 'purchases' && (
          <div className="space-y-6">
            {loadingOrders ? (
              <div className="text-center py-20 text-gray-400 text-xs flex items-center justify-center gap-2">
                <RefreshCw size={16} className="animate-spin text-red-500" />
                <span>Loading your purchases & download access...</span>
              </div>
            ) : orders.length > 0 ? (
              orders.map((order) => {
                const isPaid = order.paymentStatus === 'Paid';
                const isPending = order.paymentStatus === 'Pending Verification';
                const isRejected = order.paymentStatus === 'Rejected';
                const hasDownloadAccess = Boolean(order.downloadAccess && isPaid);
                const downloadCount = order.downloadCount || 0;
                const downloadLimit = order.downloadLimit || 10;
                const remainingDownloads = Math.max(0, downloadLimit - downloadCount);
                const isExpired = order.tokenExpiry && new Date() > new Date(order.tokenExpiry);
                const isExpanded = expandedOrderHistory === order.orderNumber;

                return (
                  <div
                    key={order._id || order.orderNumber}
                    className="p-6 md:p-7 rounded-3xl bg-[#09090d]/95 border border-white/10 backdrop-blur-xl shadow-xl space-y-6 transition-all hover:border-white/20"
                  >
                    {/* Header Row: Order Number, Date, Status Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-base text-white tracking-wide">
                            #{order.orderNumber}
                          </span>
                          {/* Payment Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isPaid
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isPending
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : isRejected
                              ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                              : 'bg-gray-500/15 text-gray-400 border border-gray-500/30'
                          }`}>
                            Payment: {order.paymentStatus}
                          </span>
                          {/* Delivery Status Badge */}
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.orderStatus === 'Delivered'
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}>
                            Delivery: {order.orderStatus}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <Clock size={12} />
                          <span>Purchased on {new Date(order.createdAt || '').toLocaleString()}</span>
                          <span>&middot;</span>
                          <span className="uppercase text-gray-300 font-bold">{order.paymentMethod}</span>
                          {order.paymentDetails?.transactionId && (
                            <span className="text-purple-300 font-mono text-[11px]">
                              (TrxID: {order.paymentDetails.transactionId})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Total Amount</span>
                        <span className="text-xl font-black text-white">${order.totalAmount}</span>
                      </div>
                    </div>

                    {/* Purchased Products List with Source ZIP Download Actions */}
                    <div className="space-y-4">
                      {order.items.map((item, itemIdx) => {
                        const tokenParam = order.downloadToken ? `?token=${order.downloadToken}` : '';
                        const downloadUrl = `/api/store/download/${order.orderNumber}/${itemIdx}${tokenParam}`;
                        const githubUrl = item.githubRepoUrl || order.deliveredGithubLink;

                        return (
                          <div
                            key={itemIdx}
                            className="p-4 md:p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-4">
                              <img
                                src={item.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300'}
                                alt={item.title}
                                className="w-16 h-14 rounded-xl object-cover border border-white/10 flex-shrink-0"
                              />
                              <div>
                                <h4 className="text-sm font-black text-white">{item.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-xs text-red-400 font-bold">${item.price}</span>
                                  <span className="text-[11px] text-gray-400">&middot;</span>
                                  <span className="text-[11px] text-gray-400 font-mono">
                                    SKU: {item.productId || `PROD-${item.slug}`}
                                  </span>
                                  {item.productLicense && (
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-gray-300">
                                      {item.productLicense}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Download Action Button Area */}
                            <div className="flex flex-wrap items-center gap-2.5 justify-end">
                              {githubUrl && hasDownloadAccess && (
                                <a
                                  href={githubUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3.5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                                  title="Open GitHub Code Repository"
                                >
                                  <ExternalLink size={13} />
                                  <span>GitHub Repo</span>
                                </a>
                              )}

                              {hasDownloadAccess && !isExpired && remainingDownloads > 0 ? (
                                <a
                                  href={downloadUrl}
                                  download
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
                                >
                                  <Download size={14} />
                                  <span>Download Source ZIP</span>
                                </a>
                              ) : isPending ? (
                                <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-2">
                                  <Clock size={13} />
                                  <span>Pending Admin Approval</span>
                                </div>
                              ) : isRejected ? (
                                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                                  <AlertCircle size={13} />
                                  <span>Payment Not Verified</span>
                                </div>
                              ) : isExpired ? (
                                <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2">
                                  <AlertCircle size={13} />
                                  <span>Download Expired (7-day limit)</span>
                                </div>
                              ) : (
                                <div className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 text-xs font-bold flex items-center gap-2">
                                  <Lock size={13} />
                                  <span>Downloads Locked</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Download Policy & Remaining Count Indicator */}
                    {hasDownloadAccess && (
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 text-gray-300">
                          <ShieldCheck size={16} className="text-emerald-400" />
                          <span>
                            Downloads Used: <strong className="text-white font-mono">{downloadCount} / {downloadLimit}</strong>
                            <span className="text-gray-500 ml-1.5">({remainingDownloads} remaining)</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-400">
                          {order.tokenExpiry && (
                            <span>
                              Active until: <span className="text-gray-300 font-mono">{new Date(order.tokenExpiry).toLocaleDateString()}</span>
                            </span>
                          )}
                          <button
                            onClick={() => setExpandedOrderHistory(isExpanded ? null : order.orderNumber)}
                            className="text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
                          >
                            <span>Download History ({order.downloadHistory?.length || 0})</span>
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Collapsible Download Audit History */}
                    {isExpanded && (
                      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 space-y-2 text-xs font-mono">
                        <span className="font-bold text-gray-300 block mb-2 font-sans text-xs">
                          Download Activity Log:
                        </span>
                        {order.downloadHistory && order.downloadHistory.length > 0 ? (
                          order.downloadHistory.map((h, hIdx) => (
                            <div key={hIdx} className="flex justify-between items-center text-[11px] p-2 rounded-lg bg-white/5">
                              <span className="text-emerald-400">
                                Downloaded on {new Date(h.downloadedAt).toLocaleString()}
                              </span>
                              <span className="text-gray-500">IP: {h.ip || '127.0.0.1'}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 text-xs font-sans">
                            No download requests logged yet for this order.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Admin Notes or Support Contact */}
                    {order.adminNotes && (
                      <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200">
                        <span className="font-bold block mb-0.5 text-purple-300">Message from Store Admin:</span>
                        {order.adminNotes}
                      </div>
                    )}

                    {/* Support Help Contact */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5 gap-2">
                      <span>Need help with this order or source installation?</span>
                      <a
                        href="https://wa.me/8801915996145"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1.5"
                      >
                        <Phone size={12} />
                        <span>WhatsApp Support: +8801915996145</span>
                      </a>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10 p-8">
                <ShoppingBag size={44} className="mx-auto text-gray-500 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">No Purchases Found</h3>
                <p className="text-gray-400 text-xs max-w-sm mx-auto mb-6">
                  You haven't placed any digital product orders yet. Browse our themes, plugins, and templates to get started.
                </p>
                <Link
                  to="/store"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 text-white text-xs font-black uppercase tracking-wider shadow-lg"
                >
                  Browse Store Catalog
                </Link>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DIRECT DOWNLOADS */}
        {activeTab === 'downloads' && (
          <div className="space-y-4">
            {loadingDownloads ? (
              <div className="text-center py-16 text-gray-400 text-xs">Loading downloads...</div>
            ) : downloads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {downloads.map((dl, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#09090d]/90 border border-white/10 backdrop-blur-xl flex items-center justify-between gap-4 shadow-lg"
                  >
                    <div className="flex items-center gap-3.5 truncate">
                      <img src={dl.thumbnail} alt="" className="w-14 h-11 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-white truncate">{dl.productTitle}</h4>
                        <span className="text-[10px] text-gray-400 block truncate">{dl.fileName}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {dl.githubRepoUrl && (
                        <a
                          href={dl.githubRepoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                          title="Open GitHub Repository Code"
                        >
                          <ExternalLink size={12} />
                          <span>GitHub</span>
                        </a>
                      )}
                      <a
                        href={dl.downloadUrl}
                        download
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 p-8">
                <Download size={40} className="mx-auto text-gray-500 mb-3" />
                <h3 className="text-sm font-bold text-white mb-1">No Downloads Available</h3>
                <p className="text-gray-400 text-xs max-w-sm mx-auto mb-6">
                  Downloads unlock automatically once your orders are verified and approved by the admin.
                </p>
                <Link
                  to="/store"
                  className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black uppercase tracking-wider"
                >
                  Explore Store Catalog
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAccountView;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Plus, 
  ShoppingBag, 
  Package, 
  CreditCard, 
  Settings, 
  Users, 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Trash2, 
  Edit3, 
  Eye, 
  Upload, 
  DollarSign, 
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Save,
  Image as ImageIcon,
  Check,
  RefreshCw,
  TrendingUp,
  FileText,
  Mail,
  Github,
  Send,
  Copy,
  FileArchive,
  Download,
  AlertCircle
} from 'lucide-react';
import { StoreProduct, StoreOrder, StoreSettings, StoreCategory } from '../types';

type AdminTab = 
  | 'overview' 
  | 'payment-verification'
  | 'add-product' 
  | 'products' 
  | 'categories' 
  | 'orders' 
  | 'customers' 
  | 'payment-settings' 
  | 'store-settings';

const CATEGORIES: StoreCategory[] = [
  'WordPress Themes',
  'WordPress Plugins',
  'Elementor Templates',
  'Website Templates',
  'UI Kits & Components',
  'Canva Templates',
];

const AdminStoreDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Stats state
  const [stats, setStats] = useState<any>({
    totalRevenue: 0,
    totalOrders: 0,
    pendingVerifications: 0,
    totalProducts: 0,
    totalCustomers: 0,
    recentOrders: []
  });

  // Data states
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filters & search
  const [productSearch, setProductSearch] = useState<string>('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('All');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');
  const [orderSearch, setOrderSearch] = useState<string>('');

  // Selected Order for Review Modal / Drawer
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [verifyingOrder, setVerifyingOrder] = useState<boolean>(false);
  const [orderGithubLink, setOrderGithubLink] = useState<string>('');
  const [orderZipUrl, setOrderZipUrl] = useState<string>('');
  const [sendEmailOnApprove, setSendEmailOnApprove] = useState<boolean>(true);
  const [sendingCodeEmail, setSendingCodeEmail] = useState<boolean>(false);

  // Manual ZIP Delivery Modal State
  const [showManualZipModal, setShowManualZipModal] = useState<boolean>(false);
  const [manualSelectedProduct, setManualSelectedProduct] = useState<string>('');
  const [manualZipUrl, setManualZipUrl] = useState<string>('');
  const [manualNotes, setManualNotes] = useState<string>('');
  const [manualRecipientEmail, setManualRecipientEmail] = useState<string>('');
  const [sendingManualZip, setSendingManualZip] = useState<boolean>(false);

  // Image & Utility States
  const [screenshotModalUrl, setScreenshotModalUrl] = useState<string | null>(null);
  const [copiedTrxId, setCopiedTrxId] = useState<string | null>(null);
  const [uploadingZip, setUploadingZip] = useState<boolean>(false);
  const [uploadedZipInfo, setUploadedZipInfo] = useState<{
    fileName: string;
    size: string;
    storageReference: string;
    uploadedAt: string;
  } | null>(null);

  // URL Sync
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'payment-verification', 'add-product', 'products', 'categories', 'orders', 'customers', 'payment-settings', 'store-settings'].includes(tab)) {
      setActiveTab(tab as AdminTab);
    }
  }, [searchParams]);

  const handleTabChange = (newTab: AdminTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
    if (newTab === 'products' || newTab === 'overview' || newTab === 'categories') {
      loadData();
    }
  };

  // Add / Edit Product Form State
  const [editingProduct, setEditingProduct] = useState<StoreProduct | null>(null);
  const [productForm, setProductForm] = useState<{
    shopName: string;
    title: string;
    slug: string;
    productCode: string;
    sourceCodeVersion: string;
    downloadFileName: string;
    downloadInstructions: string;
    productLicense: string;
    downloadEnabled: boolean;
    sourceCodeZip: string;
    shortDescription: string;
    description: string;
    category: StoreCategory;
    thumbnail: string;
    galleryImages: string;
    demoImages: string;
    liveLink: string;
    price: number | string;
    discountPrice: number | string;
    downloadFilesName: string;
    downloadFilesUrl: string;
    githubRepoUrl: string;
    sourceCodeZipUrl: string;
    status: 'Published' | 'Draft' | 'Out of Stock';
    featured: boolean;
    features: string;
    tags: string;
  }>({
    shopName: 'Jasmin Code Studio',
    title: '',
    slug: '',
    productCode: '',
    sourceCodeVersion: 'v1.0.0',
    downloadFileName: '',
    downloadInstructions: '1. Extract the downloaded source ZIP archive.\n2. Run npm install or follow project documentation.\n3. For WordPress themes, upload the ZIP via WP Admin > Appearance > Themes.',
    productLicense: 'Single Commercial License',
    downloadEnabled: true,
    sourceCodeZip: '',
    shortDescription: '',
    description: '',
    category: 'WordPress Themes',
    thumbnail: '',
    galleryImages: '',
    demoImages: '',
    liveLink: '',
    price: '',
    discountPrice: '',
    downloadFilesName: '',
    downloadFilesUrl: '',
    githubRepoUrl: '',
    sourceCodeZipUrl: '',
    status: 'Published',
    featured: false,
    features: '',
    tags: ''
  });

  const notify = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Check Admin Authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (!data.authenticated) {
          navigate('/admin/login');
        }
      } catch (e) {
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // Load Dashboard Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, productsRes, ordersRes, customersRes, settingsRes] = await Promise.all([
        fetch('/api/store/admin/stats'),
        fetch('/api/store/products?status=all'),
        fetch('/api/store/admin/orders'),
        fetch('/api/store/admin/customers'),
        fetch('/api/store/admin/settings')
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (productsRes.ok) {
        const prodData = await productsRes.json();
        if (Array.isArray(prodData)) {
          setProducts(prodData);
        }
      }
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (customersRes.ok) setCustomers(await customersRes.json());
      if (settingsRes.ok) setSettings(await settingsRes.json());
    } catch (e) {
      console.error('Error fetching admin store data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Image Upload Handler
  const handleImageUpload = (field: 'thumbnail' | 'bkashQR' | 'nagadQR' | 'rocketQR') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/store/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: reader.result as string,
              filename: file.name
            })
          });
          const data = await res.json();
          if (data.success && data.url) {
            if (field === 'thumbnail') {
              setProductForm(prev => ({ ...prev, thumbnail: data.url }));
            } else if (settings) {
              if (field === 'bkashQR') {
                setSettings(prev => prev ? ({ ...prev, bkash: { ...prev.bkash, qrImage: data.url } }) : null);
              } else if (field === 'nagadQR') {
                setSettings(prev => prev ? ({ ...prev, nagad: { ...prev.nagad, qrImage: data.url } }) : null);
              } else if (field === 'rocketQR') {
                setSettings(prev => prev ? ({ ...prev, rocket: { ...prev.rocket, qrImage: data.url } }) : null);
              }
            }
            notify('Image uploaded successfully!');
          }
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // Secure Product Source Code ZIP Uploader
  const handleZipUpload = (e?: any) => {
    const processFile = async (file: File) => {
      if (!file.name.toLowerCase().endsWith('.zip') && !file.name.toLowerCase().endsWith('.tar.gz')) {
        alert('Only .zip or .tar.gz archives are allowed for digital product source code.');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('File size exceeds 100MB limit.');
        return;
      }

      setUploadingZip(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const res = await fetch('/api/store/admin/upload-zip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: reader.result as string,
              fileName: file.name,
              productCode: productForm.productCode || 'PROD',
              version: productForm.sourceCodeVersion || 'v1.0'
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setProductForm(prev => ({
              ...prev,
              sourceCodeZip: data.storageReference,
              downloadFileName: data.fileName,
              sourceCodeZipUrl: data.storageReference
            }));
            setUploadedZipInfo({
              fileName: data.fileName,
              size: data.size,
              storageReference: data.storageReference,
              uploadedAt: new Date(data.uploadedAt).toLocaleString()
            });
            notify(`Product ZIP "${data.fileName}" uploaded securely to private storage!`);
          } else {
            alert(data.error || 'Failed to upload ZIP package');
          }
        } catch (err: any) {
          alert('Upload failed: ' + err.message);
        } finally {
          setUploadingZip(false);
        }
      };
      reader.readAsDataURL(file);
    };

    const targetFile = e?.target?.files?.[0];
    if (targetFile) {
      processFile(targetFile);
    } else {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.zip,.tar.gz';
      input.onchange = (ev: any) => {
        const f = ev.target?.files?.[0];
        if (f) processFile(f);
      };
      input.click();
    }
  };

  // Save Product (Add or Edit)
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.title || !productForm.price) {
      alert('Title and Price are required.');
      return;
    }

    const payload = {
      shopName: productForm.shopName,
      title: productForm.title,
      slug: productForm.slug || undefined,
      productCode: productForm.productCode,
      sourceCodeZip: productForm.sourceCodeZip || productForm.sourceCodeZipUrl,
      sourceCodeVersion: productForm.sourceCodeVersion,
      downloadFileName: productForm.downloadFileName || productForm.downloadFilesName,
      downloadInstructions: productForm.downloadInstructions,
      productLicense: productForm.productLicense,
      downloadEnabled: productForm.downloadEnabled,
      shortDescription: productForm.shortDescription,
      description: productForm.description,
      category: productForm.category,
      thumbnail: productForm.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
      galleryImages: productForm.galleryImages.split('\n').map(s => s.trim()).filter(Boolean),
      demoImages: productForm.demoImages.split('\n').map(s => s.trim()).filter(Boolean),
      liveLink: productForm.liveLink,
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      downloadableFiles: productForm.downloadFilesName && productForm.downloadFilesUrl ? [{
        name: productForm.downloadFilesName,
        url: productForm.downloadFilesUrl,
        size: 'Standard'
      }] : (productForm.sourceCodeZip ? [{
        name: productForm.downloadFileName || `${productForm.title}.zip`,
        url: productForm.sourceCodeZip,
        size: uploadedZipInfo?.size || 'Standard'
      }] : []),
      githubRepoUrl: productForm.githubRepoUrl || undefined,
      sourceCodeZipUrl: productForm.sourceCodeZip || productForm.sourceCodeZipUrl || undefined,
      status: productForm.status,
      featured: productForm.featured,
      features: productForm.features.split('\n').map(s => s.trim()).filter(Boolean),
      tags: productForm.tags.split(',').map(s => s.trim()).filter(Boolean)
    };

    try {
      const endpoint = editingProduct && editingProduct._id
        ? `/api/store/admin/products/${editingProduct._id}`
        : '/api/store/admin/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        notify(editingProduct ? 'Product updated successfully!' : 'Product added successfully!');
        setEditingProduct(null);
        resetProductForm();
        await loadData();
        handleTabChange('products');
      } else {
        alert(data.error || 'Failed to save product');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      shopName: 'Jasmin Code Studio',
      title: '',
      slug: '',
      productCode: '',
      sourceCodeVersion: 'v1.0.0',
      downloadFileName: '',
      downloadInstructions: '1. Extract the downloaded source ZIP archive.\n2. Run npm install or follow project documentation.\n3. For WordPress themes, upload the ZIP via WP Admin > Appearance > Themes.',
      productLicense: 'Single Commercial License',
      downloadEnabled: true,
      sourceCodeZip: '',
      shortDescription: '',
      description: '',
      category: 'WordPress Themes',
      thumbnail: '',
      galleryImages: '',
      demoImages: '',
      liveLink: '',
      price: '',
      discountPrice: '',
      downloadFilesName: '',
      downloadFilesUrl: '',
      githubRepoUrl: '',
      sourceCodeZipUrl: '',
      status: 'Published',
      featured: false,
      features: '',
      tags: ''
    });
    setUploadedZipInfo(null);
  };

  const handleEditProductClick = (product: StoreProduct) => {
    setEditingProduct(product);
    setProductForm({
      shopName: product.shopName || 'Jasmin Code Studio',
      title: product.title,
      slug: product.slug,
      productCode: product.productCode || '',
      sourceCodeVersion: product.sourceCodeVersion || 'v1.0.0',
      downloadFileName: product.downloadFileName || product.downloadableFiles?.[0]?.name || '',
      downloadInstructions: product.downloadInstructions || '1. Extract the downloaded source ZIP archive.\n2. Follow project documentation for installation.',
      productLicense: product.productLicense || 'Single Commercial License',
      downloadEnabled: product.downloadEnabled !== undefined ? Boolean(product.downloadEnabled) : true,
      sourceCodeZip: product.sourceCodeZip || product.sourceCodeZipUrl || '',
      shortDescription: product.shortDescription,
      description: product.description,
      category: product.category as StoreCategory,
      thumbnail: product.thumbnail,
      galleryImages: (product.galleryImages || []).join('\n'),
      demoImages: (product.demoImages || []).join('\n'),
      liveLink: product.liveLink || '',
      price: product.price,
      discountPrice: product.discountPrice || '',
      downloadFilesName: product.downloadableFiles?.[0]?.name || '',
      downloadFilesUrl: product.downloadableFiles?.[0]?.url || '',
      githubRepoUrl: product.githubRepoUrl || '',
      sourceCodeZipUrl: product.sourceCodeZip || product.sourceCodeZipUrl || '',
      status: product.status,
      featured: Boolean(product.featured),
      features: (product.features || []).join('\n'),
      tags: (product.tags || []).join(', ')
    });
    if (product.sourceCodeZip) {
      setUploadedZipInfo({
        fileName: product.downloadFileName || 'source-code.zip',
        size: product.downloadableFiles?.[0]?.size || 'Standard',
        storageReference: product.sourceCodeZip,
        uploadedAt: 'Active Storage'
      });
    } else {
      setUploadedZipInfo(null);
    }
    handleTabChange('add-product');
  };

  const handleDeleteProduct = async (id?: string) => {
    if (!id || !confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/store/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('Product deleted.');
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Open Order Review Modal with prefilled GitHub code link & ZIP
  const openOrderReview = (order: StoreOrder) => {
    setSelectedOrder(order);
    setAdminNotes(order.adminNotes || '');
    const defaultGithub = order.deliveredGithubLink || (order.items && order.items[0]?.githubRepoUrl) || '';
    const defaultZip = order.deliveredZipUrl || (order.items && (order.items[0]?.sourceCodeZip || order.items[0]?.sourceCodeZipUrl || order.items[0]?.downloadableFiles?.[0]?.url)) || '';
    setOrderGithubLink(defaultGithub);
    setOrderZipUrl(defaultZip);
    setSendEmailOnApprove(true);
  };

  // Open Manual ZIP Delivery Modal
  const openManualZipModal = (order: StoreOrder) => {
    setSelectedOrder(order);
    const initialItem = order.items && order.items[0];
    setManualSelectedProduct(initialItem ? (initialItem.productId || initialItem.slug) : '');
    setManualZipUrl(order.deliveredZipUrl || initialItem?.sourceCodeZip || initialItem?.sourceCodeZipUrl || '');
    setManualNotes(order.adminNotes || '');
    setManualRecipientEmail(order.customer.email);
    setShowManualZipModal(true);
  };

  // Dispatch Manual ZIP Delivery
  const handleDeliverManual = async () => {
    if (!selectedOrder || !selectedOrder._id) return;
    setSendingManualZip(true);
    try {
      const res = await fetch(`/api/store/admin/orders/${selectedOrder._id}/deliver-manual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: manualSelectedProduct,
          productZipUrl: manualZipUrl || orderZipUrl,
          githubRepoUrl: orderGithubLink,
          notes: manualNotes || adminNotes,
          recipientEmail: manualRecipientEmail || selectedOrder.customer.email
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify('Product ZIP delivered manually to customer email!');
        setSelectedOrder(data.order);
        setShowManualZipModal(false);
        loadData();
      } else {
        alert(data.error || 'Failed to deliver ZIP manually');
      }
    } catch (err: any) {
      alert(err.message || 'Error delivering manual ZIP');
    } finally {
      setSendingManualZip(false);
    }
  };

  // Verify Manual Payment (Approve / Reject)
  const handleVerifyOrder = async (orderId: string, action: 'approve' | 'reject') => {
    setVerifyingOrder(true);
    try {
      const res = await fetch(`/api/store/admin/orders/${orderId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          adminNotes,
          githubRepoUrl: orderGithubLink,
          customZipUrl: orderZipUrl,
          sendEmail: action === 'approve' ? sendEmailOnApprove : false
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (action === 'approve') {
          const emailSent = data.order?.emailDeliveryStatus === 'Sent';
          notify(`Order APPROVED! ${emailSent ? 'GitHub Code & ZIP sent to customer email!' : 'Code access unlocked.'}`);
        } else {
          notify('Order payment REJECTED.');
        }
        setSelectedOrder(data.order);
        loadData();
      } else {
        alert(data.error || 'Failed to verify order');
      }
    } catch (err: any) {
      alert(err.message || 'Error verifying order');
    } finally {
      setVerifyingOrder(false);
    }
  };

  // Send / Re-send Delivery Email with GitHub repo & ZIP to customer
  const handleSendCodeEmail = async () => {
    if (!selectedOrder || !selectedOrder._id) return;
    setSendingCodeEmail(true);
    try {
      const res = await fetch(`/api/store/admin/orders/${selectedOrder._id}/send-code-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubRepoUrl: orderGithubLink,
          customZipUrl: orderZipUrl,
          customMessage: adminNotes
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify('GitHub code repository and ZIP email dispatched to customer!');
        setSelectedOrder(data.order);
        loadData();
      } else {
        alert(data.error || 'Failed to dispatch email');
      }
    } catch (err: any) {
      alert(err.message || 'Error sending code email');
    } finally {
      setSendingCodeEmail(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/store/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        notify('Store settings updated successfully!');
      } else {
        alert(data.error || 'Failed to update settings');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const title = (p.title || (p as any).name || '').toLowerCase();
    const matchesSearch = !productSearch || title.includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'All' || o.paymentStatus === orderStatusFilter || o.orderStatus === orderStatusFilter;
    const matchesSearch = !orderSearch || 
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.paymentDetails?.transactionId && o.paymentDetails.transactionId.toLowerCase().includes(orderSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex font-['Plus_Jakarta_Sans'] relative z-10 w-full">
      {/* Toast Alert */}
      {actionMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-emerald-500/90 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="w-72 bg-[#09090d] border-r border-white/5 p-6 flex flex-col fixed h-full z-30 overflow-y-auto">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#a855f7] to-[#7e22ce] flex items-center justify-center text-white font-black text-lg shadow-lg">
            S
          </div>
          <div>
            <h2 className="font-black text-lg tracking-tight uppercase leading-none italic">
              Store Admin
            </h2>
            <span className="text-[10px] text-purple-400 font-bold tracking-widest uppercase">
              Digital Marketplace
            </span>
          </div>
        </div>

        {/* Sidebar Nav items */}
        <nav className="flex-grow space-y-1 text-xs font-bold">
          <button
            onClick={() => handleTabChange('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard size={16} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => handleTabChange('payment-verification')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'payment-verification'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck size={16} />
              <span>Payment Verification</span>
            </div>
            {stats.pendingVerifications > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] animate-pulse">
                {stats.pendingVerifications}
              </span>
            )}
          </button>

          <button
            onClick={() => { resetProductForm(); setEditingProduct(null); handleTabChange('add-product'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'add-product'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Plus size={16} />
            <span>{editingProduct ? 'Edit Product' : 'Add Product'}</span>
          </button>

          <button
            onClick={() => handleTabChange('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package size={16} />
            <span>Manage Products ({products.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'categories'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers size={16} />
            <span>Categories</span>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={16} />
              <span>Orders</span>
            </div>
            {stats.pendingVerifications > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px]">
                {stats.pendingVerifications}
              </span>
            )}
          </button>

          <button
            onClick={() => handleTabChange('customers')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'customers'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={16} />
            <span>Customers ({customers.length})</span>
          </button>

          <button
            onClick={() => handleTabChange('payment-settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'payment-settings'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CreditCard size={16} />
            <span>Payment Settings</span>
          </button>

          <button
            onClick={() => handleTabChange('store-settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'store-settings'
                ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-lg shadow-purple-900/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings size={16} />
            <span>Store Settings</span>
          </button>
        </nav>

        {/* Back to main Portfolio Admin */}
        <div className="pt-6 border-t border-white/5 space-y-2">
          <Link
            to="/admin/projects"
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Portfolio Admin HQ</span>
          </Link>
          <Link
            to="/store"
            target="_blank"
            className="flex items-center gap-2 text-xs font-bold text-purple-400 hover:text-purple-300 p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <ExternalLink size={14} />
            <span>Open Live Store</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-72 flex-grow p-8 md:p-12 min-h-screen relative z-20 bg-[#07070a]">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tight italic">
                  Store <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-purple-400">Overview</span>
                </h1>
                <p className="text-gray-400 text-xs mt-1">
                  Real-time sales, order verification status, and digital product statistics.
                </p>
              </div>

              <button
                onClick={loadData}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw size={13} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Metrics Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 shadow-xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
                  <DollarSign size={18} className="text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-white">${stats.totalRevenue.toFixed(2)}</div>
                <span className="text-[10px] text-emerald-400 font-bold block mt-1">Verified Purchases</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 shadow-xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <ShoppingBag size={18} className="text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats.totalOrders}</div>
                <span className="text-[10px] text-gray-400 font-bold block mt-1">All time orders</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 shadow-xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Verification</span>
                  <Clock size={18} className="text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">{stats.pendingVerifications}</div>
                <span className="text-[10px] text-amber-400 font-bold block mt-1">bKash/Nagad/Rocket orders waiting review</span>
              </div>

              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 shadow-xl">
                <div className="flex items-center justify-between text-gray-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
                  <Package size={18} className="text-purple-400" />
                </div>
                <div className="text-3xl font-black text-white">{stats.totalProducts}</div>
                <span className="text-[10px] text-purple-400 font-bold block mt-1">6 digital categories</span>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="rounded-3xl bg-[#09090d] border border-white/5 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Recent Orders & Verification Queue
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold"
                >
                  View All Orders &rarr;
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider text-[10px]">
                      <th className="pb-3">Order Number</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Method</th>
                      <th className="pb-3">TrxID</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 6).map((order) => {
                      const isPending = order.paymentStatus === 'Pending Verification';
                      const isPaid = order.paymentStatus === 'Paid';

                      return (
                        <tr key={order._id || order.orderNumber} className="hover:bg-white/5 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-white">{order.orderNumber}</td>
                          <td className="py-3.5">
                            <span className="font-bold text-white block">{order.customer.name}</span>
                            <span className="text-[10px] text-gray-400 block">{order.customer.email}</span>
                          </td>
                          <td className="py-3.5 uppercase font-bold text-red-400">{order.paymentMethod}</td>
                          <td className="py-3.5 font-mono text-gray-300">
                            {order.paymentDetails?.transactionId || 'None'}
                          </td>
                          <td className="py-3.5 font-bold text-white">${order.totalAmount}</td>
                          <td className="py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isPaid ? 'bg-emerald-500/20 text-emerald-400' :
                              isPending ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3.5 text-right">
                            <button
                              onClick={() => openOrderReview(order)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-purple-600 text-white text-[11px] font-bold transition-colors"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PAYMENT VERIFICATION */}
        {activeTab === 'payment-verification' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black uppercase tracking-tight italic">
                    Payment <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-purple-400">Verification</span>
                  </h1>
                  {stats.pendingVerifications > 0 && (
                    <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold animate-pulse">
                      {stats.pendingVerifications} Pending Action
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  Inspect Transaction IDs, check payment receipts, and approve digital product deliveries.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadData}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-2"
                >
                  <RefreshCw size={13} />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Verification Filters & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#09090d] border border-white/5 shadow-xl">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 text-xs">
                {(['All', 'Pending Verification', 'Paid', 'Rejected'] as const).map((st) => {
                  const count = st === 'All' 
                    ? orders.length 
                    : orders.filter(o => o.paymentStatus === st).length;
                  const isActive = orderStatusFilter === st;

                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setOrderStatusFilter(st)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-md'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{st}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-black/30 text-white' : 'bg-white/5 text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative w-full md:w-72 flex-shrink-0">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Order #, Customer, TrxID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Verification Orders Table */}
            <div className="rounded-2xl bg-[#09090d] border border-white/5 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider text-[10px] bg-white/5">
                      <th className="p-4">Order # & Date</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Purchased Product(s)</th>
                      <th className="p-4">Method & Amount</th>
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Payment Screenshot</th>
                      <th className="p-4">Payment Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => {
                        const isPending = order.paymentStatus === 'Pending Verification';
                        const isPaid = order.paymentStatus === 'Paid';
                        const isRejected = order.paymentStatus === 'Rejected';
                        const screenshot = order.paymentDetails?.screenshotUrl;
                        const trxId = order.paymentDetails?.transactionId || '';

                        return (
                          <tr key={order._id || order.orderNumber} className="hover:bg-white/5 transition-colors">
                            <td className="p-4">
                              <span className="font-mono font-bold text-white block text-sm">
                                {order.orderNumber}
                              </span>
                              <span className="text-[10px] text-gray-500 block">
                                {new Date(order.createdAt || '').toLocaleDateString()} {new Date(order.createdAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            <td className="p-4">
                              <span className="font-bold text-white block">{order.customer.name}</span>
                              <span className="text-[11px] text-gray-400 block font-mono">{order.customer.email}</span>
                              {order.customer.phone && (
                                <span className="text-[10px] text-gray-500 block">{order.customer.phone}</span>
                              )}
                            </td>

                            <td className="p-4 max-w-[200px]">
                              <div className="space-y-1">
                                {order.items.map((it, idx) => (
                                  <div key={idx} className="truncate">
                                    <span className="font-bold text-gray-200 block truncate" title={it.title}>
                                      {it.title}
                                    </span>
                                    <span className="text-[10px] text-gray-500">
                                      ${it.price} &middot; {it.productCode || 'DIGITAL'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </td>

                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider block w-max ${
                                order.paymentMethod === 'bkash' ? 'bg-[#E2136E]/20 text-[#E2136E]' :
                                order.paymentMethod === 'nagad' ? 'bg-[#F7931E]/20 text-[#F7931E]' :
                                order.paymentMethod === 'rocket' ? 'bg-purple-600/20 text-purple-300' :
                                'bg-blue-600/20 text-blue-400'
                              }`}>
                                {order.paymentMethod}
                              </span>
                              <span className="text-sm font-black text-white block mt-1">
                                ${order.totalAmount}
                              </span>
                            </td>

                            <td className="p-4 font-mono">
                              {trxId ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-white font-bold bg-white/5 px-2 py-1 rounded text-[11px]">
                                    {trxId}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(trxId);
                                      setCopiedTrxId(trxId);
                                      setTimeout(() => setCopiedTrxId(null), 2000);
                                    }}
                                    className="p-1 rounded bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                                    title="Copy TrxID"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  {copiedTrxId === trxId && (
                                    <span className="text-[9px] text-emerald-400 font-bold">Copied!</span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-500 italic text-[11px]">No TrxID</span>
                              )}
                              {order.paymentDetails?.senderNumber && (
                                <span className="text-[10px] text-gray-400 block mt-0.5">
                                  From: {order.paymentDetails.senderNumber}
                                </span>
                              )}
                            </td>

                            <td className="p-4">
                              {screenshot ? (
                                <button
                                  type="button"
                                  onClick={() => setScreenshotModalUrl(screenshot)}
                                  className="group relative block w-14 h-12 rounded-lg overflow-hidden border border-white/10 hover:border-red-500 transition-all shadow-md"
                                >
                                  <img
                                    src={screenshot}
                                    alt="Payment Screenshot"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                </button>
                              ) : (
                                <span className="text-gray-500 text-[11px] italic">No receipt</span>
                              )}
                            </td>

                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                                isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                                isRejected ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {isPending ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={verifyingOrder}
                                      onClick={() => handleVerifyOrder(order._id || '', 'approve')}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-md transition-all"
                                      title="Approve Payment"
                                    >
                                      <Check size={12} />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      type="button"
                                      disabled={verifyingOrder}
                                      onClick={() => handleVerifyOrder(order._id || '', 'reject')}
                                      className="px-3 py-1.5 rounded-lg bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white font-bold text-[11px] flex items-center gap-1 border border-red-500/30 transition-all"
                                      title="Reject Payment"
                                    >
                                      <XCircle size={12} />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                ) : isPaid ? (
                                  <button
                                    type="button"
                                    onClick={() => openManualZipModal(order)}
                                    className="px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-[11px] flex items-center gap-1 border border-purple-500/30 transition-all"
                                    title="Send ZIP Manually to Customer"
                                  >
                                    <Send size={12} />
                                    <span>Send ZIP Manually</span>
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => openOrderReview(order)}
                                  className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold"
                                  title="View Details, Verification Logs & Deliverables"
                                >
                                  Details
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-gray-500 text-xs">
                          No orders match the selected verification criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT PRODUCT */}
        {activeTab === 'add-product' && (
          <div className="max-w-4xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight italic">
                  {editingProduct ? 'Edit Product' : 'Add New Digital Product'}
                </h1>
                <p className="text-gray-400 text-xs mt-1">
                  Upload digital assets, set pricing, upload thumbnails, and configure downloadable files.
                </p>
              </div>

              {editingProduct && (
                <button
                  onClick={() => { setEditingProduct(null); resetProductForm(); }}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-bold"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-6 text-xs">
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-red-400 text-xs">1. Core Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Shop Name</label>
                    <input
                      type="text"
                      value={productForm.shopName}
                      onChange={(e) => setProductForm({ ...productForm, shopName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Product Category *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value as StoreCategory })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#09090d]">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="e.g. NovaAgency - 30+ High-Conversion Elementor Pro Kit"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Custom Slug (Optional, auto-generated if blank)</label>
                  <input
                    type="text"
                    value={productForm.slug}
                    onChange={(e) => setProductForm({ ...productForm, slug: e.target.value })}
                    placeholder="novaagency-elementor-pro-kit"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Short Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={productForm.shortDescription}
                    onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                    placeholder="One or two sentences highlighting benefits."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Full Description (Markdown / Details) *</label>
                  <textarea
                    rows={5}
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Comprehensive description of product features, requirements, installation, etc."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Pricing & Links */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-red-400 text-xs">2. Pricing & Live Demo URL</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Regular Price ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="15.00"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Discount Price ($ USD, Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.discountPrice}
                      onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                      placeholder="9.00"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Live Demo Preview URL</label>
                    <input
                      type="url"
                      value={productForm.liveLink}
                      onChange={(e) => setProductForm({ ...productForm, liveLink: e.target.value })}
                      placeholder="https://preview.demo.site"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Images & Media */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-red-400 text-xs">3. Media & Previews</h3>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Product Thumbnail Image URL *</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={productForm.thumbnail}
                      onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageUpload('thumbnail')}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Upload size={14} />
                      <span>Upload</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Gallery Image URLs (1 per line)</label>
                  <textarea
                    rows={2}
                    value={productForm.galleryImages}
                    onChange={(e) => setProductForm({ ...productForm, galleryImages: e.target.value })}
                    placeholder="https://...&#10;https://..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Product Source Code Management Section */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-red-500/20 space-y-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20">
                      <FileArchive size={18} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase tracking-wider text-white text-sm">Product Source Code</h3>
                      <p className="text-xs text-gray-400">Secure private vault storage for customer ZIP delivery upon admin approval</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span className="text-[11px] font-bold text-gray-300">Private Vault Storage</span>
                    </div>
                    {/* Enable / Disable ZIP delivery toggle */}
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <span className="text-xs font-bold text-gray-400">ZIP Delivery:</span>
                      <input
                        type="checkbox"
                        checked={productForm.downloadEnabled}
                        onChange={(e) => setProductForm({ ...productForm, downloadEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
                      <span className={`text-xs font-black ${productForm.downloadEnabled ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {productForm.downloadEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Identifiers & Versioning Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-300 text-xs block mb-1">
                      Product Code <span className="text-red-400 font-normal">(Unique Internal SKU)</span>
                    </label>
                    <input
                      type="text"
                      value={productForm.productCode}
                      onChange={(e) => setProductForm({ ...productForm, productCode: e.target.value.toUpperCase() })}
                      placeholder="e.g. WP-CORP-01"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-300 text-xs block mb-1">
                      Source Code Version
                    </label>
                    <input
                      type="text"
                      value={productForm.sourceCodeVersion}
                      onChange={(e) => setProductForm({ ...productForm, sourceCodeVersion: e.target.value })}
                      placeholder="e.g. v1.2.0"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-300 text-xs block mb-1">
                      Product License
                    </label>
                    <input
                      type="text"
                      value={productForm.productLicense}
                      onChange={(e) => setProductForm({ ...productForm, productLicense: e.target.value })}
                      placeholder="Single Commercial License"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                {/* ZIP File Upload & Vault Storage Card */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white text-xs flex items-center gap-1.5">
                        <Upload size={14} className="text-purple-400" />
                        <span>Source Code ZIP Archive</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Upload the complete product source package (.zip or .tar.gz, max 100MB). Stored securely outside public directories.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className={`px-4 py-2.5 rounded-xl cursor-pointer font-bold text-xs flex items-center gap-2 transition-all ${
                        uploadingZip
                          ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                          : productForm.sourceCodeZip
                            ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                            : 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:opacity-90 text-white shadow-lg shadow-purple-600/30'
                      }`}>
                        {uploadingZip ? (
                          <>
                            <RefreshCw size={14} className="animate-spin text-red-400" />
                            <span>Uploading ZIP...</span>
                          </>
                        ) : productForm.sourceCodeZip ? (
                          <>
                            <RefreshCw size={14} />
                            <span>Replace Existing ZIP</span>
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            <span>Upload Source ZIP</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".zip,.tar.gz"
                          disabled={uploadingZip}
                          onChange={handleZipUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Uploaded File Information Display */}
                  {(uploadedZipInfo || productForm.sourceCodeZip) && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                          <FileArchive size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-emerald-300 text-xs">
                              {uploadedZipInfo?.fileName || productForm.downloadFileName || 'product-source.zip'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                              {uploadedZipInfo?.size || 'Vault Encrypted'}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                            Reference: <span className="text-gray-300">{productForm.sourceCodeZip || uploadedZipInfo?.storageReference}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="text-[10px] text-emerald-400/90 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1">
                          <Check size={12} />
                          <span>Private Stored</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* File Download Name & Direct Reference Override */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="font-bold text-gray-300 text-xs block mb-1">
                        Download File Name (Customer Sees When Saving)
                      </label>
                      <input
                        type="text"
                        value={productForm.downloadFileName}
                        onChange={(e) => setProductForm({ ...productForm, downloadFileName: e.target.value })}
                        placeholder="e.g. jasmin-portfolio-release-v1.0.zip"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-gray-300 text-xs block mb-1">
                        Private Storage Reference / S3 / Cloudinary Path
                      </label>
                      <input
                        type="text"
                        value={productForm.sourceCodeZip}
                        onChange={(e) => setProductForm({ ...productForm, sourceCodeZip: e.target.value, sourceCodeZipUrl: e.target.value })}
                        placeholder="/downloads/private/... or private-s3-key"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Installation Instructions & GitHub Link */}
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-gray-300 text-xs block mb-1">
                      Download & Installation Instructions (Included in Customer Email & Package)
                    </label>
                    <textarea
                      rows={3}
                      value={productForm.downloadInstructions}
                      onChange={(e) => setProductForm({ ...productForm, downloadInstructions: e.target.value })}
                      placeholder="1. Extract the downloaded source ZIP archive.&#10;2. Run npm install && npm run dev.&#10;3. Follow documentation for environment keys."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-300 text-xs block mb-1 flex items-center gap-1.5">
                      <Github size={13} className="text-purple-400" />
                      <span>Optional GitHub Repository URL (Included in Customer Access)</span>
                    </label>
                    <input
                      type="url"
                      value={productForm.githubRepoUrl}
                      onChange={(e) => setProductForm({ ...productForm, githubRepoUrl: e.target.value })}
                      placeholder="https://github.com/jasminaramim/project-name"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Features */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <h3 className="font-bold uppercase tracking-wider text-red-400 text-xs">5. Status & Features List</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Product Status</label>
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Published" className="bg-[#09090d]">Published</option>
                      <option value="Draft" className="bg-[#09090d]">Draft</option>
                      <option value="Out of Stock" className="bg-[#09090d]">Out of Stock (Coming Soon)</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="featuredToggle"
                      checked={productForm.featured}
                      onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                      className="w-4 h-4 rounded text-red-600 focus:ring-0"
                    />
                    <label htmlFor="featuredToggle" className="font-bold text-white cursor-pointer">
                      Mark as Featured Product (Highlights on Homepage)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Features Checklist (1 per line)</label>
                  <textarea
                    rows={3}
                    value={productForm.features}
                    onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                    placeholder="Full Site Editing (FSE) Compatible&#10;One-click demo importer&#10;Lifetime updates"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Tags (Comma-separated)</label>
                  <input
                    type="text"
                    value={productForm.tags}
                    onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                    placeholder="WordPress, SaaS, Theme, WooCommerce"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>{editingProduct ? 'Save Product Changes' : 'Publish Product to Store'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: MANAGE PRODUCTS */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight italic">
                  Manage Products ({filteredProducts.length})
                </h1>
                <p className="text-gray-400 text-xs mt-1">
                  Edit, delete, change prices, and toggle published states.
                </p>
              </div>

              <button
                onClick={() => { resetProductForm(); setEditingProduct(null); setActiveTab('add-product'); }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:from-[#9333ea] hover:to-[#6b21a8] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-900/30"
              >
                <Plus size={14} />
                <span>Add New Product</span>
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#09090d] border border-white/5 text-xs">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-gray-400">Category:</span>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none cursor-pointer"
                >
                  <option value="All" className="bg-[#09090d]">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#09090d]">{c}</option>)}
                </select>
              </div>
            </div>

            {/* Products Table */}
            <div className="rounded-2xl bg-[#09090d] border border-white/5 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider text-[10px] bg-white/5">
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Featured</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((p) => (
                      <tr key={p._id || p.slug} className="hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img src={p.thumbnail} alt="" className="w-12 h-9 rounded object-cover border border-white/10" />
                            <div>
                              <span className="font-bold text-white block line-clamp-1">{p.title}</span>
                              <span className="text-[10px] text-gray-500 font-mono">/{p.slug}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">{p.category}</td>
                        <td className="p-4 font-bold text-white">
                          ${p.discountPrice || p.price}
                          {p.discountPrice && <span className="text-gray-500 line-through text-[10px] ml-1.5">${p.price}</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            p.status === 'Published' ? 'bg-emerald-500/20 text-emerald-400' :
                            p.status === 'Draft' ? 'bg-gray-500/20 text-gray-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {p.featured ? (
                            <span className="text-purple-400 font-bold">Yes</span>
                          ) : (
                            <span className="text-gray-600">No</span>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <Link
                            to={`/store/${p.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 inline-block"
                            title="View Public Page"
                          >
                            <Eye size={13} />
                          </Link>
                          <button
                            onClick={() => handleEditProductClick(p)}
                            className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 inline-block"
                            title="Edit"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p._id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 inline-block"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black uppercase tracking-tight italic pb-4 border-b border-white/5">
              Product Categories ({CATEGORIES.length})
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((cat) => {
                const count = products.filter(p => p.category === cat).length;
                return (
                  <div key={cat} className="p-6 rounded-2xl bg-[#09090d] border border-white/5 flex items-center justify-between shadow-xl">
                    <div>
                      <h3 className="font-bold text-white text-base">{cat}</h3>
                      <span className="text-xs text-gray-400 mt-1 block">{count} Active Products</span>
                    </div>
                    <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-bold text-red-400">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: ORDERS & MANUAL VERIFICATION */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div>
                <h1 className="text-2xl font-black uppercase tracking-tight italic">
                  Order Management & Payment Verification
                </h1>
                <p className="text-gray-400 text-xs mt-1">
                  Inspect Transaction IDs, check payment screenshots, and approve or reject bKash / Nagad / Rocket orders.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Filter Status:</span>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs cursor-pointer"
                >
                  <option value="All" className="bg-[#09090d]">All Orders</option>
                  <option value="Pending Verification" className="bg-[#09090d]">Pending Verification</option>
                  <option value="Paid" className="bg-[#09090d]">Paid / Completed</option>
                  <option value="Failed" className="bg-[#09090d]">Failed / Cancelled</option>
                </select>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-2xl bg-[#09090d] border border-white/5 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider text-[10px] bg-white/5">
                      <th className="p-4">Order #</th>
                      <th className="p-4">Customer Details</th>
                      <th className="p-4">Payment Method</th>
                      <th className="p-4">Sender Phone & TrxID</th>
                      <th className="p-4">Total</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredOrders.map((order) => {
                      const isPending = order.paymentStatus === 'Pending Verification';
                      const isPaid = order.paymentStatus === 'Paid';

                      return (
                        <tr key={order._id || order.orderNumber} className="hover:bg-white/5 transition-colors">
                          <td className="p-4 font-mono font-bold text-white">{order.orderNumber}</td>
                          <td className="p-4">
                            <span className="font-bold text-white block">{order.customer.name}</span>
                            <span className="text-[10px] text-gray-400 block">{order.customer.email}</span>
                          </td>
                          <td className="p-4 uppercase font-bold text-red-400">{order.paymentMethod}</td>
                          <td className="p-4 font-mono">
                            <span className="text-white block font-semibold">{order.paymentDetails?.senderNumber || 'N/A'}</span>
                            <span className="text-[10px] text-purple-300 block font-bold">{order.paymentDetails?.transactionId || 'No TrxID'}</span>
                          </td>
                          <td className="p-4 font-bold text-white">${order.totalAmount}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => openOrderReview(order)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:opacity-90 text-white font-bold text-xs shadow-md shadow-purple-900/30"
                            >
                              Verify / Inspect
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black uppercase tracking-tight italic pb-4 border-b border-white/5">
              Registered Customers ({customers.length})
            </h1>

            <div className="rounded-2xl bg-[#09090d] border border-white/5 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-gray-400 uppercase tracking-wider text-[10px] bg-white/5">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Orders Count</th>
                      <th className="p-4">Total Spend</th>
                      <th className="p-4">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {customers.map((c) => (
                      <tr key={c.id || c.email} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white">{c.name}</td>
                        <td className="p-4 text-gray-300">{c.email}</td>
                        <td className="p-4 text-gray-400">{c.phone || 'N/A'}</td>
                        <td className="p-4 font-bold text-white">{c.ordersCount || 0}</td>
                        <td className="p-4 font-bold text-emerald-400">${(c.totalSpend || 0).toFixed(2)}</td>
                        <td className="p-4 text-gray-500">{new Date(c.createdAt || '').toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PAYMENT SETTINGS */}
        {activeTab === 'payment-settings' && settings && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-black uppercase tracking-tight italic pb-4 border-b border-white/5">
              Payment Gateway & Manual Number Settings
            </h1>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {/* bKash Settings */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase text-[#E2136E]">bKash Configuration</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.bkash.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        bkash: { ...settings.bkash, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-[#E2136E]"
                    />
                    <span className="font-bold text-white">Enable bKash</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">bKash Account Number</label>
                    <input
                      type="text"
                      value={settings.bkash.number}
                      onChange={(e) => setSettings({
                        ...settings,
                        bkash: { ...settings.bkash, number: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">bKash QR Scanner Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.bkash.qrImage}
                        onChange={(e) => setSettings({
                          ...settings,
                          bkash: { ...settings.bkash, qrImage: e.target.value }
                        })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageUpload('bkashQR')}
                        className="px-3 py-2 rounded-xl bg-white/10 text-white font-bold"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">bKash Customer Instructions</label>
                  <textarea
                    rows={2}
                    value={settings.bkash.instructions}
                    onChange={(e) => setSettings({
                      ...settings,
                      bkash: { ...settings.bkash, instructions: e.target.value }
                    })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* Nagad Settings */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase text-[#F7931E]">Nagad Configuration</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.nagad.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        nagad: { ...settings.nagad, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-[#F7931E]"
                    />
                    <span className="font-bold text-white">Enable Nagad</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Nagad Account Number</label>
                    <input
                      type="text"
                      value={settings.nagad.number}
                      onChange={(e) => setSettings({
                        ...settings,
                        nagad: { ...settings.nagad, number: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Nagad QR Image URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.nagad.qrImage}
                        onChange={(e) => setSettings({
                          ...settings,
                          nagad: { ...settings.nagad, qrImage: e.target.value }
                        })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageUpload('nagadQR')}
                        className="px-3 py-2 rounded-xl bg-white/10 text-white font-bold"
                      >
                        Upload
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rocket Settings */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm uppercase text-purple-400">DBBL Rocket Configuration</h3>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.rocket.enabled}
                      onChange={(e) => setSettings({
                        ...settings,
                        rocket: { ...settings.rocket, enabled: e.target.checked }
                      })}
                      className="w-4 h-4 rounded text-purple-600"
                    />
                    <span className="font-bold text-white">Enable Rocket</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Rocket Account Number</label>
                    <input
                      type="text"
                      value={settings.rocket.number}
                      onChange={(e) => setSettings({
                        ...settings,
                        rocket: { ...settings.rocket, number: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Gateway Settings (SSLCOMMERZ / aamarPay) */}
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <h3 className="font-black text-sm uppercase text-blue-400">Bangladesh Payment Gateway (SSLCOMMERZ / aamarPay)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Gateway Provider</label>
                    <select
                      value={settings.gateway.provider}
                      onChange={(e) => setSettings({
                        ...settings,
                        gateway: { ...settings.gateway, provider: e.target.value as any }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                    >
                      <option value="sslcommerz" className="bg-[#09090d]">SSLCOMMERZ</option>
                      <option value="aamarpay" className="bg-[#09090d]">aamarPay</option>
                      <option value="disabled" className="bg-[#09090d]">Disabled</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Store ID</label>
                    <input
                      type="text"
                      value={settings.gateway.storeId}
                      onChange={(e) => setSettings({
                        ...settings,
                        gateway: { ...settings.gateway, storeId: e.target.value }
                      })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Live Mode Toggle</label>
                    <label className="flex items-center gap-2 pt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.gateway.isLive}
                        onChange={(e) => setSettings({
                          ...settings,
                          gateway: { ...settings.gateway, isLive: e.target.checked }
                        })}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span className="font-bold text-white">Live Production</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>Save Payment Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 8: STORE SETTINGS */}
        {activeTab === 'store-settings' && settings && (
          <div className="max-w-4xl space-y-6">
            <h1 className="text-2xl font-black uppercase tracking-tight italic pb-4 border-b border-white/5">
              General Store Settings
            </h1>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              <div className="p-6 rounded-2xl bg-[#09090d] border border-white/5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Store Name</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-400 block mb-1">Primary Display Currency</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({ ...settings, currency: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                    >
                      <option value="USD" className="bg-[#09090d]">USD ($)</option>
                      <option value="BDT" className="bg-[#09090d]">BDT (৳)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Store Announcement Banner</label>
                  <input
                    type="text"
                    value={settings.announcement || ''}
                    onChange={(e) => setSettings({ ...settings, announcement: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-400 block mb-1">Store Description</label>
                  <textarea
                    rows={3}
                    value={settings.storeDescription}
                    onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-purple-900/30 hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>Save Store Settings</span>
              </button>
            </form>
          </div>
        )}

        {/* ORDER REVIEW & VERIFICATION MODAL / DRAWER */}
        {selectedOrder && (() => {
          const mailtoSubject = encodeURIComponent(`Your Source Code & Access Package - Order #${selectedOrder.orderNumber}`);
          const mailtoBody = encodeURIComponent(
            `Hello ${selectedOrder.customer.name},\n\n` +
            `Thank you for purchasing on Jasmin Code Studio!\n` +
            `Your payment has been verified successfully.\n\n` +
            `=== PRODUCT DELIVERABLES ===\n` +
            `Order Number: #${selectedOrder.orderNumber}\n` +
            `Items: ${selectedOrder.items.map(i => i.title).join(', ')}\n\n` +
            `1. GitHub Repository Code:\n${orderGithubLink || 'Available on request'}\n\n` +
            `2. Direct Source Code ZIP Package:\n${orderZipUrl ? (orderZipUrl.startsWith('http') ? orderZipUrl : window.location.origin + orderZipUrl) : 'Available in your customer dashboard'}\n\n` +
            `If you have any questions or require custom setup assistance, reply directly to this email.\n\n` +
            `Best regards,\nJasmin Ara Mim\nJasmin Code Studio`
          );
          const mailtoHref = `mailto:${selectedOrder.customer.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

          return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#0b0b10] border border-white/10 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 md:p-8 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Order Verification & Delivery</span>
                    <h3 className="text-xl font-black uppercase text-white font-mono">
                      #{selectedOrder.orderNumber}
                    </h3>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Order & Customer Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-400 block font-bold text-[10px] uppercase">Customer Information</span>
                    <strong className="text-white block mt-0.5 text-sm">{selectedOrder.customer.name}</strong>
                    <span className="text-red-400 text-[11px] font-mono block">{selectedOrder.customer.email}</span>
                    {selectedOrder.customer.phone && (
                      <span className="text-gray-400 text-[11px] block">{selectedOrder.customer.phone}</span>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-gray-400 block font-bold text-[10px] uppercase">Payment Details</span>
                    <strong className="text-white uppercase block mt-0.5 text-sm text-[#E2136E]">{selectedOrder.paymentMethod}</strong>
                    <span className="text-gray-300 font-mono text-[11px] block">Sender: {selectedOrder.paymentDetails?.senderNumber || 'None'}</span>
                    <span className="text-purple-300 font-mono text-[11px] block font-bold">TrxID: {selectedOrder.paymentDetails?.transactionId || 'None'}</span>
                  </div>
                </div>

                {/* Uploaded Payment Screenshot Preview */}
                {selectedOrder.paymentDetails?.screenshotUrl ? (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[11px] font-bold text-gray-300 block mb-2">Customer Payment Screenshot / Receipt:</span>
                    <a href={selectedOrder.paymentDetails.screenshotUrl} target="_blank" rel="noreferrer">
                      <img
                        src={selectedOrder.paymentDetails.screenshotUrl}
                        alt="Payment Receipt"
                        className="max-h-56 rounded-lg object-contain mx-auto border border-white/10"
                      />
                    </a>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-white/5 text-center text-xs text-gray-500">
                    No payment screenshot uploaded by customer.
                  </div>
                )}

                {/* Items in this order */}
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Items Purchased:</span>
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-white/5">
                      <span className="text-white font-medium">{it.title}</span>
                      <span className="font-bold text-white">${it.price}</span>
                    </div>
                  ))}
                </div>

                {/* DELIVERABLES PANEL: GITHUB REPOSITORY & ZIP CODE */}
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                      <Github size={14} className="text-purple-400" />
                      <span>Code Delivery Package (Sent to Customer Email)</span>
                    </h4>
                    {selectedOrder.githubCodeDelivered && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase">
                        Email Delivered: {selectedOrder.emailDeliveryStatus || 'Sent'}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      GitHub Repository URL to Deliver:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={orderGithubLink}
                        onChange={(e) => setOrderGithubLink(e.target.value)}
                        placeholder="https://github.com/jasminaramim/project-repo"
                        className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                      />
                      {orderGithubLink && (
                        <a
                          href={orderGithubLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white text-xs font-bold flex items-center gap-1 flex-shrink-0"
                        >
                          <ExternalLink size={12} />
                          <span>Visit</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-300 block mb-1">
                      Source Code ZIP Download URL to Deliver:
                    </label>
                    <input
                      type="text"
                      value={orderZipUrl}
                      onChange={(e) => setOrderZipUrl(e.target.value)}
                      placeholder="/downloads/project-main.zip or direct ZIP link"
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  {/* Automatic Email Checkbox */}
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmailOnApprove}
                      onChange={(e) => setSendEmailOnApprove(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                    />
                    <span className="text-xs text-white font-semibold">
                      Automatically email GitHub repository & ZIP download link to <strong className="text-purple-300">{selectedOrder.customer.email}</strong> upon approval
                    </span>
                  </label>
                </div>

                {/* Current Status Pill */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400 font-bold">Current Verification Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                    selectedOrder.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-400' :
                    selectedOrder.paymentStatus === 'Pending Verification' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>

                {/* Admin Note Input */}
                <div>
                  <label className="text-[11px] font-bold text-gray-400 block mb-1">Admin Verification Notes / Message to Buyer</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Payment verified via bKash TrxID. Thank you for your purchase!"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                  />
                </div>

                {/* Audit Trail: Verification Logs & Delivery History */}
                {((selectedOrder.verificationLogs && selectedOrder.verificationLogs.length > 0) || (selectedOrder.deliveryHistory && selectedOrder.deliveryHistory.length > 0)) && (
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Audit Trail & History:</span>
                    
                    {selectedOrder.verificationLogs && selectedOrder.verificationLogs.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-gray-500 font-bold block">Verification Events:</span>
                        {selectedOrder.verificationLogs.map((log: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-white/5 font-mono">
                            <span className={log.action === 'Approved' ? 'text-emerald-400' : 'text-red-400'}>
                              [{log.action}] by {log.adminUser}
                            </span>
                            <span className="text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedOrder.deliveryHistory && selectedOrder.deliveryHistory.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-gray-500 font-bold block">ZIP Delivery Dispatches:</span>
                        {selectedOrder.deliveryHistory.map((d: any, idx: number) => (
                          <div key={idx} className="text-[11px] p-2 rounded-lg bg-white/5 font-mono space-y-0.5">
                            <div className="flex justify-between text-gray-300">
                              <span className="text-purple-300">Method: {d.method} (by {d.deliveredBy})</span>
                              <span className="text-emerald-400">{d.status}</span>
                            </div>
                            <div className="text-gray-400 text-[10px]">{new Date(d.deliveredAt).toLocaleString()} — {d.recipientEmail}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* APPROVE / REJECT / SEND EMAIL BUTTONS */}
                <div className="space-y-2 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={verifyingOrder}
                      onClick={() => handleVerifyOrder(selectedOrder._id || '', 'approve')}
                      className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase tracking-wider text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={16} />
                      <span>{sendEmailOnApprove ? 'Approve & Send Code to Email' : 'Approve & Unlock Access'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openManualZipModal(selectedOrder)}
                      className="py-3.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black uppercase tracking-wider text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <FileArchive size={15} />
                      <span>Send ZIP Manually</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={sendingCodeEmail}
                      onClick={handleSendCodeEmail}
                      className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider text-xs shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send size={15} />
                      <span>{sendingCodeEmail ? 'Sending Email...' : 'Send / Re-send Email'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={verifyingOrder}
                      onClick={() => handleVerifyOrder(selectedOrder._id || '', 'reject')}
                      className="py-3 px-4 rounded-xl bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 font-black uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle size={15} />
                      <span>Reject Payment</span>
                    </button>
                  </div>

                  <a
                    href={mailtoHref}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/5 font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <Mail size={13} />
                    <span>Open in External Mail Client (mailto:)</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })()}

        {/* MODAL 2: SEND ZIP MANUALLY MODAL */}
        {showManualZipModal && selectedOrder && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0b0b10] border border-purple-500/30 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                    <FileArchive size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase text-white font-mono">Send ZIP Manually</h3>
                    <p className="text-xs text-gray-400">Dispatch verified product archive to customer's registered email</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowManualZipModal(false)}
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Order Target</span>
                    <strong className="text-white font-mono">#{selectedOrder.orderNumber}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block">Recipient</span>
                    <strong className="text-purple-300 font-mono">{selectedOrder.customer.email}</strong>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Select Purchased Product to Deliver:</label>
                  <select
                    value={manualSelectedProduct}
                    onChange={(e) => {
                      const prodId = e.target.value;
                      setManualSelectedProduct(prodId);
                      const it = selectedOrder.items.find(i => i.productId === prodId || i.slug === prodId);
                      if (it) {
                        setManualZipUrl(it.sourceCodeZip || it.sourceCodeZipUrl || '');
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  >
                    {selectedOrder.items.map((it, idx) => (
                      <option key={idx} value={it.productId || it.slug} className="bg-[#0b0b10]">
                        {it.title} (${it.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Product ZIP Storage Reference or URL:</label>
                  <input
                    type="text"
                    value={manualZipUrl}
                    onChange={(e) => setManualZipUrl(e.target.value)}
                    placeholder="/downloads/private/... or direct ZIP link"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                  <span className="text-[10px] text-gray-500 block mt-1">Leave empty to use automatic secure token download link</span>
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Custom Delivery Instructions / Admin Note:</label>
                  <textarea
                    rows={3}
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="e.g. Here is your official release archive. Unzip and run npm install."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualZipModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-gray-300 font-bold hover:bg-white/15 transition-all text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={sendingManualZip}
                  onClick={handleDeliverManual}
                  className="flex-2 py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-black uppercase text-xs transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  {sendingManualZip ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Dispatching ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Dispatch ZIP Delivery Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: SCREENSHOT ZOOM LIGHTBOX */}
        {screenshotModalUrl && (
          <div
            onClick={() => setScreenshotModalUrl(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[90vh] p-2 bg-[#0b0b10] rounded-2xl border border-white/20">
              <button
                onClick={() => setScreenshotModalUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/70 text-white hover:bg-black transition-all"
              >
                ✕
              </button>
              <img
                src={screenshotModalUrl}
                alt="Payment Screenshot Zoom"
                className="max-h-[85vh] max-w-full rounded-xl object-contain mx-auto"
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminStoreDashboard;

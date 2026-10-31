import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  ShoppingBag, 
  Zap, 
  Star, 
  ShieldCheck, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  Share2, 
  Copy,
  Clock,
  Layers
} from 'lucide-react';
import { StoreProduct } from '../types';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/store/ProductCard';

const ProductDetailsView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/store/products/${slug}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
        setActiveImage(data.thumbnail);

        // Fetch related products in same category
        if (data.category) {
          const relatedRes = await fetch(`/api/store/products?category=${encodeURIComponent(data.category)}`);
          const relatedData = await relatedRes.json();
          if (Array.isArray(relatedData)) {
            const filtered = relatedData.filter((p: StoreProduct) => (p.slug !== data.slug && p._id !== data._id)).slice(0, 3);
            setRelatedProducts(filtered);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-36 pb-20 max-w-7xl mx-auto px-6">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-40 bg-white/10 rounded-lg"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="h-96 bg-white/10 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-10 bg-white/10 rounded-lg w-3/4"></div>
              <div className="h-6 bg-white/10 rounded-lg w-1/2"></div>
              <div className="h-32 bg-white/10 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-40 pb-20 text-center max-w-xl mx-auto px-6">
        <Layers size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-black uppercase text-white mb-2">Product Not Found</h2>
        <p className="text-gray-400 text-xs mb-6">
          The requested digital asset may have been moved or unpublished.
        </p>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          <span>Back to Store Catalog</span>
        </Link>
      </div>
    );
  }

  const isAvailable = product.status !== 'Out of Stock' && product.status !== 'Draft';
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  const gallery = [
    product.thumbnail,
    ...(product.galleryImages || []),
    ...(product.demoImages || [])
  ].filter(Boolean);

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    addToCart(product, 1);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen pt-32 pb-24 text-white">
      {/* Background radial accent glow */}
      <div className="fixed top-24 left-1/3 w-[600px] h-[350px] bg-[#dc2626]/10 blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 text-xs">
          <Link
            to="/store"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Digital Store</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-colors"
          >
            {copiedLink ? <CheckCircle2 size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
          </button>
        </div>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          {/* Left Column: Image Gallery (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Primary Main Image Preview */}
            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/80 border border-white/10 shadow-[0_15px_40px_rgba(0,0,0,0.8)]">
              <img
                src={activeImage || product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover object-top"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/80 backdrop-blur-md text-red-400 border border-red-500/30">
                  {product.category}
                </span>
              </div>

              {/* Live Preview Button Overlay */}
              {product.liveLink && (
                <a
                  href={product.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-4 right-4 z-10 px-4 py-2 rounded-xl bg-black/80 hover:bg-[#dc2626] text-white text-xs font-bold tracking-wider backdrop-blur-md border border-white/10 hover:border-red-500 transition-all flex items-center gap-2 shadow-2xl"
                >
                  <span>Launch Live Preview Demo</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Gallery Thumbnails List */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden flex-shrink-0 border transition-all ${
                      activeImage === img
                        ? 'border-red-500 scale-105 shadow-[0_0_15px_rgba(220,38,38,0.4)]'
                        : 'border-white/10 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Instant Delivery Guarantee Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Download size={20} className="text-red-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Instant Delivery</h4>
                  <p className="text-[10px] text-gray-400">Download starts upon payment verification</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <ShieldCheck size={20} className="text-purple-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Developer Verified</h4>
                  <p className="text-[10px] text-gray-400">100% clean, documented code</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3">
                <Zap size={20} className="text-amber-400 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Commercial License</h4>
                  <p className="text-[10px] text-gray-400">Use on client & personal projects</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Purchase Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#09090d]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-bold tracking-widest uppercase text-red-400">
                  {product.shopName || 'Jasmin Studio'}
                </span>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star size={14} className="fill-amber-400" />
                  <span>{product.rating || '5.0'}</span>
                  {product.salesCount ? (
                    <span className="text-gray-500 text-xs">({product.salesCount} sold)</span>
                  ) : null}
                </div>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight italic uppercase">
                {product.title}
              </h1>
            </div>

            {/* Price section */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">
                  License Price
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
                    ${currentPrice}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-gray-500 line-through">
                      ${product.price}
                    </span>
                  )}
                </div>
              </div>

              {hasDiscount && (
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#dc2626] to-[#e11d48] text-white shadow-lg">
                  Save ${((product.price - (product.discountPrice || 0))).toFixed(0)}
                </span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              {isAvailable ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] text-white font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Zap size={16} />
                    <span>Instant Buy Now (${currentPrice})</span>
                  </button>

                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold uppercase tracking-wider text-xs border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} className="text-red-400" />
                    <span>Add to Shopping Cart</span>
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="w-full py-4 rounded-xl bg-white/5 text-gray-500 border border-white/10 font-bold uppercase tracking-wider text-xs cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Clock size={16} />
                  <span>Item Currently Coming Soon</span>
                </button>
              )}

              {product.liveLink && (
                <a
                  href={product.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-transparent hover:bg-white/5 text-gray-300 hover:text-white text-xs font-semibold tracking-wider text-center flex items-center justify-center gap-1.5 border border-white/5 hover:border-white/10 transition-all"
                >
                  <span>Open Full Screen Live Demo</span>
                  <ExternalLink size={13} />
                </a>
              )}
            </div>

            {/* Key Features Checklist */}
            {product.features && product.features.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">
                  Included in this Package:
                </h4>
                {product.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-400">
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full Product Description & Specifications */}
        <div className="rounded-3xl bg-[#09090c]/90 border border-white/10 p-8 md:p-12 mb-20">
          <h3 className="text-xl font-bold uppercase tracking-wider text-white mb-6 border-b border-white/10 pb-4">
            Product Overview & Technical Details
          </h3>
          <div className="text-gray-300 text-sm leading-relaxed space-y-4 max-w-4xl">
            <p>{product.description}</p>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-white/5">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-[11px] font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-20">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white italic mb-8">
              Related <span className="text-red-500">Products</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relProduct) => (
                <ProductCard key={relProduct._id || relProduct.slug} product={relProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsView;

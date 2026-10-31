import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink, ShoppingBag, Zap, Star, ShieldCheck, Clock } from 'lucide-react';
import { StoreProduct } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: StoreProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isOutOfStock = product.status === 'Out of Stock';
  const isDraft = product.status === 'Draft';
  const isAvailable = !isOutOfStock && !isDraft;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAvailable) return;
    addToCart(product, 1);
  };

  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.price;
  const currentPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#09090c]/90 border border-white/10 hover:border-[#a855f7]/50 transition-all duration-300 shadow-[0_10px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.25)] overflow-hidden backdrop-blur-xl"
    >
      {/* Decorative Purple Ambient Glow on Hover */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-[#a855f7]/25 to-[#4B0082]/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

      <div>
        {/* Thumbnail Preview Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/60">
          <img
            src={product.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop'}
            alt={product.title}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />

          {/* Dark Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090c] via-black/30 to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>

          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-black/80 backdrop-blur-md text-purple-300 border border-purple-500/30 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              {product.category}
            </span>
          </div>

          {/* Featured or Discount Badge */}
          <div className="absolute top-3 right-3 z-10 flex gap-1.5">
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]">
                Save ${((product.price - (product.discountPrice || 0))).toFixed(0)}
              </span>
            )}
            {product.featured && (
              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-[#4B0082]/90 text-purple-200 border border-purple-500/30 backdrop-blur-md">
                Featured
              </span>
            )}
          </div>

          {/* Quick Preview Demo Floating Pill */}
          {product.liveLink && (
            <a
              href={product.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-[#a855f7] text-white text-[11px] font-bold tracking-wider backdrop-blur-md border border-white/10 hover:border-purple-400 transition-all flex items-center gap-1.5 shadow-lg group-hover:opacity-100"
              title="Open Live Preview Demo"
            >
              <span>Demo</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Shop Name & Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-2">
            <span className="font-semibold tracking-wider text-gray-500 uppercase">
              {product.shopName || 'Jasmin Studio'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star size={12} className="fill-amber-400" />
              <span>{product.rating || '5.0'}</span>
              {product.salesCount ? (
                <span className="text-gray-500 text-[10px]">({product.salesCount})</span>
              ) : null}
            </div>
          </div>

          {/* Product Title */}
          <Link to={`/store/${product.slug}`} className="group-hover:text-purple-400 transition-colors">
            <h3 className="text-base font-bold text-white line-clamp-1 mb-2 tracking-tight">
              {product.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-4">
            {product.shortDescription}
          </p>

          {/* Features Highlights Pills */}
          {product.features && product.features.length > 0 && (
            <div className="mb-4 space-y-1">
              {product.features.slice(0, 2).map((feat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-300">
                  <ShieldCheck size={12} className="text-purple-400 flex-shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Pricing & Action Buttons */}
      <div className="p-5 pt-0 border-t border-white/5 mt-auto">
        <div className="flex items-baseline justify-between py-3">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-bold">
              Starting Price
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white tracking-tight">
                ${currentPrice}
              </span>
              {hasDiscount && (
                <span className="text-xs text-gray-500 line-through">
                  ${product.price}
                </span>
              )}
            </div>
          </div>

          {/* Stock / Availability Status */}
          {!isAvailable && (
            <span className="px-2.5 py-1 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock size={11} />
              Coming Soon
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {isAvailable ? (
            <>
              <button
                onClick={handleAddToCart}
                className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20 transition-all text-xs font-bold tracking-wider flex items-center justify-center gap-1.5"
                title="Add to Shopping Cart"
              >
                <ShoppingBag size={14} className="text-purple-400" />
                <span>Add Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:from-[#9333ea] hover:to-[#6b21a8] text-white text-xs font-black tracking-wider uppercase transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-1.5"
                title="Instant Buy & Checkout"
              >
                <Zap size={14} />
                <span>Buy Now</span>
              </button>
            </>
          ) : (
            <button
              disabled
              className="col-span-2 py-2.5 rounded-xl bg-white/5 text-gray-500 border border-white/5 text-xs font-bold uppercase tracking-wider cursor-not-allowed text-center"
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

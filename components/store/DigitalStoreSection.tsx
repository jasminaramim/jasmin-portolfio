import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight, Layers, Sparkles, Filter } from 'lucide-react';
import { StoreProduct } from '../../types';
import ProductCard from './ProductCard';
import StorePromoBanner from './StorePromoBanner';
import { DEFAULT_STORE_PRODUCTS } from '../../data/defaultStoreProducts';

const CATEGORIES = [
  'All',
  'Website Templates',
];

const DigitalStoreSection: React.FC = () => {
  const [products, setProducts] = useState<StoreProduct[]>(DEFAULT_STORE_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/store/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.error('Failed to load store products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category === selectedCategory);

  // Display top 6 products on homepage section
  const displayProducts = filteredProducts.slice(0, 6);

  return (
    <section id="digital-store" className="py-20 md:py-28 relative border-t border-white/5 bg-transparent">
      {/* Background radial accent glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#a855f7]/15 via-[#4B0082]/15 to-transparent blur-[140px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest mb-3">
              <ShoppingBag size={12} className="text-purple-400" />
              <span>Digital Store & Assets</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic">
              My Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-purple-400 to-indigo-400">Store</span>
            </h2>

            <p className="text-gray-400 text-xs md:text-sm max-w-2xl mt-2 font-normal leading-relaxed">
              Explore premium digital products and source code archives crafted from real client projects.
            </p>
          </div>

          <Link
            to="/store"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/40 text-white text-xs font-black uppercase tracking-widest transition-all group shadow-lg w-fit"
          >
            <span>View All Products ({products.length})</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 text-purple-400 transition-transform" />
          </Link>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-10">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] scale-105'
                    : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 rounded-2xl bg-white/5 animate-pulse border border-white/5"
              />
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence>
              {displayProducts.map((product) => (
                <ProductCard key={product._id || product.slug} product={product} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
            <Layers size={36} className="mx-auto text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">No products found in this category.</p>
          </div>
        )}

        {/* Small Promotional Banner */}
        <StorePromoBanner />
      </div>
    </section>
  );
};

export default DigitalStoreSection;

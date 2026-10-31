import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Filter, Sparkles, SlidersHorizontal, Layers, ArrowUpDown } from 'lucide-react';
import { StoreProduct } from '../types';
import ProductCard from '../components/store/ProductCard';
import StorePromoBanner from '../components/store/StorePromoBanner';
import StoreCTA from '../components/store/StoreCTA';

const CATEGORIES = [
  'All',
  'WordPress Themes',
  'WordPress Plugins',
  'Elementor Templates',
  'Website Templates',
  'UI Kits & Components',
  'Canva Templates',
];

const StoreView: React.FC = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('newest');
  const [featuredOnly, setFeaturedOnly] = useState<boolean>(false);
  const [visibleCount, setVisibleCount] = useState<number>(9);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = '/api/store/products';
        const params = new URLSearchParams();
        if (selectedCategory !== 'All') params.append('category', selectedCategory);
        if (searchQuery.trim()) params.append('search', searchQuery.trim());
        if (featuredOnly) params.append('featured', 'true');
        if (params.toString()) url += `?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();
        if (Array.isArray(data)) {
          setProducts(data);
        }
      } catch (err) {
        console.error('Failed to load store products:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery, featuredOnly]);

  // Client-side sorting
  const sortedProducts = [...products].sort((a, b) => {
    const priceA = a.discountPrice !== undefined ? a.discountPrice : a.price;
    const priceB = b.discountPrice !== undefined ? b.discountPrice : b.price;

    if (sortOption === 'price-low') return priceA - priceB;
    if (sortOption === 'price-high') return priceB - priceA;
    if (sortOption === 'popular') return (b.salesCount || 0) - (a.salesCount || 0);
    return 0; // Default server sort (newest)
  });

  const displayedProducts = sortedProducts.slice(0, visibleCount);

  return (
    <div className="min-h-screen pt-32 pb-24 text-white">
      {/* Background Decorative Glows */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-[#dc2626]/10 via-[#4B0082]/10 to-transparent blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Page Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest mb-4"
          >
            <ShoppingBag size={14} className="text-red-400" />
            <span>Digital Marketplace</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic"
          >
            My Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-[#a855f7]">Store</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-sm md:text-base mt-4 font-normal leading-relaxed"
          >
            Premium Digital Products, Templates & Development Resources.
          </motion.p>
        </div>

        {/* Filter & Search Bar Toolbar */}
        <div className="bg-[#0b0b10]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl mb-10 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search templates, plugins, UI kits..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-xs font-medium focus:outline-none focus:border-red-500/50 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Controls: Featured Toggle & Sort */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button
                onClick={() => setFeaturedOnly(!featuredOnly)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider border transition-all flex items-center gap-2 ${
                  featuredOnly
                    ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles size={13} className={featuredOnly ? 'text-purple-300' : 'text-gray-400'} />
                <span>Featured Only</span>
              </button>

              <div className="relative flex items-center gap-2">
                <ArrowUpDown size={14} className="text-gray-400 hidden sm:block" />
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold tracking-wider focus:outline-none focus:border-red-500/50 cursor-pointer"
                >
                  <option value="newest" className="bg-[#0b0b10] text-white">Newest First</option>
                  <option value="price-low" className="bg-[#0b0b10] text-white">Price: Low to High</option>
                  <option value="price-high" className="bg-[#0b0b10] text-white">Price: High to Low</option>
                  <option value="popular" className="bg-[#0b0b10] text-white">Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none border-t border-white/5">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#dc2626] to-[#b91c1c] text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] scale-105'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-6 px-1">
          <span>Showing <strong className="text-white">{displayedProducts.length}</strong> of {sortedProducts.length} products</span>
          {selectedCategory !== 'All' && (
            <span className="text-red-400 font-semibold">Filtered by: {selectedCategory}</span>
          )}
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
        ) : displayedProducts.length > 0 ? (
          <>
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {displayedProducts.map((product) => (
                  <ProductCard key={product._id || product.slug} product={product} />
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load More Button if more exist */}
            {sortedProducts.length > visibleCount && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 6)}
                  className="px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  Load More Products ({sortedProducts.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <Layers size={44} className="mx-auto text-gray-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">No products found</h3>
            <p className="text-gray-400 text-xs max-w-sm mx-auto mb-6">
              Try adjusting your search query or switching categories.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
                setFeaturedOnly(false);
              }}
              className="px-5 py-2.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-bold tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Small Promotional Banner */}
        <StorePromoBanner />

        {/* Store CTA */}
        <StoreCTA />
      </div>
    </div>
  );
};

export default StoreView;

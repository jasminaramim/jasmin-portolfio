import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck, Download, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartView: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, subtotal, discount, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-24 text-center max-w-xl mx-auto px-6 text-white">
        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 shadow-xl">
          <ShoppingBag size={32} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight italic mb-3">Your Cart is Empty</h2>
        <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-8 max-w-md mx-auto">
          Explore our marketplace to find premium WordPress themes, plugins, Elementor templates, and UI assets.
        </p>
        <Link
          to="/store"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7e22ce] text-white text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:opacity-90 transition-all"
        >
          <span>Explore Digital Store</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 text-white">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight italic">
              Shopping <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-purple-400 to-indigo-400">Cart</span>
            </h1>
            <p className="text-gray-400 text-xs mt-1">Review your selected digital products before checkout</p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-semibold text-gray-400 hover:text-purple-400 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Cart Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => {
              const p = item.product;
              const pId = p._id || p.id || p.slug;
              const hasDiscount = p.discountPrice !== undefined && p.discountPrice < p.price;
              const unitPrice = hasDiscount ? p.discountPrice : p.price;

              return (
                <div
                  key={pId}
                  className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-[#09090d]/90 border border-white/10 backdrop-blur-xl shadow-lg"
                >
                  {/* Thumbnail & Title */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={p.thumbnail || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=300&auto=format&fit=crop'}
                      alt={p.title}
                      className="w-20 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-0.5">
                        {p.category}
                      </span>
                      <Link
                        to={`/store/${p.slug}`}
                        className="text-sm font-bold text-white hover:text-purple-400 transition-colors line-clamp-1"
                      >
                        {p.title}
                      </Link>
                      <span className="text-[11px] text-gray-500 block">Single Commercial License</span>
                    </div>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                      <button
                        onClick={() => updateQuantity(pId, item.quantity - 1)}
                        className="text-gray-400 hover:text-white p-1"
                        title="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold px-2">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(pId, item.quantity + 1)}
                        className="text-gray-400 hover:text-white p-1"
                        title="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-base font-black text-white block">
                        ${((unitPrice || 0) * item.quantity).toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-gray-500 line-through">
                          ${(p.price * item.quantity).toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(pId)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="pt-4 flex justify-between items-center text-xs">
              <Link
                to="/store"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Card (4 Cols) */}
          <div className="lg:col-span-4 rounded-3xl bg-[#09090e]/95 border border-white/10 p-6 md:p-8 backdrop-blur-xl shadow-2xl space-y-6">
            <h3 className="text-base font-black uppercase tracking-wider text-white border-b border-white/10 pb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span className="font-bold text-white">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Estimated Discount</span>
                <span className="font-bold text-emerald-400">-${discount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-400">
                <span>Digital Delivery</span>
                <span className="font-bold text-white">Free / Instant</span>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-sm font-bold uppercase text-white">Total Amount</span>
                <span className="text-2xl font-black text-white">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#7e22ce] hover:from-[#9333ea] hover:to-[#6b21a8] text-white font-black uppercase tracking-widest text-xs shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Trust Badges */}
            <div className="space-y-2 pt-2 text-[11px] text-gray-400">
              <div className="flex items-center gap-2">
                <Download size={14} className="text-purple-400" />
                <span>Instant download link upon payment</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-purple-400" />
                <span>Secure payment verification</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartView;

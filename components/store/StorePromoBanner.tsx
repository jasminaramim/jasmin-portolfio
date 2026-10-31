import React from 'react';
import { Sparkles, Download, ShieldCheck, Zap } from 'lucide-react';

const StorePromoBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#12071f] via-[#0b0614] to-[#06040a] border border-[#a855f7]/25 p-6 md:p-8 my-10 shadow-[0_10px_35px_rgba(168,85,247,0.15)]">
      {/* Glow backgrounds */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[#a855f7]/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-[#4B0082]/30 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-2xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] font-bold tracking-widest uppercase mb-3">
            <Sparkles size={13} className="text-purple-400" />
            <span>Developer Verified Assets</span>
          </div>

          <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white tracking-tight uppercase italic">
            Digital Products That Make Your Work <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] via-purple-400 to-violet-300">Easier.</span>
          </h3>
          <p className="text-gray-400 text-xs md:text-sm mt-2 font-normal leading-relaxed">
            Stop building from scratch. Launch stunning websites, automate WordPress workflows, and ship client projects 5x faster with pre-architected digital templates.
          </p>
        </div>

        {/* Feature badges */}
        <div className="flex flex-wrap md:flex-col gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-gray-200">
            <Download size={14} className="text-purple-400" />
            <span>Instant Digital Download</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-gray-200">
            <ShieldCheck size={14} className="text-purple-400" />
            <span>Clean Code & 100% Virus-Free</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-gray-200">
            <Zap size={14} className="text-amber-400" />
            <span>Lifetime Updates & Support</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorePromoBanner;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Code, Sparkles, MessageSquare } from 'lucide-react';

const StoreCTA: React.FC = () => {
  const navigate = useNavigate();

  const handleContactClick = () => {
    navigate('/contact');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#120505] via-[#0b0713] to-[#050508] border border-white/10 p-8 md:p-12 text-center my-14 shadow-2xl">
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-[#dc2626]/20 via-[#4B0082]/20 to-transparent rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-widest mb-4">
          <Code size={13} className="text-red-400" />
          <span>Tailored Engineering & Custom Builds</span>
        </div>

        <h3 className="text-2xl md:text-4xl font-black text-white uppercase italic tracking-tight leading-tight">
          Need a Custom Website or Plugin? <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-[#a855f7]">
            Let's Work Together.
          </span>
        </h3>

        <p className="text-gray-400 text-xs md:text-sm mt-4 max-w-xl font-normal leading-relaxed">
          Looking for a custom WordPress theme, unique MERN stack web app, automated workflow, or tailored e-commerce system? I engineer world-class solutions from concept to deployment.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handleContactClick}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[#dc2626] to-[#b91c1c] hover:from-[#b91c1c] hover:to-[#991b1b] text-white text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all flex items-center gap-3 group"
          >
            <span>Start Your Custom Project</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="https://wa.me/8801915996145"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all flex items-center gap-2"
          >
            <MessageSquare size={14} className="text-emerald-400" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default StoreCTA;

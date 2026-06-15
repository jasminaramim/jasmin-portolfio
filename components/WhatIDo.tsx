import React from 'react';
import { motion } from 'framer-motion';

const WhatIDo: React.FC = () => {
  const services = [
    {
      title: 'MERN STACK SOLUTIONS',
      desc: 'Building highly scalable, robust database-driven custom apps with Node.js, Express APIs, and advanced MongoDB configurations.',
      tags: ['NODE.JS', 'EXPRESS', 'MONGODB'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      )
    },
    {
      title: 'FRONTEND ARCHITECTURE',
      desc: 'Crafting visually outstanding, lightning-fast web applications using React.js, Next.js, and Framer Motion micro-animations.',
      tags: ['REACT.JS', 'NEXT.JS', 'FRAMER'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
      )
    },
    {
      title: 'ENTERPRISE WORDPRESS',
      desc: 'Designing bespoke Elementor Pro themes, custom plugins, secure APIs, and responsive enterprise-grade WordPress architectures.',
      tags: ['ELEMENTOR', 'PLUGINS', 'WP API'],
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"/><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      )
    }
  ];

  return (
    <section className="py-24 bg-transparent relative overflow-hidden font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h4 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#7e22ce] font-bold uppercase tracking-[0.2em] text-[11px] mb-3"
          >
            What I Offer
          </motion.h4>
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-[54px] font-black uppercase tracking-[-1px] mb-6"
          >
            <span className="text-white">MY </span>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7e22ce] to-[#8b5cf6]">SERVICES</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 text-sm leading-relaxed"
          >
            Full-stack expertise crafted for modern digital products — from pixel-perfect frontends to scalable backend systems.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {services.map((service, idx) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(200,80,192,0.2)] rounded-2xl hover:border-[rgba(200,80,192,0.5)] transition-all duration-300 flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white mb-6">
                {service.icon}
              </div>
              <h3 className="text-[15px] font-black mb-3 text-white uppercase tracking-wider">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed text-[13px] mb-8 flex-grow">
                {service.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {service.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full border border-[#8b5cf6]/30 text-[#7e22ce] text-[9px] font-black uppercase tracking-widest bg-[#8b5cf6]/5">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Wide Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="p-8 md:p-10 bg-gradient-to-r from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[rgba(200,80,192,0.2)] rounded-2xl flex flex-col md:flex-row gap-10 hover:border-[rgba(200,80,192,0.5)] transition-all duration-300"
        >
          <div className="flex-1 border-b md:border-b-0 md:border-r border-white/10 pb-8 md:pb-0 md:pr-10">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>
              </div>
              <h3 className="text-[15px] font-black text-white uppercase tracking-wider">WOOCOMMERCE OPTIMIZATION</h3>
            </div>
            <p className="text-gray-400 leading-relaxed text-[13px] mb-6">
              Scaling digital store capacities with secure multi-language checkouts, payment integrations, and high-performance product visualizers.
            </p>
            <div className="flex flex-wrap gap-2">
              {['WPML', 'PAYMENT GATEWAY', 'PERFORMANCE', 'MULTI-LANGUAGE'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full border border-[#8b5cf6]/30 text-[#7e22ce] text-[9px] font-black uppercase tracking-widest bg-[#8b5cf6]/5">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="md:w-[40%] flex flex-col justify-center">
            <h4 className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mb-6">DELIVERED RESULTS</h4>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <div className="text-[26px] font-black text-[#a855f7] leading-none mb-1">50+</div>
                <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest">STORES BUILT</div>
              </div>
              <div>
                <div className="text-[26px] font-black text-[#a855f7] leading-none mb-1">99%</div>
                <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest">UPTIME</div>
              </div>
              <div>
                <div className="text-[26px] font-black text-[#a855f7] leading-none mb-1">3x</div>
                <div className="text-gray-500 text-[9px] font-black uppercase tracking-widest">SPEED BOOST</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WhatIDo;
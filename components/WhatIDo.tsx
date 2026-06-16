import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ServiceData {
  title: string;
  desc: string;
  tags?: string[];
  icon: string | React.ReactNode;
}

const WhatIDo: React.FC = () => {
  const [services, setServices] = useState<ServiceData[]>([]);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
        } else {
          // Fallback static data if DB is empty
          setServices([
            {
              title: 'MERN STACK SOLUTIONS',
              desc: 'Building highly scalable, robust database-driven custom apps with Node.js, Express APIs, and advanced MongoDB configurations.',
              tags: ['NODE.JS', 'EXPRESS', 'MONGODB'],
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg'
            },
            {
              title: 'FRONTEND ARCHITECTURE',
              desc: 'Crafting visually outstanding, lightning-fast web applications using React.js, Next.js, and Framer Motion micro-animations.',
              tags: ['REACT.JS', 'NEXT.JS', 'FRAMER'],
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg'
            },
            {
              title: 'ENTERPRISE WORDPRESS',
              desc: 'Designing bespoke Elementor Pro themes, custom plugins, secure APIs, and responsive enterprise-grade WordPress architectures.',
              tags: ['ELEMENTOR', 'PLUGINS', 'WP API'],
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg'
            },
            {
              title: 'WOOCOMMERCE OPTIMIZATION',
              desc: 'Scaling digital store capacities with secure multi-language checkouts, payment integrations, and high-performance product visualizers.',
              tags: ['WPML', 'PAYMENTS', 'PERFORMANCE'],
              icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/woocommerce/woocommerce-original.svg'
            }
          ]);
        }
      })
      .catch(() => {
        // Fallback on error
      });
  }, []);

  return (
    <section className="py-[50px] md:py-24 bg-transparent relative overflow-hidden font-['Space_Grotesk']">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <motion.h4 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[#8b5cf6] font-bold uppercase tracking-[0.2em] text-[11px] mb-3"
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {services.map((service, idx) => (
            <motion.div 
              key={service.title + idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="p-8 bg-gradient-to-b from-[rgba(255,255,255,0.03)] to-[rgba(255,255,255,0.01)] border border-[#8b5cf6]/20 rounded-2xl hover:border-[#8b5cf6]/50 transition-all duration-300 flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white mb-6 p-2 overflow-hidden">
                {typeof service.icon === 'string' ? (
                  service.icon.startsWith('<svg') ? (
                    <div className="w-full h-full flex items-center justify-center" dangerouslySetInnerHTML={{ __html: service.icon }} />
                  ) : (
                    <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
                  )
                ) : (
                  service.icon
                )}
              </div>
              <h3 className="text-[15px] font-black mb-3 text-white uppercase tracking-wider">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed text-[13px] mb-8 flex-grow">
                {service.desc}
              </p>
              <div className="flex flex-wrap gap-2 mt-auto">
                {(service.tags || []).map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full border border-[#8b5cf6]/30 text-[#8b5cf6] text-[9px] font-black uppercase tracking-widest bg-[#8b5cf6]/5">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatIDo;
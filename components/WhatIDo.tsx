import React from 'react';
import { motion } from 'framer-motion';

const WhatIDo: React.FC = () => {
  const [services, setServices] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/services').then(res => res.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setServices(data);
      else {
        // Fallback
        setServices([
          { title: 'Full-Stack Web Apps', desc: 'Building high-performance, dynamic applications from scratch using React, Node.js, and MongoDB.', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
          { title: 'MERN Stack Ecosystems', desc: 'Developing scalable backend architectures with robust APIs and secure database integrations.', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
          { title: 'WordPress & Multi-Lang', desc: 'Enterprise-grade WordPress solutions, high-end e-commerce, and robust multilingual platform architecture.', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-original.svg' }
        ]);
      }
    });
  }, []);

  return (
    <div className="py-32 bg-transparent border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-0">
          {services.map((service, idx) => (
            <motion.div 
              key={service.title}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="p-12 border border-white/5 hover:bg-[#FF69B4] group transition-all duration-500"
            >
              <div className="w-12 h-12 mb-8 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-transform flex items-center justify-start">
                {service.icon && (service.icon.startsWith('http') || service.icon.startsWith('/') || service.icon.includes('.')) ? (
                  <img src={service.icon} alt={service.title} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-4xl">{service.icon}</span>
                )}
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors uppercase tracking-tight">{service.title}</h3>
              <p className="text-gray-500 group-hover:text-white/80 leading-relaxed text-sm">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;
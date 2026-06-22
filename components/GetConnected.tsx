import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Linkedin, MessageSquare, ExternalLink, ChevronRight, Facebook } from 'lucide-react';
import { CONTACT_INFO } from '../constants';

const GetConnected: React.FC = () => {
  const [socials, setSocials] = useState<any>({
    linkedin: CONTACT_INFO.linkedin,
    whatsapp: CONTACT_INFO.whatsapp,
    messenger: CONTACT_INFO.messenger,
    facebook: CONTACT_INFO.facebook
  });

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.socialLinks) {
        setSocials({
          linkedin: data.socialLinks.linkedin || CONTACT_INFO.linkedin,
          whatsapp: data.socialLinks.whatsapp || CONTACT_INFO.whatsapp,
          messenger: data.socialLinks.messenger || CONTACT_INFO.messenger,
          facebook: data.socialLinks.facebook || CONTACT_INFO.facebook
        });
      }
    });
  }, []);

  const images = [
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=800&auto=format&fit=crop"
  ];

  return (
    <section className="py-[25px] md:py-32 bg-transparent border-t border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="order-2 lg:order-1">
            <motion.h4 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#a855f7] font-black uppercase tracking-[0.4em] text-[10px] mb-4 italic"
            >
              Strategic Partnerships
            </motion.h4>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-8 leading-tight"
            >
              Get <span className="text-[#a855f7]">Connected</span> <br /> In Real Time.
            </motion.h2>
            <p className="text-gray-500 text-base md:text-lg font-bold leading-relaxed mb-10 max-w-xl italic">
              "Let's bridge the gap between imagination and execution. Reach out through my social channels for instant collaboration."
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'LinkedIn Professional', icon: <Linkedin className="w-4 h-4" />, link: socials.linkedin, color: 'hover:text-[#a855f7]' },
                { name: 'WhatsApp Business', icon: <MessageSquare className="w-4 h-4" />, link: socials.whatsapp, color: 'hover:text-[#a855f7]' },
                { name: 'Direct Messenger', icon: <ExternalLink className="w-4 h-4" />, link: socials.messenger, color: 'hover:text-[#a855f7]' },
                { name: 'Facebook Profile', icon: <Facebook className="w-4 h-4" />, link: socials.facebook, color: 'hover:text-[#a855f7]' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.link} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`flex items-center justify-between p-5 glass border border-white/5 hover:border-[#a855f7]/50 transition-all group rounded-2xl ${social.color}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="transition-transform group-hover:scale-110">{social.icon}</div>
                    <span className="text-white font-black uppercase tracking-widest text-[9px]">{social.name}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all translate-x-[-5px] group-hover:translate-x-0" />
                </a>
              ))}
            </div>
          </div>

          <div className="order-1 lg:order-2 grid grid-cols-2 gap-3 h-[450px]">
            <div className="grid grid-rows-2 gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="overflow-hidden border border-white/5 rounded-3xl"
              >
                <img src={images[0]} className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="overflow-hidden border border-white/5 rounded-3xl"
              >
                <img src={images[1]} className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>
            </div>
            <div className="grid grid-rows-2 gap-3">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="overflow-hidden border border-white/5 rounded-3xl"
              >
                <img src={images[2]} className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="overflow-hidden border border-white/5 rounded-3xl"
              >
                <img src={images[3]} className="w-full h-full object-cover transition-all duration-700" />
              </motion.div>
            </div>
          </div>

        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#a855f7]/5 blur-[120px] pointer-events-none"></div>
    </section>
  );
};

export default GetConnected;
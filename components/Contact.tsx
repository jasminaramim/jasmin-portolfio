import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CONTACT_INFO } from '../constants';
import { Mail, Phone, MapPin, Globe, Linkedin, MessageSquare, ExternalLink } from 'lucide-react';

const Contact: React.FC = () => {
  const [profile, setProfile] = useState<any>({
    email: CONTACT_INFO.email,
    phone: CONTACT_INFO.phone,
    address: CONTACT_INFO.address,
    socialLinks: {
      linkedin: CONTACT_INFO.linkedin,
      whatsapp: CONTACT_INFO.whatsapp,
      messenger: CONTACT_INFO.messenger
    }
  });

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.email) setProfile(data);
    });
  }, []);

  return (
    <div className="py-24 px-6 bg-transparent relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4B0082]/5 blur-[150px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[#a855f7] font-black uppercase tracking-[0.4em] mb-4 text-[10px] italic"
            >
              Get In Touch
            </motion.h3>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-black mb-8 uppercase italic tracking-tighter"
            >
              Let's Start a <br /><span className="text-[#a855f7]">Collaboration.</span>
            </motion.h2>
            <p className="text-gray-500 text-base md:text-lg mb-12 leading-relaxed italic font-bold">
              "Every great project starts with a conversation. Let's discuss your vision and turn it into a high-performance digital reality."
            </p>
            
            <div className="space-y-8">
              {[
                { label: 'Direct Email', value: profile.email, icon: <Mail className="w-5 h-5 text-[#a855f7]" /> },
                { label: 'Voice / WhatsApp', value: profile.phone, icon: <Phone className="w-5 h-5 text-[#a855f7]" /> },
                { label: 'Base Location', value: profile.address, icon: <MapPin className="w-5 h-5 text-[#a855f7]" /> },
                { label: 'Work Protocol', value: 'Freelance & Full-time', icon: <Globe className="w-5 h-5 text-[#a855f7]" /> }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-6 group"
                >
                  <div className="w-12 h-12 glass border border-white/5 flex items-center justify-center rounded-2xl group-hover:border-[#a855f7]/50 transition-all">
                    {item.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-lg text-white font-black italic tracking-tight">{item.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-4 mt-16">
              {[
                { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, link: profile.socialLinks.linkedin },
                { name: 'WhatsApp', icon: <MessageSquare className="w-5 h-5" />, link: profile.socialLinks.whatsapp },
                { name: 'Messenger', icon: <ExternalLink className="w-5 h-5" />, link: profile.socialLinks.messenger }
              ].map((platform, i) => (
                <motion.a 
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  href={platform.link} 
                  target="_blank"
                  rel="noreferrer"
                  className="w-14 h-14 glass border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#a855f7] hover:border-[#a855f7] transition-all hover:scale-110 rounded-2xl"
                >
                  {platform.icon}
                </motion.a>
              ))}
            </div>
          </div>

          <motion.form 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-12 glass border border-white/5 space-y-8 relative overflow-hidden rounded-[40px]"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#4B0082] to-[#a855f7]"></div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 italic">Protocol 01: Identification</label>
              <input 
                type="text" 
                placeholder="YOUR NAME"
                className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl focus:outline-none focus:border-[#a855f7]/50 transition-all text-white font-bold uppercase tracking-widest text-xs"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 italic">Protocol 02: Communication Node</label>
              <input 
                type="email" 
                placeholder="YOUR EMAIL ADDRESS"
                className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl focus:outline-none focus:border-[#a855f7]/50 transition-all text-white font-bold uppercase tracking-widest text-xs"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 italic">Protocol 03: Transmission Data</label>
              <textarea 
                rows={4}
                placeholder="DESCRIBE YOUR VISION..."
                className="w-full bg-white/5 border border-white/5 p-6 rounded-2xl focus:outline-none focus:border-[#a855f7]/50 transition-all text-white font-bold uppercase tracking-widest text-xs resize-none"
              ></textarea>
            </div>

            <button className="w-full py-6 bg-gradient-to-r from-[#4B0082] to-[#a855f7] text-white font-black uppercase tracking-[0.3em] text-[10px] hover:shadow-[0_0_40px_rgba(255,105,180,0.3)] transition-all active:scale-[0.98] rounded-2xl">
              INITIALIZE TRANSMISSION
            </button>
            
            <p className="text-center text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
              Encrypted Data Transfer Active
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CONTACT_INFO } from '../constants';
import { Linkedin, MessageSquare, Phone, Send, Facebook } from 'lucide-react';

const FloatingContact: React.FC = () => {
  const [socials, setSocials] = useState<any>({
    whatsapp: CONTACT_INFO.whatsapp,
    messenger: CONTACT_INFO.messenger,
    linkedin: CONTACT_INFO.linkedin,
    phone: CONTACT_INFO.phone,
    facebook: CONTACT_INFO.facebook
  });

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.socialLinks) {
        setSocials({
          whatsapp: data.socialLinks.whatsapp || CONTACT_INFO.whatsapp,
          messenger: data.socialLinks.messenger || CONTACT_INFO.messenger,
          linkedin: data.socialLinks.linkedin || CONTACT_INFO.linkedin,
          phone: data.socialLinks.phone || CONTACT_INFO.phone,
          facebook: data.socialLinks.facebook || CONTACT_INFO.facebook
        });
      }
    });
  }, []);

  const contactOptions = [
    { name: 'WhatsApp', icon: <MessageSquare className="w-5 h-5" />, link: socials.whatsapp },
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, link: socials.facebook },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, link: socials.linkedin },
    { name: 'Call', icon: <Phone className="w-5 h-5" />, link: `tel:${socials.phone}` },
  ];

  return (
    <>
      {/* Desktop Vertical Sidebar */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="fixed right-8 top-1/2 -translate-y-1/2 z-[100] hidden md:flex flex-col gap-6"
      >
        {contactOptions.map((social) => (
          <a
            key={social.name}
            href={social.link}
            target="_blank"
            rel="noreferrer"
            className="w-14 h-14 glass flex items-center justify-center text-gray-400 transition-all duration-300 hover:scale-110 hover:border-[#FF69B4] hover:text-[#FF69B4] group relative border border-white/10 rounded-2xl"
          >
            {social.icon}
            <div className="absolute right-full mr-6 px-4 py-2 bg-[#FF69B4] text-white text-[9px] font-black uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 pointer-events-none italic shadow-lg">
              {social.name}
            </div>
          </a>
        ))}
      </motion.div>

      {/* Mobile Bottom Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 w-full glass border-t border-[#FF69B4]/30 z-[100] flex md:hidden justify-around py-6 px-6 backdrop-blur-2xl"
      >
        {contactOptions.map((social) => (
          <a
            key={social.name}
            href={social.link}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center gap-2 group text-gray-400 active:text-[#FF69B4]"
          >
            {social.icon}
            <span className="text-[8px] font-black uppercase tracking-[0.2em]">{social.name}</span>
          </a>
        ))}
      </motion.div>
    </>
  );
};

export default FloatingContact;
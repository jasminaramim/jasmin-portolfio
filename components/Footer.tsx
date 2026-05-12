import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../constants';
import { Github, Linkedin, MessageSquare, Phone, Mail, MapPin, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = () => {
  const navigate = useNavigate();
  const [socials, setSocials] = useState<any>({
    linkedin: CONTACT_INFO.linkedin,
    github: CONTACT_INFO.github,
    facebook: CONTACT_INFO.facebook,
    whatsapp: CONTACT_INFO.whatsapp
  });

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.socialLinks) {
        setSocials({
          linkedin: data.socialLinks.linkedin || CONTACT_INFO.linkedin,
          github: data.socialLinks.github || CONTACT_INFO.github,
          facebook: data.socialLinks.facebook || CONTACT_INFO.facebook,
          whatsapp: data.socialLinks.whatsapp || CONTACT_INFO.whatsapp
        });
      }
    });
  }, []);

  return (
    <footer className="bg-[#050505] border-t border-white/5 pt-32 pb-12 overflow-hidden relative">
      {/* Background Tech Elements */}
      <div className="absolute top-0 left-0 w-full h-full tech-grid pointer-events-none opacity-5"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#4B0082]/5 blur-[180px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          {/* Brand & About Column */}
          <div className="space-y-10">
            <button 
              onClick={() => navigate('/')}
              className="text-4xl font-black tracking-tighter group outline-none"
            >
              <span className="text-white uppercase transition-colors group-hover:text-[#FF69B4]">Jas</span>
              <span className="text-[#FF69B4] uppercase transition-colors group-hover:text-white">min</span>
            </button>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs uppercase font-bold italic tracking-wider">
              We specialize in crafting enterprise-grade web applications using the MERN Stack and custom WordPress architecture. Our mission is to transform business goals into high-performance digital reality.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                { icon: <Linkedin className="w-5 h-5" />, link: socials.linkedin, label: 'LinkedIn' },
                { icon: <Github className="w-5 h-5" />, link: socials.github, label: 'GitHub' },
                { icon: <Facebook className="w-5 h-5" />, link: socials.facebook, label: 'Facebook' },
                { icon: <MessageSquare className="w-5 h-5" />, link: socials.whatsapp, label: 'WhatsApp' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.link} 
                  target="_blank" 
                  rel="noreferrer"
                  title={social.label}
                  className="w-12 h-12 border border-white/10 flex items-center justify-center text-gray-500 hover:text-[#FF69B4] hover:border-[#FF69B4] transition-all bg-black/50 hover:scale-110"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] mb-10 text-xs italic flex items-center gap-3">
               <span className="w-8 h-[2px] bg-[#FF69B4]"></span> Quick Links
            </h4>
            <ul className="space-y-6">
              {[
                { name: 'Home', id: '/' },
                { name: 'About', id: '/about' },
                { name: 'Projects', id: '/projects' },
                { name: 'Experience', id: '/experience' },
                { name: 'Contact', id: '/contact' }
              ].map(page => (
                <li key={page.id}>
                  <button 
                    onClick={() => navigate(page.id)}
                    className="text-gray-500 hover:text-[#FF69B4] font-bold uppercase tracking-widest text-[10px] transition-all hover:translate-x-2"
                  >
                    // {page.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Stacks */}
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] mb-10 text-xs italic flex items-center gap-3">
               <span className="w-8 h-[2px] bg-[#FF69B4]"></span> Expertises
            </h4>
            <ul className="space-y-6">
              {[
                'Custom React.js Ecosystems',
                'Node.js API Architecture',
                'WP Custom Theme Logic',
                'Advanced WooCommerce',
                'High-end Performance SEO'
              ].map(item => (
                <li key={item} className="text-gray-500 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#FF69B4]/20 group-hover:bg-[#FF69B4]"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Secure Contacts */}
          <div>
            <h4 className="text-white font-black uppercase tracking-[0.3em] mb-10 text-xs italic flex items-center gap-3">
               <span className="w-8 h-[2px] bg-[#FF69B4]"></span> Communications
            </h4>
            <ul className="space-y-8">
              <li className="flex gap-6 items-start group">
                <MapPin className="w-5 h-5 text-[#FF69B4] shrink-0 group-hover:scale-125 transition-transform" />
                <div className="flex flex-col gap-1">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">Base of Operations</span>
                  <span className="text-gray-500 text-[10px] font-bold leading-relaxed italic">{CONTACT_INFO.address}</span>
                </div>
              </li>
              <li className="flex gap-6 items-center group">
                <Mail className="w-5 h-5 text-[#FF69B4] shrink-0 group-hover:scale-125 transition-transform" />
                <div className="flex flex-col gap-1">
                   <span className="text-white text-[10px] font-black uppercase tracking-widest">Direct Inquiries</span>
                   <span className="text-gray-500 text-[10px] font-bold underline underline-offset-4 decoration-[#FF69B4]/30">{CONTACT_INFO.email}</span>
                </div>
              </li>
              <li className="flex gap-6 items-center group">
                <Phone className="w-5 h-5 text-[#FF69B4] shrink-0 group-hover:scale-125 transition-transform" />
                <div className="flex flex-col gap-1">
                   <span className="text-white text-[10px] font-black uppercase tracking-widest">Voice Communication</span>
                   <span className="text-gray-500 text-[10px] font-bold">{CONTACT_INFO.phone}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-gray-600 text-[9px] uppercase font-black tracking-[0.5em] text-center md:text-left">
            &copy; 2025 JASMIN ARA MIM. ALL ARCHITECTURAL ASSETS PROTECTED.
          </p>
          <div className="flex gap-10 text-[9px] font-black uppercase tracking-[0.4em] text-gray-600">
            <span className="hover:text-[#FF69B4] cursor-pointer transition-colors">SECURITY PROTOCOL</span>
            <span className="hover:text-[#FF69B4] cursor-pointer transition-colors">DATA PRIVACY</span>
            <span className="text-[#FF69B4] animate-pulse cursor-pointer">HIRE STATUS: AVAILABLE</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
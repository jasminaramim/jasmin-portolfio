import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../constants';
import { Github, Linkedin, MessageSquare, Phone, Mail, MapPin, Facebook, ChevronRight } from 'lucide-react';
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
    <footer className="bg-[#0a0a0c] border-t border-white/10 pt-32 pb-12 overflow-hidden relative z-20 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.5)]">
      {/* Background Tech Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#4B0082]/10 blur-[180px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20 mb-20 lg:mb-32">
          {/* Brand & About Column */}
          <div className="space-y-8">
            <button 
              onClick={() => navigate('/')}
              className="flex flex-col items-start justify-center outline-none transition-transform hover:scale-105"
            >
              <div className="flex items-center leading-none tracking-tighter" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>
                <span className="text-white font-black" style={{ fontFamily: 'Arial, sans-serif' }}>J</span>
                <span className="text-[#a855f7] font-black" style={{ fontFamily: 'Arial, sans-serif' }}>M</span>
              </div>
              <div className="flex text-[11px] font-black tracking-[0.3em] uppercase">
                <span className="text-white">JAS</span>
                <span className="text-[#a855f7]">MIN</span>
              </div>
            </button>
            <p className="text-gray-400 text-[13px] leading-relaxed max-w-xs font-bold italic tracking-wider">
              We specialize in crafting enterprise-grade web applications using the MERN Stack and custom WordPress architecture. Our mission is to transform business goals into high-performance digital reality.
            </p>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: <Linkedin className="w-4 h-4" />, link: socials.linkedin, label: 'LinkedIn' },
                { icon: <Github className="w-4 h-4" />, link: socials.github, label: 'GitHub' },
                { icon: <Facebook className="w-4 h-4" />, link: socials.facebook, label: 'Facebook' },
                { icon: <MessageSquare className="w-4 h-4" />, link: socials.whatsapp, label: 'WhatsApp' }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.link} 
                  target="_blank" 
                  rel="noreferrer"
                  title={social.label}
                  className="w-10 h-10 border border-white/20 rounded-xl flex items-center justify-center text-gray-300 hover:text-white hover:border-[#a855f7] hover:bg-[#a855f7]/10 transition-all bg-white/5 hover:scale-110 shadow-lg"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h4 className="text-[#a855f7] font-black uppercase tracking-[0.2em] mb-8 text-[11px] flex items-center gap-3">
               <span className="w-6 h-[1px] bg-[#a855f7]"></span> QUICK LINKS
            </h4>
            <ul className="space-y-4">
              {[
                { name: 'HOME', id: '/' },
                { name: 'ABOUT', id: '/about' },
                { name: 'PROJECTS', id: '/projects' },
                { name: 'EXPERIENCE', id: '/experience' },
                { name: 'CONTACT', id: '/contact' }
              ].map(page => (
                <li key={page.id}>
                  <button 
                    onClick={() => navigate(page.id)}
                    className="group flex items-center gap-3 text-gray-400 hover:text-white font-bold uppercase tracking-widest text-[11px] transition-all"
                  >
                    <ChevronRight className="w-3 h-3 text-[#a855f7] group-hover:translate-x-1 transition-transform" />
                    {page.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Stacks */}
          <div>
            <h4 className="text-[#a855f7] font-black uppercase tracking-[0.2em] mb-8 text-[11px] flex items-center gap-3">
               <span className="w-6 h-[1px] bg-[#a855f7]"></span> EXPERTISES
            </h4>
            <ul className="space-y-4">
              {[
                'CUSTOM REACT.JS ECOSYSTEMS',
                'NODE.JS API ARCHITECTURE',
                'WP CUSTOM THEME LOGIC',
                'ADVANCED WOOCOMMERCE',
                'HIGH-END PERFORMANCE SEO'
              ].map(item => (
                <li key={item} className="text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[11px] flex items-start gap-4 leading-relaxed">
                  <span className="w-[6px] h-[6px] mt-1.5 rounded-full bg-[#a855f7] shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Secure Contacts */}
          <div>
            <h4 className="text-[#a855f7] font-black uppercase tracking-[0.2em] mb-8 text-[11px] flex items-center gap-3">
               <span className="w-6 h-[1px] bg-[#a855f7]"></span> COMMUNICATIONS
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4 items-start group">
                <div className="w-10 h-10 border border-[#a855f7]/40 rounded-xl bg-[#a855f7]/10 flex items-center justify-center shrink-0 group-hover:border-[#a855f7]/80 transition-colors shadow-md">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col gap-1 mt-0.5">
                  <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">BASE OF OPERATIONS</span>
                  <span className="text-white text-[11px] font-bold leading-relaxed">{CONTACT_INFO.address}</span>
                </div>
              </li>
              <li className="flex gap-4 items-start group">
                <div className="w-10 h-10 border border-[#a855f7]/40 rounded-xl bg-[#a855f7]/10 flex items-center justify-center shrink-0 group-hover:border-[#a855f7]/80 transition-colors shadow-md">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col gap-1 mt-0.5">
                   <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">DIRECT INQUIRIES</span>
                   <span className="text-white text-[11px] font-bold">{CONTACT_INFO.email}</span>
                </div>
              </li>
              <li className="flex gap-4 items-start group">
                <div className="w-10 h-10 border border-[#a855f7]/40 rounded-xl bg-[#a855f7]/10 flex items-center justify-center shrink-0 group-hover:border-[#a855f7]/80 transition-colors shadow-md">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="flex flex-col gap-1 mt-0.5">
                   <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest">VOICE COMMUNICATION</span>
                   <span className="text-white text-[11px] font-bold">{CONTACT_INFO.phone}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Copyright */}
        <div className="pt-8 lg:pt-12 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-6">
          <p className="text-gray-400 text-[9px] uppercase font-black tracking-[0.2em] text-center lg:text-left">
            &copy; 2025 JASMIN ARA MIM. ALL ARCHITECTURAL ASSETS PROTECTED.
          </p>
          <div className="flex flex-wrap justify-center gap-6 lg:gap-10 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
            <span className="hover:text-white cursor-pointer transition-colors">SECURITY PROTOCOL</span>
            <span className="hover:text-white cursor-pointer transition-colors">DATA PRIVACY</span>
            <span className="flex items-center gap-2 cursor-pointer text-gray-300 group">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
              <span className="group-hover:text-green-400 transition-colors">HIRE STATUS: AVAILABLE</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
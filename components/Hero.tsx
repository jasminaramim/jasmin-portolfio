import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeroContent } from '../types';

interface HeroProps {
  onNavigate?: (page: string) => void;
}

const defaultHeroData: HeroContent = {
  badgeText: 'WordPress & MERN Developer',
  firstName: 'Jasmin',
  lastName: 'Ara Mim',
  subheading: 'Full-Stack Developer · Designer',
  description: 'Building modern WordPress solutions & MERN stack\napplications — fast, elegant & production-ready.',
  cvLink: 'https://docs.google.com/document/d/10LrwL1bTOHBr_vz2jej2xxaN-_Y5VgH1rbasbPbaIYg/edit?usp=sharing',
  codeSnippet: `<span class="ln"><span class="cp">const</span> <span class="ct">dev</span> <span class="cw">= {</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cb">name</span><span class="cw">:</span> <span class="cs">'Jasmin Ara Mim'</span><span class="cw">,</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cb">role</span><span class="cw">:</span> <span class="cs">'Full-Stack Dev'</span><span class="cw">,</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cb">location</span><span class="cw">:</span> <span class="cs">'Bangladesh'</span><span class="cw">,</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cb">stack</span><span class="cw">: [</span></span>
<span class="ln">&nbsp;&nbsp;&nbsp;&nbsp;<span class="cs">'React'</span><span class="cw">,</span> <span class="cs">'Node.js'</span><span class="cw">,</span></span>
<span class="ln">&nbsp;&nbsp;&nbsp;&nbsp;<span class="cs">'MongoDB'</span><span class="cw">,</span></span>
<span class="ln">&nbsp;&nbsp;&nbsp;&nbsp;<span class="cs">'WordPress'</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cw">],</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cb">available</span><span class="cw">:</span> <span class="ct">true</span><span class="cw">,</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cp">hire</span><span class="cw">() {</span></span>
<span class="ln">&nbsp;&nbsp;&nbsp;&nbsp;<span class="cb">return</span> <span class="cs">'Let\\'s build! 🚀'</span></span>
<span class="ln">&nbsp;&nbsp;<span class="cw">}</span></span>
<span class="ln"><span class="cw">};</span><span class="cursor"></span></span>`,
  stats: [
    { num: '50', suffix: '+', label: 'Projects' },
    { num: '3', suffix: '+', label: 'Experience' },
    { num: '100', suffix: '%', label: 'Satisfaction' }
  ],
  socials: {
    facebook: '#',
    linkedin: '#',
    github: '#',
    email: '#'
  }
};

const floatingIcons = [
  { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', top: '-5%', left: '80%', delay: 0, glow: 'rgba(97,218,251,0.3)' },
  { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', top: '5%', left: '5%', delay: 1.5, glow: 'rgba(71,162,72,0.3)' },
  { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', top: '45%', left: '105%', delay: 0.5, glow: 'rgba(104,160,99,0.3)' },
  { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/wordpress/wordpress-plain.svg', top: '45%', left: '-15%', delay: 2, glow: 'rgba(33,117,155,0.3)' },
  { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', top: '85%', left: '85%', delay: 1, glow: 'rgba(97,218,251,0.3)' },
  { icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', top: '95%', left: '20%', delay: 2.5, glow: 'rgba(104,160,99,0.3)' },
];

const Hero: React.FC<HeroProps> = () => {
  const [heroData, setHeroData] = useState<HeroContent>(defaultHeroData);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch('/api/hero').then(res => res.json()).then(data => {
      if (data && data.firstName) setHeroData(data);
    });
  }, []);

  useEffect(() => {
    // Canvas animation logic from the user's design
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let pts: any[] = [];

    const initCanvas = () => {
      const resize = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      };
      resize();
      window.addEventListener('resize', resize);

      pts = Array.from({ length: 55 }, () => ({
        x:      Math.random() * canvas.width,
        y:      Math.random() * canvas.height,
        vx:     (Math.random() - 0.5) * 0.4,
        vy:     (Math.random() - 0.5) * 0.4,
        r:      0.8 + Math.random() * 2,
        bright: Math.random() > 0.6,
        phase:  Math.random() * Math.PI * 2
      }));

      let tick = 0;

      const frame = () => {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        tick++;

        pts.forEach(p => {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        });

        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const d  = Math.sqrt(dx * dx + dy * dy);
            if (d < 140) {
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.strokeStyle = `rgba(140,100,220,${(1 - d / 140) * 0.5})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }

        pts.forEach(p => {
          if (p.bright) {
            const glow = 0.5 + 0.5 * Math.sin(tick * 0.04 + p.phase);
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18 * glow);
            g.addColorStop(0, 'rgba(200,80,192,0.3)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 18 * glow, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = p.bright
            ? `rgba(230,200,255,${0.7 + 0.3 * Math.sin(tick * 0.05 + p.phase)})`
            : 'rgba(140,120,200,0.45)';
          ctx.fill();
        });

        animationFrameId = requestAnimationFrame(frame);
      };

      frame();

      return () => {
        window.removeEventListener('resize', resize);
        cancelAnimationFrame(animationFrameId);
      };
    };

    const cleanup = initCanvas();
    return cleanup;
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400&display=swap');
        
        .hero-custom {
          position: relative;
          min-height: calc(100vh - 65px);
          display: flex;
          align-items: center;
          overflow: hidden;
          font-family: 'Space Grotesk', sans-serif;
          background: #07050f; /* Solid background to hide 3D earth and make it clean */
        }
        .hero-inner {
          position: relative; z-index: 5; display: flex; align-items: center;
          justify-content: space-between; width: 100%; max-width: 1280px;
          margin: 0 auto; padding: 0 24px; gap: 40px;
        }
        .hero-left { flex: 1; min-width: 0; }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #8b5cf6; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .hero-name .gr { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-p { background: linear-gradient(135deg, #8b5cf6, #a855f7); transition: opacity 0.2s, transform 0.15s; }
        .btn-p:hover { opacity: 0.88; transform: translateY(-1px); }
        .btn-s { transition: border-color 0.2s, color 0.2s; }
        .btn-s:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
        .st-n span { background: linear-gradient(135deg, #8b5cf6, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .code-card { width: 380px; flex-shrink: 0; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; overflow: hidden; }
        .code-bar { display: flex; align-items: center; gap: 6px; padding: 11px 16px; background: rgba(255,255,255,0.04); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .code-filename { font-size: 13px; color: rgba(255,255,255,0.28); letter-spacing: 0.8px; margin-left: 6px; font-family: 'JetBrains Mono', monospace; }
        .code-body { padding: 22px 24px; font-family: 'JetBrains Mono', monospace; font-size: 13.5px; line-height: 1.8; }
        .ln { display: block; }
        .cp { color: #8b5cf6; } .cb { color: #7088e8; } .ct { color: #56d9b1; }
        .cw { color: rgba(255,255,255,0.78); } .cs { color: #f9c74f; } .cd { color: rgba(255,255,255,0.22); }
        .cursor { display: inline-block; width: 7px; height: 13px; background: #8b5cf6; border-radius: 1px; animation: blink 1.1s infinite; vertical-align: middle; margin-left: 2px; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .scroll-hint { position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; z-index: 10; }
        .mouse { width: 22px; height: 34px; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 11px; display: flex; justify-content: center; padding-top: 6px; }
        .wheel { width: 3px; height: 7px; background: rgba(255,255,255,0.4); border-radius: 2px; animation: scroll 1.8s infinite; }
        @keyframes scroll { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(8px); opacity: 0; } }
        @media (max-width: 900px) {
          .hero-name { font-size: 46px !important; letter-spacing: -2px !important; }
          .hero-inner { padding: 0 24px !important; flex-direction: column; gap: 60px; text-align: center; padding-top: 40px; padding-bottom: 40px; }
          .hero-left { display: flex; flex-direction: column; align-items: center; }
          .code-card { width: 100%; max-width: 400px; }
          .scroll-hint { bottom: 30px; }
        }
      `}</style>

      <section className="hero-custom pt-[100px] md:pt-[150px] pb-[120px] md:pb-[50px]">
        {/* 2D Particle Canvas Background */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}></canvas>

        <div className="hero-inner relative z-10">
          {/* LEFT */}
          <div className="hero-left">
            <div className="inline-flex items-center gap-2 bg-[rgba(200,80,192,0.1)] border border-[rgba(200,80,192,0.28)] rounded-[50px] py-1.5 px-4 mb-6">
              <div className="badge-dot"></div>
              <span className="text-[#8b5cf6] text-[11px] font-semibold tracking-[1.8px] uppercase">{heroData.badgeText}</span>
            </div>

            <div className="text-[68px] font-bold leading-none text-white tracking-[-3px] mb-[10px] hero-name">
              <span className="gr">{heroData.firstName}</span><br/>{heroData.lastName}
            </div>
            <div className="text-[11px] text-white/30 tracking-[3px] uppercase mb-[18px]">
              {heroData.subheading}
            </div>
            <p className="text-[15px] text-white/50 leading-[1.75] mb-[34px] max-w-[380px] font-light whitespace-pre-line">
              {heroData.description}
            </p>

            <div className="flex gap-3">
              <button onClick={() => window.open(heroData.cvLink, '_blank')} className="btn-p text-[#fff] border-none rounded-[50px] py-[13px] px-[30px] text-[13px] font-semibold cursor-pointer">
                View CV &nbsp;↗
              </button>
              <button onClick={() => navigate('/projects')} className="btn-s bg-transparent text-white/65 border border-white/15 rounded-[50px] py-[13px] px-[30px] text-[13px] font-medium cursor-pointer">
                Featured Works
              </button>
            </div>

            <div className="flex gap-[36px] mt-[36px] pt-[28px] border-t border-white/10 flex-wrap">
              {Array.isArray(heroData.stats) ? heroData.stats.map((stat, idx) => (
                <div key={idx}>
                  <div className="st-n text-[26px] font-bold text-white tracking-[-1px] leading-none"><span>{stat.num}</span>{stat.suffix || ''}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-[1.8px] mt-1">{stat.label}</div>
                </div>
              )) : (
                <>
                  {/* Fallback for old object structure if still in DB */}
                  {(heroData.stats as any).projects && (
                    <div>
                      <div className="st-n text-[26px] font-bold text-white tracking-[-1px] leading-none"><span>{(heroData.stats as any).projects.num}</span>+</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-[1.8px] mt-1">{(heroData.stats as any).projects.label}</div>
                    </div>
                  )}
                  {(heroData.stats as any).experience && (
                    <div>
                      <div className="st-n text-[26px] font-bold text-white tracking-[-1px] leading-none"><span>{(heroData.stats as any).experience.num}</span>+</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-[1.8px] mt-1">{(heroData.stats as any).experience.label}</div>
                    </div>
                  )}
                  {(heroData.stats as any).satisfaction && (
                    <div>
                      <div className="st-n text-[26px] font-bold text-white tracking-[-1px] leading-none"><span>{(heroData.stats as any).satisfaction.num}</span>%</div>
                      <div className="text-[10px] text-white/30 uppercase tracking-[1.8px] mt-1">{(heroData.stats as any).satisfaction.label}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* CODE CARD WITH ORBIT */}
          <div className="relative flex items-center justify-center shrink-0 mt-12 md:mt-0 max-w-[full] md:max-w-none">
            {/* Orbit Lines */}
            <div className="absolute w-[420px] h-[420px] md:w-[480px] md:h-[480px] border border-white/5 rounded-full pointer-events-none"></div>
            <div className="absolute w-[540px] h-[540px] md:w-[620px] md:h-[620px] border border-[#a855f7]/10 rounded-full pointer-events-none border-dashed animate-[spin_100s_linear_infinite]"></div>

            {/* Floating Tech Icons */}
            <div className="absolute inset-0 pointer-events-none hidden md:block">
              {floatingIcons.map((item, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
                  className="absolute z-20 flex items-center justify-center w-16 h-16 rounded-full bg-[#0a0a0c]/80 backdrop-blur-md border border-white/10"
                  style={{ top: item.top, left: item.left, boxShadow: `0 0 25px ${item.glow}` }}
                >
                  <img src={item.icon} alt="tech" className="w-8 h-8 object-contain" />
                </motion.div>
              ))}

              <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-[-15%] left-[35%] z-20"
              >
                  <div className="text-white/60 font-light text-2xl tracking-widest bg-[#0a0a0c]/80 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">Express<span className="text-white font-bold">.js</span></div>
              </motion.div>
            </div>

            <div className="code-card relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.15)] hover:scale-[1.02] transition-transform duration-500">
              <div className="code-bar">
                <div className="dot" style={{background:'#ff5f57'}}></div>
                <div className="dot" style={{background:'#febc2e'}}></div>
                <div className="dot" style={{background:'#28c840'}}></div>
                <span className="code-filename">developer.js</span>
              </div>
              <div 
                className="code-body" 
                dangerouslySetInnerHTML={{ __html: heroData.codeSnippet }} 
              />
            </div>
          </div>
        </div>

        {/* SCROLL HINT */}
        <div className="scroll-hint">
          <div className="mouse"><div className="wheel"></div></div>
          <span className="font-['Space_Grotesk']">Scroll</span>
        </div>
      </section>
    </>
  );
};

export default Hero;
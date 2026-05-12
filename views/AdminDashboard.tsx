import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase, 
  FolderCode, 
  LogOut, 
  Plus, 
  Trash2, 
  Settings, 
  User,
  ExternalLink,
  Save,
  X,
  CreditCard,
  MessageSquare,
  Users,
  Star,
  FileText,
  MessageCircle,
  Monitor,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  ChevronRight
} from 'lucide-react';
import { Project, Service, Skill, Review, AdminProfile } from '../types';

const AdminDashboard: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/check');
        const data = await res.json();
        if (data.authenticated) {
          setAuthenticated(true);
        } else {
          navigate('/admin/login');
        }
      } catch (e) {
        navigate('/admin/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    navigate('/admin/login');
  };

  if (authenticated === null) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase tracking-[0.5em] animate-pulse">Initializing Terminal...</div>;

  const sidebarLinks = [
    { to: "/admin/projects", icon: <FolderCode size={18} />, label: "My Projects" },
    { to: "/admin/services", icon: <Monitor size={18} />, label: "Services" },
    { to: "/admin/skills", icon: <Settings size={18} />, label: "Skills" },
    { to: "/admin/reviews", icon: <Star size={18} />, label: "Reviews" },
    { to: "/admin/experience", icon: <Briefcase size={18} />, label: "Experience" },
    { to: "/admin/education", icon: <Star size={18} />, label: "Education" },
    { to: "/admin/profile", icon: <User size={18} />, label: "Profile" },
    { to: "/admin/settings", icon: <Settings size={18} />, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex font-['Plus_Jakarta_Sans']">
      {/* Sidebar */}
      <aside className="w-72 bg-[#080808] border-r border-white/5 p-8 flex flex-col fixed h-full z-20">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4B0082] to-[#FF69B4] flex items-center justify-center text-white font-black text-lg shadow-[0_0_20px_rgba(255,105,180,0.3)]">J</div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tighter uppercase leading-none italic">Jasmin</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Admin HQ v2.0</span>
          </div>
        </div>

        <nav className="flex-grow space-y-2">
          {sidebarLinks.map((link) => (
            <SidebarLink 
              key={link.to}
              to={link.to} 
              icon={link.icon} 
              active={location.pathname === link.to}
              label={link.label} 
            />
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 text-gray-500 hover:text-[#FF69B4] transition-all px-4 py-4 mt-auto font-black uppercase tracking-widest text-[10px] group"
        >
          <div className="p-2 bg-white/5 rounded-lg group-hover:bg-[#FF69B4]/10 transition-colors">
            <LogOut size={18} />
          </div>
          <span>Secure Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-grow ml-72 p-12 pb-24 bg-[#050505]">
        <header className="flex justify-between items-end mb-16 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">
               {sidebarLinks.find(l => l.to === location.pathname)?.label || "Dashboard"}
            </h1>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">Operational Command Center</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-gray-800 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                  </div>
                ))}
             </div>
             <Link to="/" className="w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-[#FF69B4] transition-all hover:scale-110 shadow-xl">
               <ExternalLink size={20} />
             </Link>
          </div>
        </header>

        <Routes>
          <Route path="projects" element={<ManageProjects />} />
          <Route path="services" element={<ManageServices />} />
          <Route path="skills" element={<ManageSkills />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="profile" element={<ManageProfile />} />
          <Route path="experience" element={<ManageExperience />} />
          <Route path="education" element={<ManageEducation />} />
          <Route path="*" element={<ManageProjects />} />
        </Routes>
      </main>
    </div>
  );
};

const SidebarLink: React.FC<{ to: string, icon: any, label: string, active: boolean }> = ({ to, icon, label, active }) => (
  <Link 
    to={to} 
    className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative ${
      active 
        ? 'bg-[#4B0082] text-white shadow-[0_10px_30px_rgba(75,0,130,0.3)] scale-[1.02] border border-white/10' 
        : 'text-gray-500 hover:text-white hover:bg-white/5'
    }`}
  >
    <div className={`${active ? 'text-white' : 'text-gray-500 group-hover:text-[#FF69B4]'} transition-colors`}>
      {icon}
    </div>
    <span className="font-black uppercase tracking-widest text-[11px] italic">{label}</span>
    {active && (
      <motion.div 
        layoutId="sidebarActive"
        className="absolute right-4 w-1.5 h-1.5 bg-[#FF69B4] rounded-full shadow-[0_0_10px_#FF69B4]" 
      />
    )}
  </Link>
);

const Overview = () => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <StatCard label="Live Projects" value="84" sub="+12 this month" icon={<FolderCode className="text-[#FF69B4]" />} />
      <StatCard label="Revenue" value="$12.4k" sub="30% growth" icon={<CreditCard className="text-[#4B0082]" />} />
      <StatCard label="Team Members" value="08" sub="High performance" icon={<Users className="text-blue-500" />} />
      <StatCard label="Efficiency" value="98%" sub="Optimized stack" icon={<CheckCircle2 className="text-green-500" />} />
    </div>

    <div className="glass p-12 rounded-[40px] border border-white/5 relative overflow-hidden">
       <div className="absolute top-0 right-0 w-96 h-96 bg-[#4B0082]/10 blur-[100px] pointer-events-none"></div>
       <div className="relative z-10">
         <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic">Quick Operations</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <QuickAction to="/admin/projects" icon={<Plus />} label="Deploy New Project" />
           <QuickAction to="/admin/services" icon={<Monitor />} label="Scale Services" />
           <QuickAction to="/admin/profile" icon={<User />} label="Update Bio" />
         </div>
       </div>
    </div>
  </div>
);

const StatCard = ({ label, value, sub, icon }: any) => (
  <div className="glass p-8 rounded-[32px] border border-white/5 hover:border-[#FF69B4]/20 transition-all group">
    <div className="flex justify-between items-start mb-6">
      <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
    </div>
    <h4 className="text-4xl font-black tracking-tighter italic">{value}</h4>
    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-2">{sub}</p>
  </div>
);

const QuickAction = ({ to, icon, label }: any) => (
  <Link to={to} className="flex flex-col items-center justify-center p-10 bg-white/5 hover:bg-[#FF69B4]/10 rounded-3xl border border-white/5 transition-all group hover:-translate-y-2">
    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#FF69B4] group-hover:text-white transition-all shadow-xl">
      {icon}
    </div>
    <span className="font-black uppercase tracking-widest text-[10px] italic">{label}</span>
  </Link>
);

const ManageProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    tags: [],
    image: '',
    liveLink: '',
    assignTo: 'Current Admin',
    type: 'Solo',
    status: 'Todo',
    orderId: '',
    clientName: '',
    profileName: '',
    achievementValue: 0,
    totalProjectValue: 0,
    developerName: '',
    docLink: ''
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData._id ? 'PUT' : 'POST';
    const url = formData._id ? `/api/projects/${formData._id}` : '/api/projects';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    setFormData({ title: '', description: '', tags: [], image: '', liveLink: '' });
    setIsAdding(false);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Initiate project deletion sequence?')) {
      await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      fetchProjects();
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Project Registry</h2>
        <button 
          onClick={() => { setIsAdding(!isAdding); setFormData({ assignTo: 'Current Admin', type: 'Solo', status: 'Todo' }); }}
          className="bg-gradient-to-r from-[#4B0082] to-[#FF69B4] px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-[0_10px_40px_rgba(255,105,180,0.3)] hover:scale-105 transition-all"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          {isAdding ? 'Abort Entry' : 'Add New Project'}
        </button>
      </div>

      <AnimatePresence mode="wait">
      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          exit={{ opacity: 0, height: 0 }}
          className="bg-[#0A0A0A] p-12 rounded-[40px] border border-white/5 shadow-2xl"
        >
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-3">
               <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Add New Project</h3>
            </div>

            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Project Title</label>
               <input 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none transition-all font-bold text-sm" 
                placeholder="e.g. Nexus Dashboard" 
                required
               />
            </div>
            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Assign To Member</label>
               <select 
                value={formData.assignTo}
                onChange={e => setFormData({...formData, assignTo: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold appearance-none cursor-pointer"
               >
                 <option>Current Admin</option>
                 <option>Lead Developer</option>
                 <option>Team Alpha</option>
               </select>
            </div>
            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Type</label>
               <select 
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold appearance-none cursor-pointer"
               >
                 <option>Solo</option>
                 <option>Collaborative</option>
                 <option>Outsourced</option>
               </select>
            </div>

            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Project Status</label>
               <select 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold appearance-none cursor-pointer"
               >
                 <option>Todo</option>
                 <option>In Progress</option>
                 <option>Completed</option>
                 <option>Review</option>
               </select>
            </div>
            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Order ID</label>
               <input 
                value={formData.orderId}
                onChange={e => setFormData({...formData, orderId: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="ORD-123"
               />
            </div>
            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Client Name</label>
               <input 
                value={formData.clientName}
                onChange={e => setFormData({...formData, clientName: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="John Doe"
               />
            </div>

            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Profile Name</label>
               <input 
                value={formData.profileName}
                onChange={e => setFormData({...formData, profileName: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="Fiverr / Upwork"
               />
            </div>
            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">My Achievement Value ($)</label>
               <input 
                type="number"
                value={formData.achievementValue}
                onChange={e => setFormData({...formData, achievementValue: Number(e.target.value)})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="500"
               />
            </div>
            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Total Project Value ($)</label>
               <input 
                type="number"
                value={formData.totalProjectValue}
                onChange={e => setFormData({...formData, totalProjectValue: Number(e.target.value)})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="1000"
               />
            </div>

            <div>
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Tech Stack (comma separated)</label>
               <input 
                value={formData.tags?.join(', ')}
                onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim())})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="React, Node, MongoDB"
               />
            </div>
            <div className="md:col-span-2">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Developer Name</label>
               <input 
                value={formData.developerName}
                onChange={e => setFormData({...formData, developerName: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="e.g. John Doe / Admin"
               />
            </div>

            <div className="md:col-span-3">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Sheet / Document Link</label>
               <input 
                value={formData.docLink}
                onChange={e => setFormData({...formData, docLink: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="https://docs.google.com/..."
               />
            </div>

            <div className="md:col-span-3">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Project Image</label>
               <div className="p-12 bg-[#111]/50 rounded-[32px] border border-white/5 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:bg-white/[0.02] transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                    <ImageIcon className="text-gray-600 group-hover:text-[#FF69B4]" size={28} />
                  </div>
                  <div className="flex flex-col items-center">
                    <button type="button" className="bg-[#4B0082]/30 text-[#FF69B4] px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-[#FF69B4]/20 hover:bg-[#FF69B4] hover:text-white transition-all">
                      <Plus size={16} /> Choose Local Device
                    </button>
                    <span className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] mt-4 italic">JPG, PNG or WEBP. Max 5MB.</span>
                  </div>
               </div>
               <input 
                value={formData.image}
                onChange={e => setFormData({...formData, image: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-4 rounded-xl mt-4 focus:border-[#FF69B4] outline-none text-xs"
                placeholder="Or paste image URL directly..."
               />
            </div>

            <div className="md:col-span-3">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Live Link</label>
               <input 
                value={formData.liveLink}
                onChange={e => setFormData({...formData, liveLink: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold"
                placeholder="https://..."
               />
            </div>

            <div className="md:col-span-3">
               <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Description</label>
               <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full bg-[#111] border border-white/10 p-8 rounded-[32px] focus:border-[#FF69B4] outline-none text-sm font-bold h-48 resize-none"
                placeholder="Describe the project masterpiece..."
               ></textarea>
            </div>

            <div className="md:col-span-3 flex justify-end gap-6 pt-6">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Discard
              </button>
              <button 
                type="submit"
                className="bg-white text-black px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#FF69B4] hover:text-white transition-all shadow-xl"
              >
                Execute & Save
              </button>
            </div>
          </form>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="col-span-2 py-32 text-center text-gray-500 font-black uppercase tracking-[0.5em] animate-pulse italic">Scanning Database...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-2 text-center py-40 glass rounded-[40px] border border-dashed border-white/10">
             <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
                <FolderCode className="text-gray-600" size={32} />
             </div>
             <h3 className="text-xl font-black uppercase italic tracking-tighter text-gray-400">Registry Is Empty</h3>
             <p className="text-gray-600 text-[10px] font-bold uppercase tracking-widest mt-4">Initiate first project entry to begin tracking.</p>
          </div>
        ) : projects.map((p: any) => (
          <motion.div 
            key={p._id} 
            layout
            className="glass p-8 rounded-[40px] border border-white/5 flex gap-8 items-center group relative hover:border-[#FF69B4]/30 transition-all duration-500"
          >
            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-white/5 shrink-0 border border-white/5">
              <img src={p.image} alt={p.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="flex-grow min-w-0">
               <div className="flex items-center gap-3 mb-2">
                 <span className={`w-2 h-2 rounded-full ${p.status === 'Completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]'}`}></span>
                 <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest italic">{p.status}</span>
               </div>
               <h4 className="text-2xl font-black italic tracking-tighter truncate group-hover:text-[#FF69B4] transition-colors">{p.title}</h4>
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Client: {p.clientName || 'Private'}</p>
               <div className="flex gap-2 mt-4 overflow-hidden">
                 {p.tags?.slice(0, 3).map((t: string, i: number) => (
                   <span key={i} className="text-[8px] font-black uppercase text-[#FF69B4] bg-[#FF69B4]/5 px-2 py-1 border border-[#FF69B4]/10">{t}</span>
                 ))}
               </div>
            </div>
            <div className="flex flex-col gap-3">
               <button 
                onClick={() => { setFormData(p); setIsAdding(true); }}
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-[#4B0082] hover:text-white transition-all shadow-lg"
               >
                 <Settings size={18} />
               </button>
               <button 
                onClick={() => handleDelete(p._id)}
                className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-600 hover:text-white transition-all shadow-lg"
               >
                 <Trash2 size={18} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ManageServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({ title: '', desc: '', icon: '' });

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    const data = await res.json();
    setServices(data);
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData._id ? 'PUT' : 'POST';
    const url = formData._id ? `/api/services/${formData._id}` : '/api/services';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setFormData({ title: '', desc: '', icon: '' });
    setIsAdding(false);
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete service offering?')) {
      await fetch(`/api/services/${id}`, { method: 'DELETE' });
      fetchServices();
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white">Dynamic Services</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-[#4B0082] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 shadow-xl hover:bg-[#FF69B4] transition-all"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          New Offering
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[40px] border border-white/5 max-w-2xl mx-auto">
          <form onSubmit={handleSave} className="space-y-8">
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Service Title</label>
              <input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. Enterprise WP Architect" required />
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Emoji Icon</label>
                <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-2xl text-center" placeholder="🚀" required />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Description</label>
              <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold h-32" required placeholder="Describe the service value proposition..."></textarea>
            </div>
            <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FF69B4] hover:text-white transition-all">Save Service Offering</button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {services.map(s => (
          <div key={s._id} className="glass p-10 rounded-[40px] border border-white/5 group relative overflow-hidden transition-all hover:bg-white/[0.02]">
            <div className="text-5xl mb-8 group-hover:scale-125 transition-transform duration-500">{s.icon}</div>
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-4">{s.title}</h3>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed mb-10">{s.desc}</p>
            <div className="flex gap-4">
              <button onClick={() => { setFormData(s); setIsAdding(true); }} className="text-[#FF69B4] font-black text-[10px] uppercase tracking-widest underline decoration-[#FF69B4]/30 hover:text-white transition-colors">Edit</button>
              <button onClick={() => handleDelete(s._id!)} className="text-red-500 font-black text-[10px] uppercase tracking-widest underline decoration-red-500/30 hover:text-white transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageSkills = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Skill>>({ name: '', level: 90, category: 'Frontend', logoLink: '' });

  const fetchSkills = async () => {
    const res = await fetch('/api/skills');
    const data = await res.json();
    setSkills(data);
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData._id ? 'PUT' : 'POST';
    const url = formData._id ? `/api/skills/${formData._id}` : '/api/skills';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setFormData({ name: '', level: 90, category: 'Frontend', logoLink: '' });
    setIsAdding(false);
    fetchSkills();
  };

  return (
    <div className="space-y-12">
       <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Technical Stack</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">
           New Skill
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-12 rounded-[40px] border border-white/5 max-w-xl mx-auto">
          <form onSubmit={handleSave} className="space-y-8">
             <div className="grid grid-cols-2 gap-8">
               <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Skill Name</label>
                  <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. React Native" required />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Proficiency (%)</label>
                  <input type="number" value={formData.level} onChange={e => setFormData({...formData, level: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" required />
               </div>
               <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Category</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-[#111] border border-white/10 p-5 rounded-2xl text-sm font-bold appearance-none">
                     <option>Frontend</option>
                     <option>Backend</option>
                     <option>WordPress</option>
                     <option>DevOps</option>
                  </select>
               </div>
               <div className="col-span-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Logo Image URL</label>
                  <input value={formData.logoLink} onChange={e => setFormData({...formData, logoLink: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-[10px]" placeholder="https://..." />
               </div>
             </div>
             <button type="submit" className="w-full bg-gradient-to-r from-[#4B0082] to-[#FF69B4] text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Inject Skill Data</button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {skills.map(skill => (
          <div key={skill._id} className="glass p-8 rounded-[32px] border border-white/5 flex flex-col items-center group relative">
            <div className="w-16 h-16 rounded-2xl bg-white/5 p-4 mb-6 group-hover:scale-110 transition-transform">
               {skill.logoLink ? <img src={skill.logoLink} alt={skill.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0" /> : <Monitor size={32} className="text-gray-600" />}
            </div>
            <h4 className="text-sm font-black uppercase tracking-widest text-white mb-2 italic">{skill.name}</h4>
            <div className="flex items-center gap-2">
               <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF69B4]" style={{ width: `${skill.level}%` }}></div>
               </div>
               <span className="text-[9px] font-black text-[#FF69B4]">{skill.level}%</span>
            </div>
            <button onClick={async () => { await fetch(`/api/skills/${skill._id}`, { method: 'DELETE' }); fetchSkills(); }} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-all">
               <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<Review>>({ clientName: '', description: '', rating: 5 });

  const fetchReviews = async () => {
    const res = await fetch('/api/reviews');
    const data = await res.json();
    setReviews(data);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setFormData({ clientName: '', description: '', rating: 5 });
    setIsAdding(false);
    fetchReviews();
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Client Testimonials</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-[#FF69B4] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl">
           Add Feedback
        </button>
      </div>

      {isAdding && (
         <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[40px] border border-white/5 max-w-xl mx-auto">
           <form onSubmit={handleSave} className="space-y-8">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Client Name</label>
                <input value={formData.clientName} onChange={e => setFormData({...formData, clientName: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none font-bold text-sm" placeholder="e.g. Sarah Jenkins" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Star Rating (1-5)</label>
                <input type="number" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none font-black text-xl text-center text-yellow-500" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Testimonial</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none font-bold text-sm h-32 resize-none" required placeholder="Share the client's experience..."></textarea>
              </div>
              <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs">Verify & Post Review</button>
           </form>
         </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {reviews.map(r => (
          <div key={r._id} className="glass p-10 rounded-[40px] border border-white/5 group relative">
             <div className="flex gap-1 mb-6">
                {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />)}
             </div>
             <p className="text-gray-400 italic text-sm leading-relaxed mb-8">"{r.description}"</p>
             <h4 className="text-lg font-black uppercase italic tracking-tighter text-[#FF69B4]">{r.clientName}</h4>
             <button onClick={async () => { await fetch(`/api/reviews/${r._id}`, { method: 'DELETE' }); fetchReviews(); }} className="absolute top-10 right-10 text-gray-600 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageProfile = () => {
  const [formData, setFormData] = useState<AdminProfile>({
    image: '',
    bio: '',
    socialLinks: { linkedin: '', github: '', facebook: '', whatsapp: '', messenger: '' }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/profile').then(res => res.json()).then(data => {
      if (data && data.socialLinks) setFormData(data);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setSaving(false);
    alert('Global Identity Synced.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
       <div className="flex justify-between items-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter italic">Identity Management</h2>
       </div>

       <div className="glass p-12 rounded-[40px] border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full tech-grid opacity-5 pointer-events-none"></div>
          <form onSubmit={handleSave} className="space-y-10 relative z-10">
             <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="w-48 h-48 rounded-[40px] bg-white/5 border-2 border-dashed border-white/20 flex flex-col items-center justify-center group cursor-pointer shrink-0 relative overflow-hidden">
                   {formData.image ? (
                     <img src={formData.image} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                     <>
                        <ImageIcon size={40} className="text-gray-600 group-hover:text-[#FF69B4] transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-widest mt-4 text-gray-500 italic">Avatar Link</span>
                     </>
                   )}
                </div>
                <div className="flex-grow space-y-6 w-full">
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Profile Image URL</label>
                      <input value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-xs" placeholder="https://..." />
                   </div>
                   <div>
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Global Bio / Signature</label>
                      <textarea value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold h-32 resize-none" placeholder="Master architectural strategist..."></textarea>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-[#FF69B4] italic">Secure Social Protocol</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {[
                     { id: 'linkedin', icon: <LinkIcon size={18} />, label: 'LinkedIn Professional' },
                     { id: 'github', icon: <LinkIcon size={18} />, label: 'GitHub Repository' },
                     { id: 'whatsapp', icon: <LinkIcon size={18} />, label: 'WhatsApp direct' },
                     { id: 'messenger', icon: <LinkIcon size={18} />, label: 'Messenger Tunnel' }
                   ].map(social => (
                     <div key={social.id}>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">{social.label}</label>
                        <div className="flex gap-4">
                           <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-gray-500">
                              {social.icon}
                           </div>
                           <input 
                            value={(formData.socialLinks as any)[social.id]} 
                            onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, [social.id]: e.target.value}})}
                            className="flex-grow bg-white/5 border border-white/10 p-4 rounded-xl focus:border-[#FF69B4] outline-none text-xs font-bold" 
                            placeholder="https://..." 
                           />
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <button type="submit" disabled={saving} className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] hover:bg-[#FF69B4] hover:text-white transition-all shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               {saving ? 'Syncing...' : 'Update Global Identity'}
             </button>
          </form>
       </div>
    </div>
  );
};

const ManageExperience = () => {
  const [experience, setExperience] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({ role: '', company: '', period: '', desc: '', companyLink: '' });

  const fetchExperience = async () => {
    const res = await fetch('/api/experience');
    const data = await res.json();
    setExperience(data);
  };

  useEffect(() => { fetchExperience(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData._id ? 'PUT' : 'POST';
    const url = formData._id ? `/api/experience/${formData._id}` : '/api/experience';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setFormData({ role: '', company: '', period: '', desc: '', companyLink: '' });
    setIsAdding(false);
    fetchExperience();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete experience entry?')) {
      await fetch(`/api/experience/${id}`, { method: 'DELETE' });
      fetchExperience();
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Professional History</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-[#4B0082] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#FF69B4] transition-all">
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          Add Entry
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[40px] border border-white/5 max-w-2xl mx-auto">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Job Role</label>
                <input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. Senior MERN Developer" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Company Name</label>
                <input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. Tech Solutions" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Period</label>
                <input value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. 2022 - Present" required />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Company Link (Optional)</label>
                <input value={formData.companyLink} onChange={e => setFormData({...formData, companyLink: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-[10px]" placeholder="https://..." />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Description</label>
              <textarea value={formData.desc} onChange={e => setFormData({...formData, desc: e.target.value})} className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold h-32 resize-none" placeholder="Describe your impact and achievements..."></textarea>
            </div>
            <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FF69B4] hover:text-white transition-all">Save History Entry</button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {experience.map(exp => (
          <div key={exp._id} className="glass p-10 rounded-[40px] border border-white/5 flex gap-8 items-center group relative">
            <div className="flex-grow">
               <span className="text-[#FF69B4] font-black text-[9px] uppercase tracking-[0.2em]">{exp.period}</span>
               <h4 className="text-2xl font-black italic tracking-tighter mt-1 group-hover:text-[#FF69B4] transition-colors">{exp.role}</h4>
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">{exp.company}</p>
               <p className="text-gray-400 text-xs mt-4 leading-relaxed line-clamp-2 max-w-3xl italic">{exp.desc}</p>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={() => { setFormData(exp); setIsAdding(true); }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-[#4B0082] hover:text-white transition-all">
                  <Settings size={18} />
               </button>
               <button onClick={() => handleDelete(exp._id)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ManageEducation = () => {
  const [education, setEducation] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<any>({ degree: '', institution: '', period: '', icon: '🎓' });

  const fetchEducation = async () => {
    const res = await fetch('/api/education');
    const data = await res.json();
    setEducation(data);
  };

  useEffect(() => { fetchEducation(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = formData._id ? 'PUT' : 'POST';
    const url = formData._id ? `/api/education/${formData._id}` : '/api/education';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    setFormData({ degree: '', institution: '', period: '', icon: '🎓' });
    setIsAdding(false);
    fetchEducation();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete education record?')) {
      await fetch(`/api/education/${id}`, { method: 'DELETE' });
      fetchEducation();
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Academic Records</h2>
        <button onClick={() => setIsAdding(!isAdding)} className="bg-[#4B0082] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-[#FF69B4] transition-all">
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          New Record
        </button>
      </div>

      {isAdding && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-12 rounded-[40px] border border-white/5 max-w-2xl mx-auto">
          <form onSubmit={handleSave} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Degree / Certification</label>
                <input value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. B.Sc in Computer Science" required />
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Institution</label>
                <input value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. Dhaka University" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Period</label>
                <input value={formData.period} onChange={e => setFormData({...formData, period: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-sm font-bold" placeholder="e.g. 2018 - 2022" required />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 block italic">Emoji Icon</label>
                <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:border-[#FF69B4] outline-none text-2xl text-center" placeholder="🎓" />
              </div>
            </div>
            <button type="submit" className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#FF69B4] hover:text-white transition-all">Save Academic Entry</button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {education.map(edu => (
          <div key={edu._id} className="glass p-10 rounded-[40px] border border-white/5 flex gap-8 items-center group relative">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shrink-0">
               {edu.icon || '🎓'}
            </div>
            <div className="flex-grow">
               <span className="text-[#FF69B4] font-black text-[9px] uppercase tracking-[0.2em]">{edu.period}</span>
               <h4 className="text-xl font-black italic tracking-tighter mt-1 group-hover:text-[#FF69B4] transition-colors">{edu.degree}</h4>
               <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mt-1 italic">{edu.institution}</p>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={() => { setFormData(edu); setIsAdding(true); }} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-[#4B0082] hover:text-white transition-all">
                  <Settings size={18} />
               </button>
               <button onClick={() => handleDelete(edu._id)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 hover:bg-red-600 hover:text-white transition-all">
                  <Trash2 size={18} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;

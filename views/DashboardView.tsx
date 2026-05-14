
import React, { useState } from 'react';
import { 
  Play,
  Users,
  BrainCircuit,
  Layout,
  MessageSquareQuote,
  Camera,
  Rocket,
  Type,
  Video,
  Eye,
  Plus,
  BarChart3,
  MoreHorizontal,
  ShoppingBag
} from 'lucide-react';
import { AppView } from '../types';

const toolsList: { id: string; title: string; category: string; status: string; icon: any; color: string; bg: string; viewId: AppView }[] = [
  { id: '01', title: 'Strategi Iklan AI', category: 'Planning', status: 'Updated', icon: BrainCircuit, color: 'text-primary', bg: 'bg-primary/10', viewId: 'strategist' },
  { id: '02', title: 'Pembuat Landing Page', category: 'Web Design', status: 'Popular', icon: Layout, color: 'text-accent', bg: 'bg-accent/10', viewId: 'landing' },
  { id: '03', title: 'Generator Testimoni', category: 'Text Generation', status: 'Active', icon: MessageSquareQuote, color: 'text-primary', bg: 'bg-primary/10', viewId: 'testimonial' },
  { id: '04', title: 'Foto Produk Estetik', category: 'Image Generation', status: 'Pro', icon: Camera, color: 'text-primary', bg: 'bg-primary/10', viewId: 'product_photo' },
  { id: '05', title: 'Pembuat Gambar Iklan', category: 'Image & Copy', status: 'Updated', icon: Rocket, color: 'text-accent', bg: 'bg-accent/10', viewId: 'content' },
  { id: '06', title: 'Penulis Konten AI', category: 'Text Generation', status: 'Popular', icon: Type, color: 'text-primary', bg: 'bg-primary/10', viewId: 'copywriter' },
  { id: '07', title: 'Desain Visi Sinematik', category: 'Image Analysis', status: 'New', icon: Eye, color: 'text-primary', bg: 'bg-primary/10', viewId: 'vision' },
  { id: '08', title: 'Pusat Konten UGC', category: 'Video Generation', status: 'Trending', icon: Users, color: 'text-primary', bg: 'bg-primary/10', viewId: 'ugc' },
  { id: '09', title: 'Pusat Affiliate', category: 'Affiliate Marketing', status: 'New', icon: ShoppingBag, color: 'text-accent', bg: 'bg-accent/10', viewId: 'affiliate' },
];

const recentList: { title: string; subtitle: string; time: string; icon: any; color: string; bg: string; viewId: AppView }[] = [
  { title: 'Viral Hook...', subtitle: 'Copywriter', time: '4 min ago', icon: Type, color: 'text-primary', bg: 'bg-primary/10', viewId: 'copywriter' },
  { title: 'Coffee A...', subtitle: 'Content Forge', time: '20 min ago', icon: Eye, color: 'text-accent', bg: 'bg-accent/10', viewId: 'content' },
  { title: 'Q1 Perform...', subtitle: 'Ad Analyzer', time: '2 hr ago', icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10', viewId: 'analytics' },
  { title: 'UGC Storyb...', subtitle: 'UGC Hub', time: '3 hr ago', icon: Users, color: 'text-accent', bg: 'bg-accent/10', viewId: 'ugc' },
];

const DashboardView: React.FC<{ onNavigate: (view: AppView) => void }> = ({ onNavigate }) => {
  const [showTrendingMenu, setShowTrendingMenu] = useState(false);

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-in fade-in duration-700 h-full">
      
      {/* Left Column (Main Content) */}
      <div className="flex-1 min-w-0 flex flex-col gap-8">
        
        {/* Header Titles */}
        <div className="flex items-end justify-between relative">
          <div>
            <p className="text-slate-400 text-sm mb-1 font-medium">What's hot</p>
            <h1 className="text-4xl font-bold text-white tracking-tight">Trending</h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowTrendingMenu(!showTrendingMenu)}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showTrendingMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setShowTrendingMenu(false)}>Refresh Trends</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setShowTrendingMenu(false)}>Customize View</button>
                <button className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors" onClick={() => setShowTrendingMenu(false)}>Share Dashboard</button>
              </div>
            )}
          </div>
        </div>

        {/* Trending Banner */}
        <div className="relative rounded-[2rem] p-8 sm:p-10 overflow-hidden shadow-2xl bg-[#0f172a] border border-white/5 group">
          {/* Background Gradient Mesh */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/10" />
          <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-gradient-to-l from-primary/10 to-transparent" />
          
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[260px]">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] font-display">
                  Platform v4.0 Active
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] font-black uppercase tracking-[0.2em] font-display">
                  Premium Ecosystem
                </div>
              </div>
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.5em] mb-4 drop-shadow-md font-display">
                ALADZAN CORPORA | ALCO CREATIVE
              </p>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-[0.95] max-w-2xl tracking-tighter drop-shadow-lg font-display uppercase italic">
                Build Faster.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Scale Smarter.</span>
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-10 gap-8">
              <div className="flex flex-wrap items-center gap-4">
                <button 
                  onClick={() => onNavigate('strategist')}
                  className="bg-primary text-white hover:bg-primary/80 px-10 py-5 rounded-2xl font-black flex items-center gap-3 transition-all shadow-2xl shadow-primary/30 font-display text-sm uppercase tracking-widest group/btn"
                >
                  <Play className="w-5 h-5 fill-white group-hover/btn:scale-110 transition-transform" />
                  Launch Alco Studio
                </button>
                <button 
                  onClick={() => window.open('https://aladzancorpora.com', '_blank')}
                  className="bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 text-white px-10 py-5 rounded-2xl font-black transition-all font-display text-sm uppercase tracking-widest"
                >
                  Enterprise Details
                </button>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-white/40 text-[10px] mb-2 font-black uppercase tracking-[0.3em]">Institutional Users</p>
                <div className="flex items-center gap-3 text-white font-black text-4xl drop-shadow-sm font-display italic">
                  <Users className="w-7 h-7 text-primary" />
                  124,512+
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Tools Section */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-white tracking-tighter font-display uppercase italic">AI Tools Suite</h2>
            <button className="text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-[0.2em] font-display">View All Solutions</button>
          </div>

          <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex-1 shadow-2xl">
            <div className="overflow-x-auto h-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest w-16">#</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">TITLE</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">CATEGORY</th>
                    <th className="py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-widest">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {toolsList.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <tr 
                        key={tool.id} 
                        onClick={() => onNavigate(tool.viewId)}
                        className="group hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <td className="py-4 px-6 text-sm font-medium text-slate-500">{tool.id}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform`}>
                              <Icon className={`w-5 h-5 ${tool.color}`} />
                            </div>
                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors">{tool.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm font-medium text-slate-400">{tool.category}</td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/5 text-slate-300 border border-white/10 group-hover:bg-white/10 transition-colors">
                            {tool.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column (Sidebar) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-8 xl:border-l xl:border-white/5 xl:pl-8">
        
        {/* Tags */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white tracking-tighter font-display">Tags</h3>
            <button className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['AI Content', 'Ad Strategy', 'Visuals', 'E-commerce', 'Automation', 'Sales Funnel', 'Market Analysis'].map(tag => (
              <button 
                key={tag}
                className="px-4 py-2 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-xl text-slate-300 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all hover:scale-105 shadow-lg font-display"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Recent */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-white tracking-tighter font-display uppercase">Recent activity</h3>
            <button className="text-xs font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest font-display">History</button>
          </div>
          
          <div className="flex flex-col gap-3">
            {recentList.map((item, index) => {
              const Icon = item.icon;
              return (
                <div 
                  key={index}
                  onClick={() => onNavigate(item.viewId)}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer group hover:scale-[1.02] shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0 border border-white/5 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-200 group-hover:text-white truncate transition-colors">{item.title}</h4>
                    <p className="text-xs font-medium text-slate-500 truncate">{item.subtitle}</p>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Promo Card */}
        <div 
          className="relative rounded-3xl overflow-hidden h-48 mt-auto group cursor-pointer border border-white/10"
          onClick={() => onNavigate('studio_ai')}
        >
          {/* Abstract Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-slate-900 to-accent opacity-90 group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_50%)] mix-blend-overlay" />
          
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white leading-tight mb-1 drop-shadow-md font-display uppercase italic">Alco Creative<br/>System</h3>
                <p className="text-[10px] font-black text-white/90 uppercase tracking-[0.2em] drop-shadow-md font-display">Premium AI Workflow</p>
              </div>
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-primary transition-colors shrink-0 border border-white/30 shadow-xl group-hover:rotate-45 duration-300">
                <Rocket className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DashboardView;

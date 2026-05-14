import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  AlertCircle, 
  Loader2, 
  Upload, 
  FileText, 
  X, 
  Activity, 
  CheckCircle2, 
  Target, 
  TrendingUp, 
  Lightbulb, 
  Search, 
  BookOpen, 
  FileStack, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Play,
  Calendar,
  BarChart4,
  Clock,
  Send,
  User as UserIcon,
  Bot,
  Download
} from 'lucide-react';
import { analyzePerformance, chatWithAnalyzer } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { downloadText } from '../utils/downloadUtils';

interface FunnelData {
  stage: string;
  actualRate: number;
  rawValue: number;
  rawLabel: string;
  benchmark: number;
  label: string;
  unit: string;
  status: 'Good' | 'Warning' | 'Bad';
  insight: string;
  actionRequired: string;
}

interface CampaignFileData {
  id: string;
  fileName: string;
  campaigns: any[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const ChatMessage: React.FC<{ msg: Message }> = ({ msg }) => {
  const isUser = msg.role === 'user';
  
  // Simple Markdown Parser to handle Bold and Bullet Points
  const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let formattedLine = line;
      
      // Handle Bold **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(formattedLine)) !== null) {
        parts.push(formattedLine.substring(lastIndex, match.index));
        parts.push(<strong key={`${i}-${match.index}`} className="font-black text-[#f97316]">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      parts.push(formattedLine.substring(lastIndex));

      // Handle Bullet Points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <div key={i} className="flex gap-3 mb-2 animate-in slide-in-from-left-2 duration-300">
             <span className="text-[#f97316] font-bold">•</span>
             <span className="flex-1">{parts.length > 0 ? parts : line.replace(/^[•\-*]\s*/, '')}</span>
          </div>
        );
      }
      
      return (
        <p key={i} className={`${line.trim() === '' ? 'h-4' : 'mb-3'}`}>
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
      <div className={`max-w-[85%] flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isUser ? 'bg-[#f97316]' : 'bg-white/[0.03] border border-white/10'}`}>
          {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-[#f97316]" />}
        </div>
        <div className={`p-7 rounded-[2.5rem] text-[15px] font-medium leading-relaxed shadow-xl border ${
          isUser 
          ? 'bg-[#f97316] text-white border-[#f97316] rounded-tr-none text-right' 
          : 'bg-white/[0.03] text-slate-200 border-white/10 rounded-tl-none text-left'
        }`}>
          {formatContent(msg.content)}
        </div>
      </div>
    </div>
  );
};

const AdAnalyzer: React.FC = () => {
  const { t } = useLanguage();
  const [filesData, setFilesData] = usePersistentState<CampaignFileData[]>('ad_analyzer_files', []);
  const [recommendations, setRecommendations] = usePersistentState<any[]>('ad_analyzer_recs', []);
  const [analyzing, setAnalyzing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = usePersistentState<Message[]>('ad_analyzer_chat', []);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => new Intl.NumberFormat('id-ID').format(num);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const calculateFunnel = (c: any): FunnelData[] => {
    const ctr = (c.clicks / c.impressions) * 100 || 0;
    const clickToLpv = (c.lpv / c.clicks) * 100 || 0;
    const lpvToAtc = (c.atc / c.lpv) * 100 || 0;
    const atcToIc = (c.ic / c.atc) * 100 || 0;
    const icToPurchase = (c.purchase / c.ic) * 100 || 0;

    return [
      { 
        stage: 'Daya Tarik Kreatif', 
        actualRate: ctr,
        rawValue: c.clicks || 0,
        rawLabel: 'Klik Link',
        benchmark: 2.0, 
        label: 'CTR', 
        unit: '%',
        status: ctr >= 2 ? 'Good' : (ctr < 1.2 ? 'Bad' : 'Warning'),
        insight: ctr < 1.2 ? 'Konten visual Anda membosankan atau salah target.' : 'Cukup baik, tapi audiens belum merasa "harus klik".',
        actionRequired: 'Ganti Thumbnail / Hook 3 detik pertama.'
      },
      { 
        stage: 'Kesehatan Landing Page', 
        actualRate: clickToLpv,
        rawValue: c.lpv || 0,
        rawLabel: 'Views Halaman',
        benchmark: 75, 
        label: 'LP PERSISTENCE', 
        unit: '%',
        status: clickToLpv >= 75 ? 'Good' : 'Bad',
        insight: clickToLpv < 75 ? 'Website Anda terlalu berat atau lambat loading.' : 'Bagus, orang mau menunggu website Anda terbuka.',
        actionRequired: 'Kompres ukuran gambar di LP atau cek hosting.'
      },
      { 
        stage: 'Hasrat Membeli (Interest)', 
        actualRate: lpvToAtc,
        rawValue: c.atc || 0,
        rawLabel: 'Add To Cart',
        benchmark: 15, 
        label: 'ATC RATE', 
        unit: '%',
        status: lpvToAtc >= 15 ? 'Good' : 'Warning',
        insight: lpvToAtc < 15 ? 'Copywriting atau harga Anda tidak meyakinkan.' : 'Penawaran Anda sudah mulai menarik minat.',
        actionRequired: 'Perkuat Social Proof (Testimoni) di Landing Page.'
      },
      { 
        stage: 'Efisiensi Checkout', 
        actualRate: icToPurchase,
        rawValue: c.purchase || 0,
        rawLabel: 'Penjualan',
        benchmark: 65, 
        label: 'PURCHASE RATE', 
        unit: '%',
        status: icToPurchase >= 65 ? 'Good' : (icToPurchase < 40 ? 'Bad' : 'Warning'),
        insight: icToPurchase < 40 ? 'Form checkout Anda ribet atau ongkir kemahalan.' : 'Sudah oke, tinggal tambah metode pembayaran.',
        actionRequired: 'Sederhanakan form atau berikan promo Gratis Ongkir.'
      },
    ];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          parseCSV(content, file.name);
        };
        reader.readAsText(file);
      });
    }
  };

  const parseCSV = (text: string, fileName: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const campaigns = lines.slice(1).filter(line => line.trim() !== '').map(line => {
      const values = line.split(',');
      const obj: any = { impressions: 0, clicks: 0, lpv: 0, atc: 0, ic: 0, purchase: 0, roas: 0, spend: 0, revenue: 0 };
      headers.forEach((header, i) => {
        const val = values[i]?.trim().replace(/[^\d.-]/g, '');
        if (header.match(/platform|campaign|nama/)) obj.name = values[i]?.trim();
        else if (header.match(/impression/)) obj.impressions = parseInt(val) || 0;
        else if (header.match(/click/)) obj.clicks = parseInt(val) || 0;
        else if (header.match(/lpv|view/)) obj.lpv = parseInt(val) || 0;
        else if (header.match(/atc|cart/)) obj.atc = parseInt(val) || 0;
        else if (header.match(/ic|checkout/)) obj.ic = parseInt(val) || 0;
        else if (header.match(/purchase|beli/)) obj.purchase = parseInt(val) || 0;
        else if (header.match(/spend|biaya|cost/)) obj.spend = parseFloat(val) || 0;
        else if (header.match(/revenue|pendapatan/)) obj.revenue = parseFloat(val) || 0;
      });
      if (!obj.roas && obj.spend > 0) obj.roas = obj.revenue / obj.spend;
      return obj;
    });

    setFilesData(prev => [
      ...prev, 
      { id: Date.now().toString() + Math.random(), fileName, campaigns }
    ]);
  };

  const removeFile = (id: string) => {
    setFilesData(prev => prev.filter(f => f.id !== id));
  };

  const handleAnalyze = async () => {
    if (filesData.length === 0) return alert('Upload minimal 1 file CSV.');
    setAnalyzing(true);
    setRecommendations([]);
    setMessages([]);
    try {
      const results = await analyzePerformance(filesData.map(f => ({ fileName: f.fileName, campaigns: f.campaigns })));
      setRecommendations(results);
      setMessages([{
        role: 'ai',
        content: `Halo! Analisis data iklan Anda dari **${filesData.length} file** telah selesai.\n\nSaya telah menemukan beberapa **pola krusial** yang bisa Anda optimalkan segera. Anda bisa meninjau kartu audit di atas, atau tanyakan detail spesifik pada saya di sini.\n\nContoh yang bisa Anda tanyakan:\n• "Kenapa CTR saya di Campaign A rendah?"\n• "Apakah budget di file kedua sudah efisien?"\n• "Bagaimana cara menaikkan ROAS saya?"`
      }]);
      setTimeout(() => document.getElementById('ai-audit')?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err) {
      alert('Analisis gagal, silakan coba lagi.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const context = filesData.flatMap(f => f.campaigns);
      const aiRes = await chatWithAnalyzer(context, userMsg, messages);
      setMessages(prev => [...prev, { role: 'ai', content: aiRes || 'Maaf, saya tidak dapat memproses pertanyaan itu.' }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: 'Terjadi kesalahan koneksi saat menghubungi pakar AI.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'UPSCALE': return <ArrowUpRight className="w-5 h-5 text-orange-400" />;
      case 'DOWNSCALE': return <ArrowDownRight className="w-5 h-5 text-amber-400" />;
      case 'KILL': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'CONTINUE': return <Play className="w-5 h-5 text-[#f97316]" />;
      default: return null;
    }
  };

  const getVerdictClass = (verdict: string) => {
    switch (verdict) {
      case 'UPSCALE': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'DOWNSCALE': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'KILL': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'CONTINUE': return 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20';
      default: return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12 animate-in fade-in duration-700 pb-32 px-4 sm:px-6 lg:px-8">
      {/* Banner Utama */}
      <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl lg:rounded-[2.5rem] p-6 sm:p-8 lg:p-10 flex flex-col md:flex-row items-center gap-8 lg:gap-10 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f97316]/20 to-transparent opacity-50" />
        <div className="absolute top-0 right-0 opacity-10"><FileStack className="w-48 h-48 lg:w-64 lg:h-64 text-[#f97316]" /></div>
        <div className="flex-1 space-y-4 relative z-10 text-left">
           <div className="inline-flex items-center gap-2 bg-[#f97316]/20 px-4 py-2 rounded-full text-[#f97316] text-[10px] lg:text-[11px] font-black uppercase tracking-widest border border-[#f97316]/30">
             <BarChart4 className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Strategic Intelligence Hub
           </div>
           <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight lg:leading-none">Pusat Diagnosis Iklan</h2>
           <p className="text-slate-300 text-base lg:text-lg font-medium leading-relaxed max-w-xl">
             Analisis satu hari atau bandingkan performa antar tanggal untuk keputusan taktis yang akurat. <strong className="text-[#f97316]">Upscale</strong> yang profit, <strong className="text-rose-400">Kill</strong> yang boncos.
           </p>
           
           {filesData.length > 0 && (
             <div className="flex flex-wrap gap-2 mt-4 lg:mt-6">
               {filesData.map((f) => (
                 <div key={f.id} className="bg-[#1a0b2e]/50 backdrop-blur-md px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl flex items-center gap-2 lg:gap-3 border border-white/10 group">
                    <FileText className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#f97316]" />
                    <span className="text-[10px] lg:text-[11px] font-black text-white truncate max-w-[100px] lg:max-w-[120px]">{f.fileName}</span>
                    <button onClick={() => removeFile(f.id)} className="text-slate-400 hover:text-rose-400 transition-colors">
                       <Trash2 className="w-3 h-3 lg:w-3.5 lg:h-3.5" />
                    </button>
                 </div>
               ))}
             </div>
           )}
        </div>
        <div className="w-full md:w-auto shrink-0 relative z-10 flex flex-col gap-3 lg:gap-4">
           <button onClick={() => fileInputRef.current?.click()} className="w-full md:w-auto bg-[#f97316] text-white px-8 lg:px-10 py-4 lg:py-5 rounded-2xl font-black text-lg lg:text-xl hover:bg-[#ea580c] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 lg:gap-4 border-b-4 border-[#9a3412] active:border-b-0 active:translate-y-1">
              <Upload className="w-5 h-5 lg:w-6 lg:h-6" /> Upload CSV
           </button>
           <p className="text-slate-400 text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-center">Mendukung satu atau banyak file</p>
        </div>
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept=".csv" multiple onChange={handleFileUpload} />

      {filesData.length > 0 && (
        <div className="space-y-8 lg:space-y-12 text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
             <div className="bg-[#241542]/60 backdrop-blur-xl p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] border border-white/5 flex items-center gap-4 lg:gap-5 shadow-lg">
                <div className="p-3 lg:p-4 bg-[#f97316]/10 rounded-xl lg:rounded-2xl"><Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-[#f97316]" /></div>
                <div>
                  <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase">Mode Analisis</p>
                  <p className="text-base lg:text-lg font-black text-white">{filesData.length > 1 ? 'Komparasi Strategis' : 'Audit Harian'}</p>
                </div>
             </div>
             <div className="bg-[#241542]/60 backdrop-blur-xl p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] border border-white/5 flex items-center gap-4 lg:gap-5 shadow-lg">
                <div className="p-3 lg:p-4 bg-orange-500/10 rounded-xl lg:rounded-2xl"><FileText className="w-5 h-5 lg:w-6 lg:h-6 text-orange-400" /></div>
                <div>
                  <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase">Jumlah Sumber Data</p>
                  <p className="text-base lg:text-lg font-black text-white">{filesData.length} File CSV</p>
                </div>
             </div>
             <div className="bg-[#241542]/60 backdrop-blur-xl p-5 lg:p-6 rounded-2xl lg:rounded-[2rem] border border-white/5 flex items-center gap-4 lg:gap-5 shadow-lg">
                <div className="p-3 lg:p-4 bg-amber-500/10 rounded-xl lg:rounded-2xl"><Clock className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" /></div>
                <div>
                  <p className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase">Estimasi Diagnosis</p>
                  <p className="text-base lg:text-lg font-black text-white">~10-15 Detik</p>
                </div>
             </div>
          </div>

          {filesData.map((fileSet) => (
            <div key={fileSet.id} className="space-y-4 lg:space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-6 lg:w-8 h-[2px] bg-white/10" />
                 <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">SUMBER: {fileSet.fileName}</span>
                 <div className="flex-1 h-[1px] bg-white/10" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {fileSet.campaigns.map((camp, cIdx) => (
                  <div key={cIdx} className="bg-[#241542]/40 backdrop-blur-md rounded-3xl lg:rounded-[3rem] border border-white/5 shadow-xl overflow-hidden group">
                    <div className="px-6 lg:px-8 py-4 lg:py-5 bg-[#1a0b2e]/50 border-b border-white/5 flex justify-between items-center">
                       <div className="flex items-center gap-3 lg:gap-4">
                          <div className="p-2.5 lg:p-3 bg-[#f97316]/10 rounded-xl"><Activity className="w-4 h-4 text-[#f97316]" /></div>
                          <span className="font-black text-white text-base lg:text-lg tracking-tight truncate max-w-[150px] lg:max-w-[180px]">{camp.name || 'Campaign'}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[8px] lg:text-[9px] font-black text-slate-500 block uppercase">ROAS</span>
                          <span className={`font-black text-lg lg:text-xl ${camp.roas >= 2.5 ? 'text-orange-400' : 'text-rose-500'}`}>{(camp.roas || 0).toFixed(2)}x</span>
                       </div>
                    </div>
                    
                    <div className="p-6 lg:p-8 grid grid-cols-2 gap-3 lg:gap-4">
                       {calculateFunnel(camp).slice(0, 4).map((step, sIdx) => (
                         <div key={sIdx} className="bg-[#1a0b2e]/30 p-4 lg:p-5 rounded-xl lg:rounded-2xl border border-white/5 space-y-2 lg:space-y-3">
                            <div className="flex justify-between items-center">
                               <span className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase">{step.label}</span>
                               <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${step.status === 'Good' ? 'bg-orange-500' : 'bg-rose-500'}`} />
                            </div>
                            <p className="text-lg lg:text-xl font-black text-white">{step.actualRate.toFixed(1)}%</p>
                            <p className="text-[8px] lg:text-[9px] font-bold text-slate-500 uppercase truncate">{step.rawLabel}: {formatNumber(step.rawValue)}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex justify-center pt-4 lg:pt-8">
            <button onClick={handleAnalyze} disabled={analyzing} className="w-full sm:w-auto bg-[#f97316] text-white px-8 lg:px-16 py-5 lg:py-8 rounded-2xl lg:rounded-[3rem] font-black text-xl lg:text-3xl flex items-center justify-center gap-4 lg:gap-8 hover:bg-[#ea580c] transition-all shadow-[0_20px_40px_rgba(245,100,56,0.3)] border-b-4 lg:border-b-8 border-[#9a3412] active:scale-95 active:border-b-0">
              {analyzing ? <Loader2 className="w-6 h-6 lg:w-10 lg:h-10 animate-spin" /> : <Zap className="w-6 h-6 lg:w-10 lg:h-10 fill-white" />}
              DIAGNOSA PERFORMA AI
            </button>
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div id="ai-audit" className="space-y-10 lg:space-y-16 animate-in slide-in-from-bottom-12 duration-1000">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-4 lg:gap-6 border-b border-white/10 pb-8 lg:pb-10 text-center sm:text-left">
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="p-4 lg:p-5 bg-[#f97316] rounded-2xl lg:rounded-[2rem] shadow-2xl"><Lightbulb className="w-8 h-8 lg:w-10 lg:h-10 text-white" /></div>
                <div>
                  <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tighter">{filesData.length > 1 ? 'Comparative Strategic Audit' : 'Daily Performance Audit'}</h2>
                  <p className="text-slate-500 font-bold uppercase tracking-widest mt-1 lg:mt-2 text-[10px] lg:text-sm">Keputusan Taktis Berdasarkan Analisis Intelijen AI</p>
                </div>
              </div>
              <button 
                onClick={() => downloadText('ad-audit-report.json', JSON.stringify(recommendations, null, 2))}
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-xl"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
           </div>

           {/* Hasil Rekomendasi */}
           <div className="grid grid-cols-1 gap-6 lg:gap-10">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/[0.03] backdrop-blur-xl rounded-3xl lg:rounded-[4rem] border border-white/10 p-6 sm:p-8 lg:p-12 relative overflow-hidden group hover:shadow-[#f97316]/10 transition-all text-left">
                   <div className={`absolute top-0 left-0 w-2 lg:w-3 h-full ${rec.verdict === 'KILL' ? 'bg-rose-600' : rec.verdict === 'UPSCALE' ? 'bg-orange-500' : 'bg-[#f97316]'}`} />
                   <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                      <div className="lg:col-span-5 space-y-6 lg:space-y-8">
                         <div className="space-y-3 lg:space-y-4">
                            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                               <div className={`px-4 lg:px-5 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl border font-black text-[11px] lg:text-sm flex items-center gap-2 lg:gap-3 ${getVerdictClass(rec.verdict)} shadow-lg shadow-current/5`}>
                                 {getVerdictIcon(rec.verdict)}
                                 {rec.verdict}
                               </div>
                               <span className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase tracking-widest bg-[#1a0b2e] text-slate-400 border border-white/5`}>
                                  Impact {rec.impact}
                               </span>
                            </div>
                            <h3 className="text-2xl lg:text-3xl font-black text-white leading-tight">{rec.title}</h3>
                         </div>
                         
                         <div className="p-6 lg:p-8 bg-[#f97316]/5 rounded-2xl lg:rounded-[2.5rem] border border-[#f97316]/10 space-y-3 lg:space-y-4">
                            <div className="flex items-center gap-2 text-[10px] lg:text-[11px] font-black text-[#f97316] uppercase tracking-widest"><Search className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Insight Perbandingan</div>
                            <p className="text-lg lg:text-xl font-bold text-slate-300 leading-relaxed italic">"{rec.comparisonNote}"</p>
                         </div>

                         <div className="space-y-2 lg:space-y-3">
                            <h4 className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"> Penjelasan Analogi</h4>
                            <p className="text-slate-400 font-medium leading-relaxed text-sm lg:text-base">{rec.babyExplanation}</p>
                         </div>
                      </div>

                      <div className="lg:col-span-7 bg-[#1a0b2e]/50 rounded-2xl lg:rounded-[3rem] p-6 lg:p-10 border border-white/5 flex flex-col">
                         <h4 className="text-lg lg:text-xl font-black text-white mb-6 lg:mb-8 flex items-center gap-3 lg:gap-4">
                            <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-orange-500" />
                            STRATEGI REKAYASA LANJUTAN
                         </h4>
                         <div className="space-y-4 lg:space-y-6 flex-1">
                            {rec.actionPlan.map((step: string, sIdx: number) => (
                              <div key={sIdx} className="flex items-start gap-4 lg:gap-6 group/step">
                                 <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl bg-[#241542] border border-white/5 flex items-center justify-center font-black text-slate-400 group-hover/step:bg-[#f97316] group-hover/step:text-white group-hover/step:border-[#f97316] transition-all shrink-0 text-sm lg:text-base">
                                   {sIdx + 1}
                                 </div>
                                 <p className="text-base lg:text-lg font-bold text-slate-300 pt-1 leading-snug group-hover/step:text-white transition-colors">{step}</p>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           {/* Fitur Tanya Expert AI */}
           <div className="space-y-8 lg:space-y-10 max-w-5xl mx-auto w-full pt-12 lg:pt-20">
              <div className="flex items-center gap-4 lg:gap-6 px-4">
                 <div className="p-3 lg:p-4 bg-[#f97316] rounded-xl lg:rounded-[1.5rem] shadow-2xl shadow-[#f97316]/40"><Bot className="w-6 h-6 lg:w-8 lg:h-8 text-white" /></div>
                 <div>
                    <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight">Tanya Expert AI</h3>
                    <p className="text-slate-500 text-[10px] lg:text-[11px] font-black uppercase tracking-widest mt-1">Deep Dive Consultation Lab</p>
                 </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl lg:rounded-[4rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-[600px] max-h-[800px] border-b-8 border-[#f97316]/50">
                 <div className="flex-1 p-6 lg:p-10 overflow-y-auto custom-scrollbar space-y-6 lg:space-y-8 bg-[#1a0b2e]/20">
                    {messages.map((msg, mIdx) => (
                       <ChatMessage key={mIdx} msg={msg} />
                    ))}
                    {isChatLoading && (
                       <div className="flex justify-start animate-pulse">
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-2xl bg-[#241542] border border-white/10 flex items-center justify-center shadow-lg">
                                <Bot className="w-5 h-5 text-[#f97316]" />
                             </div>
                             <div className="p-4 lg:p-5 bg-[#241542]/50 rounded-full flex gap-2">
                                <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-[#f97316] rounded-full animate-bounce" />
                                <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-[#f97316] rounded-full animate-bounce delay-150" />
                                <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-[#f97316] rounded-full animate-bounce delay-300" />
                             </div>
                          </div>
                       </div>
                    )}
                    <div ref={chatEndRef} />
                 </div>

                 <div className="p-6 lg:p-10 bg-white/[0.02] border-t border-white/10 backdrop-blur-md">
                    <form onSubmit={handleSendMessage} className="relative group">
                       <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Tanyakan detail data Anda..."
                          className="w-full bg-white/[0.05] border-2 border-white/10 rounded-2xl lg:rounded-[2.5rem] px-6 lg:px-10 py-4 lg:py-6 text-sm lg:text-base font-bold text-white outline-none focus:border-[#f97316] focus:ring-4 focus:ring-[#f97316]/10 transition-all pr-20 lg:pr-24 shadow-inner placeholder:text-slate-500"
                       />
                       <button 
                          type="submit" 
                          disabled={!chatInput.trim() || isChatLoading}
                          className="absolute right-2.5 lg:right-3 top-1/2 -translate-y-1/2 p-3 lg:p-5 bg-[#f97316] text-white rounded-full hover:bg-[#ea580c] transition-all disabled:opacity-20 shadow-2xl active:scale-90 group-hover:scale-105"
                       >
                          <Send className="w-5 h-5 lg:w-6 lg:h-6" />
                       </button>
                    </form>
                    <p className="mt-4 text-center text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest">Marketer Expert Intelligence • Powered by Gemini Flash</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      {!filesData.length && (
        <div className="py-12 lg:py-24 opacity-30 flex flex-col items-center gap-6 lg:gap-8">
           <div className="w-32 h-32 lg:w-40 lg:h-40 bg-[#241542] rounded-3xl lg:rounded-[3rem] flex items-center justify-center border border-white/5 shadow-2xl animate-pulse">
              <Zap className="w-16 h-16 lg:w-20 lg:h-20 text-[#f97316] fill-[#f97316]" />
           </div>
           <h3 className="text-2xl lg:text-3xl font-black text-white text-center">Upload CSV untuk Diagnosis</h3>
           <p className="text-slate-500 max-w-sm text-center text-sm lg:text-base px-4">Seret satu file untuk audit harian, atau beberapa file sekaligus untuk analisis perbandingan antar periode.</p>
        </div>
      )}
    </div>
  );
};

export default AdAnalyzer;

import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  Loader2, 
  Target, 
  Tag, 
  Zap, 
  MessageSquare, 
  Target as TargetIcon, 
  Wallet, 
  BarChart, 
  FileText, 
  AlertCircle,
  Copy,
  Check,
  Rocket,
  ShieldCheck,
  Layout,
  MousePointer2,
  Trophy,
  Download
} from 'lucide-react';
import { generateAdStrategy } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { downloadText } from '../utils/downloadUtils';

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 outline-none transition-all text-sm font-medium bg-white/[0.05] text-white placeholder:text-slate-600 shadow-inner"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, icon: Icon, rows = 2 }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-5 py-4 rounded-2xl border border-white/10 focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/20 outline-none transition-all text-sm font-medium bg-white/[0.05] text-white placeholder:text-slate-600 resize-none shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.05] text-white focus:border-[#f97316] outline-none transition-all text-sm font-medium shadow-inner cursor-pointer"
    >
      {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#241542]">{opt}</option>)}
    </select>
  </div>
);

const AIStrategist: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = usePersistentState('ai_strategist_output', '');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = usePersistentState('ai_strategist_form', {
    brandName: '',
    productType: 'Produk Fisik',
    productDesc: '',
    hasAdvertised: 'Tidak',
    usp: '',
    targetAudience: '',
    benefits: '',
    adAngle: 'Problem Solving',
    objective: 'Conversion (Sales)',
    budget: '',
    targetCpr: '',
    kpi: '',
    adCount: '3',
    notes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.brandName) return alert('Nama Brand wajib diisi');
    setLoading(true);
    setOutput('');
    try {
      const res = await generateAdStrategy(formData);
      setOutput(res || '');
      // Scroll to result on mobile
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          document.getElementById('strategy-result')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } catch (err) {
      console.error(err);
      setOutput('Gagal menghasilkan strategi iklan.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20 animate-in fade-in duration-700">
      {/* Input Panel */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <BrainCircuit className="w-32 h-32 text-[#f97316]" />
          </div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-[#f97316] rounded-2xl shadow-lg shadow-[#f97316]/20">
               <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{t('strategist.title')}</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('strategist.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InputField label={t('common.brand_name')} name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Drone X-Pro" icon={Tag} />
               <SelectField label={t('strategist.product_type')} name="productType" value={formData.productType} onChange={handleInputChange} options={['Produk Fisik', 'Layanan/Jasa', 'Produk Digital']} icon={Zap} />
            </div>
            
            <TextAreaField label={t('strategist.product_desc')} name="productDesc" value={formData.productDesc} onChange={handleInputChange} placeholder="Jelaskan produk secara detail..." icon={FileText} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <InputField label={t('strategist.usp')} name="usp" value={formData.usp} onChange={handleInputChange} placeholder="Bahan adem, Garansi 1 thn..." icon={Trophy} />
               <SelectField label={t('strategist.advertised')} name="hasAdvertised" value={formData.hasAdvertised} onChange={handleInputChange} options={['Ya', 'Tidak']} icon={BarChart} />
            </div>

            <TextAreaField label={t('common.target_audience')} name="targetAudience" value={formData.targetAudience} onChange={handleInputChange} placeholder="Contoh: Ibu-ibu muda, hobi traveling..." icon={TargetIcon} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <SelectField label={t('strategist.objective')} name="objective" value={formData.objective} onChange={handleInputChange} options={['Conversion (Sales)', 'Lead Generation', 'App Installs', 'Engagement', 'Awareness']} icon={Target} />
               <InputField label={t('strategist.daily_budget')} name="budget" value={formData.budget} onChange={handleInputChange} placeholder="Rp 100.000/Hari" icon={Wallet} />
            </div>

            <TextAreaField label={t('strategist.additional_notes')} name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Misal: Fokus di IG Reels saja..." icon={AlertCircle} />

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#f97316] text-white py-6 rounded-[2rem] font-black text-xl hover:bg-[#ea580c] transition-all flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(245,100,56,0.3)] border-b-8 border-[#9a3412] active:translate-y-2 active:border-b-0 mt-4 group"
            >
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Rocket className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
              {loading ? t('strategist.generating') : t('strategist.generate_btn')}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#f97316]/10 border border-[#f97316]/20 p-6 rounded-[2rem] flex items-start gap-4 text-left">
           <div className="p-2 bg-[#f97316]/20 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#f97316]" />
           </div>
           <div>
              <p className="text-xs font-black text-[#f97316] uppercase tracking-widest mb-1">{t('strategist.recommendation')}</p>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                {t('strategist.recommendation_desc')}
              </p>
           </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-7" id="strategy-result">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[900px] flex flex-col overflow-hidden sticky top-24">
          <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl">
             <div className="flex items-center gap-4">
               <div className="flex gap-2">
                 <div className="w-3.5 h-3.5 rounded-full bg-[#f97316]/80 shadow-[0_0_12px_rgba(245,100,56,0.4)]" />
                 <div className="w-3.5 h-3.5 rounded-full bg-orange-500/80 shadow-[0_0_12px_rgba(249,115,22,0.4)]" />
               </div>
               <div className="h-5 w-[1px] bg-white/10 mx-2" />
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Blueprint Strategis Meta v3.0</span>
             </div>
             {output && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => downloadText('strategi-iklan.txt', output)}
                  className="bg-white/5 hover:bg-white/10 text-white px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-xl"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button 
                  onClick={handleCopy}
                  className="bg-white/5 hover:bg-white/10 text-white px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/10 transition-all active:scale-95 shadow-xl"
                >
                  {copied ? <Check className="w-4 h-4 text-orange-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Berhasil Disalin' : 'Copy Strategy'}
                </button>
              </div>
             )}
          </div>

          <div className="flex-1 p-14 overflow-y-auto custom-scrollbar text-left">
             {output ? (
               <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 prose prose-invert max-w-none">
                  <div className="flex items-center gap-4 mb-10 bg-[#f97316]/5 border border-[#f97316]/10 p-6 rounded-[2rem]">
                    <div className="p-4 bg-[#f97316] rounded-2xl shadow-lg">
                      <Zap className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-white m-0">Eksekusi Siap Pakai</h4>
                      <p className="text-slate-500 text-sm m-0">Strategi ini dirancang untuk memaksimalkan ROI brand <strong>{formData.brandName}</strong>.</p>
                    </div>
                  </div>
                  <div className="whitespace-pre-wrap font-medium text-slate-300 leading-relaxed text-lg pb-20">
                    {output}
                  </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-center opacity-40 group py-20">
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-32 h-32 relative mb-12">
                         <div className="absolute inset-0 border-[6px] border-[#f97316]/10 border-t-[#f97316] rounded-full animate-spin" />
                         <BrainCircuit className="absolute inset-0 m-auto w-14 h-14 text-[#f97316] animate-pulse" />
                      </div>
                      <h4 className="text-white text-3xl font-black tracking-tight mb-4">Deep Learning Analysis...</h4>
                      <p className="text-slate-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
                        Menganalisis matriks audiens dan merancang struktur funnel Meta Ads yang paling efisien untuk Anda.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-28 h-28 bg-white/5 rounded-[3.5rem] flex items-center justify-center mb-12 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-inner">
                        <Layout className="w-14 h-14 text-slate-500 group-hover:text-[#f97316] transition-colors" />
                      </div>
                      <h4 className="text-4xl font-black text-white mb-6 tracking-tight">War Room Strategi</h4>
                      <p className="text-slate-500 text-xl font-medium leading-relaxed max-w-lg mx-auto">
                        Masukkan detail brand Anda di sebelah kiri untuk mendapatkan <strong>Marketing Blueprint</strong> lengkap yang dioptimalkan untuk performa tinggi.
                      </p>
                      <div className="mt-12 flex items-center gap-8 justify-center opacity-50">
                         <div className="flex flex-col items-center gap-2">
                            <MousePointer2 className="w-6 h-6 text-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Data Driven</span>
                         </div>
                         <div className="h-8 w-[1px] bg-white/10" />
                         <div className="flex flex-col items-center gap-2">
                            <Zap className="w-6 h-6 text-slate-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Meta Optimized</span>
                         </div>
                      </div>
                    </>
                  )}
               </div>
             )}
          </div>

          <div className="px-10 py-5 bg-[#241542]/80 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
             <div className="flex gap-4">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(245,100,56,0.5)]" /> Meta Ads Specialist AI</span>
               <span className="opacity-50 hidden sm:inline">| Funnel Engineering: Enabled</span>
             </div>
             <span className="opacity-50">StudioPebisnis Strategic Core v3.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIStrategist;

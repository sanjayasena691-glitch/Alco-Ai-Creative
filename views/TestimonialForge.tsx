import React, { useState } from 'react';
import { 
  MessageSquareQuote, 
  Sparkles, 
  Loader2, 
  X, 
  Smartphone, 
  User, 
  MessageCircle, 
  Sun, 
  Moon, 
  Maximize, 
  Clock,
  Download,
  FileText,
  Tag,
  Target,
  Smile,
  Send,
  Eye,
  Check
} from 'lucide-react';
import { generateTestimonialImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { downloadImage } from '../utils/downloadUtils';

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon }: any) => (
  <div className="space-y-2 text-left">
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
      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.05] text-white focus:border-[#f97316] outline-none transition-all text-sm font-medium shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon }: any) => (
  <div className="space-y-2 text-left">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 rounded-2xl border border-white/10 bg-white/[0.05] text-white focus:border-[#f97316] outline-none transition-all text-sm font-medium cursor-pointer shadow-inner"
    >
      {options.map((opt: string) => <option key={opt} value={opt} className="bg-[#241542]">{opt}</option>)}
    </select>
  </div>
);

const TestimonialForge: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = usePersistentState<string[]>('testimonial_results', []);

  const [formData, setFormData] = usePersistentState('testimonial_form', {
    productName: '',
    aboutProduct: '',
    firstImpression: '',
    usageResult: '',
    screenshotType: 'WhatsApp',
    targetBehavior: 'Mendorong Pembelian Langsung',
    customerName: '',
    chatStyle: 'Berdialog, Teks Panjang',
    lightMode: 'Light Mode',
    extraNotes: 'Berdialog lengkap ya chatnya, pastikan ada timestamp dan centang biru.'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.productName) return alert('Nama Produk wajib diisi');
    
    setLoading(true);
    setResults([]);
    try {
      // Generate 2 options as requested
      const promise1 = generateTestimonialImage(formData);
      const promise2 = generateTestimonialImage({ ...formData, chatStyle: 'Santai/Slang' }); // Subtle variation
      
      const [res1, res2] = await Promise.all([promise1, promise2]);
      
      const validResults = [res1, res2].filter((r): r is string => !!r);
      setResults(validResults);
    } catch (err) {
      alert('Gagal menghasilkan testimoni AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-20 animate-in fade-in duration-700">
      {/* INPUT PANEL */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-10 rounded-[3rem] border border-white/10 shadow-2xl space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <MessageSquareQuote className="w-32 h-32 text-[#f97316]" />
           </div>

          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-[#f97316] rounded-2xl shadow-lg shadow-[#f97316]/20">
               <MessageSquareQuote className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight">{t('testimonial.title')}</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('testimonial.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            <InputField label={t('common.brand_name')} name="productName" value={formData.productName} onChange={handleInputChange} placeholder="Krim Glowing Ajaib" icon={Tag} />
            <InputField label={t('strategist.product_desc')} name="aboutProduct" value={formData.aboutProduct} onChange={handleInputChange} placeholder="Skincare pencerah wajah organik" icon={FileText} />
            
            <div className="grid grid-cols-1 gap-4">
              <InputField label={t('testimonial.first_impression')} name="firstImpression" value={formData.firstImpression} onChange={handleInputChange} placeholder="Teksturnya lembut banget, langsung meresap" icon={Smile} />
              <InputField label={t('testimonial.usage_result')} name="usageResult" value={formData.usageResult} onChange={handleInputChange} placeholder="Dalam 7 hari wajah jauh lebih cerah & lembab" icon={Sparkles} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('testimonial.platform')} name="screenshotType" value={formData.screenshotType} onChange={handleInputChange} options={['WhatsApp', 'iMessage', 'Telegram', 'Instagram DM']} icon={Smartphone} />
              <SelectField label={t('testimonial.light_mode')} name="lightMode" value={formData.lightMode} onChange={handleInputChange} options={['Light Mode', 'Dark Mode']} icon={Sun} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InputField label={t('testimonial.customer_name')} name="customerName" value={formData.customerName} onChange={handleInputChange} placeholder="Siska Amelia" icon={User} />
              <SelectField label={t('testimonial.chat_style')} name="chatStyle" value={formData.chatStyle} onChange={handleInputChange} options={['Berdialog, Teks Panjang', 'Singkat & Padat', 'Sangat Antusias', 'Santai/Slang']} icon={MessageCircle} />
            </div>

            <InputField label={t('testimonial.target_behavior')} name="targetBehavior" value={formData.targetBehavior} onChange={handleInputChange} placeholder="Misal: Biar orang percaya hasilnya nyata" icon={Target} />

            <div className="space-y-2 text-left">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <FileText className="w-3.5 h-3.5" />
                {t('strategist.additional_notes')}
              </label>
              <textarea
                name="extraNotes"
                value={formData.extraNotes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Pastikan ada spasi antar bubble chat, centang biru, dan dialog natural..."
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.05] text-white focus:border-[#f97316] outline-none transition-all text-sm font-medium resize-none shadow-inner shadow-black/20"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#f97316] text-white py-6 rounded-[2rem] font-black text-xl hover:bg-[#ea580c] transition-all shadow-[0_20px_40px_rgba(245,100,56,0.3)] border-b-8 border-[#9a3412] active:translate-y-2 active:border-b-0 mt-4 flex items-center justify-center gap-4 disabled:opacity-30"
            >
              {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Sparkles className="w-7 h-7" />}
              {loading ? t('testimonial.generating') : t('testimonial.generate_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* OUTPUT PANEL */}
      <div className="lg:col-span-7">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[700px] flex flex-col overflow-hidden sticky top-24">
          <div className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-xl">
             <div className="flex items-center gap-4">
               <div className="flex gap-2">
                 <div className="w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_12px_rgba(245,100,56,0.4)]" />
                 <div className="w-3.5 h-3.5 rounded-full bg-[#f97316] shadow-[0_0_12px_rgba(245,100,56,0.4)]" />
               </div>
               <div className="h-5 w-[1px] bg-white/10 mx-2" />
               <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Realism Engine Output</span>
             </div>
             {results.length > 0 && (
               <div className="flex gap-4">
                  <span className="text-[10px] font-black text-[#f97316] uppercase tracking-widest flex items-center gap-2">
                    <Check className="w-4 h-4" /> 2 Varian Siap
                  </span>
               </div>
             )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-black/20">
             {results.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {results.map((img, idx) => (
                    <div key={idx} className="space-y-4 animate-in zoom-in-95 duration-500 group">
                       <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl">
                          <img src={img} className="w-full h-auto object-cover" alt={`Varian ${idx+1}`} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-8 text-left">
                             <p className="text-[#f97316] font-black text-[10px] uppercase tracking-[0.3em] mb-1">Varian {idx + 1}</p>
                             <h4 className="text-white text-lg font-black">{formData.chatStyle}</h4>
                             <button 
                               onClick={() => downloadImage(`testimonial-v${idx+1}.png`, img)}
                               className="mt-4 bg-white text-black px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#f97316] hover:text-white transition-all shadow-xl"
                             >
                               <Download className="w-4 h-4" /> Save Image
                             </button>
                          </div>
                       </div>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Opsi {idx + 1}: {idx === 0 ? 'Berdialog' : 'Gaya Santai'}</p>
                    </div>
                  ))}
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-10 py-20">
                  {loading ? (
                    <div className="flex flex-col items-center">
                       <div className="w-32 h-32 relative mb-10">
                          <div className="absolute inset-0 border-[6px] border-[#f97316]/10 border-t-[#f97316] rounded-full animate-spin" />
                          <Smartphone className="absolute inset-0 m-auto w-14 h-14 text-[#f97316] animate-pulse" />
                       </div>
                       <h4 className="text-white text-3xl font-black tracking-tight mb-4">Rendering Evidence...</h4>
                       <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">
                         AI sedang merancang 2 variasi percakapan dengan layout spasi dan bubble yang realistis.
                       </p>
                    </div>
                  ) : (
                    <>
                      <div className="w-32 h-32 bg-white/5 rounded-[4rem] flex items-center justify-center border border-white/10 shadow-inner group">
                        <Smartphone className="w-16 h-16 text-slate-500 group-hover:text-[#f97316] transition-all duration-700" />
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-4xl font-black text-white tracking-tight">Social Proof Lab</h4>
                        <p className="text-slate-500 text-xl font-medium max-w-md mx-auto leading-relaxed">
                          Hasilkan tangkapan layar chat {formData.screenshotType} yang 100% identik dengan aslinya untuk meyakinkan audiens Anda.
                        </p>
                      </div>
                    </>
                  )}
               </div>
             )}
          </div>

          <div className="px-10 py-5 bg-[#241542]/80 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
             <div className="flex gap-4">
               <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(245,100,56,0.5)]" /> High-Fidelity UI Active</span>
               <span className="opacity-50">Bubble Spacing: Optimized</span>
             </div>
             <span className="opacity-50">StudioPebisnis Evidence v3.2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialForge;
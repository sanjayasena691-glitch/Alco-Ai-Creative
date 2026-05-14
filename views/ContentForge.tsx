import React, { useState, useRef } from 'react';
import { 
  Download, 
  Sparkles, 
  Loader2, 
  Send, 
  Tag, 
  Target, 
  AlertCircle, 
  Palette, 
  User, 
  Maximize, 
  FileText, 
  Image as ImageIcon, 
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Upload,
  X,
  Layers,
  Edit3,
  Check,
  Type
} from 'lucide-react';
import { generateAdImage, editAdImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { downloadImage } from '../utils/downloadUtils';

interface GeneratedImage {
  id: string;
  url: string;
  isEditing: boolean;
  editPrompt: string;
}

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon, type = 'text', hint }: any) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5">
        <Icon className="w-4 h-4 text-[#f97316]" />
        {label}
      </label>
      {hint && (
        <div className="group relative">
          <HelpCircle className="w-3.5 h-3.5 text-slate-300 cursor-help" />
          <div className="absolute bottom-full right-0 mb-2 w-52 p-3 bg-[#241542] text-white text-[11px] rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-20 shadow-xl border border-white/5">
            {hint}
          </div>
        </div>
      )}
    </div>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-white/10 focus:border-[#f97316] bg-white/[0.05] outline-none transition-all text-[15px] font-medium text-white placeholder:text-slate-500 shadow-inner"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, icon: Icon, rows = 3 }: any) => (
  <div className="space-y-3">
    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
      <Icon className="w-4 h-4 text-[#f97316]" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-6 py-4 rounded-[1.5rem] border-2 border-white/10 focus:border-[#f97316] bg-white/[0.05] outline-none transition-all text-[15px] font-medium text-white placeholder:text-slate-500 resize-none shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon, error }: any) => (
  <div className="space-y-3">
    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
      <Icon className="w-4 h-4 text-[#f97316]" />
      {label}
    </label>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-6 py-4 rounded-[1.5rem] border-2 appearance-none ${error ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-white/10 bg-white/[0.05] text-white'} focus:border-[#f97316] outline-none transition-all text-[15px] font-medium cursor-pointer shadow-inner`}
      >
        {options.map((opt: any) => {
          const id = typeof opt === 'string' ? opt : opt.id;
          const name = typeof opt === 'string' ? opt : opt.name;
          return <option key={id} value={id} className="bg-[#241542]">{name}</option>;
        })}
      </select>
      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const ContentForge: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = usePersistentState('content_forge_form', {
    brandName: '',
    objective: 'Konversi',
    problemAngle: '',
    solution: '',
    targetBehavior: '',
    cta: '',
    adText: '', // State baru untuk teks dalam gambar
    fullDescription: '',
    adSize: '1:1',
    visualStyle: 'Realistis',
    colors: '',
    modelType: 'Mohon untuk pilih satu',
    batchCount: '1'
  });

  const [uploadedImage, setUploadedImage] = usePersistentState<string | null>('content_forge_image', null);
  const [generatedResults, setGeneratedResults] = usePersistentState<GeneratedImage[]>('content_forge_results', []);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brandName) return alert('Nama Brand wajib diisi.');
    
    setLoading(true);
    setGeneratedResults([]);
    const count = Math.min(parseInt(formData.batchCount), 10);
    
    try {
      const promises = Array.from({ length: count }).map(() => generateAdImage({ ...formData, image: uploadedImage }));
      const urls = await Promise.all(promises);
      
      const results: GeneratedImage[] = urls
        .filter((url): url is string => !!url)
        .map((url, index) => ({
          id: `${Date.now()}-${index}`,
          url,
          isEditing: false,
          editPrompt: ''
        }));
        
      setGeneratedResults(results);
    } catch (err) {
      alert('Gagal menghasilkan gambar iklan.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async (imgId: string) => {
    const target = generatedResults.find(img => img.id === imgId);
    if (!target || !target.editPrompt.trim()) return;

    setGeneratedResults(prev => prev.map(img => img.id === imgId ? { ...img, isEditing: true } : img));

    try {
      const newUrl = await editAdImage(target.url, target.editPrompt, formData.adSize);
      if (newUrl) {
        setGeneratedResults(prev => prev.map(img => 
          img.id === imgId ? { ...img, url: newUrl, isEditing: false, editPrompt: '' } : img
        ));
      } else {
        throw new Error("No image returned");
      }
    } catch (err) {
      alert('Gagal mengedit gambar.');
      setGeneratedResults(prev => prev.map(img => img.id === imgId ? { ...img, isEditing: false } : img));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[1200px] custom-scrollbar">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-[#f97316] rounded-2xl shadow-lg">
               <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{t('content.title')}</h3>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">{t('content.subtitle')}</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-6 text-left">
            <InputField label={t('common.brand_name')} name="brandName" value={formData.brandName} onChange={handleInputChange} placeholder="Drone X-Pro" icon={Tag} />
            
            <div className="space-y-3">
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2.5 px-1">
                <Upload className="w-4 h-4 text-[#f97316]" />
                {t('content.upload_ref')}
              </label>
              <div onClick={() => fileInputRef.current?.click()} className={`relative h-24 border-2 border-dashed rounded-[1.5rem] flex items-center justify-center cursor-pointer transition-all ${uploadedImage ? 'border-[#f97316] bg-[#f97316]/10' : 'border-white/10 hover:border-[#f97316]/50'}`}>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                {uploadedImage ? (
                  <div className="flex items-center gap-4 px-4 w-full">
                    <img src={uploadedImage} className="w-16 h-16 object-cover rounded-xl shadow-md" alt="Uploaded" />
                    <span className="text-xs font-bold text-slate-300 truncate">Gambar Produk Siap</span>
                    <button onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }} className="ml-auto text-rose-500 hover:bg-rose-500/20 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center"><Upload className="w-5 h-5 text-[#f97316] mb-1" /><span className="text-[10px] font-black text-slate-400 uppercase">{t('common.upload')}</span></div>
                )}
              </div>
            </div>

            <InputField 
              label={t('content.text_in_image')} 
              name="adText" 
              value={formData.adText} 
              onChange={handleInputChange} 
              placeholder="Contoh: 'DISKON 50%' atau 'Solusi Terbaik'" 
              icon={Type} 
              hint="Teks ini akan dirender secara estetik oleh AI di dalam visual iklan."
            />

            <SelectField 
              label={t('content.batch_count')} 
              name="batchCount" 
              value={formData.batchCount} 
              onChange={handleInputChange} 
              options={['1', '2', '3', '4', '5', '6', '8', '10']} 
              icon={Layers} 
            />
            
            <TextAreaField label={t('common.problem')} name="problemAngle" value={formData.problemAngle} onChange={handleInputChange} placeholder="Pengguna butuh solusi cepat untuk..." icon={AlertCircle} />
            <TextAreaField label={t('content.visual_desc')} name="fullDescription" value={formData.fullDescription} onChange={handleInputChange} placeholder="Produk di atas meja kayu dengan pencahayaan sunset..." icon={FileText} rows={4} />

            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('content.size')} name="adSize" value={formData.adSize} onChange={handleInputChange} options={['1:1', '9:16', '16:9']} icon={Maximize} />
              <SelectField label={t('common.style')} name="visualStyle" value={formData.visualStyle} onChange={handleInputChange} options={['Realistis', '3D Render', 'Minimalis']} icon={Palette} />
            </div>

            <SelectField 
              label={t('content.model_type')} 
              name="modelType" 
              value={formData.modelType} 
              onChange={handleInputChange} 
              options={[{id: 'Mohon untuk pilih satu', name: '- Pilih -'}, {id: 'Pria', name: 'Pria Dewasa'}, {id: 'Wanita', name: 'Wanita Dewasa'}, {id: 'Tanpa Model', name: 'Tanpa Model'}]} 
              icon={User} 
            />

            <button type="submit" disabled={loading} className="w-full bg-[#f97316] text-white py-5 rounded-[1.8rem] font-black text-lg hover:bg-[#ea580c] shadow-xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 mt-4 border-b-4 border-[#9a3412] active:translate-y-1 active:border-b-0">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {loading ? t('content.generating') : t('content.generate_btn')}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[800px] flex flex-col sticky top-24 overflow-hidden">
          <div className="px-10 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{t('content.hub_title')}</span>
            </div>
            {generatedResults.length > 0 && (
               <button onClick={() => setGeneratedResults([])} className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest flex items-center gap-2 transition-colors"><RefreshCw className="w-3.5 h-3.5" /> {t('content.clear_canvas')}</button>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            {generatedResults.length > 0 ? (
              <div className={`grid gap-8 ${
                generatedResults.length === 1 
                ? 'grid-cols-1' 
                : generatedResults.length <= 4 
                ? 'grid-cols-1 md:grid-cols-2' 
                : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              }`}>
                {generatedResults.map((res) => (
                  <div key={res.id} className="bg-white/[0.03] backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 flex flex-col">
                    <div className="relative group aspect-square bg-black/20 flex items-center justify-center">
                       {res.isEditing && (
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-[#f97316]/20 border-t-[#f97316] rounded-full animate-spin" />
                            <span className="text-[11px] font-black text-white uppercase tracking-widest">Menerapkan Edit...</span>
                         </div>
                       )}
                       <img src={res.url} className="w-full h-full object-cover" alt="Generated" />
                       <button onClick={() => downloadImage(`adflow-${Date.now()}.png`, res.url)} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all border border-white/10 hover:bg-[#f97316]">
                          <Download className="w-5 h-5" />
                       </button>
                    </div>

                    <div className="p-6 space-y-4 border-t border-white/5 mt-auto">
                       <div className="flex items-center gap-2 text-[#f97316]">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-black uppercase tracking-widest">Edit Instruksi AI</span>
                       </div>
                       <div className="relative">
                          <input 
                            type="text" 
                            value={res.editPrompt} 
                            onChange={(e) => setGeneratedResults(prev => prev.map(img => img.id === res.id ? { ...img, editPrompt: e.target.value } : img))}
                            placeholder="Contoh: 'Ubah latar jadi futuristik'" 
                            className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-xs font-medium text-white placeholder:text-slate-500 outline-none focus:border-[#f97316] transition-all pr-12 shadow-inner"
                          />
                          <button 
                            onClick={() => handleEditImage(res.id)}
                            disabled={res.isEditing || !res.editPrompt.trim()}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#f97316] text-white rounded-lg hover:bg-[#ea580c] disabled:opacity-30 transition-all shadow-lg"
                          >
                             <Check className="w-3.5 h-3.5" />
                          </button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-8">
                 <div className="w-32 h-32 bg-white/5 rounded-[3.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
                    {loading ? <Loader2 className="w-14 h-14 text-[#f97316] animate-spin" /> : <ImageIcon className="w-14 h-14 text-[#f97316]" />}
                 </div>
                 <div className="space-y-3">
                   <h4 className="text-3xl font-black text-white tracking-tight">Menunggu Kreativitas Digital</h4>
                   <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">Isi form di kiri untuk mulai menghasilkan variasi visual iklan berkualitas tinggi.</p>
                 </div>
              </div>
            )}
          </div>

          <div className="px-10 py-5 bg-[#241542]/80 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
             <div className="flex gap-4">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" /> Gemini 2.5 Flash</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> High-Res Export</span>
             </div>
             <span className="opacity-50">Studio Edition v2.5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentForge;
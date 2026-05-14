
import React, { useState, useRef } from 'react';
import { 
  Loader2, Sparkles, Monitor, Clock, MessageSquare, Zap, Tag, Palette, Eye, Layers, Copy, Check, Upload, X, Package, Clapperboard, Camera, Star, Video, Image as ImageIcon, Download, Mic2, Volume2, ArrowRight, Globe, Rocket, ExternalLink, Terminal
} from 'lucide-react';
import { generateVideoPrompt, generateAdImage, generateAudio } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { downloadText, downloadImage } from '../utils/downloadUtils';

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3 h-3 text-[#f97316]" />
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-[#f97316] outline-none transition-all text-sm font-bold bg-white/[0.05] text-white placeholder:text-slate-500 shadow-inner"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, icon: Icon, rows = 3 }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3 h-3 text-[#f97316]" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-[#f97316] outline-none transition-all text-sm font-bold bg-white/[0.05] text-white placeholder:text-slate-500 resize-none shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3 h-3 text-[#f97316]" />
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05] focus:ring-2 focus:ring-[#f97316] outline-none transition-all text-sm font-bold text-white shadow-inner"
    >
      {options.map((opt: any) => (
        <option key={typeof opt === 'string' ? opt : opt.id} value={typeof opt === 'string' ? opt : opt.id} className="bg-[#241542]">
          {typeof opt === 'string' ? opt : opt.name}
        </option>
      ))}
    </select>
  </div>
);

const ImageUploadBox = ({ label, icon: Icon, image, onUpload, onClear, subLabel }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-3 text-left">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
        <Icon className="w-3.5 h-3.5 text-[#f97316]" />
        {label}
      </label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative group h-28 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all cursor-pointer ${image ? 'border-[#f97316]/40 bg-[#f97316]/5' : 'border-white/10 hover:border-[#f97316]/40 bg-white/5 hover:bg-white/10'}`}
      >
        <input type="file" ref={fileInputRef} onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUpload(reader.result as string);
            reader.readAsDataURL(file);
          }
        }} accept="image/*" className="hidden" />
        {image ? (
          <div className="flex items-center gap-4 px-4 w-full h-full">
            <div className="relative">
              <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-xl shadow-md border-2 border-white/10" />
              <button onClick={(e) => { e.stopPropagation(); onClear(); }} className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[10px] font-black text-[#f97316] uppercase tracking-widest mb-0.5">Asset Siap</p>
              <p className="text-[10px] text-slate-300 font-black truncate leading-none">{subLabel}</p>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-5 h-5 text-slate-500 mb-2 group-hover:scale-110 transition-transform" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center px-2 leading-tight">Upload Asset</p>
          </>
        )}
      </div>
    </div>
  );
};

const VisionDesigner: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = usePersistentState<any>('vision_output', null);
  const [sceneVisuals, setSceneVisuals] = usePersistentState<Record<number, string>>('vision_visuals', {});
  const [sceneAudios, setSceneAudios] = usePersistentState<Record<number, string>>('vision_audios', {});
  const [visualizingScene, setVisualizingScene] = useState<number | null>(null);
  const [voicingScene, setVoicingScene] = useState<number | null>(null);
  const [productImage, setProductImage] = usePersistentState<string | null>('vision_product_image', null);
  const [copiedSceneId, setCopiedSceneId] = useState<number | null>(null);
  const [showVideoOptions, setShowVideoOptions] = useState(false);

  const sceneOptions = Array.from({ length: 10 }, (_, i) => ({ id: (i + 1).toString(), name: `${i + 1} Adegan` }));

  const [formData, setFormData] = usePersistentState('vision_form', {
    brandName: '',
    detailedDescription: '',
    style: 'Cinematic',
    aspectRatio: '9:16',
    numberOfScenes: '3',
    voiceName: 'Kore'
  });

  const handleGenerate = async () => {
    if (!formData.brandName) return alert('Nama Brand wajib diisi');
    setLoading(true);
    setOutput(null);
    setShowVideoOptions(false);
    setSceneVisuals({});
    setSceneAudios({});
    try {
      const res = await generateVideoPrompt({ ...formData, productImage });
      setOutput(JSON.parse(res));
    } catch (err) {
      alert('Gagal menghasilkan blueprint vision.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisualizeScene = async (scene: any, idx: number) => {
    const sceneId = scene.sceneNumber || idx + 1;
    setVisualizingScene(sceneId);
    try {
      const result = await generateAdImage({
        brandName: formData.brandName,
        fullDescription: scene.technicalPrompt,
        adSize: formData.aspectRatio,
        image: productImage
      });
      if (result) setSceneVisuals(prev => ({ ...prev, [sceneId]: result }));
    } catch (err) {
      alert('Gagal merender adegan.');
    } finally {
      setVisualizingScene(null);
    }
  };

  const handleGenerateAudioForScene = async (scene: any, idx: number) => {
    const sceneId = scene.sceneNumber || idx + 1;
    setVoicingScene(sceneId);
    try {
      const audioUrl = await generateAudio(scene.audioNarration, formData.voiceName);
      setSceneAudios(prev => ({ ...prev, [sceneId]: audioUrl }));
    } catch (err) {
      alert('Gagal memproses suara AI.');
    } finally {
      setVoicingScene(null);
    }
  };

  const handleCopyPrompt = (sceneId: number, scene: any) => {
    const text = JSON.stringify({
      scene: sceneId,
      prompt: scene.technicalPrompt,
      duration: scene.duration,
      camera: scene.cameraAngle
    }, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedSceneId(sceneId);
    setTimeout(() => setCopiedSceneId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[1200px] custom-scrollbar">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-[#f97316] rounded-2xl shadow-lg shadow-[#f97316]/20">
               <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{t('vision.title')}</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('vision.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <InputField label={t('common.brand_name')} name="brandName" value={formData.brandName} onChange={(e: any) => setFormData({...formData, brandName: e.target.value})} placeholder="ZenCoffee" icon={Tag} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('vision.visual_style')} name="style" value={formData.style} onChange={(e: any) => setFormData({...formData, style: e.target.value})} options={['Cinematic', 'Luxe', 'Minimalist']} icon={Palette} />
              <SelectField label={t('vision.aspect_ratio')} name="aspectRatio" value={formData.aspectRatio} onChange={(e: any) => setFormData({...formData, aspectRatio: e.target.value})} options={['9:16', '16:9']} icon={Monitor} />
            </div>
            <SelectField label={t('vision.scenes')} name="numberOfScenes" value={formData.numberOfScenes} onChange={(e: any) => setFormData({...formData, numberOfScenes: e.target.value})} options={sceneOptions} icon={Layers} />
            <ImageUploadBox label={t('vision.product_asset')} subLabel="Visual produk utama." image={productImage} onUpload={setProductImage} onClear={() => setProductImage(null)} icon={Package} />
            <TextAreaField label={t('vision.vision_desc')} name="detailedDescription" value={formData.detailedDescription} onChange={(e: any) => setFormData({...formData, detailedDescription: e.target.value})} placeholder="Vibe cinematic yang diinginkan..." icon={Sparkles} rows={4} />
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-[#f97316] text-white py-5 rounded-[1.8rem] font-black text-lg hover:bg-[#ea580c] shadow-xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 mt-4 border-b-4 border-[#9a3412]">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {loading ? t('vision.generating') : t('vision.generate_btn')}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[800px] flex flex-col overflow-hidden sticky top-24">
          <div className="px-10 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(245,100,56,0.4)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Vision Core v3.1</span>
            </div>
            {output && (
              <button 
                onClick={() => downloadText('vision-storyboard.json', JSON.stringify(output, null, 2))}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-xl"
              >
                <Download className="w-3.5 h-3.5" /> Download Storyboard
              </button>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            {output ? (
              <div className="space-y-12 animate-in fade-in duration-500 text-left pb-20">
                <div className="bg-[#f97316]/10 border border-[#f97316]/20 p-8 rounded-[3rem] relative group">
                   <div className="flex items-center gap-3 mb-2 text-[#f97316]">
                     <Star className="w-4 h-4 fill-current" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Global Concept</span>
                   </div>
                   <p className="text-xl font-bold italic text-slate-100">"{output.masterCreativeStyle}"</p>
                </div>
                
                <div className="space-y-12">
                  {output.scenes.map((scene: any, idx: number) => {
                    const sceneId = scene.sceneNumber || idx + 1;
                    return (
                      <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-10 hover:bg-white/[0.05] transition-all shadow-2xl relative">
                        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
                          <div className="flex items-center gap-6">
                            <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black text-2xl shadow-xl shadow-[#f97316]/20">
                              {sceneId}
                            </div>
                            <div>
                              <h5 className="font-black text-white text-2xl tracking-tight">Adegan {sceneId}</h5>
                              <div className="flex gap-4 mt-1">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                   <Clock className="w-3.5 h-3.5 text-[#f97316]" /> {scene.duration || '5'} DETIK
                                 </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleVisualizeScene(scene, idx)} disabled={visualizingScene === sceneId} className="px-5 py-3 bg-[#f97316]/10 hover:bg-[#f97316] text-[#f97316] hover:text-white rounded-2xl border border-[#f97316]/20 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                              {visualizingScene === sceneId ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                              Render Visual
                            </button>
                            <button onClick={() => handleGenerateAudioForScene(scene, idx)} disabled={voicingScene === sceneId} className="px-5 py-3 bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white rounded-2xl border border-orange-500/20 transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                              {voicingScene === sceneId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic2 className="w-4 h-4" />}
                              Voice Draft
                            </button>
                            <button onClick={() => handleCopyPrompt(sceneId, scene)} className={`p-3 rounded-2xl border transition-all ${copiedSceneId === sceneId ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}>
                              {copiedSceneId === sceneId ? <Check className="w-5 h-5" /> : <Terminal className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          <div className="lg:col-span-4 group/img">
                            <div className={`bg-black/60 rounded-[2.5rem] border border-white/5 overflow-hidden relative shadow-2xl ${formData.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}>
                              {sceneVisuals[sceneId] ? (
                                <>
                                  <img src={sceneVisuals[sceneId]} className="w-full h-full object-cover animate-in fade-in duration-700" alt={`Scene ${sceneId}`} />
                                  <button onClick={() => downloadImage(`vision-${sceneId}.png`, sceneVisuals[sceneId])} className="absolute bottom-4 right-4 p-3 bg-black/60 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover/img:opacity-100 transition-all border border-white/10 hover:bg-[#f97316]">
                                     <Download className="w-5 h-5" />
                                  </button>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 text-center p-8">
                                  <ImageIcon className="w-16 h-16 mb-4" />
                                  <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-tight">Ready to Render</p>
                                </div>
                              )}
                              {visualizingScene === sceneId && (
                                <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                                   <div className="w-12 h-12 border-4 border-[#f97316]/20 border-t-[#f97316] rounded-full animate-spin" />
                                   <span className="text-[10px] font-black text-white uppercase tracking-widest">Synthesizing...</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                 <MessageSquare className="w-4 h-4 text-orange-400" />
                                 <span className="text-[11px] font-black text-orange-400 uppercase tracking-widest">Script Narasi</span>
                               </div>
                               <div className="p-8 bg-orange-500/5 rounded-[2.5rem] border border-orange-500/10 space-y-4">
                                 <p className="text-xl font-bold text-slate-200 italic leading-relaxed">"{scene.audioNarration}"</p>
                                 {sceneAudios[sceneId] && (
                                  <div className="mt-6 flex items-center gap-4 bg-orange-500/10 p-4 rounded-3xl border border-orange-500/20 animate-in slide-in-from-top-2">
                                     <div className="p-3 bg-orange-600 rounded-2xl shadow-lg">
                                       <Volume2 className="w-5 h-5 text-white" />
                                     </div>
                                     <audio src={sceneAudios[sceneId]} controls className="h-10 flex-1 accent-orange-500" />
                                  </div>
                                 )}
                               </div>
                            </div>

                            <div className="space-y-4">
                               <div className="flex items-center gap-3">
                                 <Zap className="w-4 h-4 text-[#f97316]" />
                                 <span className="text-[11px] font-black text-[#f97316] uppercase tracking-widest">Video Prompt JSON Blueprint</span>
                               </div>
                               <div className="p-8 bg-[#1a0b2e] rounded-[2.5rem] border border-white/5">
                                 <div className="font-mono text-[12px] text-slate-300 leading-relaxed max-h-[160px] overflow-y-auto custom-scrollbar pr-4">
                                   {scene.technicalPrompt}
                                 </div>
                               </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-12 border-t border-white/5 mt-12 flex flex-col items-center pb-20">
                   {!showVideoOptions ? (
                      <button 
                        onClick={() => setShowVideoOptions(true)}
                        className="group relative bg-[#f97316] text-white px-12 py-6 rounded-[2.5rem] font-black text-2xl flex items-center gap-6 hover:bg-[#ea580c] transition-all shadow-2xl shadow-[#f97316]/20 hover:scale-105 active:scale-95"
                      >
                         <Video className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                         Lanjut ke Produksi Video
                         <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </button>
                   ) : (
                      <div className="w-full max-w-4xl bg-white/[0.03] backdrop-blur-xl rounded-[3.5rem] border border-[#f97316]/30 p-10 animate-in slide-in-from-bottom-8 duration-500 shadow-2xl">
                         <div className="text-center mb-10">
                            <h4 className="text-3xl font-black text-white">Pilih Video Engine Utama</h4>
                            <p className="text-slate-500 font-medium mt-2">Gunakan prompt di atas pada salah satu engine berikut untuk merender video cinematic.</p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <a href="https://www.meta.ai" target="_blank" className="group bg-white/[0.05] p-8 rounded-[2.5rem] border border-white/5 hover:border-orange-500/50 transition-all flex flex-col items-center text-center gap-4">
                               <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Zap className="w-8 h-8 text-white fill-white" />
                               </div>
                               <p className="text-xl font-black text-white">Meta AI</p>
                               <ExternalLink className="w-5 h-5 text-slate-700 group-hover:text-orange-400 transition-colors" />
                            </a>
                            <a href="https://flow.ai" target="_blank" className="group bg-white/[0.05] p-8 rounded-[2.5rem] border border-white/5 hover:border-[#f97316]/50 transition-all flex flex-col items-center text-center gap-4">
                               <div className="w-16 h-16 bg-[#f97316] rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Rocket className="w-8 h-8 text-white" />
                               </div>
                               <p className="text-xl font-black text-white">Flow AI</p>
                               <ExternalLink className="w-5 h-5 text-slate-700 group-hover:text-[#f97316] transition-colors" />
                            </a>
                            <a href="https://grok.com" target="_blank" className="group bg-white/[0.05] p-8 rounded-[2.5rem] border border-white/5 hover:border-white/30 transition-all flex flex-col items-center text-center gap-4">
                               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <span className="text-2xl font-black text-black">/</span>
                                </div>
                               <p className="text-xl font-black text-white">Grok</p>
                               <ExternalLink className="w-5 h-5 text-slate-700 group-hover:text-white transition-colors" />
                            </a>
                         </div>
                         <button onClick={() => setShowVideoOptions(false)} className="mt-8 text-slate-600 hover:text-slate-400 font-black text-[10px] uppercase tracking-widest block mx-auto">Kembali ke Storyboard</button>
                      </div>
                   )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-8 py-20">
                 <div className="w-32 h-32 bg-white/5 rounded-[3.5rem] flex items-center justify-center border border-white/10 shadow-2xl">
                    {loading ? <Loader2 className="w-14 h-14 text-[#f97316] animate-spin" /> : <Eye className="w-14 h-14 text-slate-500" />}
                 </div>
                 <h4 className="text-3xl font-black text-white tracking-tight">Menunggu Visi Visual</h4>
                 <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">Tentukan brand dan deskripsi visi di kiri untuk memulai rancangan storyboard cinematic.</p>
              </div>
            )}
          </div>

          <div className="px-10 py-5 bg-white/[0.03] backdrop-blur-md border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
             <div className="flex gap-4">
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#f97316]" /> Storyboard Consistency: ON</span>
               <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Visual Quality: High-End</span>
             </div>
             <span className="opacity-50">StudioPebisnis v3.1 Vision Core</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionDesigner;

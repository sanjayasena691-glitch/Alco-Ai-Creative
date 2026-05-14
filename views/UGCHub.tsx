
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Sparkles, Monitor, Clock, MessageSquare, Zap, Tag, Palette, Eye, Layers, Copy, Check, Upload, X, Package, Clapperboard, Camera, Star, Video, Image as ImageIcon, Download, Mic2, Volume2, ArrowRight, Globe, Rocket, ExternalLink, Terminal, Users, User, Edit3, Type
} from 'lucide-react';
import { generateVideoPrompt, generateAdImage, generateAudio, editAdImage } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';
import { downloadText, downloadImage } from '../utils/downloadUtils';

const InputField = ({ label, name, value, onChange, placeholder, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3 h-3 text-orange-500" />
      {label}
    </label>
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-bold bg-white/[0.05] text-white placeholder:text-slate-500 shadow-inner"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange, placeholder, icon: Icon, rows = 3 }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3 h-3 text-orange-500" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 rounded-xl border border-white/10 focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-bold bg-white/[0.05] text-white placeholder:text-slate-500 resize-none shadow-inner"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options, icon: Icon }: any) => (
  <div className="space-y-2">
    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
      <Icon className="w-3 h-3 text-orange-500" />
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/[0.05] focus:ring-2 focus:ring-orange-500 outline-none transition-all text-sm font-bold text-white shadow-inner"
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
        <Icon className="w-3.5 h-3.5 text-orange-500" />
        {label}
      </label>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative group h-28 border-2 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center transition-all cursor-pointer ${image ? 'border-orange-500/40 bg-orange-500/5' : 'border-white/10 hover:border-orange-500/40 bg-white/5 hover:bg-white/10'}`}
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
              <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-0.5">Asset Siap</p>
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

const UGCHub: React.FC = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = usePersistentState<any>('ugc_output', null);
  const [sceneVisuals, setSceneVisuals] = usePersistentState<Record<number, string>>('ugc_visuals', {});
  const [sceneAudios, setSceneAudios] = usePersistentState<Record<number, string>>('ugc_audios', {});
  const [visualizingScene, setVisualizingScene] = useState<number | null>(null);
  const [voicingScene, setVoicingScene] = useState<number | null>(null);
  const [editingVisual, setEditingVisual] = useState<number | null>(null);
  
  const [productImage, setProductImage] = usePersistentState<string | null>('ugc_product_image', null);
  const [modelImage, setModelImage] = usePersistentState<string | null>('ugc_model_image', null);
  const [copiedSceneId, setCopiedSceneId] = useState<number | null>(null);
  const [showVideoOptions, setShowVideoOptions] = useState(false);

  const sceneOptions = Array.from({ length: 10 }, (_, i) => ({ id: (i + 1).toString(), name: `${i + 1} Adegan` }));
  const voiceOptions = [
    { id: 'Kore', name: 'Kore (Wanita - Energetik)' },
    { id: 'Zephyr', name: 'Zephyr (Wanita - Lembut)' },
    { id: 'Puck', name: 'Puck (Pria - Ceria)' },
    { id: 'Charon', name: 'Charon (Pria - Wibawa)' }
  ];

  const [formData, setFormData] = usePersistentState('ugc_form', {
    brandName: '',
    productFeatures: '',
    aspectRatio: '9:16',
    numberOfScenes: '3',
    voiceName: 'Kore'
  });

  // State for dynamic scene inputs
  const [sceneInputs, setSceneInputs] = usePersistentState<string[]>('ugc_scene_inputs', []);

  useEffect(() => {
    const count = parseInt(formData.numberOfScenes);
    setSceneInputs(new Array(count).fill(''));
  }, [formData.numberOfScenes]);

  const handleSceneInputChange = (idx: number, val: string) => {
    const newInputs = [...sceneInputs];
    newInputs[idx] = val;
    setSceneInputs(newInputs);
  };

  const handleGenerate = async () => {
    if (!formData.brandName) return alert('Nama Brand wajib diisi');
    setLoading(true);
    setOutput(null);
    setShowVideoOptions(false);
    setSceneVisuals({});
    setSceneAudios({});
    try {
      const res = await generateVideoPrompt({ 
        ...formData, 
        productImage, 
        modelImage, 
        sceneInputs,
        isUGC: true 
      });
      setOutput(JSON.parse(res));
    } catch (err) {
      alert('Gagal memproses storyboard UGC.');
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
        fullDescription: `${scene.technicalPrompt}. COMPULSORY: Max 8s audio sync. Show clear interaction between creator and product.`,
        adSize: formData.aspectRatio,
        image: productImage,
        creatorImage: modelImage 
      });
      if (result) setSceneVisuals(prev => ({ ...prev, [sceneId]: result }));
    } catch (err) {
      alert('Gagal merender visual adegan.');
    } finally {
      setVisualizingScene(null);
    }
  };

  const handleEditSceneVisual = async (sceneId: number, editPrompt: string) => {
    const currentUrl = sceneVisuals[sceneId];
    if (!currentUrl || !editPrompt.trim()) return;
    setEditingVisual(sceneId);
    try {
      const result = await editAdImage(currentUrl, editPrompt, formData.aspectRatio);
      if (result) setSceneVisuals(prev => ({ ...prev, [sceneId]: result }));
    } catch (err) {
      alert('Gagal mengedit visual.');
    } finally {
      setEditingVisual(null);
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

  const handleUpdateSceneData = (idx: number, field: string, value: string) => {
    const newScenes = [...output.scenes];
    newScenes[idx] = { ...newScenes[idx], [field]: value };
    setOutput({ ...output, scenes: newScenes });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-20">
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-8 md:p-10 rounded-[3rem] border border-white/10 shadow-2xl overflow-y-auto max-h-[1200px] custom-scrollbar">
          <div className="flex items-center gap-5 mb-10">
            <div className="p-4 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
               <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">{t('ugc.title')}</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">{t('ugc.subtitle')}</p>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <InputField label={t('common.brand_name')} name="brandName" value={formData.brandName} onChange={(e: any) => setFormData({...formData, brandName: e.target.value})} placeholder="ZenCoffee" icon={Tag} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label={t('audio.voice_select')} name="voiceName" value={formData.voiceName} onChange={(e: any) => setFormData({...formData, voiceName: e.target.value})} options={voiceOptions} icon={Mic2} />
              <SelectField label={t('vision.aspect_ratio')} name="aspectRatio" value={formData.aspectRatio} onChange={(e: any) => setFormData({...formData, aspectRatio: e.target.value})} options={['9:16', '16:9']} icon={Monitor} />
            </div>
            <SelectField label={t('vision.scenes')} name="numberOfScenes" value={formData.numberOfScenes} onChange={(e: any) => setFormData({...formData, numberOfScenes: e.target.value})} options={sceneOptions} icon={Layers} />
            
            {/* Dynamic Per-Scene Input Form */}
            <div className="space-y-4 p-4 bg-white/[0.03] rounded-2xl border border-white/5 shadow-inner">
               <div className="flex items-center gap-2 mb-2">
                 <Edit3 className="w-3 h-3 text-orange-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Detail Tema Per Adegan (Opsional)</span>
               </div>
               {sceneInputs.map((input, idx) => (
                 <div key={idx} className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase">Adegan {idx + 1}</p>
                   <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => handleSceneInputChange(idx, e.target.value)}
                    placeholder="Contoh: Hook kaget ke arah kamera..."
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/[0.05] text-xs font-bold text-white focus:border-orange-500 outline-none placeholder:text-slate-600 shadow-inner"
                   />
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
               <ImageUploadBox label="Produk" subLabel="Asset Produk" image={productImage} onUpload={setProductImage} onClear={() => setProductImage(null)} icon={Package} />
               <ImageUploadBox label="Kreator" subLabel="Wajah Model" image={modelImage} onUpload={setModelImage} onClear={() => setModelImage(null)} icon={User} />
            </div>
            <TextAreaField label="Fitur Utama" name="productFeatures" value={formData.productFeatures} onChange={(e: any) => setFormData({...formData, productFeatures: e.target.value})} placeholder="Poin-poin penting produk..." icon={Sparkles} rows={3} />
            
            <button onClick={handleGenerate} disabled={loading} className="w-full bg-orange-500 text-white py-5 rounded-[1.8rem] font-black text-lg hover:bg-orange-600 shadow-xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 mt-4 border-b-4 border-orange-700">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Users className="w-6 h-6" />}
              {loading ? t('ugc.generating') : t('ugc.generate_btn')}
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-[4rem] border border-white/10 shadow-2xl h-full min-h-[800px] flex flex-col overflow-hidden sticky top-24">
          <div className="px-10 py-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02] backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">UGC Creator Matrix v3.2</span>
            </div>
            {output && (
              <button 
                onClick={() => downloadText('ugc-storyboard.json', JSON.stringify(output, null, 2))}
                className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all active:scale-95 shadow-xl"
              >
                <Download className="w-3.5 h-3.5" /> Download Storyboard
              </button>
            )}
          </div>

          <div className="flex-1 p-10 overflow-y-auto custom-scrollbar">
            {output ? (
              <div className="space-y-12 animate-in fade-in duration-500 text-left pb-20">
                <div className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-[3rem]">
                   <p className="text-xl font-bold italic text-slate-100">"{output.masterCreativeStyle}"</p>
                </div>
                
                <div className="space-y-12">
                  {output.scenes.map((scene: any, idx: number) => {
                    const sceneId = scene.sceneNumber || idx + 1;
                    return (
                      <div key={idx} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-10 hover:bg-white/[0.05] transition-all shadow-2xl relative">
                        <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                          <div className="flex items-center gap-6">
                            <div className="bg-orange-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl">
                              {sceneId}
                            </div>
                            <div>
                              <h5 className="font-black text-white text-xl">Adegan {sceneId}</h5>
                              <div className="flex gap-4 mt-1">
                                 <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                   <Clock className="w-3 h-3" /> MAX 8 DETIK
                                 </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleVisualizeScene(scene, idx)} disabled={visualizingScene === sceneId} className="px-4 py-2 bg-orange-500/10 hover:bg-orange-500 text-orange-500 hover:text-white rounded-xl border border-orange-500/20 transition-all flex items-center gap-2 font-black text-[10px] uppercase">
                              {visualizingScene === sceneId ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                              Render Visual
                            </button>
                            <button onClick={() => handleGenerateAudioForScene(scene, idx)} disabled={voicingScene === sceneId} className="px-4 py-2 bg-orange-500/10 hover:bg-orange-600 text-orange-400 hover:text-white rounded-xl border border-orange-500/20 transition-all flex items-center gap-2 font-black text-[10px] uppercase">
                              {voicingScene === sceneId ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic2 className="w-3 h-3" />}
                              Suara AI
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                          {/* Visual Column with Editor */}
                          <div className="lg:col-span-4 space-y-4">
                            <div className={`bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden relative shadow-xl group/img ${formData.aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-[16/9]'}`}>
                              {sceneVisuals[sceneId] ? (
                                <>
                                  <img src={sceneVisuals[sceneId]} className="w-full h-full object-cover animate-in fade-in duration-700" alt={`Scene ${sceneId}`} />
                                  <button onClick={() => downloadImage(`ugc-${sceneId}.png`, sceneVisuals[sceneId])} className="absolute bottom-4 right-4 p-3 bg-black/60 backdrop-blur-md text-white rounded-2xl opacity-0 group-hover/img:opacity-100 transition-all border border-white/10 hover:bg-orange-500">
                                     <Download className="w-5 h-5" />
                                  </button>
                                </>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-20 text-center p-8">
                                  <ImageIcon className="w-12 h-12 mb-4" />
                                  <p className="text-[10px] font-black uppercase tracking-widest">Visual Siap</p>
                                </div>
                              )}
                              {(visualizingScene === sceneId || editingVisual === sceneId) && (
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center gap-4">
                                   <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                                   <span className="text-[9px] font-black text-white uppercase tracking-widest">Memproses...</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Visual Edit Input */}
                            {sceneVisuals[sceneId] && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[9px] font-black text-orange-500 uppercase tracking-widest px-1">
                                   <Edit3 className="w-3 h-3" /> Edit Visual Adegan
                                </div>
                                <div className="flex gap-2">
                                  <input 
                                    id={`edit-visual-${sceneId}`}
                                    type="text" 
                                    placeholder="Ganti latar jadi kamar..."
                                    className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2 text-xs font-medium text-white outline-none focus:border-orange-500 shadow-inner"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleEditSceneVisual(sceneId, (e.target as HTMLInputElement).value);
                                    }}
                                  />
                                  <button 
                                    onClick={() => {
                                      const input = document.getElementById(`edit-visual-${sceneId}`) as HTMLInputElement;
                                      handleEditSceneVisual(sceneId, input.value);
                                    }}
                                    className="p-2 bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors"
                                  >
                                    <Check className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Narration and Technical Prompt Editor */}
                          <div className="lg:col-span-8 space-y-6">
                             <div className="space-y-3">
                               <div className="flex items-center gap-3">
                                 <Type className="w-4 h-4 text-orange-400" />
                                 <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Naskah Suara (Max 8 Detik)</span>
                               </div>
                               <textarea 
                                 value={scene.audioNarration}
                                 onChange={(e) => handleUpdateSceneData(idx, 'audioNarration', e.target.value)}
                                 className="w-full bg-orange-500/5 border border-orange-500/10 rounded-3xl p-6 text-lg font-bold text-slate-200 italic leading-relaxed outline-none focus:border-orange-500/30 transition-all resize-none"
                                 rows={3}
                               />
                               {sceneAudios[sceneId] && (
                                <div className="flex items-center gap-4 bg-orange-500/10 p-3 rounded-2xl border border-orange-500/20">
                                   <Volume2 className="w-4 h-4 text-orange-400" />
                                   <audio src={sceneAudios[sceneId]} controls className="h-8 flex-1 accent-orange-500" />
                                </div>
                               )}
                            </div>

                            <div className="space-y-3">
                               <div className="flex items-center gap-3">
                                 <Zap className="w-4 h-4 text-orange-500" />
                                 <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Instruksi Teknis Video (AV Sync)</span>
                               </div>
                               <textarea 
                                 value={scene.technicalPrompt}
                                 onChange={(e) => handleUpdateSceneData(idx, 'technicalPrompt', e.target.value)}
                                 className="w-full bg-white/[0.05] border border-white/10 rounded-3xl p-6 font-mono text-xs text-orange-500/80 leading-relaxed outline-none focus:border-orange-500/30 transition-all resize-none shadow-inner"
                                 rows={4}
                               />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-12 border-t border-white/5 flex flex-col items-center">
                   {!showVideoOptions ? (
                      <button 
                        onClick={() => setShowVideoOptions(true)}
                        className="group bg-orange-500 text-white px-10 py-5 rounded-[2rem] font-black text-xl flex items-center gap-4 hover:bg-orange-600 transition-all shadow-xl"
                      >
                         <Video className="w-6 h-6" />
                         Finalisasi & Produksi Video
                         <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                   ) : (
                      <div className="w-full max-w-4xl bg-[#241542]/80 rounded-[3rem] border border-orange-500/20 p-8 animate-in slide-in-from-bottom-4 duration-500">
                         <div className="text-center mb-8">
                            <h4 className="text-2xl font-black text-white">Render Video dengan Engine AI</h4>
                            <p className="text-slate-500 text-sm mt-1">Salin instruksi sinkronisasi adegan di atas ke platform berikut.</p>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <a href="https://www.meta.ai" target="_blank" className="bg-white/[0.05] p-6 rounded-3xl border border-white/5 hover:border-orange-500/50 transition-all flex flex-col items-center gap-3">
                               <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg"><Zap className="w-6 h-6 text-white" /></div>
                               <p className="text-lg font-black text-white">Meta AI</p>
                            </a>
                            <a href="https://labs.google/flow/about" target="_blank" className="bg-white/[0.05] p-6 rounded-3xl border border-white/5 hover:border-orange-500/50 transition-all flex flex-col items-center gap-3">
                               <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg"><Rocket className="w-6 h-6 text-white" /></div>
                               <p className="text-lg font-black text-white">Flow AI</p>
                            </a>
                            <a href="https://grok.com" target="_blank" className="bg-white/[0.05] p-6 rounded-3xl border border-white/5 hover:border-white/30 transition-all flex flex-col items-center gap-3">
                               <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg"><span className="text-xl font-black text-black">/</span></div>
                               <p className="text-lg font-black text-white">Grok</p>
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
                    {loading ? <Loader2 className="w-14 h-14 text-orange-500 animate-spin" /> : <Users className="w-14 h-14 text-slate-500" />}
                 </div>
                 <h4 className="text-3xl font-black text-white tracking-tight">UGC Canvas Siap</h4>
                 <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto leading-relaxed">Pilih jumlah adegan dan isi instruksi spesifik di kiri untuk merancang storyboard UGC yang sinkron dan meyakinkan.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UGCHub;

import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  Upload, 
  Trash2, 
  ImageIcon, 
  ChevronDown, 
  Zap, 
  Settings2, 
  Layout, 
  RefreshCw, 
  Download, 
  Eye, 
  Target, 
  Grid2X2, 
  Camera, 
  User, 
  Shirt, 
  Palette,
  Loader2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePersistentState } from '../hooks/usePersistentState';
import { generateStudioAIContent } from '../services/geminiService';
import { downloadImage } from '../utils/downloadUtils';

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
      <Icon className="w-5 h-5 text-purple-400" />
    </div>
    <div>
      <h3 className="text-sm font-black text-white uppercase tracking-widest">{title}</h3>
      {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{subtitle}</p>}
    </div>
  </div>
);

const InputGroup = ({ label, children, icon: Icon, onRefresh }: { label: string, children: React.ReactNode, icon?: any, onRefresh?: () => void }) => (
  <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3 relative group shadow-lg">
    <div className="flex items-center justify-between">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {Icon && <Icon className="w-3 h-3 text-purple-500" />}
        {label}
      </label>
      {onRefresh && (
        <button onClick={onRefresh} className="p-1.5 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 text-purple-400 transition-all">
          <Settings2 className="w-3 h-3" />
        </button>
      )}
    </div>
    {children}
  </div>
);

const Select = ({ value, onChange, options, placeholder }: { value: string, onChange: (v: string) => void, options: string[], placeholder: string }) => (
  <div className="relative">
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-purple-500 transition-all cursor-pointer shadow-inner"
    >
      <option value="">{placeholder}</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
      <ChevronDown className="w-4 h-4 text-slate-500" />
    </div>
  </div>
);

const TextInput = ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder: string }) => (
  <input 
    type="text" 
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
  />
);

const StudioAI: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // dna Visual & Referensi
  const [referenceImages, setReferenceImages] = usePersistentState<string[]>('studioai_ref_images', []);
  const [physicalDescription, setPhysicalDescription] = usePersistentState('studioai_physical_desc', '');
  const [basicClothingStyle, setBasicClothingStyle] = usePersistentState('studioai_clothing_style', '');

  // Customization
  const [pose, setPose] = usePersistentState('studioai_pose', '');
  const [posePrompt, setPosePrompt] = usePersistentState('studioai_pose_prompt', '');
  const [cameraAngle, setCameraAngle] = usePersistentState('studioai_camera_angle', '');
  const [cameraAnglePrompt, setCameraAnglePrompt] = usePersistentState('studioai_camera_prompt', '');
  const [expression, setExpression] = usePersistentState('studioai_expression', '');
  const [expressionPrompt, setExpressionPrompt] = usePersistentState('studioai_expression_prompt', '');
  const [changeClothes, setChangeClothes] = usePersistentState('studioai_change_clothes', '');
  const [changePants, setChangePants] = usePersistentState('studioai_change_pants', '');
  const [addAccessories, setAddAccessories] = usePersistentState('studioai_add_accessories', '');
  const [backgroundChoice, setBackgroundChoice] = usePersistentState('studioai_background_choice', '');
  const [backgroundPrompt, setBackgroundPrompt] = usePersistentState('studioai_background_prompt', '');

  // Engine Settings
  const [precisionEngine, setPrecisionEngine] = usePersistentState('studioai_precision', 100);
  const [jumlahHasil, setJumlahHasil] = usePersistentState('studioai_quantity', 4);
  const [aspectRatio, setAspectRatio] = usePersistentState('studioai_aspect_ratio', '1:1');
  const [precisionSeed, setPrecisionSeed] = usePersistentState('studioai_seed', '823123');

  const [results, setResults] = usePersistentState<string[]>('studioai_results', []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    files.slice(0, 3 - referenceImages.length).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const generateSeed = () => {
    setPrecisionSeed(Math.floor(Math.random() * 1000000).toString());
  };

  const handleGenerate = async () => {
    if (referenceImages.length === 0) {
      alert("Please upload at least one reference image.");
      return;
    }

    setIsLoading(true);
    setResults([]);
    try {
      const images = await generateStudioAIContent({
        physicalDescription,
        basicClothingStyle,
        pose,
        posePrompt,
        cameraAngle,
        cameraAnglePrompt,
        expression,
        expressionPrompt,
        changeClothes,
        changePants,
        addAccessories,
        backgroundChoice,
        backgroundPrompt,
        precisionEngine,
        jumlahHasil,
        aspectRatio,
        precisionSeed,
        referenceImages
      });
      setResults(images);
    } catch (error) {
      console.error("Studio AI Generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto pb-20 px-4">
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: DNA & Customization */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* DNA Visual */}
          <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <SectionHeader icon={User} title="DNA Visual & Referensi" subtitle="Membangun Genetika Karakter" />
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Upload Referensi (1-3 Foto)</label>
                <div className="grid grid-cols-3 gap-3">
                  {referenceImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-purple-500/50 group">
                      <img src={img} className="w-full h-full object-cover" alt="ref" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <Trash2 className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  {referenceImages.length < 3 && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
                    >
                      <Upload className="w-5 h-5 text-slate-500 group-hover:text-purple-400 transition-colors" />
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-purple-400 transition-colors">Upload</span>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" multiple />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Deskripsi Fisik Inti</label>
                  <textarea 
                    value={physicalDescription}
                    onChange={(e) => setPhysicalDescription(e.target.value)}
                    placeholder="Contoh: Pria Asia, 30 tahun, wajah oval, mata cokelat..."
                    className="w-full aspect-[16/6] bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all resize-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gaya Pakaian Dasar</label>
                  <textarea 
                    value={basicClothingStyle}
                    onChange={(e) => setBasicClothingStyle(e.target.value)}
                    placeholder="Contoh: Kemeja oxford biru muda, celana chino cokelat..."
                    className="w-full aspect-[16/6] bg-white/[0.05] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-all resize-none shadow-inner"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customization */}
          <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <SectionHeader icon={Sparkles} title="Customization & AI Recommendation" />
              <button className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-widest border-b border-purple-500/20 pb-0.5 transition-all">
                Apply All Recommendations
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputGroup label="Pose" icon={Target}>
                <Select 
                  value={pose} 
                  onChange={setPose} 
                  placeholder="Pilih Pose..."
                  options={['Standing', 'Sitting', 'Walking', 'Action', 'Professional', 'Casual', 'Fashion Model']} 
                />
                <TextInput value={posePrompt} onChange={setPosePrompt} placeholder="Prompt singkat (opsional)..." />
              </InputGroup>

              <InputGroup label="Camera Angle" icon={Camera}>
                <Select 
                  value={cameraAngle} 
                  onChange={setCameraAngle} 
                  placeholder="Pilih Camera Angle..."
                  options={['Eye Level', 'Low Angle', 'High Angle', 'Close Up', 'Wide Shot', 'Cinematic Wide']} 
                />
                <TextInput value={cameraAnglePrompt} onChange={setCameraAnglePrompt} placeholder="Prompt singkat (opsional)..." />
              </InputGroup>

              <InputGroup label="Ekspresi" icon={Palette}>
                <Select 
                  value={expression} 
                  onChange={setExpression} 
                  placeholder="Pilih Ekspresi..."
                  options={['Neutral', 'Happy', 'Professional', 'Serious', 'Smiling', 'Surprised', 'Thinking']} 
                />
                <TextInput value={expressionPrompt} onChange={setExpressionPrompt} placeholder="Prompt singkat (opsional)..." />
              </InputGroup>

              <InputGroup label="Ubah Baju" icon={Shirt}>
                <TextInput value={changeClothes} onChange={setChangeClothes} placeholder="Prompt singkat (opsional)..." />
              </InputGroup>

              <InputGroup label="Ubah Celana" icon={Layout}>
                <TextInput value={changePants} onChange={setChangePants} placeholder="Prompt singkat (opsional)..." />
              </InputGroup>

              <InputGroup label="Tambah Aksesoris" icon={Zap}>
                <TextInput value={addAccessories} onChange={setAddAccessories} placeholder="Prompt singkat (opsional)..." />
              </InputGroup>

              <div className="md:col-span-2">
                <InputGroup label="Pilihan Background" icon={ImageIcon}>
                  <Select 
                    value={backgroundChoice} 
                    onChange={setBackgroundChoice} 
                    placeholder="Pilih Pilihan Background..."
                    options={['Studio', 'Office', 'Outdoor Nature', 'Modern City', 'Minimalist Room', 'Neon Cyberpunk', 'Abstract']} 
                  />
                  <TextInput value={backgroundPrompt} onChange={setBackgroundPrompt} placeholder="Prompt singkat (opsional)..." />
                </InputGroup>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Engine & Results */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Engine Settings */}
          <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-12 gap-y-10">
              
              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 truncate">
                    <Target className="w-3 h-3 text-purple-500 shrink-0" />
                    <span className="truncate">Precision Engine (%)</span>
                  </label>
                  <span className="text-xs font-black text-purple-400 shrink-0">{precisionEngine}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={precisionEngine} 
                  onChange={(e) => setPrecisionEngine(parseInt(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-white/5 rounded-full cursor-pointer"
                />
              </div>

              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 truncate">
                    <Grid2X2 className="w-3 h-3 text-purple-500 shrink-0" />
                    <span className="truncate">Jumlah Hasil (1-15)</span>
                  </label>
                  <span className="text-sm font-black text-white shrink-0">{jumlahHasil}</span>
                </div>
                <input 
                  type="range" 
                  min="1" max="15" 
                  value={jumlahHasil} 
                  onChange={(e) => setJumlahHasil(parseInt(e.target.value))}
                  className="w-full accent-purple-600 h-1.5 bg-white/5 rounded-full cursor-pointer"
                />
              </div>

              <div className="space-y-4 min-w-0">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 truncate">
                  <Layout className="w-3 h-3 text-purple-500 shrink-0" />
                  <span className="truncate">Format Gambar (Aspect Ratio)</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['1:1', '4:3', '16:9', '9:16'].map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all border ${aspectRatio === ratio ? 'bg-purple-600 text-white border-purple-500' : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10'}`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 min-w-0">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 truncate">
                  <Zap className="w-3 h-3 text-purple-500 shrink-0" />
                  <span className="truncate">Precision Seed (Lock Identity)</span>
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={precisionSeed}
                    onChange={(e) => setPrecisionSeed(e.target.value)}
                    className="w-full h-10 bg-white/[0.05] border border-white/10 rounded-xl pl-4 pr-10 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
                  />
                  <div className="absolute inset-y-0 right-1 flex items-center">
                    <button 
                      onClick={generateSeed}
                      className="p-2 hover:bg-purple-500/10 rounded-lg text-slate-500 hover:text-purple-400 transition-all flex items-center justify-center"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || referenceImages.length === 0}
              className="w-full mt-10 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 hover:from-orange-300 hover:to-amber-400 text-white font-black py-5 rounded-2xl shadow-[0_0_25px_rgba(249,115,22,0.3)] hover:shadow-[0_0_35px_rgba(249,115,22,0.5)] flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group active:scale-[0.98] border-b-4 border-orange-700 active:border-b-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="uppercase tracking-[0.2em] text-sm">Synthesizing Creative Studio...</span>
                </>
              ) : (
                <>
                  <Zap className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  <span className="uppercase tracking-[0.2em] text-sm">Generate AI Studio</span>
                </>
              )}
            </button>
          </div>

          {/* Results Grid */}
          <div className="bg-white/[0.03] backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-2xl min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <SectionHeader icon={ImageIcon} title="Output Gambar Dan UGC Videos" />
              {results.length > 0 && (
                <div className="flex gap-4">
                  <button onClick={() => setResults([])} className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center space-y-6 pt-20"
                  >
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                       <p className="text-white font-black uppercase tracking-[0.3em] text-sm">Generating Character Matrix</p>
                       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">Analyzing reference images & style DNA...</p>
                    </div>
                  </motion.div>
                ) : results.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {results.map((img, idx) => (
                      <div key={idx} className="group relative bg-white/[0.05] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                        <img src={img} className="w-full h-auto object-cover" alt={`Result ${idx + 1}`} referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
                          <button 
                            onClick={() => downloadImage(`studio-ai-${idx}.png`, img)}
                            className="bg-purple-600 text-white p-4 rounded-2xl shadow-2xl hover:bg-purple-500 transition-all flex items-center gap-3"
                          >
                            <Download className="w-5 h-5" />
                            <span className="font-black uppercase tracking-widest text-xs">Download Image</span>
                          </button>
                          <div className="flex gap-2">
                             <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-black text-white/50 uppercase tracking-widest">
                                {aspectRatio}
                             </div>
                             <div className="px-3 py-1.5 bg-white/10 rounded-lg text-[10px] font-black text-white/50 uppercase tracking-widest">
                                Result {idx + 1}
                             </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center opacity-20 py-40"
                  >
                    <div className="w-32 h-32 bg-white/5 rounded-[3.5rem] flex items-center justify-center border border-white/10 shadow-2xl mb-8">
                      <Sparkles className="w-14 h-14 text-purple-500" />
                    </div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-3 text-center">Ready for Synthesis</h4>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs max-w-xs text-center leading-relaxed">
                      Upload your reference images and configure the character DNA to start generating.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap gap-4 items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-600">
               <div className="flex gap-6">
                 <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Precision Engine v4.2</span>
                 <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Character Consistency Locked</span>
               </div>
               <div className="flex items-center gap-2 opacity-100 text-purple-500/50">
                  <Check className="w-3.5 h-3.5" /> Unlimited Synthesis Credits
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioAI;

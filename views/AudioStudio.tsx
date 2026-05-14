
import React, { useState } from 'react';
import { 
  Mic2, 
  Loader2, 
  Play, 
  Download, 
  Volume2, 
  MessageSquare, 
  Sparkles, 
  User, 
  Heart,
  Music,
  Zap,
  Tag,
  Volume1,
  FastForward,
  Info
} from 'lucide-react';
import { generateAudio } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';
import { usePersistentState } from '../hooks/usePersistentState';

const voices = [
  { id: 'Kore', name: 'Kore', gender: 'Feminine', style: 'Energetic & Professional', preview: 'Halo, saya Kore. Suara saya sangat cocok untuk iklan yang penuh semangat.' },
  { id: 'Puck', name: 'Puck', gender: 'Masculine', style: 'Playful & Friendly', preview: 'Hai! Saya Puck. Mari buat konten yang santai dan akrab dengan audiens Anda.' },
  { id: 'Charon', name: 'Charon', gender: 'Masculine', style: 'Deep & Authoritative', preview: 'Selamat datang. Saya Charon. Suara berat saya akan memberikan kesan terpercaya.' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Masculine', style: 'Mysterious & Cool', preview: 'Halo. Saya Fenrir. Mari buat sesuatu yang berbeda dan menarik perhatian.' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Feminine', style: 'Calm & Warm', preview: 'Halo, saya Zephyr. Suara lembut saya sangat pas untuk produk kesehatan dan kecantikan.' },
];

const AudioStudio: React.FC = () => {
  const { t } = useLanguage();
  const [text, setText] = usePersistentState('audio_text', '');
  const [selectedVoice, setSelectedVoice] = usePersistentState('audio_voice', 'Kore');
  const [mood, setMood] = usePersistentState('audio_mood', 'Professional');
  const [speed, setSpeed] = usePersistentState('audio_speed', 1); // 0.5 to 1.5
  const [pitch, setPitch] = usePersistentState('audio_pitch', 1); // 0.5 to 1.5
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = usePersistentState<string | null>('audio_url', null);

  const getIntonationPrompt = () => {
    let speedDesc = speed > 1.2 ? "very fast" : speed < 0.8 ? "slowly and deliberately" : "at a normal pace";
    let pitchDesc = pitch > 1.2 ? "with a high-pitched tone" : pitch < 0.8 ? "with a deep and low voice" : "with a natural pitch";
    return `Speak ${speedDesc} and ${pitchDesc} in a ${mood} mood.`;
  };

  const handleGenerate = async () => {
    if (!text.trim()) return alert('Masukkan naskah terlebih dahulu');
    setLoading(true);
    setAudioUrl(null);
    try {
      const fullPrompt = `${getIntonationPrompt()}: ${text}`;
      const url = await generateAudio(fullPrompt, selectedVoice);
      setAudioUrl(url);
    } catch (err) {
      console.error(err);
      alert('Gagal menghasilkan audio. Pastikan API Key valid.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewVoice = async (voice: any) => {
    setPreviewLoading(voice.id);
    try {
      const url = await generateAudio(voice.preview, voice.id);
      const audio = new Audio(url);
      audio.play();
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `marketgenius-vo-${selectedVoice.toLowerCase()}.wav`;
    link.click();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Configuration Panel */}
      <div className="lg:col-span-5 space-y-6 lg:space-y-8">
        <div className="bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 lg:p-10 rounded-3xl lg:rounded-[2.5rem] border border-white/10 shadow-2xl space-y-8">
          <div className="flex items-center gap-4 lg:gap-5">
            <div className="p-3 lg:p-4 bg-[#f97316] rounded-2xl shadow-lg">
               <Mic2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight">AI Voice Designer</h3>
              <p className="text-slate-400 text-[10px] lg:text-[11px] font-black uppercase tracking-widest mt-1">Advanced Synthesis Engine</p>
            </div>
          </div>

          <div className="space-y-5 lg:space-y-6">
            <div className="space-y-2 lg:space-y-3">
              <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <MessageSquare className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#f97316]" />
                Script / Naskah Iklan
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Masukkan naskah iklan Anda di sini..."
                rows={5}
                className="w-full px-4 lg:px-6 py-4 lg:py-5 rounded-2xl lg:rounded-[2rem] border-2 border-white/10 focus:border-[#f97316] bg-white/[0.05] text-white placeholder:text-slate-500 outline-none transition-all text-sm font-medium resize-none shadow-inner"
              />
            </div>

            <div className="space-y-3 lg:space-y-4">
               <label className="text-[10px] lg:text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                <User className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#f97316]" />
                Pilih Karakter & Preview
              </label>
              <div className="grid grid-cols-1 gap-2 lg:gap-3">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    className={`flex items-center justify-between p-3 lg:p-4 rounded-xl lg:rounded-2xl border-2 transition-all group cursor-pointer ${
                      selectedVoice === voice.id 
                      ? 'border-[#f97316] bg-[#f97316]/10 shadow-md' 
                      : 'border-white/5 hover:border-[#f97316]/50 bg-white/[0.05]'
                    }`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex items-center gap-3 lg:gap-4">
                       <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center transition-colors ${selectedVoice === voice.id ? 'bg-[#f97316] text-white' : 'bg-[#241542] text-slate-400 group-hover:bg-[#f97316]/20'}`}>
                          <Volume2 className="w-4 h-4 lg:w-5 lg:h-5" />
                       </div>
                       <div className="text-left">
                          <p className={`font-black text-xs lg:text-sm ${selectedVoice === voice.id ? 'text-white' : 'text-slate-300'}`}>{voice.name}</p>
                          <p className="text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{voice.style}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePreviewVoice(voice); }}
                        className={`p-1.5 lg:p-2 rounded-lg lg:rounded-xl transition-all ${previewLoading === voice.id ? 'bg-[#f97316]/20' : 'hover:bg-[#f97316]/20 text-[#f97316]'}`}
                      >
                        {previewLoading === voice.id ? <Loader2 className="w-3.5 h-3.5 lg:w-4 lg:h-4 animate-spin" /> : <Play className="w-3.5 h-3.5 lg:w-4 lg:h-4 fill-current" />}
                      </button>
                      <div className={`px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-md lg:rounded-lg text-[8px] lg:text-[9px] font-black uppercase ${selectedVoice === voice.id ? 'bg-[#f97316]/20 text-[#f97316]' : 'bg-[#241542] text-slate-500'}`}>
                         {voice.gender}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Intonation Controls */}
            <div className="p-5 lg:p-6 bg-white/[0.05] rounded-2xl lg:rounded-[2rem] border border-white/5 space-y-5 lg:space-y-6 shadow-inner">
              <div className="flex items-center justify-between">
                <label className="text-[10px] lg:text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Zap className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-[#f97316]" />
                  {t('audio.intonation')}
                </label>
                <div className="group relative">
                   <Info className="w-3 h-3 text-slate-500 cursor-help" />
                   <div className="absolute bottom-full right-0 mb-2 w-40 lg:w-48 p-2 lg:p-3 bg-[#241542] text-white text-[9px] lg:text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-white/5">
                      Nada dan kecepatan akan mempengaruhi emosi suara yang dihasilkan.
                   </div>
                </div>
              </div>

              <div className="space-y-4 lg:space-y-5">
                <div className="space-y-2">
                   <div className="flex justify-between text-[8px] lg:text-[10px] font-black text-slate-500 uppercase">
                      <span className="flex items-center gap-1"><Volume1 className="w-3 h-3" /> Rendah</span>
                      <span className="text-[#f97316]">Nada (Pitch)</span>
                      <span className="flex items-center gap-1">Tinggi <Volume2 className="w-3 h-3" /></span>
                   </div>
                   <input 
                      type="range" min="0.5" max="1.5" step="0.1" 
                      value={pitch} onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#f97316]"
                   />
                </div>

                <div className="space-y-2">
                   <div className="flex justify-between text-[8px] lg:text-[10px] font-black text-slate-500 uppercase">
                      <span className="flex items-center gap-1">Lambat</span>
                      <span className="text-[#f97316]">Kecepatan (Speed)</span>
                      <span className="flex items-center gap-1">Cepat <FastForward className="w-3 h-3" /></span>
                   </div>
                   <input 
                      type="range" min="0.5" max="1.5" step="0.1" 
                      value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#f97316]"
                   />
                </div>
              </div>

              <div className="pt-2">
                <label className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t('audio.mood')}</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Professional', 'Cheerfully', 'Serious', 'Excited', 'Soft', 'Mysterious'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setMood(m)}
                      className={`py-1.5 lg:py-2 rounded-lg lg:rounded-xl text-[8px] lg:text-[10px] font-black uppercase transition-all border ${mood === m ? 'bg-[#f97316] text-white border-[#f97316]' : 'bg-[#241542] text-slate-400 border-white/5 hover:border-[#f97316]/50'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={loading}
              className="w-full bg-[#f97316] text-white py-4 lg:py-5 rounded-2xl lg:rounded-[1.8rem] font-black text-lg lg:text-xl hover:bg-[#ea580c] transition-all flex items-center justify-center gap-3 lg:gap-4 shadow-xl border-b-4 border-[#9a3412] active:translate-y-1 active:border-b-0"
            >
              {loading ? <Loader2 className="w-6 h-6 lg:w-7 lg:h-7 animate-spin" /> : <Mic2 className="w-6 h-6 lg:w-7 lg:h-7" />}
              {loading ? t('audio.generating') : t('audio.generate_btn')}
            </button>
          </div>
        </div>
      </div>

      {/* Output / Preview Panel */}
      <div className="lg:col-span-7">
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-3xl lg:rounded-[3.5rem] border border-white/10 shadow-2xl h-full min-h-[400px] lg:min-h-[600px] flex flex-col overflow-hidden lg:sticky lg:top-24">
          <div className="px-6 lg:px-10 py-4 lg:py-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/[0.02] backdrop-blur-xl">
             <div className="flex items-center gap-3 lg:gap-4">
               <div className="flex gap-1.5 lg:gap-2">
                 <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-[#f97316]/80 shadow-[0_0_10px_rgba(245,100,56,0.4)]" />
                 <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-orange-500/80 shadow-[0_0_10px_rgba(249,115,22,0.4)]" />
                 <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full bg-amber-500/80 shadow-[0_0_10px_rgba(245,158,11,0.4)]" />
               </div>
               <div className="h-4 w-[1px] bg-slate-700 mx-1" />
               <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Audio Processing Unit v2.1</span>
             </div>
             {audioUrl && (
              <button 
                onClick={handleDownload}
                className="w-full sm:w-auto bg-[#f97316] hover:bg-[#ea580c] text-white px-5 lg:px-6 py-2 lg:py-2.5 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 lg:gap-3 transition-all active:scale-95 shadow-lg shadow-[#f97316]/20"
              >
                <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Download .WAV
              </button>
             )}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 text-center bg-[#1a0b2e]/20">
             {audioUrl ? (
               <div className="w-full max-w-lg space-y-8 lg:space-y-10 animate-in zoom-in-95 duration-500">
                  <div className="h-24 lg:h-32 flex items-center justify-center gap-1 lg:gap-1.5 px-4">
                    {[...Array(18)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 lg:w-2 bg-[#f97316]/40 rounded-full animate-pulse" 
                        style={{ 
                          height: `${20 + Math.random() * 80}%`,
                          animationDelay: `${i * 0.1}s` 
                        }} 
                      />
                    ))}
                  </div>

                  <div className="bg-white/[0.03] border border-white/10 p-6 lg:p-8 rounded-3xl lg:rounded-[2.5rem] backdrop-blur-md shadow-inner">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                      <div className="text-left">
                        <p className="text-[#f97316] text-[9px] lg:text-[10px] font-black uppercase tracking-widest mb-1">Preview Playback</p>
                        <h4 className="text-white text-lg lg:text-xl font-black">{selectedVoice} - {mood} Voice</h4>
                        <div className="flex flex-wrap gap-1.5 lg:gap-2 mt-2">
                           <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase border border-white/10 px-1.5 lg:px-2 py-0.5 rounded">Speed: {speed}x</span>
                           <span className="text-[8px] lg:text-[9px] font-black text-slate-400 uppercase border border-white/10 px-1.5 lg:px-2 py-0.5 rounded">Pitch: {pitch}x</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 lg:w-12 lg:h-12 bg-[#f97316] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg">
                        <Music className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                      </div>
                    </div>

                    <audio src={audioUrl} controls className="w-full accent-[#f97316]" />
                  </div>
               </div>
             ) : (
               <div className="max-w-sm opacity-40 group cursor-default py-12 lg:py-0">
                  {loading ? (
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 relative mb-6 lg:mb-8">
                         <div className="absolute inset-0 border-4 border-[#f97316]/10 border-t-[#f97316] rounded-full animate-spin" />
                         <Zap className="absolute inset-0 m-auto w-8 h-8 lg:w-10 lg:h-10 text-[#f97316] animate-pulse" />
                      </div>
                      <h4 className="text-white text-xl lg:text-2xl font-black tracking-tight mb-2">{t('audio.generating')}</h4>
                      <p className="text-slate-500 text-xs lg:text-sm font-medium">Gemini AI sedang menerapkan intonasi {mood.toLowerCase()}.</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-20 h-20 lg:w-24 lg:h-24 bg-white/5 rounded-2xl lg:rounded-[2.5rem] flex items-center justify-center mb-8 lg:mb-10 border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 mx-auto">
                        <Sparkles className="w-10 h-10 lg:w-12 lg:h-12 text-slate-500 group-hover:text-[#f97316] transition-colors" />
                      </div>
                      <h4 className="text-2xl lg:text-3xl font-black text-white mb-3 lg:mb-4 tracking-tight">Audio Preview Lab</h4>
                      <p className="text-slate-500 text-sm lg:text-base font-medium leading-relaxed px-4">
                        Gunakan tombol Play pada karakter suara untuk mendengarkan sampel, lalu atur intonasi sesuai kebutuhan brand Anda.
                      </p>
                    </>
                  )}
               </div>
             )}
          </div>

          <div className="px-6 lg:px-10 py-4 lg:py-5 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-2 text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
             <div className="flex gap-3 lg:gap-4">
               <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(245,100,56,0.5)]" /> Neural TTS Active</span>
               <span className="opacity-50">Precision Synthesis: Enabled</span>
             </div>
             <span className="opacity-50">StudioPebisnis Audio Core v1.1</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioStudio;

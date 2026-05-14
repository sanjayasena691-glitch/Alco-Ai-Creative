
import { GoogleGenAI, Type, Modality } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzePerformance = async (filesData: { fileName: string, campaigns: any[] }[]) => {
  const ai = getAI();
  const isComparative = filesData.length > 1;
  const dataString = filesData.map(f => `FILE: ${f.fileName}\nDATA: ${JSON.stringify(f.campaigns)}`).join('\n\n');

  const systemInstruction = isComparative 
    ? `Sebagai Senior Media Buyer & Strategic Analyst, lakukan ANALISIS KOMPARATIF mendalam untuk membandingkan performa antar file/periode iklan ini.`
    : `Sebagai Senior Media Buyer & Strategic Analyst, lakukan AUDIT HARIAN mendalam untuk data performa iklan tunggal ini.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `${systemInstruction}\n\nDATA IKLAN:\n${dataString}\n\nOUTPUT: JSON. Verdict: UPSCALE, DOWNSCALE, KILL, atau CONTINUE.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            verdict: { type: Type.STRING, enum: ['UPSCALE', 'DOWNSCALE', 'KILL', 'CONTINUE'] },
            comparisonNote: { type: Type.STRING },
            babyExplanation: { type: Type.STRING },
            technicalAnalysis: { type: Type.STRING },
            actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
            hint: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ['Tinggi', 'Sedang', 'Rendah'] }
          },
          required: ['title', 'verdict', 'comparisonNote', 'babyExplanation', 'technicalAnalysis', 'actionPlan', 'impact']
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const chatWithAnalyzer = async (contextData: any, userMessage: string, chatHistory: {role: string, content: string}[]) => {
  const ai = getAI();
  const historyString = chatHistory.map(h => `${h.role === 'user' ? 'USER' : 'AI'}: ${h.content}`).join('\n');
  
  const systemInstruction = `Anda adalah Senior Media Buyer Expert di StudioPebisnis AI.
  KONTEKS DATA IKLAN USER:
  ${JSON.stringify(contextData)}
  
  ATURAN JAWABAN:
  1. Jawablah dengan SANGAT TERSTRUKTUR.
  2. Gunakan **Bold** untuk terminologi penting (CTR, ROAS, Hook, dll).
  3. Gunakan Bullet Points (•) atau penomoran untuk membagi insight agar enak dilihat.
  4. Berikan spasi antar paragraf agar teks tidak menumpuk.
  5. Jika ada kampanye spesifik yang bermasalah, sebutkan namanya dengan jelas.
  6. Gunakan Bahasa Indonesia yang profesional, solutif, dan tidak bertele-tele.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${systemInstruction}\n\nRIWAYAT CHAT:\n${historyString}\n\nPERTANYAAN USER: ${userMessage}`,
  });
  return response.text;
};

export const generateTestimonialImage = async (data: any) => {
  const ai = getAI();
  const prompt = `Create a highly realistic and natural SMARTPHONE SCREENSHOT of a WhatsApp conversation.
  VISUAL UI SPECIFICATIONS:
  - APP STYLE: Identical to WhatsApp messenger.
  - CONTENT: ${data.productName} - ${data.usageResult}. 
  - Style: Realistic Indonesian conversation.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "4:3" } },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateAestheticProductPhoto = async (data: any) => {
  const ai = getAI();
  const textPart = {
    text: `Professional Product Photo for ${data.brandName}. Style: ${data.ambiance}, ${data.bgColor} background. Position: ${data.productPosition}. Realistic studio lighting. ${data.modelImage ? 'The character/model from the provided model image must be perfectly integrated, wearing or interacting with the product from the product image. Maintain 100% facial and body characteristics of the model.' : ''}`
  };
  const parts: any[] = [textPart];
  if (data.image) {
    const base64Data = data.image.split(',')[1];
    const mimeType = data.image.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }
  if (data.modelImage) {
    const base64Data = data.modelImage.split(',')[1];
    const mimeType = data.modelImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { imageConfig: { aspectRatio: "1:1" } },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateAdImage = async (data: any) => {
  const ai = getAI();
  const ratioMap: Record<string, string> = { '1:1': '1:1', '9:16': '9:16', '16:9': '16:9', '4:5': '3:4' };
  const textPart = {
    text: `Professional Advertising Creative for ${data.brandName}. Description: ${data.fullDescription}. Size: ${data.adSize}. No text unless requested: ${data.adText || ''}.`
  };
  const parts: any[] = [textPart];
  if (data.image) {
    const base64Data = data.image.split(',')[1];
    const mimeType = data.image.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }
  if (data.creatorImage) {
    const base64Data = data.creatorImage.split(',')[1];
    const mimeType = data.creatorImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { imageConfig: { aspectRatio: (ratioMap[data.adSize] as any) || "1:1" } },
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const editAdImage = async (base64Image: string, prompt: string, aspectRatio: string) => {
  const ai = getAI();
  const ratioMap: Record<string, string> = { '1:1': '1:1', '9:16': '9:16', '16:9': '16:9', '4:5': '3:4' };
  const base64Data = base64Image.split(',')[1];
  const mimeType = base64Image.split(';')[0].split(':')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: `${prompt}. IMPORTANT: Maintain product identity but modify background/setting as requested.` }
      ]
    },
    config: { imageConfig: { aspectRatio: (ratioMap[aspectRatio] as any) || "1:1" } },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateVideoPrompt = async (data: any) => {
  const ai = getAI();
  const isUGC = data.isUGC || !!data.modelImage;
  const isAffiliate = data.isAffiliate;
  
  const customScenesContext = data.sceneInputs 
    ? `Berikut adalah instruksi spesifik untuk masing-masing adegan:\n${data.sceneInputs.map((s: string, i: number) => `Adegan ${i+1}: ${s}`).join('\n')}`
    : '';

  let systemInstruction = '';
  
  if (isAffiliate) {
    systemInstruction = `Bertindaklah sebagai Spesialis Affiliate Marketing Top-Tier. Buat storyboard video JSON untuk produk ${data.brandName}.
       ATURAN AFFILIATE:
       1. NARASI UTAMA: Gunakan deskripsi narasi berikut sebagai inti cerita: "${data.detailedDescription}".
       2. POSE: Pastikan setiap adegan mencerminkan pose: ${data.pose}.
       3. AKSEN: Gunakan aksen suara: ${data.accent}. Jika aksen Indonesia, naskah harus dalam Bahasa Indonesia yang natural. Jika aksen English, naskah harus dalam Bahasa Inggris yang persuasif.
       4. PERSUASIF: Buat naskah video yang sangat persuasif, fokus pada manfaat (benefit-driven).
       4. SINEMATOGRAFI: Instruksi visual (technicalPrompt) harus fokus pada integrasi produk dengan model karakter. JANGAN sertakan teks apapun dalam gambar.
       5. KARAKTER: Pertahankan karakteristik wajah dan tubuh model dari gambar yang diunggah. Sesuaikan gaya bicara dan nada narasi dengan karakteristik visual model (misal: jika model terlihat muda, gunakan gaya bicara trendi; jika profesional, gunakan gaya bicara formal).
       6. AV SYNC: Kolom "technicalPrompt" WAJIB menyertakan teks dialog/narasi yang harus diucapkan karakter. Selain itu, di AKHIR setiap "technicalPrompt", tambahkan kalimat: "while maintaining the facial and body characteristics of the character. NO TEXT IN IMAGE.".
       7. OTOMATIS: Hasilkan "audioNarration" secara otomatis berdasarkan konteks produk, deskripsi user, dan karakteristik model.
       8. FORMAT: Balas hanya dengan JSON valid.`;
  } else if (isUGC) {
    systemInstruction = `Bertindaklah sebagai Senior UGC Creative Director. Buat storyboard video JSON untuk produk ${data.brandName}.
       ATURAN KETAT UGC:
       1. DURASI: Setiap adegan HARUS memiliki audioNarration yang jika dibaca normal TIDAK LEBIH dari 8 detik.
       2. SYNC: technicalPrompt HARUS mendeskripsikan gerakan bibir (lip-sync) atau tindakan fisik model yang sinkron dengan kata-kata dalam audioNarration.
       3. INTERAKSI: Model HARUS memegang/menggunakan produk secara nyata.
       4. FORMAT: Balas hanya dengan JSON valid.`;
  } else {
    systemInstruction = `Bertindaklah sebagai Cinematic Director. Buat storyboard vision JSON untuk ${data.brandName}.`;
  }

  const parts: any[] = [{
    text: `${systemInstruction}
    
    KONTEKS: ${data.brandName} - ${data.productFeatures || data.detailedDescription}.
    ${data.visualContext ? `VISUAL CONTEXT: Background: ${data.visualContext.background}, Palette: ${data.visualContext.palette}.` : ''}
    ${data.videoModel ? `VIDEO MODEL: ${data.videoModel}.` : ''}
    JUMLAH ADEGAN: ${data.numberOfScenes}.
    ASPEK RASIO: ${data.aspectRatio}.
    ${customScenesContext}
    
    WAJIB:
    - audioNarration maksimal 20 kata per adegan.
    - technicalPrompt detail dalam Bahasa Inggris fokus pada sinkronisasi audio-visual.`
  }];

  if (data.productImage) {
    const base64Data = data.productImage.split(',')[1];
    const mimeType = data.productImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }

  if (data.modelImage) {
    const base64Data = data.modelImage.split(',')[1];
    const mimeType = data.modelImage.split(';')[0].split(':')[1];
    parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          masterCreativeStyle: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNumber: { type: Type.INTEGER },
                description: { type: Type.STRING },
                audioNarration: { type: Type.STRING },
                technicalPrompt: { type: Type.STRING },
                duration: { type: Type.INTEGER },
                cameraAngle: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return response.text;
};

export const generateAudio = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } } }
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data");
  const audioBytes = decode(base64Audio);
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  const buffer = await decodeAudioData(audioBytes, audioCtx, 24000, 1);
  const wavBlob = createWavFromAudioBuffer(buffer);
  return URL.createObjectURL(wavBlob);
};

function createWavFromAudioBuffer(audioBuffer: AudioBuffer): Blob {
  const numOfChan = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numOfChan * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  const channels = [];
  let i, sample, offset = 0, pos = 0;
  
  function setUint16(data: number) { view.setUint16(pos, data, true); pos += 2; }
  function setUint32(data: number) { view.setUint32(pos, data, true); pos += 4; }

  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"
  setUint32(0x20746d66); // "fmt "
  setUint32(16);
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(audioBuffer.sampleRate);
  setUint32(audioBuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16); // 16-bit
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);
  
  for(i = 0; i < numOfChan; i++) channels.push(audioBuffer.getChannelData(i));
  while(offset < audioBuffer.length) {
    for(i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0;
      view.setInt16(pos, sample, true); 
      pos += 2;
    }
    offset++;
  }
  return new Blob([buffer], {type: "audio/wav"});
}

export const generateCopyVariations = async (data: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Buat 3 variasi copywriting Bahasa Indonesia untuk ${data.brandName}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            body: { type: Type.STRING },
            cta: { type: Type.STRING },
            hashtags: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const generateLandingPageStructure = async (data: any) => {
  const ai = getAI();
  const prompt = `
    Anda adalah Arsitek Landing Page Senior. Tugas Anda adalah membuat Blueprint Landing Page yang sangat detail dan teknis sehingga dapat dipahami secara penuh oleh sistem visual AI (Z.Ai) untuk dirender menjadi halaman web yang presisi.

    PARAMETER INPUT:
    - Brand: ${data.brandName}
    - Target: ${data.targetAudience}
    - Keunggulan: ${data.competitiveAdvantage}
    - Masalah: ${data.problemAngle}
    - Solusi: ${data.solution}
    - Layout: ${data.layout}
    - CTA: ${data.cta}
    - Promo: ${data.promo}
    - Tone: ${data.tone}

    STRUKTUR OUTPUT (Markdown):
    1. [DNA VISUAL]: Tentukan palette warna (hex), tipografi (font family), dan moodboard visual (misal: clean, brutalist, luxury).
    2. [HERO SECTION]: Desktop & Mobile layout, Headline (H1) yang powerful, sub-headline, and visual asset prompt.
    3. [SOCIAL PROOF]: Penempatan testimonial, logo trust, and trust pilot style.
    4. [FEATURE/SOLUTION]: Breakdown 3-4 fitur utama dengan ikonografi dan deskripsi teknis.
    5. [OFFER SECTION]: Penjelasan promo, scarcity (urgency), dan harga.
    6. [CTA SECTION]: Desain tombol, teks micro-copy, and efek hover.

    Format output harus sangat terstruktur, menggunakan poin-poin teknis, dan mengandung instruksi desain spesifik (padding, spacing, alignment) agar Z.Ai bisa menghasilkan visual yang otentik. Gunakan Bahasa Indonesia.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
  });
  return response.text;
};

export const generateAdStrategy = async (data: any) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Rancang strategi Meta Ads Bahasa Indonesia untuk ${data.brandName}.`,
    config: { thinkingConfig: { thinkingBudget: 32768 } }
  });
  return response.text;
};

export const generateStudioAIContent = async (data: any) => {
  const ai = getAI();
  const { 
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
  } = data;

  const ratioMap: Record<string, string> = { '1:1': '1:1', '4:3': '4:3', '16:9': '16:9', '9:16': '9:16' };
  
  const constructionPrompt = `Create a high-quality, photorealistic image of a character.
  CHARACTER DNA:
  - Physical: ${physicalDescription}
  - Style: ${basicClothingStyle}
  
  POSE & COMPOSITION:
  - Pose: ${pose}${posePrompt ? ` (${posePrompt})` : ''}
  - Camera: ${cameraAngle}${cameraAnglePrompt ? ` (${cameraAnglePrompt})` : ''}
  - Expression: ${expression}${expressionPrompt ? ` (${expressionPrompt})` : ''}
  
  CUSTOMIZATION:
  - Clothing: ${changeClothes || 'As described in basic style'}
  - Pants: ${changePants || 'As described in basic style'}
  - Accessories: ${addAccessories || 'None'}
  
  ENVIRONMENT:
  - Background: ${backgroundChoice}${backgroundPrompt ? ` (${backgroundPrompt})` : ''}
  
  TECHNICAL:
  - Quality: Professional studio photography, photorealistic, 8k resolution.
  - Character Consistency: You MUST maintain 100% characteristics of the character's face and body from the provided reference images.
  - Precision: ${precisionEngine}% accuracy to reference.
  - Seed: ${precisionSeed}
  
  IMPORTANT: No text, watermarks, or logos in the image.`;

  const results = [];
  
  // Since we need to generate multiple results based on 'jumlahHasil', 
  // we'll loop. Note: Gemini image gen typically returns one image per call for now.
  for (let i = 0; i < jumlahHasil; i++) {
    const parts: any[] = [{ text: constructionPrompt }];
    
    // Add reference images if they exist
    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach((img: string) => {
        const base64Data = img.split(',')[1];
        const mimeType = img.split(';')[0].split(':')[1];
        parts.push({ inlineData: { data: base64Data, mimeType: mimeType } });
      });
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { 
          imageConfig: { 
            aspectRatio: (ratioMap[aspectRatio] as any) || "1:1",
          } 
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          results.push(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (e) {
      console.error(`Failed to generate image ${i+1}:`, e);
    }
    
    // Small delay to avoid rate limits if generating many
    if (jumlahHasil > 1) await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
};

export const studioAIOrchestrator = async (userInput: string) => {
  const ai = getAI();
  const systemInstruction = `Kamu adalah "StudioAI", backend orchestrator untuk SaaS pembuatan konten visual. Kamu sekarang menangani 3 pembaruan fitur utama:

1. AVATAR AI (create_custom_avatar):
Membuat avatar AI custom fotorealistik dengan tingkat kustomisasi hiper-detail berdasarkan input pengguna. Variabel wajib meliputi: warna kulit, ras/etnis, warna/gaya rambut, postur tubuh (kurus/gemuk/proporsional/berotot), dan persona/vibe (sangat profesional, meyakinkan, CEO, kasual, dll).

2. UGC HUB (ugc_video_generation):
Menghasilkan instruksi untuk merender video yang SUDAH TERMASUK voice over (suara). Input pengguna akan diubah menjadi prompt video dinamis sekaligus script suara yang akan disinkronkan.

3. REVIEW & EXPORT (review_and_export):
Fungsi final di mana pengguna mengunggah/memilih 1 hingga 5 video dari UGC Hub untuk digabungkan menjadi 1 video panjang. Tugasmu di sini adalah menganalisis urutan cerita dari gabungan video tersebut, lalu menghasilkan Caption Media Sosial yang sangat persuasif (hook, story, offer) lengkap dengan hashtag untuk di-copy oleh pengguna.

[UPDATE FORMAT OUTPUT JSON WAJIB]
Setiap menerima input, identifikasi \`action_type\`-nya dan keluarkan HANYA format JSON murni ini tanpa teks basa-basi:

{
  "action_type": "[Pilih: create_custom_avatar, ugc_video_generation, atau review_and_export]",
  
  "optimized_prompt": "[Isi HANYA jika membuat Avatar atau UGC. Buatkan prompt bahasa Inggris super detail untuk AI Generator. KHUSUS AVATAR: Gabungkan seluruh variabel ras, kulit, rambut, postur, dan vibe. KHUSUS UGC: Deskripsikan adegan video secara visual.]",
  
  "avatar_customization": {
    "race_and_skin_tone": "[Etnis dan warna kulit spesifik]",
    "hair_style_and_color": "[Gaya dan warna rambut]",
    "body_type": "[Postur tubuh: gemuk, kurus, atletis, dll]",
    "vibe_and_persona": "[Kesan visual: profesional, meyakinkan, elegan, dll]",
    "clothing_and_setting": "[Pakaian dan latar belakang]"
  },

  "ugc_specs": {
    "visual_scene_description": "[Deskripsi visual video yang akan di-render]",
    "voice_over_script": "[Teks naskah yang akan dibacakan oleh AI Voice, disesuaikan dengan visual]"
  },

  "export_details": {
    "merged_video_context": "[Deskripsi singkat alur cerita dari gabungan 1-5 video yang diinput user (Hanya untuk review_and_export)]",
    "social_media_caption": "[Buatkan caption Instagram/TikTok bergaya copywriting konversi tinggi berdasarkan gabungan video tersebut. Wajib ada Hook, Penjelasan Solusi, dan Call to Action (CTA) jualan yang jelas.]",
    "recommended_hashtags": "[Berikan 5-8 hashtag viral dan relevan]"
  }
}

[ATURAN KETAT]
- Saat \`action_type\` adalah \`review_and_export\`, abaikan pembuatan \`optimized_prompt\` atau \`avatar_customization\`. Fokus 100% memberikan \`social_media_caption\` terbaik yang siap di-copy-paste oleh user.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `${systemInstruction}\n\nINPUT PENGGUNA:\n${userInput}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action_type: { type: Type.STRING, enum: ['create_custom_avatar', 'ugc_video_generation', 'review_and_export'] },
          optimized_prompt: { type: Type.STRING },
          avatar_customization: {
            type: Type.OBJECT,
            properties: {
              race_and_skin_tone: { type: Type.STRING },
              hair_style_and_color: { type: Type.STRING },
              body_type: { type: Type.STRING },
              vibe_and_persona: { type: Type.STRING },
              clothing_and_setting: { type: Type.STRING }
            }
          },
          ugc_specs: {
            type: Type.OBJECT,
            properties: {
              visual_scene_description: { type: Type.STRING },
              voice_over_script: { type: Type.STRING }
            }
          },
          export_details: {
            type: Type.OBJECT,
            properties: {
              merged_video_context: { type: Type.STRING },
              social_media_caption: { type: Type.STRING },
              recommended_hashtags: { type: Type.STRING }
            }
          }
        },
        required: ["action_type"]
      }
    }
  });
  
  const result = JSON.parse(response.text || '{}');

  if (result.action_type === 'create_custom_avatar' && result.optimized_prompt) {
    try {
      const imageResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: result.optimized_prompt }] },
        config: { imageConfig: { aspectRatio: "1:1" } },
      });
      for (const part of imageResponse.candidates[0].content.parts) {
        if (part.inlineData) {
          result.generated_image = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    } catch (e) {
      console.error("Failed to generate avatar image", e);
    }
  } else if (result.action_type === 'ugc_video_generation' && result.optimized_prompt) {
    // Generate the voice over
    if (result.ugc_specs?.voice_over_script) {
      try {
        const audioUrl = await generateAudio(result.ugc_specs.voice_over_script);
        result.generated_audio = audioUrl;
      } catch (e) {
        console.error("Failed to generate voice over", e);
      }
    }
  }

  return result;
};


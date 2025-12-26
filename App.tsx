
import React, { useState, useRef } from 'react';
import { extractExif } from './services/exifService';
import { analyzePhotoSubject, generateSticker } from './services/geminiService';
import { resizeImage } from './services/imageUtils';
import { PhotoMetadata } from './types';
import { JourneyMap } from './components/JourneyMap';
import { Sticker } from './components/Sticker';

const App: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoMetadata | null>(null);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = async (files: FileList) => {
    if (files.length > 10) {
      alert("最多上传10张照片哦");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const newPhotos: PhotoMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Math.random().toString(36).substring(7);
      
      setProcessingStep(`正在处理第 ${i + 1}/${files.length} 张: ${file.name}`);
      
      try {
        // 1. Extract EXIF (Original file for GPS)
        const { lat, lng, timestamp } = await extractExif(file);
        
        // 2. Resize image for Gemini API to avoid Rpc/XHR errors
        setProcessingStep(`正在优化图像大小...`);
        const { base64, mimeType } = await resizeImage(file);
        const url = URL.createObjectURL(file);

        // 3. Analyze with Gemini
        setProcessingStep(`正在分析内容...`);
        const subjectInfo = await analyzePhotoSubject(base64, mimeType);

        // 4. Generate Q-Version Sticker
        let stickerUrl: string | undefined = undefined;
        if (subjectInfo && subjectInfo.name) {
          setProcessingStep(`正在绘制Q版贴纸...`);
          const generated = await generateSticker(base64, mimeType, subjectInfo.name);
          if (generated) stickerUrl = generated;
        }

        newPhotos.push({
          id,
          name: file.name,
          url,
          base64,
          mimeType,
          stickerUrl,
          lat,
          lng,
          timestamp: timestamp?.toLocaleDateString('zh-CN'),
          subjectInfo: subjectInfo || undefined
        });
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
      }

      setProgress(Math.round(((i + 1) / files.length) * 100));
    }

    setPhotos(prev => [...prev, ...newPhotos]);
    setIsProcessing(false);
    setProcessingStep("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const clearPhotos = () => {
    setPhotos([]);
    setSelectedPhoto(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 space-y-8 max-w-7xl mx-auto pb-24 bg-[#fbf9f4]">
      {/* Header Section */}
      <header className="text-center space-y-3 mt-12 animate-fade-in">
        <div className="inline-block px-4 py-1.5 bg-amber-50 text-amber-700 text-[10px] rounded-full font-black uppercase tracking-[0.3em] mb-2 border border-amber-100 shadow-sm">
          Sticker Journey
        </div>
        <h1 className="text-5xl md:text-6xl font-handwriting text-stone-800 tracking-tight">旅行贴纸地图</h1>
        <p className="text-stone-400 font-serif italic text-lg">"把旅途中的瞬间，变成手账里的贴纸"</p>
      </header>

      {/* Upload/Action Section */}
      {!isProcessing && photos.length === 0 && (
        <div className="w-full max-w-2xl bg-white p-16 rounded-[60px] shadow-2xl border-[12px] border-white flex flex-col items-center justify-center space-y-8 transition-all hover:scale-[1.01] mt-10">
          <div className="w-40 h-40 bg-stone-50 rounded-full flex items-center justify-center border-4 border-dashed border-stone-100 group">
            <svg className="w-16 h-16 text-stone-200 group-hover:text-amber-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center space-y-2">
            <p className="text-2xl font-handwriting text-stone-700">开启你的回忆手账</p>
            <p className="text-stone-400 text-sm max-w-xs mx-auto">我们将识别照片中的主角，并用 AI 绘制出专属的 Q 版贴纸标记在地图上</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-12 py-4 bg-stone-800 text-stone-50 rounded-full font-bold hover:bg-stone-950 transition-all shadow-xl hover:shadow-2xl active:scale-95"
          >
            开始上传照片
          </button>
        </div>
      )}

      {/* Loading State */}
      {isProcessing && (
        <div className="w-full max-w-2xl bg-white p-16 rounded-[60px] shadow-2xl border-[12px] border-white flex flex-col items-center space-y-10">
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 border-[6px] border-stone-50 rounded-full"></div>
            <div 
              className="absolute inset-0 border-[6px] border-amber-400 rounded-full border-t-transparent animate-spin transition-all duration-500"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }}
            ></div>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-4xl font-handwriting text-stone-800">{progress}%</span>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Processing</span>
            </div>
          </div>
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-handwriting text-stone-800">创作进行中...</h3>
            <p className="text-stone-500 font-serif italic bg-amber-50 px-6 py-2 rounded-full border border-amber-100 inline-block">
              {processingStep}
            </p>
          </div>
        </div>
      )}

      {/* Main Map View */}
      {!isProcessing && photos.length > 0 && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-10 animate-fade-in-up">
          {/* Sidebar / List */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[40px] shadow-xl border-8 border-white sticky top-8 max-h-[750px] overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-handwriting text-2xl text-stone-800">贴纸集</h2>
                <button onClick={clearPhotos} className="text-[10px] bg-stone-50 px-3 py-1 rounded-full text-stone-400 hover:text-red-500 transition-colors uppercase font-bold tracking-widest border border-stone-100">重置</button>
              </div>
              <div className="grid grid-cols-2 gap-6 pb-6">
                {photos.map(photo => (
                  <Sticker 
                    key={photo.id} 
                    photo={photo} 
                    size={85} 
                    className="mx-auto"
                    onClick={() => setSelectedPhoto(photo)}
                  />
                ))}
              </div>
              
              <div className="mt-auto pt-8 border-t border-stone-50">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-stone-100 rounded-2xl text-stone-300 hover:border-amber-200 hover:text-amber-500 transition-all text-sm font-handwriting hover:bg-amber-50"
                >
                  添加新的时刻
                </button>
              </div>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-4 h-[750px]">
            <JourneyMap photos={photos} onSelectPhoto={setSelectedPhoto} />
          </div>
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-md animate-fade-in" onClick={() => setSelectedPhoto(null)}>
          <div className="bg-white p-10 rounded-[50px] shadow-2xl max-w-2xl w-full border-[12px] border-white transform transition-all animate-scale-in flex flex-col md:flex-row gap-10" onClick={e => e.stopPropagation()}>
            <div className="w-full md:w-1/2">
               <div className="relative aspect-square rounded-[30px] overflow-hidden mb-4 shadow-inner group">
                <img src={selectedPhoto.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              {selectedPhoto.stickerUrl && (
                <div className="flex justify-center -mt-12 relative z-10">
                   <div className="w-32 h-32 bg-white rounded-3xl p-2 shadow-2xl border-4 border-white rotate-6 hover:rotate-0 transition-transform">
                      <img src={selectedPhoto.stickerUrl} className="w-full h-full object-contain mix-blend-multiply" />
                   </div>
                </div>
              )}
            </div>
            
            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <div className="inline-block px-3 py-1 bg-stone-100 rounded-full text-[10px] text-stone-400 font-bold tracking-widest uppercase">Memory Detail</div>
                <h3 className="text-4xl font-handwriting text-stone-800 leading-tight">{selectedPhoto.subjectInfo?.name || "未知回忆"}</h3>
                <div className="flex items-center space-x-2 text-amber-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                  <span className="text-sm font-serif">{selectedPhoto.lat ? `${selectedPhoto.lat.toFixed(4)}, ${selectedPhoto.lng?.toFixed(4)}` : "位置未知"}</span>
                </div>
              </div>
              
              <div className="p-6 bg-stone-50 rounded-[30px] border border-stone-100 italic font-serif text-stone-600 leading-relaxed relative">
                <span className="absolute -top-4 -left-2 text-6xl text-stone-200 font-serif opacity-50">“</span>
                {selectedPhoto.subjectInfo?.description || "那是生命中一段特别的旅程，静静地躺在快门留下的时空里。"}
              </div>
              
              <div className="text-xs text-stone-300 font-serif tracking-widest uppercase">Captured on {selectedPhoto.timestamp || "a bright day"}</div>

              <button 
                onClick={() => setSelectedPhoto(null)}
                className="w-full py-4 bg-stone-800 text-white rounded-2xl font-handwriting text-lg hover:bg-stone-900 transition-all shadow-lg active:scale-95 mt-4"
              >
                收起这枚贴纸
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Hidden Input */}
      <input 
        type="file" 
        multiple 
        accept="image/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      {/* Footer / Info */}
      <footer className="fixed bottom-0 left-0 right-0 p-8 flex justify-center pointer-events-none z-[1500]">
        <div className="bg-white/80 backdrop-blur-md px-8 py-3 rounded-full border border-stone-100 shadow-xl text-[10px] text-stone-400 uppercase tracking-[0.3em] font-black pointer-events-auto hover:text-amber-500 transition-colors">
          Powered by Gemini 2.5 Flash Image • Nano Banana Series
        </div>
      </footer>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { from { transform: scale(0.9) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-scale-in { animation: scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 10px; }
        .sticker-marker { background: transparent !important; border: none !important; }
        .sticker-marker:hover { z-index: 2000 !important; }
        .sticker-marker:hover > div { transform: scale(1.3) rotate(3deg); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
};

export default App;

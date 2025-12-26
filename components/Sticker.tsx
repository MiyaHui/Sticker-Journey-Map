
import React from 'react';
import { PhotoMetadata } from '../types';

interface StickerProps {
  photo: PhotoMetadata;
  size?: number;
  className?: string;
  onClick?: () => void;
  showStickerOnly?: boolean;
}

export const Sticker: React.FC<StickerProps> = ({ photo, size = 100, className = "", onClick, showStickerOnly = false }) => {
  if (!photo.subjectInfo) return null;

  const [ymin, xmin, ymax, xmax] = photo.subjectInfo.boundingBox;
  const width = xmax - xmin;
  const height = ymax - ymin;

  // If we have a generated stickerUrl, use it. Otherwise, fall back to the photo crop.
  const displayUrl = photo.stickerUrl || photo.url;
  const isGenerated = !!photo.stickerUrl;

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-500 transform hover:scale-125 hover:z-50 ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
    >
      <div className={`absolute inset-0 bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-500 ${isGenerated ? 'p-1' : 'border-4 border-white'}`}>
        <img 
          src={displayUrl} 
          alt={photo.subjectInfo.name}
          className={`w-full h-full transition-transform duration-700 group-hover:scale-110 ${isGenerated ? 'object-contain mix-blend-multiply' : 'object-cover'}`}
          style={!isGenerated ? {
             objectPosition: `${(xmin + width/2)/10}% ${(ymin + height/2)/10}%`
          } : undefined}
        />
      </div>
      
      {/* Sticker "White Border" for generated ones specifically if background is mixed */}
      {isGenerated && (
        <div className="absolute inset-0 border-4 border-white rounded-2xl pointer-events-none"></div>
      )}
      
      {/* Decorative shadow layer */}
      <div className="absolute -inset-1 rounded-2xl bg-black/5 blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      {/* Tooltip-like label */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-3 py-1 rounded-full shadow-md text-xs opacity-0 group-hover:opacity-100 transition-all z-10 font-handwriting text-stone-700 scale-90 group-hover:scale-100">
        {photo.subjectInfo.name}
      </div>
    </div>
  );
};

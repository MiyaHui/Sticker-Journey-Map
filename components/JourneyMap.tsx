
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PhotoMetadata } from '../types';
import ReactDOMServer from 'react-dom/server';

interface JourneyMapProps {
  photos: PhotoMetadata[];
  onSelectPhoto: (photo: PhotoMetadata) => void;
}

const AutoBounds: React.FC<{ photos: PhotoMetadata[] }> = ({ photos }) => {
  const map = useMap();

  useEffect(() => {
    if (photos.length === 0) return;
    const validPhotos = photos.filter(p => p.lat !== undefined && p.lng !== undefined);
    if (validPhotos.length === 0) return;
    const bounds = L.latLngBounds(validPhotos.map(p => [p.lat!, p.lng!] as [number, number]));
    map.fitBounds(bounds, { padding: [100, 100], maxZoom: 12 });
  }, [photos, map]);

  return null;
};

const createStickerIcon = (photo: PhotoMetadata) => {
  const isGenerated = !!photo.stickerUrl;
  const displayUrl = photo.stickerUrl || photo.url;
  
  const html = ReactDOMServer.renderToStaticMarkup(
    <div style={{ 
      width: '80px', 
      height: '80px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ 
        width: '100%', 
        height: '100%', 
        background: 'white', 
        borderRadius: '20px', 
        border: '4px solid white', 
        boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out'
      }}>
        <img 
          src={displayUrl} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: isGenerated ? 'contain' : 'cover',
            // Simple hack to simulate transparency for white backgrounds
            mixBlendMode: isGenerated ? 'multiply' : 'normal'
          }} 
        />
      </div>
      <div style={{
        position: 'absolute',
        bottom: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'white',
        padding: '2px 8px',
        borderRadius: '10px',
        fontSize: '10px',
        whiteSpace: 'nowrap',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontFamily: 'ZCOOL XiaoWei',
        color: '#444'
      }}>
        {photo.subjectInfo?.name}
      </div>
    </div>
  );

  return L.divIcon({
    html,
    className: 'sticker-marker',
    iconSize: [80, 80],
    iconAnchor: [40, 40]
  });
};

export const JourneyMap: React.FC<JourneyMapProps> = ({ photos, onSelectPhoto }) => {
  const validPhotos = photos.filter(p => p.lat !== undefined && p.lng !== undefined);

  return (
    <div className="w-full h-full relative rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
      <MapContainer 
        center={[0, 0]} 
        zoom={2} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <AutoBounds photos={photos} />
        {validPhotos.map((photo) => (
          <Marker 
            key={photo.id} 
            position={[photo.lat!, photo.lng!]}
            icon={createStickerIcon(photo)}
            eventHandlers={{
              click: () => onSelectPhoto(photo),
            }}
          />
        ))}
      </MapContainer>
      
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-5 py-3 rounded-[24px] border border-stone-100 shadow-xl flex items-center space-x-3">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-stone-700 font-handwriting font-bold tracking-wider">我的足迹地图</span>
        </div>
      </div>
    </div>
  );
};

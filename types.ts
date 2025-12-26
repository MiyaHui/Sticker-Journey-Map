
export interface PhotoMetadata {
  id: string;
  name: string;
  url: string;
  base64: string;
  mimeType: string;
  stickerUrl?: string; // Generated sticker URL
  lat?: number;
  lng?: number;
  timestamp?: string;
  subjectInfo?: {
    name: string;
    description: string;
    boundingBox: [number, number, number, number]; // [ymin, xmin, ymax, xmax]
  };
}

export interface MapBounds {
  center: [number, number];
  zoom: number;
}

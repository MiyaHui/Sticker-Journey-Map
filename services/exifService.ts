
import exifr from 'https://cdn.skypack.dev/exifr';

export async function extractExif(file: File): Promise<{ lat?: number; lng?: number; timestamp?: Date }> {
  try {
    const data = await exifr.gps(file);
    const meta = await exifr.parse(file);
    
    return {
      lat: data?.latitude,
      lng: data?.longitude,
      timestamp: meta?.DateTimeOriginal ? new Date(meta.DateTimeOriginal) : undefined
    };
  } catch (error) {
    console.error("EXIF extraction failed:", error);
    return {};
  }
}

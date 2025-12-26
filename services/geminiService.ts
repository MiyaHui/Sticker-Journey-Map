
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzePhotoSubject(base64Data: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Identify the main subject (person, animal, or unique object) in this image. Provide its name, a short poetic description (in Chinese), and its bounding box [ymin, xmin, ymax, xmax] where values are 0-1000 representing the coordinate system of the image."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            boundingBox: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
              description: "[ymin, xmin, ymax, xmax]"
            }
          },
          required: ["name", "description", "boundingBox"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Analysis failed:", e);
    return null;
  }
}

export async function generateSticker(base64Data: string, mimeType: string, subjectName: string): Promise<string | null> {
  const model = "gemini-2.5-flash-image";
  
  // Simplified prompt to avoid safety filters and complexity issues
  const prompt = `Convert the ${subjectName} from this photo into a cute Q-version chibi sticker. 
  Features: thick white outline, vibrant cartoon colors, high-contrast, die-cut style. 
  The subject must be centered on a plain white background.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      console.warn("No parts in sticker generation response");
      return null;
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    console.warn("No image data found in response parts");
    return null;
  } catch (e: any) {
    console.error("Sticker generation failed details:", e);
    return null;
  }
}

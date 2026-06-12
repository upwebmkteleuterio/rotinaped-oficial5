import { GoogleGenAI, Type } from "@google/genai";
import { PNI_SCHEDULE } from '../data/vaccineSchedule';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface AIResult {
  vaccineId: string;
  name: string;
  dose: string;
  dateRead: string | null; // The date actually read from the notebook
  expectedDate: string;   // The calculated date from PNI (fallback)
}

/**
 * Business Rule (Immutable): 
 * If AI cannot read the application date, it MUST return the date 
 * based on the child's birth date and the recommended PNI age.
 */
export async function analyzeVaccineNotebook(
  imageBase64: string, 
  childBirthDate: string
): Promise<AIResult[]> {
  
  const prompt = `
    Analise esta imagem de caderneta de vacinação. 
    Compare com o calendário PNI Brasileiro.
    Identifique quais vacinas já foram aplicadas (marcadas como tomadas).
    Para cada vacina identificada, retorne o nome, a dose e a data de aplicação se estiver visível.
    
    IMPORTANTE (Regra de Negócio):
    Se houver uma vacina marcada como tomada, mas você não conseguir ler a data de aplicação, retorne null no campo 'dateRead'.
    
    Retorne um array JSON.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { text: prompt },
        { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            dose: { type: Type.STRING },
            dateRead: { type: Type.STRING, nullable: true },
          },
          required: ["name", "dose"]
        }
      }
    }
  });

  const rawResults = JSON.parse(response.text || '[]') as any[];
  
  return rawResults.map(raw => {
    // Try to match with PNI_SCHEDULE to get metadata
    const scheduleMatch = PNI_SCHEDULE.find(s => 
      raw.name.toLowerCase().includes(s.name.toLowerCase()) &&
      (raw.dose ? s.dose.toLowerCase().includes(raw.dose.toLowerCase()) : true)
    );

    // Calculate expected date: birthDate + months from PNI
    const birthDateObj = new Date(childBirthDate);
    const monthsToAdd = scheduleMatch?.ageInMonths || 0;
    const expectedDateObj = new Date(birthDateObj);
    expectedDateObj.setMonth(expectedDateObj.getMonth() + monthsToAdd);
    
    const expectedDate = expectedDateObj.toISOString().split('T')[0];

    return {
      vaccineId: scheduleMatch?.id || `manual-${crypto.randomUUID()}`,
      name: scheduleMatch?.name || raw.name,
      dose: scheduleMatch?.dose || raw.dose || '',
      dateRead: raw.dateRead,
      expectedDate: expectedDate
    };
  });
}

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
    Você é um assistente pediátrico especialista em leitura de cadernetas de vacinação manuscritas.
    
    INSTRUÇÕES DE ANÁLISE:
    1. Analise a imagem fornecida da caderneta de vacinação e compare os registros com o Calendário PNI Brasileiro (Programa Nacional de Imunizações).
    2. Identifique quais vacinas já foram aplicadas (marcadas com carimbo, assinatura, check, preenchimento de lote ou data de aplicação).

    CRITÉRIO DE RIGOR PARA DATAS (Evitar Alucinações):
    - Caligrafias médicas podem ser ilegíveis, rasuradas ou borradas.
    - Se você identificar que uma vacina foi tomada, mas a data estiver minimamente ilegível, borrada, incompleta (ex: faltando o ano) ou suspeita, NÃO TENTE ADIVINHAR.
    - Nesses casos de dúvida, retorne estritamente o valor null no campo 'dateRead'.
    - Só preencha o campo 'dateRead' (no formato "YYYY-MM-DD") se você tiver 100% de certeza da leitura dos números do dia, mês e ano.

    ESTRUTURA DO OUTPUT (Obrigatório retornar no formato do Schema):
    Retorne estritamente um array JSON de objetos contendo exatamente os seguintes campos:
    - "name" (string): Nome oficial da vacina (ex: "Pentavalente", "BCG", "Rotavírus Humano").
    - "dose" (string): A dose correspondente (ex: "1ª Dose", "2ª Dose", "Dose Única", "Reforço").
    - "dateRead" (string | null): A data da aplicação lida estritamente no formato "YYYY-MM-DD", ou null se a data estiver ilegível, rasurada ou borrada.
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
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const extractTextFromPdf = async (file: File): Promise<string> => {
  try {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });

    const pdfPart = fileToGenerativePart(base64, file.type);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{text: "Extract all text from this PDF document."}, pdfPart] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF via Gemini API.");
  }
};


export const generateChatResponse = async (pdfText: string, userQuestion: string): Promise<string> => {
    const systemInstruction = `You are a helpful assistant for the "Cincinnati Hotel".
Your knowledge is strictly limited to the information contained within the document provided by the user.
You must not answer any questions using information outside of this document's content. Never make up information.
If a user's question cannot be answered using ONLY the provided document, you MUST respond with the exact phrase: "I'm sorry, I don't have that information right now."
Do not add any other words, apologies, or offers for help to that specific phrase.`;

    const userPrompt = `
        --- DOCUMENT START ---
        ${pdfText}
        --- DOCUMENT END ---

        Based ONLY on the document above, answer the following question: "${userQuestion}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: {
                systemInstruction: systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating chat response:", error);
        throw new Error("Failed to get a response from the AI.");
    }
};

export const categorizeQuestion = async (userQuestion: string): Promise<string> => {
    const prompt = `
        Based on the following user question for a hotel, what is the single most relevant topic?
        Choose only from this list: Rooms, Restaurant, Amenities, Booking, Location, Price, Policy, General Inquiry.
        Respond with only the single category name and nothing else.

        Question: "${userQuestion}"
    `;

    try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });
        const category = response.text.trim();
        const validCategories = ["Rooms", "Restaurant", "Amenities", "Booking", "Location", "Price", "Policy", "General Inquiry"];
        return validCategories.includes(category) ? category : "General Inquiry";
    } catch (error) {
        console.error("Error categorizing question:", error);
        return "General Inquiry"; // Default category on error
    }
};
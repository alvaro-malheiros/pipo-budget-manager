import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Transaction, BudgetGoal } from "../types";

// A variável deve ser VITE_GEMINI_API_KEY na Vercel e no .env.local
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getBudgetInsights(transactions: Transaction[], budgets: BudgetGoal[]) {
  // Inicializa o modelo corretamente
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const context = `
    I have the following budget transactions:
    ${JSON.stringify(transactions.slice(-20))}
    
    And the following monthly budget limits:
    ${JSON.stringify(budgets)}
    
    Please provide 3-4 short, actionable insights or tips based on my spending patterns in Portuguese. 
    Focus on areas where I might be overspending or could save. Keep the tone professional but friendly.
    Return only a JSON array of strings.
  `;

  try {
    const result = await model.generateContent(context);
    const text = result.response.text();
    if (text) {
      // Remove possíveis marcações de Markdown caso a IA as envie
      const cleanText = text.replace(/```json|```/g, "");
      return JSON.parse(cleanText) as string[];
    }
    return ["Acompanhe seus gastos com café!", "Seu orçamento de moradia está estável.", "Defina um limite para supermercado."];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Mantenha-se atento às suas despesas diárias.", "Verifique seus serviços de assinatura.", "Bom trabalho acompanhando sua renda!"];
  }
}

export async function extractReceiptData(base64Data: string, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const prompt = `Analyze this receipt image and extract the total amount, the name of the store/merchant, and the date (YYYY-MM-DD). 
  Return the data in a structured JSON format with keys: amount (number), merchant (string), and date (string).`;
  
  try {
    const result = await model.generateContent([
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
      { text: prompt },
    ]);

    const text = result.response.text();
    if (text) {
      const cleanText = text.replace(/```json|```/g, "");
      return JSON.parse(cleanText);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Receipt Extraction Error:", error);
    throw error;
  }
}

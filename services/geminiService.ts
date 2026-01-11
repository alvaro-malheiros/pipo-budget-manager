
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, BudgetGoal, CategoryType } from "../types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function getBudgetInsights(transactions: Transaction[], budgets: BudgetGoal[]) {
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
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: context,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as string[];
    }
    return ["Acompanhe seus gastos com café - eles somam!", "Você está indo bem no seu orçamento de moradia.", "Considere definir um limite para supermercado."];
  } catch (error) {
    console.error("Gemini Error:", error);
    return ["Mantenha-se atento às suas despesas diárias.", "Verifique seus serviços de assinatura para possíveis economias.", "Bom trabalho acompanhando sua renda!"];
  }
}

export async function extractReceiptData(base64Data: string, mimeType: string, availableCategories: string[]) {
  const prompt = `Analyze this receipt image and extract the total amount, the name of the store/merchant, and the date. 
  Additionally, select the most appropriate category from this list: [${availableCategories.join(', ')}].
  Return the data in a structured JSON format.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: prompt },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER, description: "The total amount of the receipt" },
            merchant: { type: Type.STRING, description: "The name of the store or merchant" },
            date: { type: Type.STRING, description: "The date of the transaction in YYYY-MM-DD format" },
            category: { type: Type.STRING, description: "The most likely category for this spend from the provided list" },
          },
          required: ["amount", "merchant", "date", "category"],
        },
      },
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as { amount: number; merchant: string; date: string; category: CategoryType };
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Receipt Extraction Error:", error);
    throw error;
  }
}

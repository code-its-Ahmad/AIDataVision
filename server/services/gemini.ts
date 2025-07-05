import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "AIzaSyBvSCZvylq1lTQGRfr2czWQJb3c3jEuYY8"
});

export async function analyzeDataPattern(data: any): Promise<string> {
  const prompt = `Analyze this machine learning data pattern and provide insights:
  
  Data: ${JSON.stringify(data)}
  
  Please provide:
  1. Key patterns or trends identified
  2. Potential anomalies or outliers
  3. Recommendations for model improvement
  4. Data quality assessment
  
  Format your response as a concise analysis suitable for a dashboard.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Analysis could not be completed";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to analyze data pattern");
  }
}

export async function generateModelInsights(modelData: any): Promise<string> {
  const prompt = `Analyze this ML model performance data and provide actionable insights:
  
  Model Data: ${JSON.stringify(modelData)}
  
  Please provide:
  1. Performance assessment
  2. Training optimization suggestions
  3. Potential issues or risks
  4. Next steps for improvement
  
  Keep response concise and actionable for a data scientist.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Insights could not be generated";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate model insights");
  }
}

export async function detectAnomalies(metrics: any[]): Promise<{ title: string; description: string; priority: string; confidence: number }[]> {
  const prompt = `Analyze these system metrics for anomalies:
  
  Metrics: ${JSON.stringify(metrics)}
  
  Identify any anomalies and return them as a JSON array with this structure:
  [
    {
      "title": "Anomaly Title",
      "description": "Detailed description of the anomaly",
      "priority": "high|medium|low",
      "confidence": 0.95
    }
  ]
  
  Only return the JSON array, no other text.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    }
    return [];
  } catch (error) {
    console.error("Gemini API error:", error);
    return [];
  }
}

export async function generatePredictionInsights(predictionData: any): Promise<string> {
  const prompt = `Analyze these ML prediction results and provide insights:
  
  Prediction Data: ${JSON.stringify(predictionData)}
  
  Please provide:
  1. Prediction accuracy assessment
  2. Confidence level analysis
  3. Potential bias detection
  4. Recommendations for improvement
  
  Format for dashboard display.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Prediction insights could not be generated";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate prediction insights");
  }
}

export async function chatWithAI(query: string, context?: any): Promise<string> {
  const prompt = `You are an AI assistant specialized in machine learning analytics. 
  Answer this query about ML data and models:
  
  Query: ${query}
  ${context ? `Context: ${JSON.stringify(context)}` : ''}
  
  Provide a helpful, technical response suitable for a data scientist.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "I couldn't process your request at this time.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to process AI chat request");
  }
}

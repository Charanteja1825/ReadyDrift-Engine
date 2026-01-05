
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY
});

export async function generateSkillGapAnalysis(role: string, skills: string[], time: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze career readiness for Role: ${role}. Current Skills: ${skills.join(', ')}. Prep Time: ${time}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: {
            type: Type.OBJECT,
            properties: {
              requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["requiredSkills", "missingSkills"],
          },
          roadmap: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                duration: { type: Type.STRING },
              },
              required: ["phase", "topics", "duration"],
            },
          },
          strategies: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                phase: { type: Type.STRING },
                strategy: { type: Type.STRING },
                timeAllocation: { type: Type.STRING },
              },
              required: ["phase", "strategy", "timeAllocation"],
            },
          },
        },
        required: ["analysis", "roadmap", "strategies"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

export async function generateExam(type: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 5-question mock exam for ${type} including MCQs and basic coding theory questions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["mcq", "coding"] },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["id", "type", "question", "correctAnswer", "explanation"],
        },
      },
    },
  });

  return JSON.parse(response.text || '[]');
}

export async function generateInterviewFeedback() {
  // Simulate AI processing of video/audio cues
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: "The user just finished a mock technical interview. Generate feedback based on common pitfalls and best practices.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidenceScore: { type: Type.NUMBER },
          stressLevel: { type: Type.NUMBER },
          clarityScore: { type: Type.NUMBER },
          feedback: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              tips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["strengths", "weaknesses", "tips"],
          },
        },
        required: ["confidenceScore", "stressLevel", "clarityScore", "feedback"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
}

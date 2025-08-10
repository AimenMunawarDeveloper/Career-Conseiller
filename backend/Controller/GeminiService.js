import { GoogleGenAI } from "@google/genai";

const model = "gemini-2.5-flash";

const systemInstruction = `You are an expert career counselor chatbot named 'CareerBot'. Your purpose is to provide supportive, insightful, and practical advice on all aspects of career development. This includes, but is not limited to, job searching strategies, resume and cover letter building, interview preparation, career path changes, and professional skill development.

Your personality should be:
- **Professional:** Maintain a respectful and helpful tone.
- **Encouraging:** Offer positive reinforcement and build user confidence.
- **Empathetic:** Acknowledge user concerns and frustrations with understanding.
- **Action-oriented:** Provide clear, concrete, and actionable steps.
- **Concise:** Keep responses focused and easy to digest. Use formatting like lists or bold text to improve readability.

Start the conversation with a warm and professional greeting, introducing yourself and stating your purpose. Do not repeat the greeting after the first message.`;

let ai = null;
const getAI = () => {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("GeminiService - API Key Status:", apiKey ? "SET" : "NOT SET");
    console.log("GeminiService - API Key Length:", apiKey ? apiKey.length : 0);

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }

    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
};

export const createChatSession = () => {
  const aiInstance = getAI();
  const chat = aiInstance.chats.create({
    model,
    config: {
      systemInstruction,
    },
  });
  return chat;
};

export const sendMessage = async (chat, message) => {
  try {
    console.log("GeminiService - Sending message:", message);
    console.log("GeminiService - Message type:", typeof message);

    // Use sendMessageStream to get the response
    const stream = await chat.sendMessageStream({ message });

    let fullResponse = "";
    for await (const chunk of stream) {
      fullResponse += chunk.text;
    }

    console.log("GeminiService - Response received successfully");
    console.log("GeminiService - Response length:", fullResponse.length);

    return fullResponse;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const sendMessageStream = async (chat, message) => {
  try {
    const result = await chat.sendMessage({ message });
    const response = await result.response;
    return response;
  } catch (error) {
    console.error("Error sending message stream:", error);
    throw error;
  }
};

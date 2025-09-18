import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const GEMINI_API_URL = process.env.GEMINI_API_URL;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Recursively searches through a nested object or array to find the first string value.
 */
const findFirstString = (value) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findFirstString(item);
      if (result !== null) return result;
    }
  }
  if (typeof value === 'object' && value !== null) {
    for (const key in value) {
      const result = findFirstString(value[key]);
      if (result !== null) return result;
    }
  }
  return null;
};

const geminiResponse = async (command, assistantName = "Assistant", userName = "User") => {
  try {
    if (!GEMINI_API_URL || !GEMINI_API_KEY) {
      console.warn("GEMINI_API_URL or GEMINI_API_KEY not set in .env");
      return null;
    }

    // --- NEW, MORE ROBUST PROMPT ---
    // This simpler, more direct prompt is less likely to trigger safety filters.
    const prompt = `
CONTEXT:
- Assistant's Name: "${assistantName}"
- User's Name: "${userName}"

TASK:
You are a helpful and polite virtual assistant. Your default language is English, but you are also fluent in Hindi.
- If the user's command is in Hindi (Devanagari or Roman script), you MUST respond in polite Hindi.
- Otherwise, always respond in polite English.
- Always try to answer the user's question, even if it seems absurd.
- Your entire output MUST be a single, valid JSON object and nothing else.

JSON RESPONSE FORMAT:
{
  "type": "general" | "google_open" | "google_search" | "youtube_search" | "youtube_play" | "wikipedia_search" | "facebook_open" | "instagram_open" | "twitter_open" | "gmail_open" | "google_maps_open" | "weather_show" | "calculator_open",
  "userinput": "<the user's original command>",
  "language": "<'en' for English or 'hi' for Hindi>",
  "response": "<your short, polite, spoken response in the correct language>"
}

USER'S COMMAND:
"${command}"
`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    };

    const response = await axios.post(GEMINI_API_URL, payload, {
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY },
      timeout: 30_000,
    });

    const textResponse = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
      return { type: "general", language: "en", response: "Sorry, I received an empty response." };
    }

    let parsedObject;
    try {
      const startIndex = textResponse.indexOf('{');
      const endIndex = textResponse.lastIndexOf('}') + 1;
      const jsonString = textResponse.substring(startIndex, endIndex);
      parsedObject = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("❌ Failed to parse JSON from Gemini:", textResponse);
      return { type: "general", language: "en", response: "Sorry, I received an invalid response." };
    }

    if (parsedObject && typeof parsedObject === 'object') {
        const extractedText = findFirstString(parsedObject.response);
        parsedObject.response = extractedText || "I'm sorry, I could not find a valid response.";
    } else {
        return { type: 'general', language: 'en', response: 'There was an issue processing the command.' }
    }
    
    return parsedObject;

  } catch (error) {
    // This is the error you were seeing. It happens when the API call itself fails.
    console.error("❌ Gemini API Error:", error.response?.data ?? error.message ?? error);
    return { type: "general", language: "en", response: "Sorry, I'm having trouble connecting right now." };
  }
};

export default geminiResponse;
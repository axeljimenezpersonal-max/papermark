import { OpenAI } from "openai";

// Parche self-host: sin OPENAI_API_KEY el constructor lanza error en build.
// Mismo patrón que lib/openai.ts. Las funciones de IA no se usan en la bóveda.
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

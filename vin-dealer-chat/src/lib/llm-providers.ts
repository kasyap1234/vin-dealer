import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { createCerebras } from '@ai-sdk/cerebras';

// Gemini
export const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

// Groq (OpenAI Compatible)
export const groq = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey: process.env.GROQ_API_KEY,
});

// Cerebras (Dedicated Provider)
export const cerebras = createCerebras({
    apiKey: process.env.CEREBRAS_API_KEY,
});

// MiMo (Assuming OpenRouter as it's common for Xiaomi MiMo access outside China)
export const mimo = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.MIMO_API_KEY,
});

export type ProviderId = 'gemini' | 'groq' | 'cerebras' | 'mimo';

export const PROVIDERS = [
    { id: 'gemini', name: 'Gemini 1.5 Pro', model: 'gemini-1.5-pro' },
    { id: 'groq', name: 'Groq (Llama 3.1 70B)', model: 'llama-3.1-70b-versatile' },
    { id: 'cerebras', name: 'Cerebras (GPT-OSS 120B)', model: 'gpt-oss-120b' },
    { id: 'mimo', name: 'MiMo (Xiaomi MiMo-V2)', model: 'xiaomi/mimo-v2-flash' },
] as const;

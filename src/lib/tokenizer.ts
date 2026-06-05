// Safe wrapper around gpt-tokenizer to count prompts safely
import { encode } from "gpt-tokenizer";

export function countTokens(text: string): number {
  if (!text) return 0;
  try {
    const tokens = encode(text);
    return tokens.length;
  } catch (error) {
    console.warn("gpt-tokenizer encode failed, falling back to approximation:", error);
    // Bulletproof fallback approximation: 1 token is roughly 4 characters or 0.75 words
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words * 1.3));
  }
}

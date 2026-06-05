import { RemovedItem } from "../types";

export interface TokenSpan {
  id: number;
  text: string;
  isWord: boolean;
  charStart: number;
  charEnd: number;
  attackType?: "filler" | "redundant" | "wordy" | "replaceable" | "duplicates" | "none";
  replacement?: string | null;
  flagged?: boolean;
  removed?: boolean;
  replacedText?: string;
}

/**
 * High-performance, offline prompt optimization rules-engine.
 * Rewrites prompts to be concise by removing clutter, preambles, redundant expressions, and fillers.
 */
export function optimizePromptLocally(promptText: string): { optimized: string; removed: RemovedItem[] } {
  let text = promptText;
  const removed: RemovedItem[] = [];

  interface Rule {
    phrase: string;
    reason: 'filler' | 'redundant' | 'wordy' | 'replaceable';
    replacement: string | null;
  }

  const rules: Rule[] = [
    // Wordy openers (longer phrases first to avoid partial matching)
    { phrase: "What I need is for you to write a", reason: "wordy", replacement: "Write a" },
    { phrase: "What I need is for you to write", reason: "wordy", replacement: "Write" },
    { phrase: "What I need is for you to", reason: "wordy", replacement: "" },
    { phrase: "I would appreciate if you could write a", reason: "wordy", replacement: "Write a" },
    { phrase: "I would appreciate if you could write", reason: "wordy", replacement: "Write" },
    { phrase: "I would appreciate if you could", reason: "wordy", replacement: "" },
    { phrase: "It is important to note that you should", reason: "wordy", replacement: "You should" },
    { phrase: "It is important to note that", reason: "wordy", replacement: "" },
    { phrase: "I would like you to write a", reason: "wordy", replacement: "Write a" },
    { phrase: "I would like you to write", reason: "wordy", replacement: "Write" },
    { phrase: "I would like you to", reason: "wordy", replacement: "" },
    { phrase: "I want you to write a", reason: "wordy", replacement: "Write a" },
    { phrase: "I want you to write", reason: "wordy", replacement: "Write" },
    { phrase: "I want you to", reason: "wordy", replacement: "" },
    { phrase: "Could you please write a", reason: "wordy", replacement: "Write a" },
    { phrase: "Could you please write", reason: "wordy", replacement: "Write" },
    { phrase: "Could you please", reason: "wordy", replacement: "" },
    { phrase: "Please ensure that you", reason: "wordy", replacement: "Ensure you" },
    { phrase: "Please ensure that", reason: "wordy", replacement: "" },
    { phrase: "In this prompt, I will have you", reason: "wordy", replacement: "" },
    { phrase: "In this prompt, I will", reason: "wordy", replacement: "" },
    { phrase: "What I need is to", reason: "wordy", replacement: "To" },
    { phrase: "What I need is", reason: "wordy", replacement: "" },
    { phrase: "Can you please write a", reason: "wordy", replacement: "Write a" },
    { phrase: "Can you please write", reason: "wordy", replacement: "Write" },
    { phrase: "Can you please", reason: "wordy", replacement: "" },
    { phrase: "I am looking for you to write", reason: "wordy", replacement: "Write" },
    { phrase: "I am looking for a", reason: "wordy", replacement: "I want a" },
    { phrase: "I am looking for", reason: "wordy", replacement: "I want" },
    { phrase: "As you can see,", reason: "wordy", replacement: "" },
    { phrase: "As you can see", reason: "wordy", replacement: "" },

    // Redundant transitions and phrases
    { phrase: "completely and totally", reason: "redundant", replacement: "completely" },
    { phrase: "due to the fact that", reason: "redundant", replacement: "because" },
    { phrase: "at this point in time", reason: "redundant", replacement: "now" },
    { phrase: "in close proximity to", reason: "redundant", replacement: "near" },
    { phrase: "with the exception of", reason: "redundant", replacement: "except" },
    { phrase: "first and foremost", reason: "redundant", replacement: "first" },
    { phrase: "as a matter of fact", reason: "redundant", replacement: "actually" },
    { phrase: "with reference to", reason: "redundant", replacement: "about" },
    { phrase: "for the purpose of", reason: "redundant", replacement: "to" },
    { phrase: "has the capability to", reason: "redundant", replacement: "can" },
    { phrase: "each and every one of the", reason: "redundant", replacement: "all of the" },
    { phrase: "each and every one of", reason: "redundant", replacement: "all of" },
    { phrase: "each and every", reason: "redundant", replacement: "every" },
    { phrase: "in order to", reason: "redundant", replacement: "to" },
    { phrase: "in the event that", reason: "redundant", replacement: "if" },
    { phrase: "is able to", reason: "redundant", replacement: "can" },
    { phrase: "made out of", reason: "redundant", replacement: "of" },
    { phrase: "utilizing", reason: "redundant", replacement: "using" },
    { phrase: "utilizes", reason: "redundant", replacement: "uses" },
    { phrase: "utilize", reason: "redundant", replacement: "use" },

    // Fillers / qualifiers
    { phrase: "basically", reason: "filler", replacement: null },
    { phrase: "actually", reason: "filler", replacement: null },
    { phrase: "really", reason: "filler", replacement: null },
    { phrase: "very", reason: "filler", replacement: null },
    { phrase: "just", reason: "filler", replacement: null },
    { phrase: "quite", reason: "filler", replacement: null },
    { phrase: "simply", reason: "filler", replacement: null },
    { phrase: "effectively", reason: "filler", replacement: null },
    { phrase: "quickly", reason: "filler", replacement: null },
    { phrase: "easily", reason: "filler", replacement: null },
    { phrase: "literally", reason: "filler", replacement: null },
    { phrase: "totally", reason: "filler", replacement: null },
    { phrase: "seriously", reason: "filler", replacement: null },
    { phrase: "absolutely", reason: "filler", replacement: null },
    { phrase: "definitely", reason: "filler", replacement: null },
    { phrase: "probably", reason: "filler", replacement: null },
    { phrase: "extremely", reason: "filler", replacement: null }
  ];

  // Apply each rule sequentially
  rules.forEach((rule) => {
    const isSingleWord = /^[a-zA-Z]+$/.test(rule.phrase);
    let regex: RegExp;

    if (isSingleWord) {
      regex = new RegExp(`\\b${rule.phrase}\\b`, "gi");
    } else {
      const escaped = rule.phrase.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      let patternStr = escaped;
      if (/^\w/.test(rule.phrase)) patternStr = "\\b" + patternStr;
      if (/\w$/.test(rule.phrase)) patternStr = patternStr + "\\b";
      regex = new RegExp(patternStr, "gi");
    }

    let match;
    const matchedPhrases: string[] = [];
    while ((match = regex.exec(text)) !== null) {
      const matchedText = match[0];
      if (!matchedPhrases.includes(matchedText)) {
        matchedPhrases.push(matchedText);
      }
    }

    matchedPhrases.forEach((exactText) => {
      if (!removed.some(r => r.original === exactText)) {
        removed.push({
          original: exactText,
          reason: rule.reason,
          replacement: rule.replacement
        });
      }
    });

    text = text.replace(regex, (matchedText) => {
      if (rule.replacement === null) {
        return "";
      }
      // Preserve uppercase casing style of the original text
      const repl = rule.replacement;
      if (repl && repl.length > 0) {
        const isOriginalUpper = /^[A-Z]/.test(matchedText);
        if (isOriginalUpper) {
          return repl.charAt(0).toUpperCase() + repl.slice(1);
        }
        return repl;
      }
      return "";
    });
  });

  // Clean layout formatting and double spaces
  let cleaned = text
    .replace(/[ \t]+/g, " ")
    .replace(/ \./g, ".")
    .replace(/ ,/g, ",")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();

  if (!cleaned && promptText.trim()) {
    cleaned = "Write something concise.";
  }

  return {
    optimized: cleaned,
    removed
  };
}

/**
 * Parses raw text into inline token spans, and maps the removed items onto their respective span groups.
 */
export function parseAndMapTokens(originalText: string, removedItems: RemovedItem[] = []): TokenSpan[] {
  // Regex to split into word/punctuation groups vs whitespaces
  const parts = originalText.split(/(\s+)/);
  
  let currentCharIndex = 0;
  const spans: TokenSpan[] = [];

  parts.forEach((text, idx) => {
    if (!text) return;
    const isWord = !/^\s+$/.test(text);
    const length = text.length;
    
    spans.push({
      id: idx,
      text,
      isWord,
      charStart: currentCharIndex,
      charEnd: currentCharIndex + length,
    });

    currentCharIndex += length;
  });

  // Now, let's map search items onto these spans
  // Sort removed items by length descending so larger matched phrases get mapped first, preventing overlapping sub-matches
  const sortedRemoved = [...removedItems].sort((a, b) => b.original.length - a.original.length);

  // We will keep track of which characters in originalText have been flagged
  const flaggedCharacters = new Set<number>();

  sortedRemoved.forEach((item) => {
    const query = item.original;
    if (!query) return;

    // Search for matching substrings in the originalText
    let matchIdx = originalText.indexOf(query);
    while (matchIdx !== -1) {
      const matchEnd = matchIdx + query.length;

      // Ensure this substring hasn't already been mapped/flagged
      let alreadyFlagged = false;
      for (let c = matchIdx; c < matchEnd; c++) {
        if (flaggedCharacters.has(c)) {
          alreadyFlagged = true;
          break;
        }
      }

      if (!alreadyFlagged) {
        // Flag all characters in this match
        for (let c = matchIdx; c < matchEnd; c++) {
          flaggedCharacters.add(c);
        }

        // Map onto spanning tokens
        spans.forEach((span) => {
          if (span.isWord && span.charStart >= matchIdx && span.charEnd <= matchEnd) {
            span.attackType = item.reason;
            span.replacement = item.replacement;
            span.flagged = true;
          }
        });
        break; // matched this specific instance
      }

      // Find next occurrence
      matchIdx = originalText.indexOf(query, matchIdx + 1);
    }
  });

  return spans;
}

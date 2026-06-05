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

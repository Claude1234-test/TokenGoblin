import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", backend: "express", timestamp: new Date().toISOString() });
  });

  // API Route
  app.post("/api/optimize", async (req, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt || typeof prompt !== "string") {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not defined" });
      }

      // Initialize GoogleGenAI SDK safely
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `You are a prompt optimization engine. The user will give you an AI prompt. Your job is to return a JSON object and nothing else — no markdown, no explanation, no backticks. The JSON must follow this exact structure:
{
  "optimized": "<the full rewritten prompt, shorter and cleaner>",
  "removed": [
    {
      "original": "<exact word or phrase removed or replaced>",
      "reason": "<one of: filler | redundant | wordy | replaceable>",
      "replacement": "<shorter replacement word, or null if fully removed>"
    }
  ]
}
Rules for optimization:
- Remove filler words: just, very, really, quite, basically, actually, simply, effectively, quickly, easily
- Remove wordy openers: I would like you to, Please ensure that, It is important to note that, As you can see, I want you to, Could you please, What I need is
- Collapse redundant phrases: in order to → to, due to the fact that → because, at this point in time → now, completely and totally → completely, each and every → every
- Replace long words with shorter synonyms where meaning is identical
- Never change the core intent or meaning of the prompt
- Return only the raw JSON object`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              optimized: {
                type: Type.STRING,
                description: "The full rewritten prompt, shorter and cleaner",
              },
              removed: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    original: {
                      type: Type.STRING,
                      description: "The exact word or phrase removed or replaced from the input prompt.",
                    },
                    reason: {
                      type: Type.STRING,
                      description: "Must be: filler, redundant, wordy, or replaceable.",
                    },
                    replacement: {
                      type: Type.STRING,
                      description: "Shorter replacement word, or null if fully removed or collapsed.",
                    },
                  },
                  required: ["original", "reason"],
                },
              },
            },
            required: ["optimized", "removed"],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        return res.status(500).json({ error: "Failed to get response from Gemini" });
      }

      let result;
      const cleanResponseText = responseText.trim();
      try {
        result = JSON.parse(cleanResponseText);
      } catch (parseErr) {
        // Fallback: try to strip markdown backticks if any
        let jsonStr = cleanResponseText;
        if (jsonStr.startsWith("```")) {
          // Remove start code blocks (e.g., ```json or ```)
          jsonStr = jsonStr.replace(/^```[a-zA-Z]*\s*/, "");
          // Remove ending code blocks
          jsonStr = jsonStr.replace(/\s*```$/, "");
        }
        jsonStr = jsonStr.trim();
        try {
          result = JSON.parse(jsonStr);
        } catch (secondErr) {
          // If still fails, try to extract first outer '{...}' statement
          const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              result = JSON.parse(jsonMatch[0]);
            } catch (thirdErr) {
              return res.status(500).json({ 
                error: `Failed to parse Gemini response as JSON. Cleaned response: ${jsonStr.substring(0, 100)}...` 
              });
            }
          } else {
            return res.status(500).json({ 
              error: `Failed to parse Gemini response as JSON. Format: ${jsonStr.substring(0, 100)}...` 
            });
          }
        }
      }
      return res.json(result);
    } catch (err: any) {
      console.error(err);
      return res.status(500).json({ error: err.message || "An error occurred" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

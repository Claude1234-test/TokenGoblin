import React, { useState, useEffect, useRef } from "react";
import { countTokens } from "./lib/tokenizer";
import { synth } from "./lib/synth";
import { parseAndMapTokens, TokenSpan } from "./lib/parser";
import { SnipCharacter } from "./components/SnipCharacter";
import { gsap } from "gsap";
import { 
  Scissors, 
  Trash2, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  AlertCircle,
  HelpCircle,
  Zap,
  Sparkles,
  ArrowRight,
  Sun,
  Moon
} from "lucide-react";

type AppPhase = "idle" | "loading" | "animating" | "victory" | "done";
type SnipMood = "curious" | "excited" | "focused" | "tired" | "proud" | "bored";

// Sample Bloated Prompts
const MATCHING_SAMPLES = [
  {
    title: "Project Explanation",
    text: "I would just like you to explain the approach very quickly. It is important to note that the system basically performs well. We should in order to improve, focus on the core features that completely and totally define our output."
  },
  {
    title: "Task Summary Request",
    text: "Could you please write a brief summary of this task, due to the fact that I think it is very important to make a visual presentation for each and every team member now."
  },
  {
    title: "Padded Constraints",
    text: "Please ensure that the response is completely accurate and literally perfect because basically we really need to utilize this optimal feature easily."
  }
];

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [showIntro, setShowIntro] = useState(true);
  const [inputText, setInputText] = useState(MATCHING_SAMPLES[0].text);
  const [optimizedText, setOptimizedText] = useState("");
  const [phase, setPhase] = useState<AppPhase>("idle");
  const [mood, setMood] = useState<SnipMood>("curious");
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [copying, setCopying] = useState(false);
  
  // Scored stats
  const [beforeTokens, setBeforeTokens] = useState(0);
  const [afterTokens, setAfterTokens] = useState(0);
  const [savedTokens, setSavedTokens] = useState(0);
  const [efficiencyPct, setEfficiencyPct] = useState(0);
  const [grade, setGrade] = useState("C");
  const [efficiencyGradeDesc, setEfficiencyGradeDesc] = useState("");

  // Speech bubble text
  const [speechBubbleText, setSpeechBubbleText] = useState("");
  const [speechBubbleVisible, setSpeechBubbleVisible] = useState(false);

  // Spans for attack mapping
  const [spans, setSpans] = useState<TokenSpan[]>([]);
  const [removedCount, setRemovedCount] = useState(0);

  // Interactive UI indicators
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Particle Explosions
  const [particles, setParticles] = useState<any[]>([]);
  const [fireworks, setFireworks] = useState<any[]>([]);
  const pIdCounter = useRef(0);

  // References for coordinates
  const textareaContainerRef = useRef<HTMLDivElement>(null);
  const snipContainerRef = useRef<HTMLDivElement>(null);

  // Sync token count on mount & typing change
  useEffect(() => {
    setBeforeTokens(countTokens(inputText));
    // Reset spans to match new text in IDLE state
    const tSpans = parseAndMapTokens(inputText, []);
    setSpans(tSpans);
  }, [inputText]);

  // Handle speaker configuration toggle
  useEffect(() => {
    synth.enabled = speakerEnabled;
  }, [speakerEnabled]);

  // Initial wave and idle background animation config
  useEffect(() => {
    // Left eye & right eye blink timer
    const blinkInterval = setInterval(() => {
      gsap.to("#snip-eye-left, #snip-eye-right", {
        scaleY: 0.1,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        transformOrigin: "center center"
      });
    }, 4000);

    // Initial load Hello Wave!
    setTimeout(() => {
      synth.wiggle();
      setMood("excited");
      showSpeechBubble("Hello prompt buddy! 👋");
      
      const waveTl = gsap.timeline({
        onComplete: () => {
          setMood("curious");
        }
      });
      waveTl.to("#snip-arm-left", { rotation: -40, duration: 0.2 })
            .to("#snip-arm-left", { rotation: -120, duration: 0.15, yoyo: true, repeat: 5 })
            .to("#snip-arm-left", { rotation: 0, duration: 0.2 });
    }, 850);

    return () => {
      clearInterval(blinkInterval);
    };
  }, []);

  const showSpeechBubble = (text: string, duration = 2000) => {
    setSpeechBubbleText(text);
    setSpeechBubbleVisible(true);
    setTimeout(() => {
      setSpeechBubbleVisible(false);
    }, duration);
  };

  // Mascot tracks mouse move in writing box
  const handleMouseMove = (e: React.MouseEvent) => {
    if (phase !== "idle") return; // eyes focused during animations
    const container = document.getElementById("snip-svg");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxShift = 1.3;

    const sx = distance ? (dx / distance) * maxShift : 0;
    const sy = distance ? (dy / distance) * maxShift : 0;

    gsap.to(["#snip-pupil-left", "#snip-pupil-right"], {
      x: sx,
      y: sy,
      duration: 0.1,
      overwrite: "auto"
    });
  };

  const handleMouseLeave = () => {
    gsap.to(["#snip-pupil-left", "#snip-pupil-right"], {
      x: 0,
      y: 0,
      duration: 0.3
    });
  };

  // Foot tapping loader loop animation
  const startImpatientTap = () => {
    gsap.to("#snip-leg-left", {
      y: -3,
      duration: 0.1,
      yoyo: true,
      repeat: -1,
      transformOrigin: "center top"
    });
    gsap.to("#snip-leg-right", {
      y: -3,
      duration: 0.1,
      delay: 0.05,
      yoyo: true,
      repeat: -1,
      transformOrigin: "center top"
    });
    gsap.to("#snip-sweat", {
      opacity: 1,
      duration: 0.3
    });
  };

  // Stop impatient foot tap
  const stopImpatientTap = () => {
    gsap.killTweensOf("#snip-leg-left");
    gsap.killTweensOf("#snip-leg-right");
    gsap.to(["#snip-leg-left", "#snip-leg-right"], { y: 0, duration: 0.2 });
    gsap.to("#snip-sweat", { opacity: 0, duration: 0.2 });
  };

  // Triggers ear wiggles when a filler is typed in real-time
  const handleTextareaChange = (txt: string) => {
    setInputText(txt);
    
    // Check if the last word typed was a filler keyword
    const words = txt.toLowerCase().trim().split(/\s+/);
    const lastWord = words[words.length - 1] || "";
    const fillers = ["just", "very", "really", "basically", "actually", "quite", "simply"];
    
    if (fillers.includes(lastWord)) {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      synth.wiggle();
      setMood("excited");
      gsap.to("#snip-ear-left", { rotation: -20, duration: 0.1, yoyo: true, repeat: 3 });
      gsap.to("#snip-ear-right", { rotation: 20, duration: 0.1, yoyo: true, repeat: 3 });
      
      typingTimerRef.current = setTimeout(() => {
        setMood("curious");
      }, 1000);
    }
  };

  // Particle bursts generators
  const spawnDebris = (x: number, y: number, color: string = "#a3e635") => {
    const chars = ["✂️", "✦", "✖", "★", "🔥", "⚙️", "💧"];
    const newParticles = Array.from({ length: 12 }).map(() => ({
      id: pIdCounter.current++,
      x,
      y,
      dx: `${(Math.random() - 0.5) * 140}px`,
      dy: `${(Math.random() - 0.5) * 140 - 30}px`,
      rot: `${Math.random() * 360}deg`,
      color,
      char: chars[Math.floor(Math.random() * chars.length)]
    }));
    
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(n => n.id === p.id)));
    }, 1200);
  };

  const fireworkBurst = (cx: number, cy: number, color: string) => {
    const particleCount = 20;
    const newShells = Array.from({ length: particleCount }).map((_, idx) => {
      const angle = (Math.PI * 2 / particleCount) * idx;
      const velocity = 80 + Math.random() * 80;
      return {
        id: pIdCounter.current++,
        x: cx,
        y: cy,
        dx: `${Math.cos(angle) * velocity}px`,
        dy: `${Math.sin(angle) * velocity}px`,
        color,
      };
    });
    setFireworks(p => [...p, ...newShells]);
    setTimeout(() => {
      setFireworks(p => p.filter(f => !newShells.find(n => n.id === f.id)));
    }, 1000);
  };

  // Helper delays
  const waitMs = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Primary animation attack controllers
  const animateKarateChop = (spanId: number, rect: DOMRect, parentRect: DOMRect, text: string) => {
    return new Promise<void>((resolve) => {
      const tx = rect.left - parentRect.left + rect.width / 2;
      const ty = rect.top - parentRect.top;

      const tl = gsap.timeline({
        onComplete: () => {
          setSpans(prev => prev.map(s => s.id === spanId ? { ...s, removed: true } : s));
          setRemovedCount(r => r + 1);
          resolve();
        }
      });

      // Jump and charge at word
      tl.to("#snip-goblin-container", { left: tx - 48, top: ty + 12, duration: 0.35, ease: "power2.out" })
        .to("#snip-leg-left, #snip-leg-right", { rotation: "+=360", duration: 0.3 }, "-=0.35");

      // Activate headband
      tl.to("#snip-headband", { opacity: 1, scaleX: 1, duration: 0.1 });
      
      // Arm chop strike wind-up
      tl.to("#snip-arm-right", { rotation: -130, duration: 0.15 })
        .call(() => {
          setSpeechBubbleText("HYAAAAA! ⚔️");
          setSpeechBubbleVisible(true);
        })
        // Lightning fast strike!
        .to("#snip-arm-right", {
          rotation: -20,
          duration: 0.08,
          onStart: () => {
            synth.chop();
            spawnDebris(tx, ty + 12, "#fbbf24");
          }
        })
        .to("#snip-arm-right", { rotation: 0, duration: 0.1 })
        .to("#snip-headband", { opacity: 0, duration: 0.15 })
        .call(() => setSpeechBubbleVisible(false))
        // Settle bow
        .to("#snip-body-group", { rotation: 12, duration: 0.1 })
        .to("#snip-body-group", { rotation: 0, duration: 0.15 });
    });
  };

  const animateVacuum = (spanIds: number[], rect: DOMRect, parentRect: DOMRect, text: string) => {
    return new Promise<void>((resolve) => {
      const tx = rect.left - parentRect.left + rect.width / 2;
      const ty = rect.top - parentRect.top;

      const tl = gsap.timeline({
        onComplete: () => {
          setSpans(prev => prev.map(s => spanIds.includes(s.id) ? { ...s, removed: true } : s));
          setRemovedCount(r => r + spanIds.length);
          resolve();
        }
      });

      // Swap to Vacuum
      tl.to("#snip-goblin-container", { left: tx - 48, top: ty + 16, duration: 0.3, ease: "power2.out" })
        .to("#snip-scissors", { opacity: 0, duration: 0.1 })
        .to("#snip-vacuum", { opacity: 1, duration: 0.15 })
        .call(() => {
          setSpeechBubbleText("WHOOOOOMP! 🌪️");
          setSpeechBubbleVisible(true);
          synth.vacuum();
        });

      // Rotate spiral nozzle continuously
      tl.to("#snip-vacuum-nozzle-dust", { rotation: "+=360", transformOrigin: "center center", duration: 0.4, repeat: 2 }, "-=0.2");

      // Slide word spans toward vacuum nozzle
      spanIds.forEach((sid, idx) => {
        tl.to(`#word-span-${sid}`, {
          x: 40,
          scaleX: 0,
          scaleY: 0.1,
          opacity: 0,
          duration: 0.25,
          ease: "power1.in"
        }, `-=${0.25 - idx * 0.04}`);
      });

      // Bulge vacuum body and emit smoke puff
      tl.to("#snip-vacuum", { scale: 1.25, transformOrigin: "center center", duration: 0.1 })
        .to("#snip-vacuum", { scale: 1.0, duration: 0.12 })
        .to("#snip-arm-left", { rotation: -30, duration: 0.12, yoyo: true, repeat: 2 })
        .call(() => {
          spawnDebris(tx + 28, ty, "#f97316");
          setSpeechBubbleVisible(false);
        })
        .to("#snip-vacuum", { opacity: 0, duration: 0.1 })
        .to("#snip-scissors", { opacity: 1, duration: 0.1 });
    });
  };

  const animateLasso = (spanIds: number[], rect: DOMRect, parentRect: DOMRect, text: string) => {
    return new Promise<void>((resolve) => {
      const tx = rect.left - parentRect.left + rect.width / 2;
      const ty = rect.top - parentRect.top;

      const tl = gsap.timeline({
        onComplete: () => {
          setSpans(prev => prev.map(s => spanIds.includes(s.id) ? { ...s, removed: true } : s));
          setRemovedCount(r => r + spanIds.length);
          resolve();
        }
      });

      // Position adjacent to phrase
      tl.to("#snip-goblin-container", { left: tx - 48, top: ty + 24, duration: 0.35, ease: "power2.out" })
        .to("#snip-scissors", { opacity: 0, duration: 0.1 })
        .to("#snip-lasso", { opacity: 1, duration: 0.15 })
        .call(() => {
          setSpeechBubbleText("CATCH IT! 🤠");
          setSpeechBubbleVisible(true);
          synth.lasso();
        })
        // Spin overhead
        .to("#snip-lasso", { rotation: "+=1080", transformOrigin: "center center", duration: 0.6 });

      // Pull back recoil snap!
      tl.to("#snip-goblin-container", { left: "-=25", duration: 0.15, ease: "power2.in" })
        .call(() => {
          spawnDebris(tx, ty, "#fbbf24");
        });

      // Target elements gather smaller and scale wrap out
      spanIds.forEach((sid) => {
        tl.to(`#word-span-${sid}`, {
          scaleX: 0.1,
          scaleY: 2.0,
          opacity: 0,
          x: 50,
          skewX: 20,
          duration: 0.22,
          ease: "back.in(2)"
        }, "-=0.22");
      });

      tl.to("#snip-goblin-container", { left: "+=25", duration: 0.2, ease: "bounce.out" })
        .call(() => setSpeechBubbleVisible(false))
        .to("#snip-lasso", { opacity: 0, duration: 0.1 })
        .to("#snip-scissors", { opacity: 1, duration: 0.1 });
    });
  };

  const animateEraser = (spanId: number, rect: DOMRect, parentRect: DOMRect, text: string) => {
    return new Promise<void>((resolve) => {
      const tx = rect.left - parentRect.left + rect.width / 2;
      const ty = rect.top - parentRect.top;

      const tl = gsap.timeline({
        onComplete: () => {
          setSpans(prev => prev.map(s => s.id === spanId ? { ...s, removed: true } : s));
          setRemovedCount(r => r + 1);
          resolve();
        }
      });

      // Arm eraser lock grip walking
      tl.to("#snip-goblin-container", { left: tx - 48, top: ty + 8, duration: 0.35, ease: "power2.out" })
        .to("#snip-arm-left", { rotation: -60, duration: 0.15 })
        .call(() => {
          setSpeechBubbleText("RUB RUB... 🧼");
          setSpeechBubbleVisible(true);
        })
        // Smash frame strike!
        .to("#snip-arm-left", {
          rotation: 40,
          duration: 0.1,
          yoyo: true,
          repeat: 3,
          onStart: () => {
            synth.eraser();
            spawnDebris(tx, ty + 8, "#ec4899");
          }
        })
        .to(`#word-span-${spanId}`, { opacity: 0, duration: 0.12 }, "-=0.3")
        .to("#snip-arm-left", { rotation: 0, duration: 0.15 })
        .call(() => setSpeechBubbleVisible(false))
        // Snip fans arm
        .to("#snip-arm-right", { rotation: -40, duration: 0.12, yoyo: true, repeat: 3 });
    });
  };

  const animateMagnet = (spanId: number, rect: DOMRect, parentRect: DOMRect, originalText: string, replacement: string) => {
    return new Promise<void>((resolve) => {
      const tx = rect.left - parentRect.left + rect.width / 2;
      const ty = rect.top - parentRect.top;

      const tl = gsap.timeline({
        onComplete: () => {
          // Replace span values with optimized text
          setSpans(prev => prev.map(s => s.id === spanId ? { ...s, text: replacement, replacement: null, attackType: "none", flagged: false, replacedText: replacement } : s));
          resolve();
        }
      });

      // Move to target
      tl.to("#snip-goblin-container", { left: tx - 48, top: ty + 20, duration: 0.35, ease: "power2.out" })
        .to("#snip-scissors", { opacity: 0, duration: 0.1 })
        .to("#snip-magnet", { opacity: 1, duration: 0.15 })
        .call(() => {
          setSpeechBubbleText("ATTRACT NEW! 🧲");
          setSpeechBubbleVisible(true);
          synth.magnet();
        });

      // Attract original text out
      tl.to(`#word-span-${spanId}`, {
        y: 20,
        opacity: 0,
        scale: 0.1,
        duration: 0.25,
        onStart: () => {
          spawnDebris(tx, ty, "#f43f5e");
        }
      });

      // Pop back visual replacement
      tl.to("#snip-arm-right", { rotation: 20, duration: 0.15 })
        .call(() => {
          synth.victory();
        })
        .to("#snip-magnet", { opacity: 0, duration: 0.1 })
        .to("#snip-scissors", { opacity: 1, duration: 0.1 })
        .call(() => setSpeechBubbleVisible(false));
    });
  };

  const triggerVictoryGrading = (before: number, after: number) => {
    // Perform GSAP counter tick animations
    const countObj = { bVal: before, aVal: before };
    
    gsap.to(countObj, {
      bVal: before,
      aVal: after,
      duration: 1.2,
      onUpdate: () => {
        setBeforeTokens(Math.round(countObj.bVal));
        setAfterTokens(Math.round(countObj.aVal));
      }
    });

    const saved = before - after;
    setSavedTokens(saved);

    const ratio = Math.max(0, saved / (before || 1));
    const efficiency = Math.round(ratio * 100);
    setEfficiencyPct(efficiency);

    // Compute letter Grades
    let finalGrade = "C";
    let desc = "Tiny Snip. Barely scratched the surface! 🤷";
    if (efficiency >= 50) {
      finalGrade = "S";
      desc = "SUPREME SNIP! Absolute S Rank reduction! 👑🌟";
    } else if (efficiency >= 30) {
      finalGrade = "A";
      desc = "Excellent pruning! Outstanding grade! 🔥";
    } else if (efficiency >= 10) {
      finalGrade = "B";
      desc = "Decent gains. Good job prompt scout! 🎉";
    }

    setGrade(finalGrade);
    setEfficiencyGradeDesc(desc);

    return { efficiency, finalGrade };
  };

  const executeVictoryMascotAnimation = async (finalGrade: string, efficiency: number) => {
    setMood("proud");
    
    // Jump to horizontal center of staging zone
    gsap.to("#snip-goblin-container", { left: "44%", top: "60%", duration: 0.5, ease: "back.out" });
    
    await waitMs(620);

    if (finalGrade === "S") {
      synth.victory();
      setMood("excited");
      showSpeechBubble("S RANK BABY! 🌟👑", 3500);
      gsap.to("#snip-cape-wrapper", { opacity: 1, duration: 0.3 });
      
      // Firework pops!
      for (let f = 0; f < 5; f++) {
        setTimeout(() => {
          synth.wiggle();
          fireworkBurst(
            Math.random() * 400 + 50, 
            Math.random() * 100 - 45, 
            ["#84cc16", "#ef4444", "#38bdf8", "#eab308", "#22c55e"][f]
          );
        }, f * 250);
      }
      
      // Giant scale bounce
      gsap.timeline()
        .to("#snip-goblin-container", { scale: 1.5, duration: 0.25, ease: "elastic.out" })
        .to("#snip-goblin-container", { scale: 1, duration: 0.2, ease: "power1.inOut" });

    } else if (finalGrade === "A") {
      synth.victory();
      showSpeechBubble("YOOO! BACKFLIP! 🔥", 2500);
      
      // Backflip animation
      gsap.timeline()
        .to("#snip-goblin-container", { y: -80, rotation: 360, duration: 0.5, ease: "power1.out" })
        .to("#snip-goblin-container", { y: 0, rotation: 360, duration: 0.3, ease: "bounce.out" });
      
      setTimeout(() => {
        fireworkBurst(200, 20, "#eab308");
      }, 400);

    } else if (finalGrade === "B") {
      synth.victory();
      showSpeechBubble("Not bad! 🎉", 2000);
      
      // Happy dance
      gsap.timeline()
        .to("#snip-goblin-container", { y: -15, duration: 0.12, yoyo: true, repeat: 5 })
        .to("#snip-tail", { rotation: 40, duration: 0.1, yoyo: true, repeat: 8 });

    } else {
      showSpeechBubble("...not bad I guess 🤷", 2000);
      setMood("tired");
      
      // Shrug
      gsap.timeline()
        .to("#snip-arm-left, #snip-arm-right", { rotation: -60, duration: 0.25, yoyo: true, repeat: 1 });
    }
  };

  const startOptimize = async () => {
    if (phase !== "idle") return;
    if (!inputText.trim()) {
      alert("Please enter some text for Snip to chew on first!");
      return;
    }

    setPhase("loading");
    setMood("focused");
    startImpatientTap();

    try {
      // Trigger fullstack Express endpoint API call
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: inputText })
      });

      stopImpatientTap();

      if (!response.ok) {
        const errDetail = await response.json();
        throw new Error(errDetail.error || "Gemini optimization request failed");
      }

      const data = await response.json();
      
      // Optimized prompt
      setOptimizedText(data.optimized);
      
      // Populate matched span tags
      const mappedSpans = parseAndMapTokens(inputText, data.removed || []);
      setSpans(mappedSpans);
      setRemovedCount(0);

      // Begin GSAP custom animation timeline
      setPhase("animating");

      // ENTRY ANIMATION
      // Step 1: Crouch down
      await gsap.to("#snip-goblin-container", { y: "+=20", duration: 0.15 });

      // Step 2-3: Spring launch overshoot & Settle on boundary edge
      await gsap.to("#snip-goblin-container", { y: -120, duration: 0.45, ease: "back.out(2.5)" });
      await gsap.to("#snip-goblin-container", { y: -80, duration: 0.2, ease: "bounce.out" });

      // Step 4: Arm Windmill
      setMood("excited");
      synth.wiggle();
      await gsap.to(["#snip-arm-left", "#snip-arm-right"], { rotation: "+=360", duration: 0.4 });

      // Step 5: Speach bubble "TOKENS BEWARE! 🔥"
      showSpeechBubble("TOKENS BEWARE! 🔥", 1200);
      await waitMs(1000);

      // Step 6: Hop down inside text grid area
      await gsap.to("#snip-goblin-container", { y: -10, duration: 0.35, ease: "power2.out" });

      // SCAN PHASE sweep line
      setMood("focused");
      showSpeechBubble("SCANNING LOGIC...", 1200);
      
      // Slide Snip horizontally scan
      await gsap.to("#snip-goblin-container", {
        left: "90%",
        duration: 1.2,
        ease: "none",
        onUpdate: function() {
          const progress = this.progress();
          // Flag items as the scan line passes over them
          const parentWidth = textareaContainerRef.current?.offsetWidth || 500;
          const currentScanX = progress * parentWidth;

          spans.forEach(s => {
            const el = document.getElementById(`word-span-${s.id}`);
            if (el && !s.removed && s.flagged) {
              const rect = el.getBoundingClientRect();
              const parentRect = textareaContainerRef.current?.getBoundingClientRect();
              if (parentRect) {
                const rx = rect.left - parentRect.left;
                if (rx < currentScanX) {
                  el.classList.add("flagged");
                }
              }
            }
          });
        }
      });

      // Small bounce in of problems found
      const problemsCount = mappedSpans.filter(s => s.flagged).length;
      synth.wiggle();
      showSpeechBubble(`FOUND ${problemsCount} ISSUES!`, 1800);
      await waitMs(1200);

      // Iterate through flagged target spans sequentially
      const flaggedGroups: { ids: number[], type: string, text: string, replacement: string | null }[] = [];
      let currentGroup: typeof flaggedGroups[0] | null = null;

      // Group adjacent tokens with identical reason or matching phrases
      mappedSpans.forEach(s => {
        if (s.flagged && s.attackType) {
          if (currentGroup && currentGroup.type === s.attackType && s.attackType === "wordy") {
            // Include adjacent wordy opener words into single group attack
            currentGroup.ids.push(s.id);
            currentGroup.text += " " + s.text;
          } else {
            if (currentGroup) flaggedGroups.push(currentGroup);
            currentGroup = {
              ids: [s.id],
              type: s.attackType,
              text: s.text,
              replacement: s.replacement || null
            };
          }
        } else {
          if (currentGroup) {
            flaggedGroups.push(currentGroup);
            currentGroup = null;
          }
        }
      });
      if (currentGroup) flaggedGroups.push(currentGroup);

      // Execute attack sequences sequentially (awaiting completion)
      for (const group of flaggedGroups) {
        const firstEl = document.getElementById(`word-span-${group.ids[0]}`);
        if (firstEl && textareaContainerRef.current) {
          const rect = firstEl.getBoundingClientRect();
          const parentRect = textareaContainerRef.current.getBoundingClientRect();

          if (group.type === "filler") {
            // Karate Chop
            await animateKarateChop(group.ids[0], rect, parentRect, group.text);
          } else if (group.type === "wordy") {
            // Vacuum
            await animateVacuum(group.ids, rect, parentRect, group.text);
          } else if (group.type === "redundant") {
            // Lasso
            await animateLasso(group.ids, rect, parentRect, group.text);
          } else if (group.type === "duplicates") {
            // Eraser
            await animateEraser(group.ids[0], rect, parentRect, group.text);
          } else if (group.type === "replaceable") {
            // Magnet
            await animateMagnet(group.ids[0], rect, parentRect, group.text, group.replacement || "");
          }
          await waitMs(450);
        }
      }

      // After all attacks complete, trigger reflow gaps slide close and result reveal
      setPhase("victory");
      
      const beforeToks = countTokens(inputText);
      const afterToks = countTokens(data.optimized);
      setAfterTokens(afterToks); // Cache actual optimized counts
      
      const { finalGrade } = triggerVictoryGrading(beforeToks, afterToks);

      // Mascot victory ritual
      await executeVictoryMascotAnimation(finalGrade, efficiencyPct);

      setPhase("done");

    } catch (err: any) {
      console.error(err);
      stopImpatientTap();
      setPhase("idle");
      setMood("tired");
      showSpeechBubble("Ouch! Let's retry... ⚠️", 3000);
      alert(`Optimization failed: ${err.message || err}`);
    }
  };

  const handleReset = async () => {
    // Reset Snip with stamp feet annoyance
    setMood("bored");
    synth.eraser();
    showSpeechBubble("Oof... fine, let's reset! 🙄", 1850);
    
    // Quick head stomp bounce
    await gsap.timeline()
      .to("#snip-goblin-container", { y: -20, duration: 0.12, yoyo: true, repeat: 2 })
      .to("#snip-goblin-container", { left: "50%", top: "72px", x: 0, y: 0, scale: 1, duration: 0.35 });

    // Wipe out cape or tools
    gsap.to("#snip-cape-wrapper", { opacity: 0, duration: 0.2 });
    
    setPhase("idle");
    setMood("curious");
    setRemovedCount(0);
  };

  const triggerCopy = () => {
    if (!optimizedText) return;
    navigator.clipboard.writeText(optimizedText);
    setCopying(true);
    synth.wiggle();
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <main className={`min-h-screen ${theme === "dark" ? "bg-[#0d1117] grid-bg text-white" : "bg-[#f8fafc] grid-bg-light text-slate-850"} flex flex-col justify-between py-6 px-4 md:px-8 select-none font-sans relative transition-colors duration-300`}>
      
      {/* GLASSMORPHIC STARTUP INTRO BOX */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-text">
          <div className="bg-slate-900/80 border border-white/20 shadow-2xl rounded-3xl p-6 md:p-8 max-w-lg w-full relative overflow-hidden backdrop-blur-xl backdrop-saturate-150 text-white flex flex-col gap-5">
            {/* Ambient background decoration */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-lime-500/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col items-center text-center gap-2">
              <div className="bg-lime-500/20 text-lime-400 p-3 rounded-2xl border border-lime-500/30 flex items-center justify-center relative shadow-inner">
                <span className="text-4xl animate-bounce">👹</span>
                <span className="absolute -top-1 -right-1 text-base">✂️</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight mt-2 flex items-center gap-1.5 font-sans bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-emerald-400">
                Meet Snip the Token Goblin!
              </h2>
              <p className="text-xs uppercase tracking-widest font-mono text-lime-300 font-bold">
                Your prompt-eating companion
              </p>
            </div>

            <div className="space-y-3.5 text-sm leading-relaxed text-slate-100">
              <p>
                Beware! A hungry, slightly chaotic creature has infested your workspace. Meet <strong>Snip</strong>! He lives in this app, hates boring filler text, and survives entirely by eating overpriced, redundant words in your AI prompts.
              </p>
              
              <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2.5 font-sans text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-yellow-400">🥋</span>
                  <div>
                    <span className="font-bold text-yellow-300">Karate Chop:</span> Removes filler intensifiers like {"\"basically, actually\""}.
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-blue-400">🌪️</span>
                  <div>
                    <span className="font-bold text-blue-300">Vacuum Slurp:</span> Sucks up long requesting preambles.
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-pink-400">✨</span>
                  <div>
                    <span className="font-bold text-pink-300">Eraser Rub:</span> Cleans duplicate synonyms & wordy prepositions.
                  </div>
                </div>
              </div>

              <p className="text-xs italic text-slate-300 text-center">
                Snip tap-dances when he cuts down tokens, wiggles while eating, and saves you hard-earned API cash!
              </p>
            </div>

            <button
              onClick={() => {
                setShowIntro(false);
                synth.enabled = speakerEnabled;
                synth.wiggle();
              }}
              className="py-3.5 px-6 w-full text-center bg-gradient-to-r from-lime-400 to-emerald-500 hover:from-lime-500 hover:to-emerald-600 rounded-xl font-bold text-black uppercase tracking-tight shadow-[0_10px_20px_rgba(132,204,22,0.2)] hover:scale-[1.01] active:scale-[0.98] transition-transform duration-200 cursor-pointer text-sm font-sans"
            >
              Unleash the Goblin! 👹
            </button>
          </div>
        </div>
      )}
      
      {/* 1. TOP NAVBAR */}
      <nav className={`w-full max-w-5xl mx-auto flex items-center justify-between border rounded-2xl px-6 py-4 shadow-lg mb-6 z-10 transition-all ${
        theme === "dark" 
          ? "bg-[#161b22] border-[#30363d]" 
          : "bg-white border-slate-200 shadow-md"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border flex items-center justify-center animate-pulse ${
            theme === "dark"
              ? "bg-lime-500/10 text-lime-400 border-lime-500/30"
              : "bg-green-500/10 text-green-600 border-green-500/20"
          }`}>
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <h1 className={`text-2xl font-bold tracking-tight flex items-center gap-1.5 ${
              theme === "dark" ? "text-white" : "text-slate-850"
            }`}>
              <span>TokenGoblin</span>
            </h1>
            <p className={`text-xs font-sans ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`}>
              ✂️ Snip the Goblin cuts redundant AI prompt clutter
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* THEME TOGGLE BUTTON */}
          <button
            onClick={() => {
              setTheme(theme === "dark" ? "light" : "dark");
              synth.wiggle();
            }}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              theme === "light"
                ? "bg-amber-450/10 border-amber-500/20 text-amber-600 hover:bg-amber-500/10"
                : "bg-transparent border-[#30363d] text-[#8b949e] hover:text-white"
            }`}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setSpeakerEnabled(!speakerEnabled)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              speakerEnabled 
                ? theme === "dark"
                  ? "bg-lime-400/10 border-lime-400/30 text-lime-450 font-bold" 
                  : "bg-green-100 border-green-400/30 text-green-700 font-bold"
                : theme === "dark"
                  ? "bg-transparent border-[#30363d] text-[#8b949e] hover:text-white"
                  : "bg-transparent border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50"
            }`}
            title={speakerEnabled ? "Mute audio cues" : "Unmute audio cues"}
          >
            {speakerEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className={`border px-4 py-1.5 rounded-full flex items-center gap-3 ${
            theme === "dark" ? "bg-[#161b22] border-[#30363d]" : "bg-slate-50 border-slate-205"
          }`}>
            <span className={`text-xs uppercase tracking-widest font-semibold font-sans ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>
              Total Savings
            </span>
            <span className={`font-mono font-bold ${theme === "dark" ? "text-lime-400" : "text-green-600 font-black text-sm"}`}>
              {savedTokens > 0 ? savedTokens : "0"} <span className="text-[10px] font-sans">TOKENS</span>
            </span>
          </div>
        </div>
      </nav>

      {/* CORE DISPLAY STAGE CONTAINER */}
      <section className="flex-1 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT TWO-COLUMNS: WRITING AREA AND CONTROLS */}
        <div className="lg:col-span-2 flex flex-col gap-6 w-full">
          
          {/* TOKENS COMPARISON PILL BADGES */}
          <div className="flex justify-center items-center gap-4 mb-2 z-10 w-full animate-fade-in">
            <div className={`border px-6 py-2 rounded-full flex items-center shadow-md transition-all ${
              theme === "dark" ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-205"
            }`}>
              <span className={`text-xs mr-2 uppercase tracking-tighter font-semibold font-sans ${theme === "dark" ? "text-gray-400" : "text-slate-500"}`}>Before:</span>
              <span className={`font-mono text-sm font-bold ${theme === "dark" ? "text-white" : "text-slate-800"}`}>
                {beforeTokens} <span className={theme === "dark" ? "text-gray-500 font-normal" : "text-slate-400 font-normal"}>tokens</span>
              </span>
            </div>

            <div className="text-gray-500 font-bold select-none">→</div>

            {(phase === "done" || phase === "victory") ? (
              <div className={`border px-6 py-2 rounded-full flex items-center shadow-md transition-all ${
                theme === "dark" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-emerald-50 border-emerald-250 text-emerald-700"
              }`}>
                <span className={`text-xs mr-2 uppercase tracking-tighter font-semibold font-sans ${theme === "dark" ? "text-emerald-400" : "text-emerald-600"}`}>After:</span>
                <span className="font-mono text-sm font-bold">
                  {afterTokens} <span className={theme === "dark" ? "text-emerald-500/60 font-normal" : "text-emerald-600/60 font-normal"}>tokens</span>
                </span>
              </div>
            ) : (
              <div className={`border px-6 py-2 rounded-full flex items-center shadow-sm opacity-55 transition-all ${
                theme === "dark" ? "bg-[#161b22]/50 border-[#30363d]/50" : "bg-white/55 border-slate-200/55"
              }`}>
                <span className="text-xs text-gray-400 mr-2 uppercase tracking-tighter font-semibold font-sans">After:</span>
                <span className="font-mono text-gray-400 text-sm italic">pending...</span>
              </div>
            )}
          </div>

          {/* MAIN VISUAL ELEMENT: WORKSPACE TEXTAREA ZONE */}
          <div 
            className={`relative border-2 rounded-2xl shadow-2xl p-6 min-h-[300px] flex flex-col justify-between overflow-visible transition-all ${
              theme === "dark" ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200"
            }`}
            id="textarea-container"
            ref={textareaContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Elegant cyan top accent highlight bar */}
            <div className={`absolute top-0 left-0 w-full h-[2.5px] rounded-t-2xl ${
              theme === "dark" ? "bg-cyan-400/60" : "bg-cyan-500/80"
            }`}></div>

            {/* Background absolute flying particle elements list */}
            {particles.map(p => (
              <span
                key={p.id}
                className="fly-particle select-none text-lg z-50 text-lime-400"
                style={{
                  left: p.x,
                  top: p.y,
                  color: p.color,
                  "--dx": p.dx,
                  "--dy": p.dy,
                  "--rot": p.rot,
                } as React.CSSProperties}
              >
                {p.char}
              </span>
            ))}

            {/* Background fireworks bursts list */}
            {fireworks.map(f => (
              <span
                key={f.id}
                className="firework-particle z-50"
                style={{
                  left: f.x,
                  top: f.y,
                  backgroundColor: f.color,
                  "--dx": f.dx,
                  "--dy": f.dy,
                } as React.CSSProperties}
              />
            ))}

            <div className="w-full flex-grow relative">
              {/* Conditional Display: Typing standard text-area view vs spans animation view */}
              {phase === "idle" || phase === "loading" ? (
                <textarea
                  className={`w-full h-full min-h-[170px] bg-transparent font-mono text-sm md:text-base leading-relaxed resize-none border-none outline-none focus:ring-0 scrollbar-thin selection:bg-lime-500/20 transition-all ${
                    theme === "dark" ? "text-[#c9d1d9] placeholder:text-[#505a66]" : "text-slate-800 placeholder:text-slate-400"
                  }`}
                  placeholder="Paste your bloated prompt here... Snip is watching 👀"
                  value={inputText}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  disabled={phase === "loading"}
                />
              ) : (
                <div className="w-full min-h-[170px] font-mono text-sm md:text-base leading-relaxed select-text flex flex-wrap gap-x-1.5 whitespace-pre-wrap break-all select-none">
                  {spans.map((span) => {
                    if (span.removed) return null;

                    // If word is flagged, render with wobble CSS class
                    const isFlagged = span.flagged;
                    let styleClass = theme === "dark" 
                      ? "inline-block text-[#c9d1d9] cursor-default transition-all duration-300" 
                      : "inline-block text-slate-800 cursor-default transition-all duration-300";

                    if (isFlagged) {
                      if (span.attackType === "filler") {
                        styleClass = theme === "dark"
                          ? "flagged inline-block cursor-pointer transition-all duration-300 rounded bg-red-500/20 text-red-400 border border-red-500/40 italic px-1"
                          : "flagged inline-block cursor-pointer transition-all duration-300 rounded bg-red-550/10 text-red-700 border border-red-300/40 italic px-1";
                      } else if (span.attackType === "wordy" || span.attackType === "redundant") {
                        styleClass = theme === "dark"
                          ? "flagged inline-block cursor-pointer transition-all duration-300 rounded bg-orange-500/20 text-orange-400 border border-orange-500/40 italic px-1"
                          : "flagged inline-block cursor-pointer transition-all duration-300 rounded bg-orange-500/10 text-orange-700 border border-orange-300/40 italic px-1";
                      } else {
                        styleClass = theme === "dark"
                          ? "flagged inline-block cursor-pointer transition-all duration-300 rounded bg-pink-500/20 text-pink-400 border border-pink-500/40 italic px-1"
                          : "flagged inline-block cursor-pointer transition-all duration-300 rounded bg-pink-500/10 text-pink-700 border border-pink-300/40 italic px-1";
                      }
                    }

                    return (
                      <span
                        key={span.id}
                        id={`word-span-${span.id}`}
                        data-word-idx={span.id}
                        className={styleClass}
                        title={span.attackType ? `Mapped attack: ${span.attackType}` : undefined}
                      >
                        {span.text}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MASCOT STAGING BOUNDS SYSTEM */}
            <div 
              id="snip-stage-bounds" 
              className={`relative h-[68px] mt-2 select-none pointer-events-none ${
                phase === "idle" ? "overflow-hidden" : ""
              }`}
            >
              <div 
                id="snip-goblin-container"
                ref={snipContainerRef}
                className="absolute left-[44%] -bottom-10"
              >
                <SnipCharacter className="w-24 h-24" mood={mood} />

                {/* Floating procedual bubble speaker */}
                {speechBubbleVisible && (
                  <div
                    id="snip-speech-bubble"
                    className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#161b22] text-white font-bold px-3 py-1.5 rounded-2xl rounded-br-none text-[10px] animate-bounce shadow-xl border border-[#30363d] whitespace-nowrap z-50"
                  >
                    {speechBubbleText}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* LOWER INTERACTIVE ACTIONS & DROPDOWN PROMPTS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {phase === "idle" ? (
                <button
                  onClick={startOptimize}
                  className={`py-4.5 px-8 rounded-xl font-bold text-base uppercase tracking-tight z-10 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center gap-2.5 cursor-pointer font-sans shadow-lg ${
                    theme === "dark" 
                      ? "bg-gradient-to-r from-lime-400 to-emerald-500 text-black shadow-[0_10px_30px_rgba(132,204,22,0.3)]" 
                      : "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)]"
                  }`}
                >
                  <Scissors className="w-5 h-5 fill-current" />
                  <span>Let Snip Loose</span>
                </button>
              ) : (
                <button
                  disabled
                  className={`font-bold text-base px-6 py-3.5 rounded-xl border opacity-80 flex items-center gap-3 ${
                    theme === "dark" 
                      ? "bg-[#24292f] text-[#8b949e] border-[#30363d]" 
                      : "bg-slate-200 text-slate-500 border-slate-300"
                  }`}
                >
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Goblin at Work...</span>
                </button>
              )}

              {phase !== "idle" && (
                <button
                  onClick={handleReset}
                  className={`px-5 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer border ${
                    theme === "dark" 
                      ? "bg-transparent border-[#30363d] text-gray-400 hover:text-white hover:bg-[#30363d]/50" 
                      : "bg-white border-slate-250 text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset App</span>
                </button>
              )}
            </div>

            {/* Quick-select bloated seeds */}
            {phase === "idle" && (
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase font-mono font-bold ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`}>Select bloating sample:</span>
                <div className="flex flex-wrap gap-1">
                  {MATCHING_SAMPLES.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTextareaChange(s.text)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer font-medium font-sans ${
                        inputText === s.text 
                          ? theme === "dark"
                            ? "bg-lime-450/10 border-lime-500/25 text-lime-400 font-bold" 
                            : "bg-green-500/10 border-green-500/30 text-green-700 font-bold"
                          : theme === "dark"
                            ? "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/30 hover:text-white"
                            : "bg-white border-slate-250 text-slate-600 hover:border-slate-350 hover:text-slate-900"
                      }`}
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. RESULT BOX DISPLAY */}
          {phase === "done" && (
            <div className={`border-2 rounded-xl p-5 shadow-xl animate-fade-in transition-all ${
              theme === "dark" ? "bg-emerald-950/20 border-emerald-500/30" : "bg-green-50 border-green-250"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-xs font-bold uppercase flex items-center gap-2 tracking-widest font-sans ${
                  theme === "dark" ? "text-emerald-400" : "text-green-705 text-green-700"
                }`}>
                  <span className={`block w-2.5 h-2.5 rounded-full animate-ping ${theme === "dark" ? "bg-emerald-400" : "bg-green-600"}`}></span>
                  Cleaned Prompt
                </h3>
                <button
                  onClick={triggerCopy}
                  className={`text-[10px] font-extrabold px-3 py-1 rounded uppercase tracking-tight transition-all cursor-pointer flex items-center gap-1 ${
                    theme === "dark"
                      ? "bg-emerald-500 text-black hover:bg-emerald-405"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-sm"
                  }`}
                >
                  {copying ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className={`text-sm font-mono opacity-90 italic select-all select-text p-4 rounded-lg border ${
                theme === "dark" 
                  ? "text-emerald-50 bg-emerald-950/40 border-emerald-500/10" 
                  : "text-slate-850 bg-white border-green-200 shadow-inner"
              }`}>
                {optimizedText}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: CHAR DISPLAY & STATUS SUMMARY */}
        <div className="flex flex-col gap-6 w-full">
          
          {/* MASCOT MOOD SHOWCASE */}
          <div className={`border rounded-xl p-4 shadow-lg flex flex-col items-center transition-all ${
            theme === "dark" ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200 shadow-md"
          }`}>
            <span className={`text-[10px] font-sans font-bold tracking-widest uppercase mb-4 self-start ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>Mascot Profile</span>
            
            {/* Frame containing actual mascot visualization */}
            <div className={`border w-full rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] shadow-inner relative overflow-hidden transition-all ${
              theme === "dark" ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-100"
            }`}>
              <SnipCharacter className="w-28 h-28 transform hover:scale-[1.05] transition-all" mood={mood} />
              
              <div className="mt-3 text-center">
                <h3 className={`text-sm font-bold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-850"}`}>Snip the Token Goblin</h3>
                <p className={`text-xs mt-1 italic capitalize ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`} id="goblin-description">{mood} State</p>
              </div>
            </div>

            {/* Custom interactive mood triggers */}
            <div className="w-full mt-4">
              <p className={`text-[10px] font-sans font-bold tracking-wider uppercase mb-2 ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>Test Snip's moods</p>
              <div className="grid grid-cols-3 gap-1.5 flex-wrap">
                {(["curious", "excited", "focused", "tired", "proud", "bored"] as SnipMood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      synth.wiggle();
                      setMood(m);
                    }}
                    className={`text-[11px] px-2 py-1.5 rounded-lg border transition-all cursor-pointer capitalize font-mono ${
                      mood === m 
                        ? theme === "dark"
                          ? "bg-lime-500/15 border-lime-400/40 text-lime-400 font-bold" 
                          : "bg-green-500/10 border-green-500/35 text-green-700 font-extrabold"
                        : theme === "dark"
                          ? "bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/30 hover:text-white"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350 hover:text-slate-900"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 7. SAVINGS REPORT CARD PANEL */}
          {phase === "done" && (
            <div className={`relative border rounded-xl p-4 flex flex-col shadow-xl overflow-hidden animate-fade-in transition-all ${
              theme === "dark" ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200"
            }`}>
              <h3 className={`text-[10px] font-sans font-bold uppercase tracking-widest mb-3 ${theme === "dark" ? "text-gray-500" : "text-slate-400"}`}>Snip's Report Card</h3>
              <div className="space-y-2 flex-grow">
                <div className="flex justify-between text-xs items-center">
                  <span className={theme === "dark" ? "text-gray-400 font-sans" : "text-slate-500 font-sans"}>Before</span>
                  <span className={`font-mono font-medium ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{beforeTokens} tokens</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className={theme === "dark" ? "text-gray-400 font-sans" : "text-slate-500 font-sans"}>After</span>
                  <span className={`font-mono font-medium ${theme === "dark" ? "text-white" : "text-slate-800"}`}>{afterTokens} tokens</span>
                </div>
                
                <div className={`h-[1px] my-1 ${theme === "dark" ? "bg-[#30363d]" : "bg-slate-100"}`}></div>

                <div className="flex justify-between text-xs items-center">
                  <span className={theme === "dark" ? "text-gray-400 font-sans" : "text-slate-500 font-sans"}>Saved</span>
                  <span className={`font-bold font-mono ${theme === "dark" ? "text-lime-400" : "text-green-650 text-green-700"}`}>{savedTokens} tokens ✂️</span>
                </div>
                <div className="flex justify-between text-xs items-center">
                  <span className={theme === "dark" ? "text-gray-400 font-sans" : "text-slate-500 font-sans"}>Efficiency</span>
                  <span className={`font-bold font-mono ${theme === "dark" ? "text-lime-400" : "text-green-650 text-green-700"}`}>-{efficiencyPct}%</span>
                </div>
                
                <div className={`h-[1px] my-1 ${theme === "dark" ? "bg-[#30363d]" : "bg-slate-100"}`}></div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <span className={`text-[10px] uppercase font-bold tracking-widest font-sans ${theme === "dark" ? "text-gray-500" : "text-slate-450"}`}>Grade</span>
                  <span className={`text-5xl font-black font-mono animate-bounce mt-1 ${
                    theme === "dark" 
                      ? "text-lime-400 drop-shadow-[0_0_10px_rgba(132,204,22,0.4)]" 
                      : "text-green-600 drop-shadow-[0_4px_6px_rgba(16,185,129,0.2)]"
                  }`}>
                    {grade}
                  </span>
                </div>
              </div>

              <div className={`p-2.5 rounded-lg text-center mt-3 text-[11px] font-mono leading-tight border transition-all ${
                theme === "dark" 
                  ? "bg-lime-950/20 border-lime-500/20 text-[#c8ffd8]" 
                  : "bg-green-105 bg-green-50/60 border-green-200/50 text-green-800"
              }`}>
                {efficiencyGradeDesc}
              </div>
            </div>
          )}

          {/* HIT LIST & ATTACK EXPLANATIONS */}
          <div className={`border rounded-xl p-4 shadow-lg transition-all ${
            theme === "dark" ? "bg-[#161b22] border-[#30363d]" : "bg-white border-slate-200"
          }`}>
            <span className={`text-[10px] font-sans font-bold tracking-widest uppercase mb-3 block ${theme === "dark" ? "text-[#8b949e]" : "text-slate-400"}`}>Snip's Attack Guide</span>
            
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-3 border rounded-lg p-2.5 transition-all ${
                theme === "dark" ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-150 border-slate-200/65"
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" />
                <div className="flex-grow">
                  <h4 className={`text-xs font-semibold font-sans ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Karate Chop</h4>
                  <p className={`text-[10.5px] font-sans ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`}>Removes direct filler intensifiers</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 border rounded-lg p-2.5 transition-all ${
                theme === "dark" ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-150 border-slate-200/65"
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                <div className="flex-grow">
                  <h4 className={`text-xs font-semibold font-sans ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Vacuum Slurp</h4>
                  <p className={`text-[10.5px] font-sans ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`}>Swallows wordy requesting preambles</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 border rounded-lg p-2.5 transition-all ${
                theme === "dark" ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-150 border-slate-200/65"
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0" />
                <div className="flex-grow">
                  <h4 className={`text-xs font-semibold font-sans ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Lasso Pull</h4>
                  <p className={`text-[10.5px] font-sans ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`}>Retrieves wordy prepositional bloat</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 border rounded-lg p-2.5 transition-all ${
                theme === "dark" ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-150 border-slate-200/65"
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400 shrink-0" />
                <div className="flex-grow">
                  <h4 className={`text-xs font-semibold font-sans ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Eraser Rub</h4>
                  <p className={`text-[10.5px] font-sans ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`}>Wipes out synonym pairs & duplicate content</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 border rounded-lg p-2.5 transition-all ${
                theme === "dark" ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-150 border-slate-200/65"
              }`}>
                <div className="w-2.5 h-2.5 rounded-full bg-lime-400 shrink-0" />
                <div className="flex-grow">
                  <h4 className={`text-xs font-semibold font-sans ${theme === "dark" ? "text-white" : "text-slate-800"}`}>Magnet Spark</h4>
                  <p className={`text-[10.5px] font-sans ${theme === "dark" ? "text-[#8b949e]" : "text-slate-500"}`}>Attracts shorter synonyms over complex terms</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="w-full text-center text-[10px] uppercase tracking-widest text-gray-500 font-sans mt-8 font-semibold">
        Powered by Gemini 1.5 Flash • Token Goblin is fully offline-approximating with local audio synthesis • Snip v2.1.0
      </footer>

    </main>
  );
}

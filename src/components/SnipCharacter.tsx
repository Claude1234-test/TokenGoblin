import React from "react";

interface SnipCharacterProps {
  className?: string;
  activeTool?: "scissors" | "vacuum" | "lasso" | "magnet" | "eraser";
  mood?: "curious" | "excited" | "focused" | "tired" | "proud" | "bored";
}

export const SnipCharacter: React.FC<SnipCharacterProps> = ({
  className = "w-24 h-24",
  activeTool = "scissors",
  mood = "curious",
}) => {
  return (
    <div className={`relative ${className}`} id="snip-goblin-container">
      {/* Tiny cape SVG background animation when proud */}
      <div
        id="snip-cape-wrapper"
        className="absolute inset-0 pointer-events-none opacity-0"
        style={{ zIndex: -1 }}
      >
        <svg viewBox="0 0 80 80" className="w-full h-full">
          <g id="snip-cape">
            <path
              d="M 33 34 L 10 52 C 5 62 12 70 20 68 L 30 48 Z"
              fill="#ef4444"
            />
            <path
              d="M 47 34 L 70 52 C 75 62 68 70 60 68 L 50 48 Z"
              fill="#dc2626"
            />
          </g>
        </svg>
      </div>

      <svg
        viewBox="0 0 80 80"
        width="100%"
        height="100%"
        className="overflow-visible"
        id="snip-svg"
      >
        {/* Shadow */}
        <ellipse
          cx="40"
          cy="66"
          rx="18"
          ry="3"
          fill="rgba(0,0,0,0.3)"
          id="snip-shadow"
        />

        {/* Tail group */}
        <g id="snip-tail" className="origin-[38px_53px]">
          <path
            d="M 38 53 Q 25 56 16 48 Q 12 42 18 36 Q 22 34 25 39 Q 24 45 32 49 Z"
            fill="#4d7c0f"
          />
          <circle cx="16" cy="48" r="2.5" fill="#facc15" id="snip-tail-spade" />
        </g>

        {/* Legs group */}
        <g id="snip-legs">
          <rect
            id="snip-leg-left"
            x="29"
            y="54"
            width="6"
            height="13"
            rx="3"
            fill="#4d7c0f"
            className="origin-top"
          />
          <rect
            id="snip-leg-right"
            x="45"
            y="54"
            width="6"
            height="13"
            rx="3"
            fill="#4d7c0f"
            className="origin-top"
          />
        </g>

        {/* Body and Head groups */}
        <g id="snip-body-group" className="origin-[40px_48px]">
          {/* Main body */}
          <g id="snip-body">
            {/* Lime body */}
            <rect
              x="22"
              y="32"
              width="36"
              height="26"
              rx="12"
              fill="#84cc16"
              stroke="#4d7c0f"
              strokeWidth="1"
            />
            {/* Underbelly */}
            <ellipse cx="40" cy="47" rx="13" ry="8" fill="#65a30d" />

            {/* Belt */}
            <g id="snip-belt">
              <rect x="22" y="44" width="36" height="3" fill="#78350f" />
              {/* Pouches */}
              <rect x="25" y="43" width="5" height="5" rx="1.5" fill="#92400e" id="pouch-1" />
              <rect x="38" y="43" width="5" height="5" rx="1.5" fill="#92400e" id="pouch-2" />
              <rect x="50" y="43" width="5" height="5" rx="1.5" fill="#92400e" id="pouch-3" />
            </g>
          </g>

          {/* Head */}
          <g id="snip-head" className="origin-[40px_24px]">
            {/* Pointed Ears */}
            <g id="snip-ear-left" className="origin-[25px_22px]">
              <path
                d="M 25 22 Q 10 12 8 20 C 6 28 18 26 25 24 Z"
                fill="#84cc16"
                stroke="#4d7c0f"
                strokeWidth="1"
              />
              <path d="M 23 21 Q 12 15 11 20 Z" fill="#65a30d" />
            </g>

            <g id="snip-ear-right" className="origin-[55px_22px]">
              <path
                d="M 55 22 Q 70 12 72 20 C 74 28 62 26 55 24 Z"
                fill="#84cc16"
                stroke="#4d7c0f"
                strokeWidth="1"
              />
              <path d="M 57 21 Q 68 15 69 20 Z" fill="#65a30d" />
            </g>

            {/* Main skull */}
            <circle
              cx="40"
              cy="24"
              r="15"
              fill="#84cc16"
              stroke="#4d7c0f"
              strokeWidth="1"
            />

            {/* Eyes */}
            <g id="snip-eye-left" className="origin-[33px_20px]">
              <circle cx="33" cy="20" r="4.5" fill="#ffffff" />
              <circle
                id="snip-pupil-left"
                cx="33"
                cy="20"
                r="2.2"
                fill="#0f172a"
              />
            </g>

            <g id="snip-eye-right" className="origin-[47px_20px]">
              <circle cx="47" cy="20" r="4.5" fill="#ffffff" />
              <circle
                id="snip-pupil-right"
                cx="47"
                cy="20"
                r="2.2"
                fill="#0f172a"
              />
            </g>

            {/* Eyebrows */}
            <rect
              id="snip-brow-left"
              x="27"
              y="13"
              width="8"
              height="2"
              rx="1"
              fill="#4d7c0f"
              className="origin-right"
            />
            <rect
              id="snip-brow-right"
              x="45"
              y="13"
              width="8"
              height="2"
              rx="1"
              fill="#4d7c0f"
              className="origin-left"
            />

            {/* Mouth */}
            <path
              id="snip-mouth"
              d="M 36 29 Q 40 31 44 29"
              stroke="#4d7c0f"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              className="origin-center"
            />

            {/* Toy headband node (hidden by default) */}
            <g id="snip-headband" className="opacity-0">
              <path d="M 25 15 H 55 V 19 H 25 Z" fill="#ef4444" />
              <path d="M 52 14 L 62 6 L 56 16 Z" fill="#dc2626" />
            </g>

            {/* Sweat Drop for tired mood */}
            <path
              id="snip-sweat"
              d="M 48 10 Q 50 14 52 10 T 48 10"
              fill="#38bdf8"
              className="opacity-0"
            />
          </g>

          {/* Left Arm (holds eraser / holds lasso/magnet/etc) */}
          <g id="snip-arm-left" className="origin-[22px_36px]">
            <rect x="10" y="34" width="13" height="4" rx="2" fill="#84cc16" />
            {/* Standard Eraser tool */}
            <g id="snip-eraser" className="origin-[10px_36px]">
              <rect x="6" y="31" width="5" height="10" rx="1.5" fill="#f43f5e" />
              <rect x="9" y="31" width="2" height="10" fill="#ffffff" opacity="0.4" />
            </g>
          </g>

          {/* Right Arm (holds scissors / vacuum / etc) */}
          <g id="snip-arm-right" className="origin-[58px_36px]">
            <rect x="57" y="34" width="13" height="4" rx="2" fill="#84cc16" />

            {/* Scissors tool */}
            <g id="snip-scissors" className="origin-[67px_36px]">
              {/* Scissors handle rings */}
              <circle
                cx="67"
                cy="32"
                r="3"
                stroke="#d97706"
                strokeWidth="1.5"
                fill="none"
              />
              <circle
                cx="67"
                cy="40"
                r="3"
                stroke="#d97706"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Moving upper blade */}
              <path
                id="snip-scissors-blade-upper"
                d="M 68 36 L 78 30"
                stroke="#e2e8f0"
                strokeWidth="2"
                strokeLinecap="round"
                className="origin-[68px_36px]"
              />
              {/* Moving lower blade */}
              <path
                id="snip-scissors-blade-lower"
                d="M 68 36 L 78 42"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
                className="origin-[68px_36px]"
              />
              {/* Screw joint */}
              <circle cx="68" cy="36" r="1.2" fill="#d97706" />
            </g>

            {/* Vacuum tool (hidden by default) */}
            <g id="snip-vacuum" className="origin-[64px_36px] opacity-0">
              <path
                d="M 64 33 H 74 V 39 H 64 Z"
                fill="#f97316"
                stroke="#c2410c"
                strokeWidth="0.5"
              />
              <path d="M 74 31 H 78 V 41 H 74 Z" fill="#475569" />
              {/* Swirl spiral nozzle */}
              <path
                id="snip-vacuum-nozzle-dust"
                d="M 78 36 Q 81 33 80 39 T 83 36"
                stroke="#a7f3d0"
                strokeWidth="1"
                fill="none"
              />
            </g>

            {/* Lasso tool (hidden by default) */}
            <g id="snip-lasso" className="origin-[65px_36px] opacity-0">
              <circle
                cx="74"
                cy="28"
                r="7"
                stroke="#fbbf24"
                strokeWidth="1.5"
                fill="none"
                strokeDasharray="2,2"
              />
              <path d="M 65 36 Q 70 32 74 28" stroke="#d97706" strokeWidth="1" />
            </g>

            {/* Magnet tool (hidden by default) */}
            <g id="snip-magnet" className="origin-[65px_36px] opacity-0">
              {/* Horseshoe magnet */}
              <path
                d="M 66 30 C 70 30 75 31 75 36 C 75 41 70 42 66 42"
                stroke="#ef4444"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="square"
              />
              {/* Metal tips */}
              <rect x="65" y="28" width="2" height="4" fill="#cbd5e1" />
              <rect x="65" y="40" width="2" height="4" fill="#cbd5e1" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
};

import React from "react";

export type LogoPalette = "sunset-gold" | "cosmic-ocean" | "teal-mint" | "royal-indigo";

export interface SomaLogoProps {
  size?: number | string;
  palette?: LogoPalette;
  showText?: boolean;
  showTagline?: boolean;
  circularBadgeStyle?: boolean;
  className?: string;
  customLogoUrl?: string | null;
}

export const SomaLogo: React.FC<SomaLogoProps> = ({
  size = 48,
  palette = "sunset-gold",
  showText = false,
  showTagline = false,
  circularBadgeStyle = false,
  className = "",
  customLogoUrl = null,
}) => {
  // If a custom uploaded/converted logo is configured, render it
  if (customLogoUrl) {
    if (circularBadgeStyle) {
      return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
          <div 
            style={{ width: size, height: size }}
            className="rounded-full overflow-hidden border border-indigo-100 shadow-md bg-white flex items-center justify-center p-1"
          >
            <img referrerPolicy="no-referrer" src={customLogoUrl} className="w-full h-full object-contain rounded-full" alt="Custom Logo" />
          </div>
        </div>
      );
    }
    return (
      <div className={`inline-flex items-center space-x-3.5 ${className}`}>
        <img 
          referrerPolicy="no-referrer"
          src={customLogoUrl} 
          style={{ width: size, height: size }} 
          className="object-contain rounded-xl drop-shadow" 
          alt="Custom Logo" 
        />
        {(showText || showTagline) && (
          <div className="flex flex-col text-left">
            {showText && (
              <span className="font-serif text-2xl sm:text-3xl font-normal text-[#0F4C5C] tracking-[0.1em] uppercase leading-none">
                Soma
              </span>
            )}
            {showTagline && (
              <div className="flex flex-col mt-1">
                <span className="text-[8px] sm:text-[9px] font-sans tracking-[0.15em] text-[#0F4C5C] uppercase font-bold">
                  SPA AND WELLNESS CENTER
                </span>
                <span className="text-[7px] sm:text-[8px] font-sans tracking-[0.2em] text-[#D4A359] uppercase font-bold mt-0.5">
                  INDORE • INDIA
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Dual-tone color configuration based on selected palette
  const getPaletteColors = () => {
    switch (palette) {
      case "cosmic-ocean":
        return {
          primary: "#0F4C5C",  // Deep Petrol Teal
          accent: "#D4A359",   // Metallic Warm Gold
          text: "#0F4C5C",
          tagline: "#D4A359"
        };
      case "teal-mint":
        return {
          primary: "#0D9488",  // Botanical Teal
          accent: "#2DD4BF",   // Mint Green
          text: "#0D9488",
          tagline: "#10B981"
        };
      case "royal-indigo":
        return {
          primary: "#312E81",  // Deep Royal Purple/Indigo
          accent: "#F43F5E",   // Luxurious Rose Gold
          text: "#312E81",
          tagline: "#F43F5E"
        };
      case "sunset-gold":
      default:
        // EXACT palette from the user's shared premium logo image
        return {
          primary: "#0F4C5C",  // Beautiful signature Deep Petrol Teal
          accent: "#D4A359",   // Elegant Metallic Gold
          text: "#0F4C5C",
          tagline: "#D4A359"
        };
    }
  };

  const colors = getPaletteColors();
  const uniqueId = `soma-grad-${palette}`;

  // Magnificent Vector Line-Art Lotus with Meditating Yoga Person
  // Replicated exactly from the user's shared image (https://share.gemini.google/c0sYVR8CDUZs)
  const logoContent = (
    <g id="soma-lotus-logo-group">
      <defs>
        {/* Soft, beautiful linear gradients for smooth rendering */}
        <linearGradient id={`${uniqueId}-teal-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.primary} />
          <stop offset="100%" stopColor="#0B303B" />
        </linearGradient>

        <linearGradient id={`${uniqueId}-gold-grad`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8A662D" />
          <stop offset="50%" stopColor={colors.accent} />
          <stop offset="100%" stopColor="#F9E7B9" />
        </linearGradient>
      </defs>

      {/* 1. GOLD BACKGROUND PETALS (Rendered behind for elegant layering) */}
      {/* Far Left Gold Petal */}
      <path
        d="M 33 46 C 26 44, 25 36, 33 34 C 32 38, 32 42, 33 46 Z"
        fill={`url(#${uniqueId}-gold-grad)`}
        opacity="0.9"
      />
      {/* Inner-Left Gold Petal */}
      <path
        d="M 41 27 C 35 22, 38 13, 47 12 C 44 18, 43 23, 41 27 Z"
        fill={`url(#${uniqueId}-gold-grad)`}
        opacity="0.9"
      />
      {/* Inner-Right Gold Petal */}
      <path
        d="M 59 27 C 65 22, 62 13, 53 12 C 56 18, 57 23, 59 27 Z"
        fill={`url(#${uniqueId}-gold-grad)`}
        opacity="0.9"
      />
      {/* Far Right Gold Petal */}
      <path
        d="M 67 46 C 74 44, 75 36, 67 34 C 68 38, 68 42, 67 46 Z"
        fill={`url(#${uniqueId}-gold-grad)`}
        opacity="0.9"
      />

      {/* 2. MAIN DEEP TEAL FRONT PETALS (Line-art Lotus Structure) */}
      {/* Far Left Teal Petal */}
      <path
        d="M 35 48 C 24 43, 22 31, 33 29 C 34 34, 34 42, 35 48"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Far Right Teal Petal */}
      <path
        d="M 65 48 C 76 43, 78 31, 67 29 C 66 34, 66 42, 65 48"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Flame Petal framing the Head */}
      <path
        d="M 50 16 C 43 25, 43 35, 50 42 C 57 35, 57 25, 50 16 Z"
        fill="none"
        stroke={colors.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 3. CORE MEDITATING YOGA FIGURE (Deep Teal) */}
      {/* Head */}
      <circle
        cx="50"
        cy="33.5"
        r="3.5"
        fill={`url(#${uniqueId}-teal-grad)`}
      />

      {/* Elegant arms sweeping up to form inner lotus petals */}
      <path
        d="M 50 48 C 45 42, 38 41, 38 45.5 C 38 49.5, 46 51, 50 54.5"
        fill="none"
        stroke={colors.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 50 48 C 55 42, 62 41, 62 45.5 C 62 49.5, 54 51, 50 54.5"
        fill="none"
        stroke={colors.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Symmetrical Crossed Legs base loop */}
      <path
        d="M 38 57 C 33 53, 41 49, 50 52 C 59 49, 67 53, 62 57 C 57 61, 43 61, 38 57 Z"
        fill="none"
        stroke={colors.primary}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Base Supportive Line Arcs (Water ripples representing serenity) */}
      <path
        d="M 43 62 C 46 64, 54 64, 57 62"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M 46 65.5 C 48 67, 52 67, 54 65.5"
        fill="none"
        stroke={colors.primary}
        strokeWidth="1"
        strokeLinecap="round"
      />
    </g>
  );

  // Render combined SVG
  if (circularBadgeStyle) {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 120 120"
          width={size}
          height={size}
          className="overflow-visible select-none drop-shadow-md"
        >
          {/* Circular text path setup */}
          <path
            id="soma-text-path"
            d="M 20 60 A 40 40 0 1 1 100 60 A 40 40 0 1 1 20 60"
            fill="none"
            stroke="none"
          />
          
          <g transform="translate(10, 10)">
            {logoContent}
          </g>

          {/* Symmetrical curved brand text */}
          <text className="font-sans text-[6px] tracking-[0.25em] font-bold fill-[#0F4C5C] uppercase">
            <textPath href="#soma-text-path" startOffset="50%" textAnchor="middle">
              • SOMA SPA & WELLNESS CENTRE • INDORE
            </textPath>
          </text>
        </svg>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-3.5 ${className}`}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="overflow-visible select-none drop-shadow"
      >
        {logoContent}
      </svg>
      
      {(showText || showTagline) && (
        <div className="flex flex-col text-left">
          {showText && (
            <span className="font-serif text-2xl sm:text-3xl font-normal text-[#0F4C5C] tracking-[0.1em] uppercase leading-none">
              Soma
            </span>
          )}
          {showTagline && (
            <div className="flex flex-col mt-1">
              <span className="text-[8px] sm:text-[9px] font-sans tracking-[0.15em] text-[#0F4C5C] uppercase font-bold">
                SPA AND WELLNESS CENTER
              </span>
              <span className="text-[7px] sm:text-[8px] font-sans tracking-[0.2em] text-[#D4A359] uppercase font-bold mt-0.5">
                INDORE • INDIA
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

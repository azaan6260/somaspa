import React, { useState, useRef } from "react";
import { SomaLogo, LogoPalette } from "./SomaLogo";
import { Download, Check, Sparkles, Sliders, Image as ImageIcon, Type, HelpCircle } from "lucide-react";

export const LogoStudio: React.FC = () => {
  const [palette, setPalette] = useState<LogoPalette>("sunset-gold");
  const [styleType, setStyleType] = useState<"icon" | "horizontal" | "circular">("horizontal");
  const [customTitle, setCustomTitle] = useState("Soma");
  const [customTagline, setCustomTagline] = useState("SPA & WELLNESS CENTRE");
  const [isDownloading, setIsDownloading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const palettes: { id: LogoPalette; label: string; desc: string; colors: string[] }[] = [
    {
      id: "sunset-gold",
      label: "Sunset Gold",
      desc: "Warm yellow, orange & gold. Represents healing solar fire and sandalwood energy.",
      colors: ["bg-amber-500", "bg-orange-500", "bg-yellow-300"],
    },
    {
      id: "cosmic-ocean",
      label: "Cosmic Ocean",
      desc: "Deep indigo, sky blue & emerald. Reflects deep mental calm and water flows.",
      colors: ["bg-indigo-600", "bg-sky-400", "bg-emerald-400"],
    },
    {
      id: "teal-mint",
      label: "Teal Mint",
      desc: "Fresh teal, emerald & mint. Associated with botanical purity, herbs and nature.",
      colors: ["bg-teal-600", "bg-emerald-500", "bg-emerald-100"],
    },
    {
      id: "royal-indigo",
      label: "Royal Indigo",
      desc: "Majestic indigo, pink & rose. Expresses spiritual awakening and divine luxury.",
      colors: ["bg-indigo-700", "bg-pink-500", "bg-rose-400"],
    },
  ];

  const handleDownloadSVG = () => {
    try {
      if (!previewRef.current) return;
      
      // Query the SVG element inside our preview
      const svgElement = previewRef.current.querySelector("svg");
      if (!svgElement) {
        alert("SVG template not found");
        return;
      }

      // Clone and clean the SVG for standalone use
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      
      // If we are in horizontal text mode, let's make sure the SVG viewbox includes the text properly
      if (styleType === "horizontal") {
        clonedSvg.setAttribute("width", "420");
        clonedSvg.setAttribute("height", "150");
        clonedSvg.setAttribute("viewBox", "0 0 420 150");
        
        // Let's inject the text elements manually into the SVG so the standalone file works beautifully
        const gText = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gText.setAttribute("transform", "translate(120, 52)");
        
        const textTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textTitle.setAttribute("font-family", "Playfair Display, Georgia, serif");
        textTitle.setAttribute("font-size", "32px");
        textTitle.setAttribute("font-weight", "600");
        textTitle.setAttribute("letter-spacing", "0.08em");
        textTitle.setAttribute("fill", "#0F4C5C");
        textTitle.textContent = "Soma";
        
        const textTag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textTag.setAttribute("y", "26");
        textTag.setAttribute("font-family", "system-ui, -apple-system, sans-serif");
        textTag.setAttribute("font-size", "9px");
        textTag.setAttribute("font-weight", "700");
        textTag.setAttribute("letter-spacing", "0.18em");
        textTag.setAttribute("fill", "#0F4C5C");
        textTag.textContent = "SPA AND WELLNESS CENTER";

        const textLoc = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLoc.setAttribute("y", "38");
        textLoc.setAttribute("font-family", "system-ui, -apple-system, sans-serif");
        textLoc.setAttribute("font-size", "8px");
        textLoc.setAttribute("font-weight", "700");
        textLoc.setAttribute("letter-spacing", "0.22em");
        textLoc.setAttribute("fill", "#D4A359");
        textLoc.textContent = "INDORE • INDIA";

        gText.appendChild(textTitle);
        gText.appendChild(textTag);
        gText.appendChild(textLoc);
        clonedSvg.appendChild(gText);
      }

      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = `soma-logo-${palette}-${styleType}.svg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);

      triggerSuccessAlert("SVG Vector Logo downloaded successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPNG = () => {
    setIsDownloading(true);
    try {
      if (!previewRef.current) return;
      const svgElement = previewRef.current.querySelector("svg");
      if (!svgElement) return;

      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

      let width = 500;
      let height = 500;

      if (styleType === "horizontal") {
        width = 840;
        height = 300;
        clonedSvg.setAttribute("width", "840");
        clonedSvg.setAttribute("height", "300");
        clonedSvg.setAttribute("viewBox", "0 0 420 150");

        const gText = document.createElementNS("http://www.w3.org/2000/svg", "g");
        gText.setAttribute("transform", "translate(120, 52)");
        
        const textTitle = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textTitle.setAttribute("font-family", "Playfair Display, Georgia, serif");
        textTitle.setAttribute("font-size", "32px");
        textTitle.setAttribute("font-weight", "600");
        textTitle.setAttribute("letter-spacing", "0.08em");
        textTitle.setAttribute("fill", "#0F4C5C");
        textTitle.textContent = "Soma";
        
        const textTag = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textTag.setAttribute("y", "26");
        textTag.setAttribute("font-family", "system-ui, -apple-system, sans-serif");
        textTag.setAttribute("font-size", "9px");
        textTag.setAttribute("font-weight", "700");
        textTag.setAttribute("letter-spacing", "0.18em");
        textTag.setAttribute("fill", "#0F4C5C");
        textTag.textContent = "SPA AND WELLNESS CENTER";

        const textLoc = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textLoc.setAttribute("y", "38");
        textLoc.setAttribute("font-family", "system-ui, -apple-system, sans-serif");
        textLoc.setAttribute("font-size", "8px");
        textLoc.setAttribute("font-weight", "700");
        textLoc.setAttribute("letter-spacing", "0.22em");
        textLoc.setAttribute("fill", "#D4A359");
        textLoc.textContent = "INDORE • INDIA";

        gText.appendChild(textTitle);
        gText.appendChild(textTag);
        gText.appendChild(textLoc);
        clonedSvg.appendChild(gText);
      } else if (styleType === "circular") {
        width = 600;
        height = 600;
        clonedSvg.setAttribute("width", "600");
        clonedSvg.setAttribute("height", "600");
      } else {
        width = 500;
        height = 500;
        clonedSvg.setAttribute("width", "500");
        clonedSvg.setAttribute("height", "500");
      }

      const svgString = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = reader.result as string;
        
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Fill high-end transparent or white background
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, width, height);
            
            ctx.drawImage(img, 0, 0, width, height);
            
            const pngUrl = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngUrl;
            downloadLink.download = `soma-logo-${palette}-${styleType}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            triggerSuccessAlert("PNG High-Res Logo downloaded successfully!");
          }
          setIsDownloading(false);
        };
      };
      reader.readAsDataURL(svgBlob);
    } catch (err) {
      console.error(err);
      setIsDownloading(false);
    }
  };

  const triggerSuccessAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  return (
    <div id="brand-logo-studio" className="bg-white border border-indigo-100 rounded-[32px] p-6 sm:p-10 shadow-sm space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-indigo-500/5 to-teal-500/5 rounded-full blur-3xl" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Interactive Brand Kit</span>
          </div>
          <h2 className="font-serif text-3xl font-semibold text-slate-900 tracking-wide">
            SOMA Design Studio
          </h2>
          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Create, personalize, and export high-definition vector logos for SOMA. Fully compatible with digital screens, corporate letterheads, and wellness signage.
          </p>
        </div>
        
        {/* Instant Indicator of high resolution output */}
        <div className="bg-slate-50 border border-indigo-50 rounded-2xl p-4 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Format Outputs</p>
            <p className="text-[10px] font-mono text-slate-400">Vector SVG & 300DPI PNG</p>
          </div>
        </div>
      </div>

      {/* Success Notification Bar */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm px-4 py-3.5 rounded-xl flex items-center space-x-2 animate-scale-up">
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">✓</div>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Live Preview Area */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 border border-indigo-100/50 rounded-2xl p-6 sm:p-10 text-center relative group min-h-[350px]">
          <div className="absolute top-4 left-4 text-[10px] font-mono text-slate-400 select-none uppercase tracking-widest font-bold">
            Live Vector Canvas
          </div>
          
          <div 
            ref={previewRef}
            className="w-full flex items-center justify-center transition-all duration-300 transform group-hover:scale-102 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-indigo-50/50"
          >
            {styleType === "icon" && (
              <SomaLogo size={140} palette={palette} />
            )}

            {styleType === "horizontal" && (
              <div className="flex items-center space-x-5 py-4">
                <SomaLogo size={80} palette={palette} />
                <div className="flex flex-col text-left border-l border-slate-100 pl-5">
                  <span className="font-serif text-3xl font-black text-slate-900 tracking-wide leading-none">
                    {customTitle}
                  </span>
                  <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-600 uppercase font-bold mt-2">
                    {customTagline}
                  </span>
                </div>
              </div>
            )}

            {styleType === "circular" && (
              <SomaLogo size={180} palette={palette} circularBadgeStyle={true} />
            )}
          </div>

          <p className="text-[11px] text-slate-400 mt-6 font-mono leading-relaxed max-w-xs">
            {styleType === "horizontal" 
              ? "Designed for headers, horizontal layouts & invoices" 
              : styleType === "circular" 
              ? "Designed for stickers, circular badges & window glass print" 
              : "Minimal symbol variant, ideal for avatars, favicons & apps"}
          </p>
        </div>

        {/* Right Side: Options Customizer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Style Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-indigo-600 uppercase font-bold tracking-wider flex items-center space-x-1">
              <Type className="w-3.5 h-3.5" />
              <span>Choose Brand Layout Style</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "icon", label: "Minimal Symbol", desc: "Icon Only" },
                { id: "horizontal", label: "Corporate Badge", desc: "Text & Icon" },
                { id: "circular", label: "Circular Emblem", desc: "Curved Badge" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStyleType(st.id as any)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    styleType === st.id
                      ? "bg-indigo-600/5 border-indigo-600 text-indigo-900 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50/50"
                  }`}
                >
                  <p className="text-xs font-bold">{st.label}</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono text-indigo-600 uppercase font-bold tracking-wider flex items-center space-x-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Color Harmony & Gradient</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {palettes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPalette(p.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-3 cursor-pointer ${
                    palette === p.id
                      ? "bg-indigo-600/5 border-indigo-600 text-indigo-900 shadow-sm"
                      : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50/50"
                  }`}
                >
                  {/* Palette Dot Overlap Preview */}
                  <div className="flex -space-x-2 shrink-0 mt-0.5">
                    {p.colors.map((c, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full border border-white shadow-sm ${c}`} />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <p className="text-xs font-bold text-slate-800">{p.label}</p>
                      {palette === p.id && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Configuration (Visible only if horizontal text) */}
          {styleType === "horizontal" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 border border-slate-100 p-4 rounded-xl animate-fade-in">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wide mb-1">
                  Brand Name (Title)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wide mb-1">
                  Slogan/Tagline
                </label>
                <input
                  type="text"
                  maxLength={28}
                  value={customTagline}
                  onChange={(e) => setCustomTagline(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Quick Export Panel */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDownloadSVG}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow hover:shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-sky-300" />
                <span>Export Vector (SVG)</span>
              </button>

              <button
                onClick={handleDownloadPNG}
                disabled={isDownloading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl transition-all shadow hover:shadow-lg disabled:opacity-75 flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isDownloading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rasterizing PNG...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4 text-indigo-100" />
                    <span>Download Image (PNG)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

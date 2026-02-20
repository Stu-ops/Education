import { useLanguage } from "../hooks/useLanguage";
import { resetSession } from "../utils/api";
import { useState } from "react";
import { Users } from "lucide-react";

export default function Header() {
  const { lang, toggleLang } = useLanguage();
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);

  const handleReset = async () => {
    try {
      // Trigger bounce animation
      setIsLogoAnimating(true);
      setTimeout(() => setIsLogoAnimating(false), 600);

      // 1. Call backend reset API if it exists
      if (typeof resetSession === "function") {
        await resetSession();
      }

      // 3. Force a *real* React-level reset
      // Instead of full hard reload, use a soft reload that remounts components
      window.location.href = window.location.origin; // ensures total reset
    } catch (error) {
      console.error("Error resetting session:", error);
    }
  };

  return (
    <div className="masterly-surface-dark rounded-[20px] px-4 py-3 shadow-lg select-none">
      <div className="flex justify-between items-center gap-3">
        <button
          onClick={handleReset}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleReset();
            }
          }}
          className="flex items-center gap-2 text-white hover:text-white/90 transition-colors"
          title="Click to reset session"
          aria-label="Masterly - Click to reset session"
        >
          <img
            src="/assets/icons/logo.png"
            alt="Masterly logo"
            className={`w-9 h-8 ${isLogoAnimating ? "animate-bounce-in" : ""}`}
          />
          <span className="text-lg font-semibold tracking-tight">Masterly</span>
        </button>

        <div className="flex items-center gap-2">


          <button
            onClick={toggleLang}
            className="flex items-center gap-1 rounded-full bg-white/10 px-1.5 py-1 text-[11px] text-white/80 hover:text-white transition-colors"
            aria-label={`Switch language to ${lang === "hi" ? "English" : "Hindi"}`}
          >
            <span className={`px-2 py-0.5 rounded-full ${lang === "hi" ? "bg-white/20 text-white" : ""}`}>à¤…</span>
            <span className={`px-2 py-0.5 rounded-full ${lang === "en" ? "bg-white/20 text-white" : ""}`}>A</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-masterly-orange text-white font-semibold flex items-center justify-center border border-white/30 shadow-sm">
            A
          </div>
        </div>
      </div>
    </div>
  );
}

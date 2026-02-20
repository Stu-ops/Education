import { useLanguage } from "../hooks/useLanguage";
import { Home, Compass, User, MessageSquare } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { resetSession } from "../utils/api"; // <-- import here
import { useState, useEffect } from "react";

export default function BottomNav({ setIsChatExpanded }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [clickedIndex, setClickedIndex] = useState(null);
  const [showExploreHint, setShowExploreHint] = useState(false);

  // Show hint pulse for Explore feature (new feature hint)
  useEffect(() => {
    const hasSeenExplore = localStorage.getItem('hasSeenExplore');
    if (!hasSeenExplore) {
      setShowExploreHint(true);
    }
  }, []);

  const handleExploreClick = (index) => {
    // Mark as seen and remove hint
    localStorage.setItem('hasSeenExplore', 'true');
    setShowExploreHint(false);
    handleNavigate("/math", true, index);
  };

  const handleNavigate = (path, collapseChat = true, index) => {
    // Trigger bounce animation
    setClickedIndex(index);
    setTimeout(() => setClickedIndex(null), 300);

    // 🧹 Reset chat session before going anywhere
    resetSession();

    if (collapseChat) setIsChatExpanded(false);
    navigate(path);
  };

  const navItems = [
    {
      icon: <Home size={24} />,
      label: lang === "hi" ? "होम" : "Home",
      path: "/",
      action: (index) => { 
        window.history.replaceState({}, document.title, "/"); 
        window.location.reload(); 
        handleNavigate("/", true, index);
      }
    },
    {
      icon: <MessageSquare size={24} />,
      label: lang === "hi" ? "चैट हिस्ट्री" : "Chat History",
      path: "/history",
      action: (index) => handleNavigate("/history", false, index),
    },
    {
      icon: <Compass size={24} />,
      label: lang === "hi" ? "खोजें" : "Explore",
      path: "/math",
      action: (index) => handleExploreClick(index),
      showHint: showExploreHint,
    },
    {
      icon: <User size={24} />,
      label: lang === "hi" ? "प्रोफ़ाइल" : "Profile",
      path: "/profile",
      action: (index) => handleNavigate("/profile", true, index),
    },
  ];

  return (
    <nav className="flex justify-around items-center masterly-surface-dark rounded-[20px] py-2.5 px-2 mt-3 text-white shadow-lg">
      {navItems.map((n, i) => {
        const isActive = location.pathname === n.path;
        
        return (
          <button
            key={i}
            onClick={() => n.action(i)}
            className={`
              relative flex flex-col items-center gap-1 
              min-w-[44px] min-h-[44px] px-3 py-2
              transition-all duration-200
              ${isActive ? 'scale-100' : 'scale-100 hover:scale-105'}
              active:scale-90
              ${clickedIndex === i ? 'animate-bounce' : ''}
            `}
            aria-label={n.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {n.showHint && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-masterly-orange rounded-full" />
            )}

            {/* Icon */}
            <div className={`
              transition-all duration-200
              ${isActive 
                ? 'text-masterly-orange' 
                : 'text-white/70 hover:text-white'
              }
            `}>
              {n.icon}
            </div>
            
            {/* Label with fade transition */}
            <span className={`
              text-[10px] transition-all duration-200
              ${isActive 
                ? 'opacity-100 font-semibold text-masterly-orange' 
                : 'opacity-70 hover:opacity-100 text-white/70'
              }
            `}>
              {n.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

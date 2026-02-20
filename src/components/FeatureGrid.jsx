import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage";
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function FeatureGrid({ onTopicClick }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${BACKEND_URL}/topics/`, { headers });
        if (!res.ok) throw new Error("Failed to fetch topics");
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error("Error fetching topics:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const icons = ["123", "+", "−", "⬤"];
  
  // Solid colors for topic badges
  const badgeColors = [
    "#F670B1",
    "#3DA9D3",
    "#31BC5F",
    "#FD9D28",
  ];

  const features =
    topics.length > 0
      ? topics.map((topic, i) => ({
          label: lang === "hi"
            ? ["संख्याएँ", "जोड़", "घटाव", "आकार"][i] || topic
            : topic,
          icon: icons[i] || "❖",
          badge: badgeColors[i] || "#FF7A1A",
        }))
      : [];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        {/* Loading skeleton for browse teachers card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="w-28 h-4 bg-white/20 rounded mb-2"></div>
              <div className="w-44 h-3 bg-white/20 rounded"></div>
            </div>
            <div className="w-16 h-8 bg-white/20 rounded"></div>
          </div>
        </div>

        {/* Loading skeleton for my teachers card */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="w-24 h-4 bg-white/20 rounded mb-2"></div>
              <div className="w-52 h-3 bg-white/20 rounded"></div>
            </div>
            <div className="w-16 h-8 bg-white/20 rounded"></div>
          </div>
        </div>

        {/* Loading skeleton for math topics */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 md:p-6 min-h-[100px] sm:min-h-[120px] md:min-h-[140px] flex flex-col items-center justify-center relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white/20 rounded-full mb-2 sm:mb-3" />
              <div className="w-16 sm:w-20 h-3 sm:h-4 bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full">
      {/* Browse Teachers */}
      <div className="bg-masterly-creamLight rounded-2xl p-3 border border-masterly-border shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-masterly-navy font-semibold text-sm">
              {lang === "hi" ? "शिक्षक खोजें" : "Browse Teachers"}
            </h3>
            <p className="text-masterly-muted text-xs">
              {lang === "hi" ? "वीडियो लेक्चर देखें और सीखें" : "Watch video lectures and learn"}
            </p>
          </div>
          <button
            onClick={() => navigate('/find-teachers')}
            className="bg-masterly-green text-white px-4 py-1.5 rounded-full font-semibold transition-all duration-200 text-xs flex-shrink-0 hover:brightness-110 shadow-sm border border-black/5"
            style={{ backgroundColor: "#27B74A" }}
          >
            {lang === "hi" ? "खोजें" : "Browse"}
          </button>
        </div>
      </div>

      {/* My Teachers */}
      <div className="bg-masterly-creamLight rounded-2xl p-3 border border-masterly-border shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-masterly-navy font-semibold text-sm">
              {lang === "hi" ? "मेरे शिक्षक" : "My Teachers"}
            </h3>
            <p className="text-masterly-muted text-xs">
              {lang === "hi" ? "आपके नामांकित शिक्षकों की सामग्री देखें" : "Access content from your enrolled teachers"}
            </p>
          </div>
          <button
            onClick={() => navigate('/my-teachers')}
            className="bg-masterly-orangeDeep text-white px-4 py-1.5 rounded-full font-semibold transition-all duration-200 text-xs flex-shrink-0 hover:brightness-110 shadow-sm border border-black/5"
            style={{ backgroundColor: "#FC6F1F" }}
          >
            {lang === "hi" ? "देखें" : "View"}
          </button>
        </div>
      </div>

      {/* Math Topics Grid */}
      <div className="grid grid-cols-4 gap-2">
        {features.map((f, i) => (
          <button
            key={i}
            className={`
              group relative
              bg-masterly-creamLight 
              rounded-2xl
              flex flex-col items-center justify-center 
              p-2
              min-h-[88px]
              text-masterly-navy font-medium
              border border-masterly-border
              shadow-sm
              transition-all duration-300 ease-out
              hover:scale-105 hover:shadow-md
              active:scale-95
              animate-fade-in
              gpu-accelerated
            `}
            style={{
              animationDelay: `${i * 100}ms`,
              animationFillMode: 'backwards'
            }}
            onClick={() => onTopicClick(f.label)}
            aria-label={`${lang === "hi" ? "विषय चुनें" : "Select topic"}: ${f.label}`}
          >
            {/* Solid icon badge */}
            <div
              className={`
                w-11 h-11
                rounded-full 
                flex items-center justify-center
                mb-2
                text-lg text-white
                transition-transform duration-300
                group-hover:scale-110
                group-active:scale-90
                gpu-accelerated
              `}
              style={{ backgroundColor: f.badge }}
              aria-hidden="true"
            >
              {f.icon}
            </div>
            
            {/* Topic label */}
            <div className="text-[11px] text-center leading-tight">
              {f.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

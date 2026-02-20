import { useEffect, useState } from "react";

export default function CircularProgress({ percentage, size = "mobile" }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Responsive sizing: 120px mobile, 160px desktop
  const dimensions = size === "desktop" ? 160 : 120;
  const radius = size === "desktop" ? 70 : 52;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    // Trigger mount for arc drawing animation
    setMounted(true);
    
    // Count-up animation for percentage in center
    const duration = 1000; // 1 second to match arc animation
    const steps = 60;
    const increment = percentage / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        setAnimatedPercentage(percentage);
        clearInterval(timer);
      } else {
        setAnimatedPercentage(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [percentage]);

  return (
    <div 
      className="relative mx-auto"
      style={{ width: `${dimensions}px`, height: `${dimensions}px` }}
    >
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(248, 115, 22, 0.14) 0%, transparent 70%)",
          filter: "blur(16px)"
        }}
      />
      
      {/* SVG Circle */}
      <svg 
        className="w-full h-full transform -rotate-90" 
        viewBox={`0 0 ${dimensions} ${dimensions}`}
      >
        <defs>
          {/* Gradient stroke from green-400 to blue-500 */}
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4BE87" />
            <stop offset="100%" stopColor="#F87316" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke="#EEDACE"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle with arc drawing animation (1s ease-out) */}
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? strokeDashoffset : circumference}
          strokeLinecap="round"
          style={{
            transition: mounted ? "stroke-dashoffset 1s ease-out" : "none",
            filter: "drop-shadow(0 0 6px rgba(248, 115, 22, 0.35))"
          }}
        />
      </svg>
      
      {/* Center percentage text with count-up animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className={`font-bold text-masterly-navy ${
            size === "desktop" ? "text-3xl" : "text-2xl"
          }`}
        >
          {animatedPercentage}%
        </span>
      </div>
    </div>
  );
}

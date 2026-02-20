import { useState } from "react";
import Header from "../components/Header";
import ProgressBar from "../components/ProgressBar";
import BottomNav from "../components/BottomNav";

export default function MainLayout({ children }) {
  const [loading, setLoading] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  return (
    <div
      className="min-h-screen w-screen bg-masterly-cream p-3 flex justify-center items-center"
      onClick={() => setIsChatExpanded(false)}
    >
      <div
        className="w-full max-w-[440px] h-[calc(100vh-24px)] max-h-[860px]
                   bg-masterly-cream rounded-[28px] border border-masterly-border shadow-xl 
                   p-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <Header />

        {/* Progress bar */}
        <ProgressBar loading={loading} />

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children({ isChatExpanded, setIsChatExpanded, loading, setLoading })}
        </div>

        {/* Bottom navigation */}
        <BottomNav setIsChatExpanded={setIsChatExpanded} />
      </div>
    </div>
  );
}

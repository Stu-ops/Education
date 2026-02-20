import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../components/Header";
import ProgressBar from "../components/ProgressBar";
import FeatureGrid from "../components/FeatureGrid";
import ChatSection from "../components/ChatSection";
import BottomNav from "../components/BottomNav";
import MotivationalQuote from "../components/MotivationalQuote";

export default function Home() {
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialTopic, setInitialTopic] = useState(null);
  const [showQuote, setShowQuote] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const location = useLocation();
  const preloadMessages = location.state?.messages || null;
  const preloadSessionId = location.state?.session_id || null;

  useEffect(() => {
    // Check if this is the first load of the app
    const hasShownQuote = sessionStorage.getItem('hasShownQuote');
    console.log('hasShownQuote:', hasShownQuote);
    console.log('showQuote:', showQuote, 'isFirstLoad:', isFirstLoad);

    if (hasShownQuote) {
      setShowQuote(false);
      setIsFirstLoad(false);
    }

    // For debugging - uncomment the line below to always show the quote
    sessionStorage.removeItem('hasShownQuote');
  }, []);

  const handleTopicClick = (topic) => {
    setInitialTopic(topic);
    setIsChatExpanded(true);
  };

  const handleQuoteComplete = () => {
    console.log('Quote completed, hiding quote');
    setShowQuote(false);
    setIsFirstLoad(false);
    sessionStorage.setItem('hasShownQuote', 'true');
  };

  return (
    <>
      {/* Show motivational quote on first load */}
      {showQuote && isFirstLoad && (
        <MotivationalQuote onComplete={handleQuoteComplete} />
      )}

      {/* Debug info - remove this later */}
      {/*process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 right-4 bg-black/50 text-white p-2 rounded text-xs z-50">
          showQuote: {showQuote.toString()}, isFirstLoad: {isFirstLoad.toString()}
        </div>
      )*/}

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
          <Header />
          <ProgressBar loading={loading} />

          {/* Content area with proper overflow handling */}
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {!isChatExpanded && (
              <>
                <FeatureGrid onTopicClick={handleTopicClick} />
                <div className="text-center text-masterly-muted text-sm sm:text-base font-medium py-2">
                  See More
                </div>
              </>
            )}

            <ChatSection
              setIsChatExpanded={setIsChatExpanded}
              isChatExpanded={isChatExpanded}
              setLoading={setLoading}
              loading={loading}
              loadMessages={preloadMessages}
              preloadSessionId={preloadSessionId}
              initialTopic={initialTopic}
            />
          </div>

          <BottomNav setIsChatExpanded={setIsChatExpanded} />
        </div>
      </div>
    </>
  );
}

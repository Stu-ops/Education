import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserChats } from "../utils/fetchData";
import { useUser } from "../contexts/UserContext";

export default function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading } = useUser();

  useEffect(() => {
    const loadChats = async () => {
      if (loading) return;
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await getUserChats(user.username);
        setHistory(data);
      } catch (err) {
        console.error("Failed to load chats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [user, loading]);

  const handleClick = (chat) => {
    navigate("/", { state: { messages: chat.messages || [], session_id: chat.session_id } });
  };

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-masterly-card p-4 rounded-2xl border border-masterly-border shadow-sm"
        >
          <div className="h-4 bg-masterly-creamDark rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-masterly-creamDark rounded w-full"></div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-masterly-navy">
        No Chat History Yet
      </h2>
      <p className="text-masterly-muted text-sm sm:text-base mb-6 max-w-md">
        Start a conversation to see your chat history here.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 rounded-full font-semibold text-white
             bg-gradient-to-r from-orange-500 to-orange-600
             shadow-lg transition-all duration-200
             hover:scale-[1.03] hover:shadow-xl
             active:scale-95"
      >
        Start Chatting
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col h-full text-masterly-navy p-4">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Chat History</h1>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-masterly-navy p-3 sm:p-4 animate-page-fade-in">
      <h1 className="text-xl sm:text-2xl font-bold mb-4">
        {user ? `${user.username}'s Chat History` : "Guest Chat History"}
      </h1>

      {isLoading ? (
        <LoadingSkeleton />
      ) : history.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3 overflow-y-auto smooth-scroll flex-1">
          {history.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleClick(chat)}
              className="bg-masterly-card p-4 sm:p-5 rounded-2xl border border-masterly-border cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-sm sm:text-base truncate mb-1 text-masterly-navy">
                    {chat.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-masterly-muted line-clamp-2">
                    {chat.messages && chat.messages.length > 0
                      ? chat.messages.map((m) => m.text || "[Image]").join(" · ")
                      : "No messages"}
                  </p>
                </div>
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-masterly-creamDark border border-masterly-border flex items-center justify-center">
                  <span className="text-[10px] text-masterly-orange">•</span>
                </div>
              </div>
              {chat.messages && chat.messages.length > 0 && (
                <div className="mt-3 pt-3 border-t border-masterly-border flex items-center gap-2 text-xs text-masterly-muted">
                  <span>{chat.messages.length} messages</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

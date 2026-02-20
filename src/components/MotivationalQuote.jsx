import { useState, useEffect } from 'react';

export default function MotivationalQuote({ onComplete }) {
  const [quote, setQuote] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuote = async () => {
      try {
        const response = await fetch('/quotes.json');
        if (!response.ok) {
          throw new Error('Failed to fetch quotes');
        }
        const quotes = await response.json();
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        setQuote(randomQuote);
      } catch (error) {
        setQuote({
          text: 'The expert in anything was once a beginner.',
          author: 'Helen Hayes',
        });
      } finally {
        setLoading(false);
      }
    };

    loadQuote();
  }, []);

  useEffect(() => {
    if (!quote || loading) return;

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 3000);

    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [quote, loading, onComplete]);

  if (!isVisible) return null;

  if (loading || !quote) {
    return (
      <div className="fixed inset-0 z-50 bg-masterly-cream flex items-center justify-center">
        <div className="text-masterly-navy text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-masterly-orange mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading inspiration...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 z-50 bg-masterly-cream flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="max-w-2xl mx-8 text-center">
        <div className="bg-masterly-creamLight rounded-3xl p-8 shadow-sm border border-masterly-border animate-quote-fade-in">
          <div className="mb-6 text-4xl">?</div>
          <blockquote className="text-xl md:text-2xl font-medium text-masterly-navy mb-4 leading-relaxed animate-quote-text-reveal">
            "{quote.text}"
          </blockquote>
          <cite className="text-masterly-muted text-base animate-quote-author-slide">
            — {quote.author}
          </cite>
          <div className="mt-6 pt-4 border-t border-masterly-border animate-quote-author-slide">
            <p className="text-masterly-muted text-sm font-medium">
              Ready to start your learning journey?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

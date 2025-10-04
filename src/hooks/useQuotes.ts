import { useState, useEffect, useCallback } from 'react';
import { Quote, getTodaysQuotes, getNextQuote, getCurrentQuote, getQuoteStats, forceRefreshQuotes } from '@/services/quotesService';

export function useQuotes() {
  const [currentQuote, setCurrentQuote] = useState<Quote>(getCurrentQuote());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState(getQuoteStats());

  // Load today's quotes on mount
  useEffect(() => {
    const loadTodaysQuotes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await getTodaysQuotes();
        setCurrentQuote(getCurrentQuote());
        setStats(getQuoteStats());
      } catch (err) {
        setError('Failed to load quotes');
        console.error('Error loading quotes:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodaysQuotes();
  }, []);

  // Get next quote
  const nextQuote = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const quote = await getNextQuote();
      setCurrentQuote(quote);
      setStats(getQuoteStats());
    } catch (err) {
      setError('Failed to get next quote');
      console.error('Error getting next quote:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh quotes (force fetch new ones)
  const refreshQuotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await forceRefreshQuotes();
      setCurrentQuote(getCurrentQuote());
      setStats(getQuoteStats());
    } catch (err) {
      setError('Failed to refresh quotes');
      console.error('Error refreshing quotes:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    currentQuote,
    isLoading,
    error,
    stats,
    nextQuote,
    refreshQuotes
  };
}





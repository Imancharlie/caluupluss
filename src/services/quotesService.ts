import api from '@/lib/api';

export interface Quote {
  id: number;
  text: string;
  author: string;
  is_active: boolean;
  created_at: string;
}

// Local storage keys
const QUOTES_STORAGE_KEY = 'caluu_quotes';
const CURRENT_QUOTE_INDEX_KEY = 'caluu_current_quote_index';
const QUOTES_LAST_FETCH_KEY = 'caluu_quotes_last_fetch';

// Cache duration: 24 hours
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Get quotes from localStorage
const getStoredQuotes = (): Quote[] => {
  try {
    const stored = localStorage.getItem(QUOTES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save quotes to localStorage
const saveQuotes = (quotes: Quote[]) => {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
    localStorage.setItem(QUOTES_LAST_FETCH_KEY, Date.now().toString());
  } catch (error) {
    console.error('Failed to save quotes to localStorage:', error);
  }
};

// Get current quote index
const getCurrentQuoteIndex = (): number => {
  try {
    const stored = localStorage.getItem(CURRENT_QUOTE_INDEX_KEY);
    return stored ? parseInt(stored, 10) : 0;
  } catch {
    return 0;
  }
};

// Set current quote index
const setCurrentQuoteIndex = (index: number) => {
  try {
    localStorage.setItem(CURRENT_QUOTE_INDEX_KEY, index.toString());
  } catch (error) {
    console.error('Failed to save quote index:', error);
  }
};

// Check if quotes cache is valid
const isCacheValid = (): boolean => {
  try {
    const lastFetch = localStorage.getItem(QUOTES_LAST_FETCH_KEY);
    if (!lastFetch) return false;
    
    const timeSinceFetch = Date.now() - parseInt(lastFetch, 10);
    return timeSinceFetch < CACHE_DURATION;
  } catch {
    return false;
  }
};

// Fetch quotes from backend with retry
const fetchQuotesFromBackend = async (retryCount = 0): Promise<Quote[]> => {
  const maxRetries = 2;
  
  try {
    const response = await api.get('/quotes/');
    return response.data.quotes || response.data || [];
  } catch (error) {
    console.error(`Failed to fetch quotes from backend (attempt ${retryCount + 1}):`, error);
    
    // Retry up to maxRetries times
    if (retryCount < maxRetries) {
      console.log(`Retrying quotes fetch (${retryCount + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
      return fetchQuotesFromBackend(retryCount + 1);
    }
    
    throw error;
  }
};

// Get today's quotes (API first, then cache fallback)
export const getTodaysQuotes = async (): Promise<Quote[]> => {
  // Always try API first
  try {
    console.log('Fetching quotes from API...');
    const quotes = await fetchQuotesFromBackend();
    saveQuotes(quotes);
    return quotes;
  } catch (error) {
    console.warn('API failed, trying cache...', error);
    
    // If API fails, check cache
    const storedQuotes = getStoredQuotes();
    if (storedQuotes.length > 0) {
      console.warn('Using cached quotes due to API error');
      return storedQuotes;
    }
    
    // If no cache either, throw the original error
    throw error;
  }
};

// Get current quote
export const getCurrentQuote = (): Quote => {
  const quotes = getStoredQuotes();
  const currentIndex = getCurrentQuoteIndex();
  
  if (quotes.length === 0) {
    return {
      id: 0,
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      is_active: true,
      created_at: new Date().toISOString()
    };
  }
  
  return quotes[currentIndex % quotes.length];
};

// Get next quote
export const getNextQuote = async (): Promise<Quote> => {
  const quotes = await getTodaysQuotes();
  const currentIndex = getCurrentQuoteIndex();
  const nextIndex = (currentIndex + 1) % quotes.length;
  
  setCurrentQuoteIndex(nextIndex);
  return quotes[nextIndex];
};

// Get quote statistics
export const getQuoteStats = () => {
  const quotes = getStoredQuotes();
  const currentIndex = getCurrentQuoteIndex();
  
  return {
    totalQuotes: quotes.length,
    currentIndex: currentIndex + 1,
    hasQuotes: quotes.length > 0
  };
};

// Force refresh quotes (ignore cache)
export const forceRefreshQuotes = async (): Promise<Quote[]> => {
  try {
    const quotes = await fetchQuotesFromBackend();
    saveQuotes(quotes);
    setCurrentQuoteIndex(0); // Reset to first quote
    return quotes;
  } catch (error) {
    console.error('Failed to refresh quotes:', error);
    throw error;
  }
};

// Reset quotes (clear cache)
export const resetQuotes = () => {
  try {
    localStorage.removeItem(QUOTES_STORAGE_KEY);
    localStorage.removeItem(CURRENT_QUOTE_INDEX_KEY);
    localStorage.removeItem(QUOTES_LAST_FETCH_KEY);
  } catch (error) {
    console.error('Failed to reset quotes:', error);
  }
};

// Backend service functions
export const quotesService = {
  async getRandomQuote(): Promise<Quote> {
    const response = await api.get('/quotes/random/');
    return response.data;
  },

  async getAllQuotes(): Promise<Quote[]> {
    const response = await api.get('/quotes/');
    return response.data.quotes || response.data || [];
  }
};
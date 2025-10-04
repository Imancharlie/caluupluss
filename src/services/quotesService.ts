import axios from 'axios';

// Quote interface
export interface Quote {
  id: string;
  text: string;
  author: string;
  category: 'motivation' | 'success' | 'education' | 'transformation' | 'inspiration';
  source?: string;
}

// Daily quotes storage interface
interface DailyQuotes {
  date: string; // YYYY-MM-DD format
  quotes: Quote[];
  currentIndex: number;
}

// API configuration
const QUOTES_API_BASE = 'https://api.quotable.io';
const QUOTES_PER_DAY = 10;
const STORAGE_KEY = 'daily_quotes';

// Fallback quotes for offline use and inspiration
const FALLBACK_QUOTES: Quote[] = [
  {
    id: '1',
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "Robert Collier",
    category: 'success'
  },
  {
    id: '2',
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: 'inspiration'
  },
  {
    id: '3',
    text: "Discipline is the bridge between goals and accomplishment.",
    author: "Jim Rohn",
    category: 'motivation'
  },
  {
    id: '4',
    text: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
    category: 'motivation'
  },
  {
    id: '5',
    text: "It always seems impossible until it's done.",
    author: "Nelson Mandela",
    category: 'inspiration'
  },
  {
    id: '6',
    text: "Education is the most powerful weapon which you can use to change the world.",
    author: "Nelson Mandela",
    category: 'education'
  },
  {
    id: '7',
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
    category: 'success'
  },
  {
    id: '8',
    text: "Be yourself; everyone else is already taken.",
    author: "Oscar Wilde",
    category: 'inspiration'
  },
  {
    id: '9',
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: 'motivation'
  },
  {
    id: '10',
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: 'inspiration'
  },
  {
    id: '11',
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: 'motivation'
  },
  {
    id: '12',
    text: "Don't be afraid to give up the good to go for the great.",
    author: "John D. Rockefeller",
    category: 'success'
  },
  {
    id: '13',
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: 'transformation'
  },
  {
    id: '14',
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
    category: 'transformation'
  },
  {
    id: '15',
    text: "Your limitation—it's only your imagination.",
    author: "Unknown",
    category: 'motivation'
  },
  {
    id: '16',
    text: "Great things never come from comfort zones.",
    author: "Unknown",
    category: 'motivation'
  },
  {
    id: '17',
    text: "Dream it. Wish it. Do it.",
    author: "Unknown",
    category: 'inspiration'
  },
  {
    id: '18',
    text: "Success doesn't just find you. You have to go out and get it.",
    author: "Unknown",
    category: 'success'
  },
  {
    id: '19',
    text: "The harder you work for something, the greater you'll feel when you achieve it.",
    author: "Unknown",
    category: 'motivation'
  },
  {
    id: '20',
    text: "Dream bigger. Do bigger.",
    author: "Unknown",
    category: 'inspiration'
  }
];

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Get quotes from localStorage
function getStoredQuotes(): DailyQuotes | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn('Failed to parse stored quotes:', error);
    return null;
  }
}

// Save quotes to localStorage
function saveQuotes(quotes: DailyQuotes): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
  } catch (error) {
    console.warn('Failed to save quotes:', error);
  }
}

// Fetch quotes from API
async function fetchQuotesFromAPI(): Promise<Quote[]> {
  try {
    console.log('🌐 Attempting to fetch quotes from API...');
    const quotes: Quote[] = [];
    
    // Fetch multiple quotes from different categories
    const categories = ['motivation', 'success', 'education', 'inspiration'];
    
    for (const category of categories) {
      try {
        // Fetch 2-3 quotes per category
        const quotesPerCategory = Math.ceil(QUOTES_PER_DAY / categories.length);
        
        for (let i = 0; i < quotesPerCategory; i++) {
          const response = await axios.get(`${QUOTES_API_BASE}/random`, {
            params: {
              tags: category,
              maxLength: 150 // Keep quotes concise
            },
            timeout: 5000
          });
          
          if (response.data && response.data.content && response.data.author && response.data.author !== 'Unknown') {
            quotes.push({
              id: `api_${Date.now()}_${i}`,
              text: response.data.content,
              author: response.data.author,
              category: category as Quote['category'],
              source: 'quotable.io'
            });
            console.log(`✅ Fetched quote from API: "${response.data.content.substring(0, 50)}..."`);
          }
        }
      } catch (error) {
        console.warn(`❌ Failed to fetch quotes for category ${category}:`, error);
      }
    }
    
    console.log(`📊 API fetch complete: ${quotes.length} quotes fetched`);
    
    // If we didn't get enough quotes from API, fill with fallback quotes
    if (quotes.length < QUOTES_PER_DAY) {
      const remaining = QUOTES_PER_DAY - quotes.length;
      console.log(`⚠️ Only ${quotes.length} quotes from API, adding ${remaining} fallback quotes`);
      const shuffledFallbacks = [...FALLBACK_QUOTES].sort(() => Math.random() - 0.5);
      quotes.push(...shuffledFallbacks.slice(0, remaining));
    }
    
    return quotes.slice(0, QUOTES_PER_DAY);
  } catch (error) {
    console.warn('❌ Failed to fetch quotes from API, using fallback quotes:', error);
    // Return shuffled fallback quotes
    return [...FALLBACK_QUOTES].sort(() => Math.random() - 0.5).slice(0, QUOTES_PER_DAY);
  }
}

// Get today's quotes (from API or localStorage)
export async function getTodaysQuotes(): Promise<Quote[]> {
  const today = getTodayDate();
  const stored = getStoredQuotes();
  
  // If we have quotes for today, return them
  if (stored && stored.date === today) {
    console.log(`📅 Using cached quotes for ${today} (${stored.quotes.length} quotes)`);
    return stored.quotes;
  }
  
  // Fetch new quotes for today
  console.log(`🔄 Fetching new quotes for ${today}...`);
  const quotes = await fetchQuotesFromAPI();
  
  // Save to localStorage
  const dailyQuotes: DailyQuotes = {
    date: today,
    quotes,
    currentIndex: 0
  };
  saveQuotes(dailyQuotes);
  console.log(`💾 Saved ${quotes.length} quotes to localStorage for ${today}`);
  
  return quotes;
}

// Get next quote (with rotation)
export async function getNextQuote(): Promise<Quote> {
  const today = getTodayDate();
  const stored = getStoredQuotes();
  
  // If no stored quotes or different day, get today's quotes first
  if (!stored || stored.date !== today) {
    await getTodaysQuotes();
    const newStored = getStoredQuotes();
    if (newStored) {
      const quote = newStored.quotes[newStored.currentIndex];
      newStored.currentIndex = (newStored.currentIndex + 1) % newStored.quotes.length;
      saveQuotes(newStored);
      return quote;
    }
  }
  
  // Use stored quotes
  if (stored) {
    const quote = stored.quotes[stored.currentIndex];
    stored.currentIndex = (stored.currentIndex + 1) % stored.quotes.length;
    saveQuotes(stored);
    return quote;
  }
  
  // Fallback to first fallback quote
  return FALLBACK_QUOTES[0];
}

// Get current quote without advancing
export function getCurrentQuote(): Quote {
  const stored = getStoredQuotes();
  if (stored && stored.quotes.length > 0) {
    return stored.quotes[stored.currentIndex];
  }
  return FALLBACK_QUOTES[0];
}

// Reset quotes (useful for testing)
export function resetQuotes(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Quotes cache cleared. New quotes will be fetched on next load.');
}

// Force refresh quotes (bypass cache)
export async function forceRefreshQuotes(): Promise<Quote[]> {
  console.log('🔄 Force refreshing quotes...');
  localStorage.removeItem(STORAGE_KEY);
  return await getTodaysQuotes();
}

// Get quote statistics
export function getQuoteStats(): { totalQuotes: number; currentIndex: number; date: string } {
  const stored = getStoredQuotes();
  return {
    totalQuotes: stored?.quotes.length || 0,
    currentIndex: stored?.currentIndex || 0,
    date: stored?.date || 'No quotes stored'
  };
}

import React, { useState } from 'react';
import { useQuotes } from '@/hooks/useQuotes';
import { resetQuotes, getQuoteStats } from '@/services/quotesService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const QuotesDebug: React.FC = () => {
  const { currentQuote, isLoading, error, stats, nextQuote, refreshQuotes } = useQuotes();
  const [debugStats, setDebugStats] = useState(getQuoteStats());

  const handleNextQuote = async () => {
    await nextQuote();
    setDebugStats(getQuoteStats());
  };

  const handleRefreshQuotes = async () => {
    await refreshQuotes();
    setDebugStats(getQuoteStats());
  };

  const handleResetQuotes = () => {
    resetQuotes();
    setDebugStats(getQuoteStats());
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Quotes Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Quote Display */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Current Quote:</h3>
          {isLoading ? (
            <div className="animate-pulse">Loading...</div>
          ) : error ? (
            <div className="text-red-500">Error: {error}</div>
          ) : (
            <div>
              <p className="italic">"{currentQuote.text}"</p>
              <p className="text-sm text-gray-600 mt-1">— {currentQuote.author}</p>
              <p className="text-xs text-gray-500 mt-1">
                Category: {currentQuote.category} | Source: {currentQuote.source || 'fallback'}
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded">
            <h4 className="font-medium text-blue-800">Stats</h4>
            <p className="text-sm text-blue-600">
              Total: {debugStats.totalQuotes} | Index: {debugStats.currentIndex}
            </p>
            <p className="text-xs text-blue-500">Date: {debugStats.date}</p>
          </div>
          <div className="p-3 bg-green-50 rounded">
            <h4 className="font-medium text-green-800">Hook Stats</h4>
            <p className="text-sm text-green-600">
              Total: {stats.totalQuotes} | Index: {stats.currentIndex}
            </p>
            <p className="text-xs text-green-500">Date: {stats.date}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleNextQuote} disabled={isLoading}>
            Next Quote
          </Button>
          <Button onClick={handleRefreshQuotes} disabled={isLoading} variant="outline">
            Refresh Quotes
          </Button>
          <Button onClick={handleResetQuotes} variant="destructive">
            Reset Cache
          </Button>
        </div>

        {/* Debug Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Next Quote: Advances to next quote in rotation</p>
          <p>• Refresh Quotes: Forces API fetch (bypasses cache)</p>
          <p>• Reset Cache: Clears localStorage cache</p>
        </div>
      </CardContent>
    </Card>
  );
};






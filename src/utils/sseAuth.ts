// Utility for handling SSE authentication
// Since EventSource doesn't support custom headers, we need to handle auth differently

export const createAuthenticatedSSE = (url: string, token: string): EventSource => {
  // For SSE with authentication, we have a few options:
  // 1. Pass token as query parameter (less secure but works)
  // 2. Use cookies for authentication
  // 3. Use a proxy endpoint that handles auth
  
  const authUrl = `${url}?token=${encodeURIComponent(token)}`;
  
  return new EventSource(authUrl, {
    withCredentials: true
  });
};

// Alternative: Create SSE with token in URL
export const createSSEWithToken = (baseUrl: string, token: string): EventSource => {
  const url = new URL(baseUrl);
  url.searchParams.set('token', token);
  
  return new EventSource(url.toString(), {
    withCredentials: true
  });
};

// Check if SSE is supported
export const isSSESupported = (): boolean => {
  return typeof EventSource !== 'undefined';
};

// Get SSE connection state as string
export const getSSEState = (eventSource: EventSource | null): string => {
  if (!eventSource) return 'disconnected';
  
  switch (eventSource.readyState) {
    case EventSource.CONNECTING:
      return 'connecting';
    case EventSource.OPEN:
      return 'open';
    case EventSource.CLOSED:
      return 'closed';
    default:
      return 'unknown';
  }
};












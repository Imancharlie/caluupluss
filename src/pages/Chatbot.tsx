import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Sparkles, Plus, RotateCw, MessageSquare, X, Clock, Trash2, Menu } from 'lucide-react';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppStore } from '@/store';
import { useIsMobile } from '@/hooks/use-mobile';

interface ServerMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number | null;
  timestamp?: string;
  // client-side only flags
  _status?: 'pending' | 'failed' | 'sent';
}

interface Conversation {
  id: string;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  messages: ServerMessage[];
}

const Chatbot: React.FC = () => {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversationsLoading, setConversationsLoading] = useState(false);
  const [welcomeTextIndex, setWelcomeTextIndex] = useState(0);
  const [isWelcomeTyping, setIsWelcomeTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const navigate = useNavigate();
  const { sidebarOpen: globalSidebarOpen } = useAppStore();
  const isMobile = useIsMobile();

  const welcomeMessages = useMemo(() => [
    "How can I help you today?",
    "Got any questions brewing?",
    "How's ur academic journey going?",
    "What have you learned recently?"
  ], []);

  const isAuthed = useMemo(() => Boolean(localStorage.getItem('token')), []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const routeFromLink = (raw: string): string => {
    try {
      if (raw.startsWith('/app/')) return raw.replace('/app', '') || '/';
      return raw || '/';
    } catch {
      return '/';
    }
  };

  const handleRetrySend = async (localId: string, text: string) => {
    if (!conversation || loading) return;
    setLoading(true);
    try {
      // mark as pending while retrying
      setConversation(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === localId ? { ...m, _status: 'pending' } : m) } : prev);
      const res = await api.post(`/chatbot/conversations/${conversation.id}/send_message/`, { message: text });
      setConversation(res.data as Conversation);
      toast.success('Message resent');
    } catch (e: unknown) {
      setConversation(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === localId ? { ...m, _status: 'failed' } : m) } : prev);
      const err = e as { response?: { data?: { error?: string; detail?: string } } };
      toast.error(err?.response?.data?.error || err?.response?.data?.detail || 'Failed to resend');
    } finally {
      setLoading(false);
    }
  };

  const MessageBubble: React.FC<{ msg: ServerMessage }> = ({ msg }) => {
    const text = msg.content || '';
    
    // Parse rich formatting: links, bold, italic, code, lists
    const parseRichText = (input: string): React.ReactNode[] => {
      const parts: Array<{ type: 'text' | 'link' | 'external' | 'bold' | 'italic' | 'code' | 'linebreak' | 'bullet' | 'numbered'; content: string; listItems?: string[] }> = [];
      
      // First, handle links
      const linkRegex = /\[(LINK|LINK_EXTERNAL):([^\]]+)\]/g;
      let lastIndex = 0;
      let match;
      while ((match = linkRegex.exec(input)) !== null) {
        const idx = match.index;
        if (idx > lastIndex) {
          parts.push({ type: 'text', content: input.slice(lastIndex, idx) });
        }
        const kind = match[1];
        const payload = match[2];
        if (kind === 'LINK_EXTERNAL') {
          parts.push({ type: 'external', content: payload });
        } else {
          parts.push({ type: 'link', content: payload });
        }
        lastIndex = (match.index || 0) + match[0].length;
      }
      if (lastIndex < input.length) {
        parts.push({ type: 'text', content: input.slice(lastIndex) });
      }

      // Process each part for additional formatting
      const processedParts: React.ReactNode[] = [];
      
      for (const part of parts) {
        if (part.type === 'text') {
          // Split by line breaks first
          const lines = part.content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            
            const line = lines[i];
            
            // Check for bullet points
            if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
              const bulletText = line.trim().substring(2);
              processedParts.push(
                <div key={`bullet-${i}`} className="flex items-start">
                  <span className="text-caluu-blue">•</span>
                  <span>{parseInlineFormatting(bulletText)}</span>
                </div>
              );
            }
            // Check for numbered lists
            else if (/^\d+\.\s/.test(line.trim())) {
              const match = line.trim().match(/^(\d+)\.\s(.+)/);
              if (match) {
                processedParts.push(
                  <div key={`numbered-${i}`} className="flex items-start">
                    <span className="text-caluu-blue font-medium">{match[1]}.</span>
                    <span>{parseInlineFormatting(match[2])}</span>
                  </div>
                );
              }
            }
            // Regular line
            else if (line.trim()) {
              // Check if this is a closing phrase that needs extra spacing
              const isClosingPhrase = /^(Let me know|Please let me know).*clarification.*questions/i.test(line.trim());
              processedParts.push(
                <div key={`line-${i}`} className={isClosingPhrase ? 'mt-3' : ''}>
                  {parseInlineFormatting(line)}
                </div>
              );
            }
          }
        } else if (part.type === 'external') {
          processedParts.push(
            <a
              key={`ext-${part.content}`}
              href={part.content}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-caluu-blue hover:text-caluu-blue-light"
            >
              {part.content}
            </a>
          );
        } else if (part.type === 'link') {
          processedParts.push(
            <button
              key={`link-${part.content}`}
              onClick={() => navigate(routeFromLink(part.content))}
              className="underline text-caluu-blue hover:text-caluu-blue-light"
            >
              {routeFromLink(part.content)}
            </button>
          );
        }
      }
      
      return processedParts;
    };

    // Parse inline formatting (bold, italic, code)
    const parseInlineFormatting = (text: string): React.ReactNode[] => {
      if (!text) return [];
      
      const parts: React.ReactNode[] = [];
      let remaining = text;
      let keyCounter = 0;
      
      // Process all formatting in one pass
      while (remaining.length > 0) {
        let found = false;
        
        // Check for code blocks first (```code```)
        const codeBlockMatch = remaining.match(/^```([^`]+)```/);
        if (codeBlockMatch) {
          parts.push(
            <code key={`code-${keyCounter++}`} className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
              {codeBlockMatch[1]}
            </code>
          );
          remaining = remaining.slice(codeBlockMatch[0].length);
          found = true;
        }
        // Check for inline code (`code`)
        else if (remaining.startsWith('`')) {
          const inlineCodeMatch = remaining.match(/^`([^`]+)`/);
          if (inlineCodeMatch) {
            parts.push(
              <code key={`inline-${keyCounter++}`} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
                {inlineCodeMatch[1]}
              </code>
            );
            remaining = remaining.slice(inlineCodeMatch[0].length);
            found = true;
          }
        }
        // Check for bold (**text**)
        else if (remaining.startsWith('**')) {
          const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
          if (boldMatch) {
            parts.push(<strong key={`bold-${keyCounter++}`} className="font-semibold">{boldMatch[1]}</strong>);
            remaining = remaining.slice(boldMatch[0].length);
            found = true;
          }
        }
        // Check for italic (*text*)
        else if (remaining.startsWith('*')) {
          const italicMatch = remaining.match(/^\*([^*]+)\*/);
          if (italicMatch) {
            parts.push(<em key={`italic-${keyCounter++}`} className="italic">{italicMatch[1]}</em>);
            remaining = remaining.slice(italicMatch[0].length);
            found = true;
          }
        }
        
        if (!found) {
          // Add plain text until next formatting marker
          const nextMarker = remaining.search(/[`*]/);
          if (nextMarker === -1) {
            parts.push(remaining);
            break;
          } else {
            parts.push(remaining.slice(0, nextMarker));
            remaining = remaining.slice(nextMarker);
          }
        }
      }
      
      return parts;
    };

    return (
      <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all hover:shadow-md ${
        msg.role === 'user' 
          ? 'bg-gradient-to-br from-caluu-blue to-caluu-blue-light text-white rounded-br-none' 
          : 'bg-white border border-gray-100 text-gray-900 rounded-bl-none'
      }`}>
        <div className="whitespace-pre-wrap">
          {parseRichText(text)}
          {msg._status === 'failed' && (
            <div className="mt-2 flex items-center gap-2 text-xs text-red-600">
              Failed to send.
              <button
                onClick={() => handleRetrySend(msg.id, msg.content)}
                className="inline-flex items-center gap-1 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
              >
                <RotateCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const loadActiveConversation = useCallback(async () => {
    try {
      setBootLoading(true);
      const res = await api.get('/chatbot/conversations/active/');
      setConversation(res.data as Conversation);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number } };
      if (err?.response?.status === 401) {
        toast.error('Please login to use the chatbot.');
      } else {
        toast.error('Failed to load conversation');
      }
      setConversation(null);
    } finally {
      setBootLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const res = await api.get('/chatbot/conversations/');
      setConversations(res.data.results || []);
    } catch (e: unknown) {
      toast.error('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  const switchToConversation = useCallback(async (conversationId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/chatbot/conversations/${conversationId}/`);
      setConversation(res.data as Conversation);
      setSidebarOpen(false);
    } catch (e: unknown) {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.post('/chatbot/conversations/', {});
      setConversation(res.data as Conversation);
    } catch (e) {
      toast.error('Failed to start a new conversation');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!conversation) {
      toast.error('Please start a conversation first');
      return;
    }
    setInput('');
    // optimistic append user message
    const localId = `local-${Date.now()}`;
    const optimistic: ServerMessage = { id: localId, role: 'user', content: text, _status: 'pending' };
    setConversation(prev => prev ? { ...prev, messages: [...prev.messages, optimistic] } : prev);
    setLoading(true);
    setIsTyping(true);
    try {
      const res = await api.post(`/chatbot/conversations/${conversation.id}/send_message/`, { message: text });
      setConversation(res.data as Conversation);
    } catch (e: unknown) {
      // mark as failed, keep text for retry
      setConversation(prev => prev ? { ...prev, messages: prev.messages.map(m => m.id === localId ? { ...m, _status: 'failed' } : m) } : prev);
      const err = e as { response?: { data?: { error?: string; detail?: string } } };
      toast.error(err?.response?.data?.error || err?.response?.data?.detail || 'Failed to send message');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!isAuthed) {
      setBootLoading(false);
      return;
    }
    loadActiveConversation();
  }, [isAuthed, loadActiveConversation]);

  useEffect(() => {
    if (sidebarOpen && conversations.length === 0) {
      loadConversations();
    }
  }, [sidebarOpen, conversations.length, loadConversations]);

  // Listen for mobile sidebar state changes
  useEffect(() => {
    const handleSidebarStateChange = (event: CustomEvent) => {
      const { isOpen, isMobile: isMobileSidebar } = event.detail;
      if (isMobileSidebar) {
        setIsMobileSidebarOpen(isOpen);
      }
    };

    window.addEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    return () => {
      window.removeEventListener('sidebarStateChanged', handleSidebarStateChange as EventListener);
    };
  }, []);

  // Typing effect for welcome messages
  useEffect(() => {
    const currentMessage = welcomeMessages[welcomeTextIndex];
    let timeoutId: NodeJS.Timeout;
    
    const typeText = (text: string, index: number = 0) => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        setIsWelcomeTyping(index < text.length);
        timeoutId = setTimeout(() => typeText(text, index + 1), 50 + Math.random() * 50);
      } else {
        // Wait a bit before starting to erase
        timeoutId = setTimeout(() => {
          const eraseText = (text: string, index: number) => {
            if (index >= 0) {
              setDisplayedText(text.slice(0, index));
              setIsWelcomeTyping(true);
              timeoutId = setTimeout(() => eraseText(text, index - 1), 30);
            } else {
              // Move to next message
              setWelcomeTextIndex((prevIndex) => (prevIndex + 1) % welcomeMessages.length);
            }
          };
          eraseText(currentMessage, currentMessage.length);
        }, 2000);
      }
    };

    typeText(currentMessage);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [welcomeTextIndex, welcomeMessages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {/* Header - Sticky on desktop, non-sticky on mobile when sidebar open */}
      <div className={`sticky top-0 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm ${isMobile && isMobileSidebarOpen ? 'z-40' : 'z-50'}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              {isMobile && (
                <Button
                  onClick={() => {
                    // Dispatch custom event to trigger mobile sidebar
                    window.dispatchEvent(new CustomEvent('toggleMobileSidebar'));
                  }}
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 mr-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              )}
              <div className="w-10 h-10 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mr. Caluu</h1>
                <p className="text-xs text-gray-500">Your Bestfiend</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={createConversation}
                disabled={loading}
                variant="outline"
                className="h-9 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-caluu-blue transition-all"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">New</span>
              </Button>
              <Button
                onClick={() => setSidebarOpen(true)}
                variant="outline"
                className="h-9 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-caluu-blue transition-all"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">History</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Content */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Card className="bg-white/60 backdrop-blur border-gray-200/50 rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {!isAuthed ? (
              <div className="p-6 text-center text-gray-600">
                Please log in to use the chatbot.
              </div>
            ) : bootLoading ? (
              <div className="p-6 text-center text-gray-600 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading your conversation...
              </div>
            ) : (
              <>
                <style>{`
                  @keyframes fadeInUp { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                  }
                  @keyframes gradientShift { 
                    0%, 100% { background-position: 0% 50%; } 
                    50% { background-position: 100% 50%; } 
                  }
                  @keyframes textFadeInOut {
                    0%, 100% { opacity: 0; transform: translateY(10px); }
                    20%, 80% { opacity: 1; transform: translateY(0); }
                  }
                  @keyframes textSlideIn {
                    from { opacity: 0; transform: translateY(15px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                  }
                  @keyframes cursorBlink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                  }
                  .typing-cursor::after {
                    content: '|';
                    animation: cursorBlink 1s infinite;
                    color: #3b82f6;
                    font-weight: bold;
                  }
                  .gradient-bg { 
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
                    background-size: 200% 200%; 
                    animation: gradientShift 15s ease infinite; 
                  }
                  .animated-text {
                    animation: textFadeInOut 4s ease-in-out infinite;
                  }
                `}</style>
                <div className={`overflow-y-auto space-y-4 p-4 sm:p-6 gradient-bg ${isMobile ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-240px)]'}`}>
                  {conversation?.messages?.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>

                      <p className="text-gray-600 max-w-md min-h-[1.5rem] flex items-center justify-center">
                        <span className="text-center">
                          {displayedText}
                          {isWelcomeTyping && <span className="typing-cursor"></span>}
                        </span>
                      </p>
                    </div>
                  )}
                  {conversation?.messages?.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start gap-3 max-w-[75%]`}>
                       
                        <div style={{ animation: m.role === 'assistant' ? 'fadeInUp 0.3s ease both' : undefined }}>
                          <MessageBubble msg={m} />
                        </div>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex items-start gap-3 max-w-[75%]">
                        <div className="w-8 h-8 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-caluu-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-caluu-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-caluu-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
                <div className="p-4 sm:p-6 bg-white border-t border-gray-200/50">
                  <div className="flex items-end gap-3">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2 focus-within:border-caluu-blue focus-within:bg-white transition-all shadow-sm">
                      <Textarea
                        ref={textareaRef}
                        placeholder="Type your message..."
                        value={input}
                        onChange={e => {
                          setInput(e.target.value);
                          if (textareaRef.current) {
                            textareaRef.current.style.height = 'auto';
                            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, window.innerHeight * 0.3) + 'px';
                          }
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="min-h-[40px] max-h-[30vh] resize-none border-0 focus-visible:ring-0 px-0 py-1 text-sm bg-transparent"
                      />
                    </div>
                    <Button 
                      onClick={sendMessage} 
                      disabled={loading || !input.trim() || !conversation} 
                      className="shrink-0 bg-gradient-to-br from-caluu-blue to-caluu-blue-light hover:shadow-lg text-white h-12 w-12 rounded-2xl p-0 transition-all disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Conversation History Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Conversation History</h2>
                <Button
                  onClick={() => setSidebarOpen(false)}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-caluu-blue" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No conversations yet</p>
                    <p className="text-sm">Start a new chat to see it here</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => switchToConversation(conv.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 border ${
                          conversation?.id === conv.id
                            ? 'bg-caluu-blue/10 border-caluu-blue text-caluu-blue'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm truncate">
                              {conv.title || 'New Conversation'}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              {conv.messages?.length || 0} messages
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-400">
                                {new Date(conv.updated_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;



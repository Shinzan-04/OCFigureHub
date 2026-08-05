import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Send, X, MessageCircle, Loader2, Bot, User } from 'lucide-react';
import { chatApi } from '../../api/chat';
import type { ChatMessage, ChatMessageResponse } from '../../types/chat';

const SUGGESTIONS = [
  'Tìm model anime miễn phí',
  'Gói membership có gì?',
  'Tôi tải file STL như thế nào?',
  'License commercial là gì?',
];

const SESSION_KEY = 'oc-chatbot-session';

function getStoredSessionId(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function storeSessionId(sessionId: string): void {
  try {
    localStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    // ignore
  }
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

interface MessageItem extends ChatMessage {
  isLoading?: boolean;
}

function renderInlineMarkdown(text: string, navigate: (url: string) => void): React.ReactNode {
  if (text.startsWith('[') && text.includes('](') && text.endsWith(')')) {
    const closeBracketIdx = text.indexOf('](');
    const label = text.slice(1, closeBracketIdx);
    const url = text.slice(closeBracketIdx + 2, -1);
    return (
      <a
        href={url}
        onClick={(e) => {
          if (url.startsWith('/')) {
            e.preventDefault();
            navigate(url);
          }
        }}
        className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-4 decoration-purple-500/50 hover:decoration-purple-400 transition-colors duration-200"
      >
        {label}
      </a>
    );
  }
  return text;
}

function renderMessageContent(text: string, navigate: (url: string) => void): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);

    const renderedLine = parts.map((part, partIdx) => {
      // 1. Check for bold text
      if (part.startsWith('**') && part.endsWith('**')) {
        const innerText = part.slice(2, -2);
        
        // If the bold text is exactly a relative link/path, let's render it as a link instead of just bold
        const rawProductUrlRegex = /^\/product\/[a-fA-Z0-9-]{36}$/i;
        if (rawProductUrlRegex.test(innerText) || innerText === '/upgrade' || innerText === '/') {
          return (
            <a
              key={partIdx}
              href={innerText}
              onClick={(e) => {
                if (innerText.startsWith('/')) {
                  e.preventDefault();
                  navigate(innerText);
                }
              }}
              className="text-purple-400 hover:text-purple-300 font-bold underline underline-offset-4 decoration-purple-500/50 hover:decoration-purple-400 transition-colors duration-200"
            >
              {innerText}
            </a>
          );
        }

        return (
          <strong key={partIdx} className="font-bold text-white">
            {renderInlineMarkdown(innerText, navigate)}
          </strong>
        );
      }

      // 2. Check for markdown links
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const closeBracketIdx = part.indexOf('](');
        const label = part.slice(1, closeBracketIdx);
        const url = part.slice(closeBracketIdx + 2, -1);

        return (
          <a
            key={partIdx}
            href={url}
            onClick={(e) => {
              if (url.startsWith('/')) {
                e.preventDefault();
                navigate(url);
              }
            }}
            className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 decoration-purple-500/50 hover:decoration-purple-400 transition-colors duration-200"
          >
            {label}
          </a>
        );
      }

      // 3. Fallback: Parse raw /product/ID if they were returned plain
      const rawProductUrlRegex = /(\/product\/[a-fA-Z0-9-]{36})/gi;
      if (rawProductUrlRegex.test(part)) {
        rawProductUrlRegex.lastIndex = 0; // Reset lastIndex
        const subParts = part.split(rawProductUrlRegex);
        const singleProductUrlRegex = /^\/product\/[a-fA-Z0-9-]{36}$/i;
        return subParts.map((subPart, subIdx) => {
          if (singleProductUrlRegex.test(subPart)) {
            return (
              <a
                key={subIdx}
                href={subPart}
                onClick={(e) => {
                  if (subPart.startsWith('/')) {
                    e.preventDefault();
                    navigate(subPart);
                  }
                }}
                className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-4 decoration-purple-500/50 hover:decoration-purple-400 transition-colors duration-200"
              >
                {subPart}
              </a>
            );
          }
          return subPart;
        });
      }

      return part;
    });

    return (
      <span key={lineIdx} className="block min-h-[1.2em]">
        {renderedLine}
      </span>
    );
  });
}

export function ChatbotWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [hasValue, setHasValue] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(getStoredSessionId());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: 'Xin chào! 👋 Tôi là OC Assistant, trợ lý AI của OC Figure Hub. Tôi có thể giúp bạn tìm model 3D, hiểu về membership, license và cách tải file. Bạn cần hỗ trợ gì?',
          createdAt: new Date().toISOString(),
        },
      ]);
    }
  }, [isOpen]);

  const sendMessage = async (text?: string) => {
    const rawText = text !== undefined ? text : (inputRef.current?.value || '');
    const trimmedText = rawText.trim();
    if (!trimmedText || isLoading) return;

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setHasValue(false);
    setIsLoading(true);

    try {
      const response: ChatMessageResponse = await chatApi.sendMessage({
        sessionId: sessionId || undefined,
        message: trimmedText,
      });

      if (!sessionId && response.sessionId) {
        setSessionId(response.sessionId);
        storeSessionId(response.sessionId);
      }

      const assistantMessage: MessageItem = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        provider: response.provider,
        createdAt: response.createdAtUtc,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: unknown) {
      const errorMessage: MessageItem = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn. Vui lòng thử lại.',
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Action Buttons Container */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
        
        {/* Messenger Button */}
        {!isOpen && (
          <a
            href="https://m.me/61590154153324"
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 pointer-events-auto"
            style={{ backgroundColor: '#00B2FF', color: '#FFFFFF' }}
            title="Chat với Admin qua Messenger"
          >
            <svg viewBox="0 0 36 36" fill="currentColor" width="26" height="26">
              <path d="M18 1.4C8.7 1.4 1.2 8.5 1.2 17.2c0 4.9 2.4 9.3 6.1 12.3v5.1l5.5-3.1c1.7.5 3.5.7 5.2.7 9.3 0 16.8-7.1 16.8-15.8S27.3 1.4 18 1.4zm1.1 21.3-4.3-4.7-8.4 4.7 9.2-9.9 4.4 4.7 8.3-4.7-9.2 9.9z"/>
            </svg>
          </a>
        )}

        {/* AI Chatbot Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 pointer-events-auto"
          style={{
            backgroundColor: isOpen ? '#6D28D9' : '#8B5CF6',
            color: '#FFFFFF',
          }}
          aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
        >
          {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        </button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-[72px] right-2 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-16px)] sm:w-96 max-w-[calc(100vw-16px)] sm:max-w-[calc(100vw-48px)] h-[450px] sm:h-[500px] max-h-[calc(100vh-100px)] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          style={{
            backgroundColor: '#0B0B0B',
            border: '1px solid #262626',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: '#262626', backgroundColor: '#111111' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#FFFFFF' }}>
                  OC Assistant
                </h3>
                <p className="text-xs" style={{ color: '#A1A1A1' }}>
                  Trực tuyến
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full transition-colors hover:bg-white/10"
              style={{ color: '#A1A1A1' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: '#0B0B0B' }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{
                    backgroundColor: message.role === 'user' ? '#8B5CF6' : '#262626',
                  }}
                >
                  {message.role === 'user' ? (
                    <User size={14} className="text-white" />
                  ) : (
                    <Bot size={14} className="text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                    message.role === 'user'
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                  style={{
                    backgroundColor: message.role === 'user' ? '#8B5CF6' : '#1a1a1a',
                    color: '#FFFFFF',
                  }}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Đang trả lời...</span>
                    </div>
                  ) : (
                    <div className="space-y-1" style={{ whiteSpace: 'pre-wrap' }}>
                      {renderMessageContent(message.content, navigate)}
                    </div>
                  )}
                  {message.createdAt && !message.isLoading && (
                    <p
                      className="text-xs mt-1 opacity-60"
                      style={{ color: message.role === 'user' ? 'rgba(255,255,255,0.6)' : '#666' }}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: '#262626' }}
                >
                  <Bot size={14} className="text-white" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-tl-sm"
                  style={{ backgroundColor: '#1a1a1a' }}
                >
                  <Loader2 size={16} className="animate-spin" style={{ color: '#8B5CF6' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 2 && !isLoading && (
            <div
              className="px-4 pb-2 flex flex-wrap gap-2"
              style={{ backgroundColor: '#0B0B0B' }}
            >
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all hover:scale-105"
                  style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #262626',
                    color: '#A1A1A1',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t flex items-end gap-2"
            style={{ borderColor: '#262626', backgroundColor: '#111111' }}
          >
            <textarea
              ref={inputRef}
              onChange={(e) => setHasValue(!!e.target.value.trim())}
              onKeyDown={handleKeyDown}
              placeholder="Nhập tin nhắn..."
              rows={1}
              maxLength={1000}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm resize-none outline-none transition-all"
              style={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #262626',
                color: '#FFFFFF',
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!hasValue || isLoading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{
                backgroundColor: hasValue ? '#8B5CF6' : '#262626',
                color: hasValue ? '#FFFFFF' : '#666',
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

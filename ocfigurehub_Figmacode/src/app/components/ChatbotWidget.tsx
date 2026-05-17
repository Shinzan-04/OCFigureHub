import { useState, useRef, useEffect, useCallback } from 'react';
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

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState('');
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

  const sendMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    const userMessage: MessageItem = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedText,
      createdAt: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
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
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        style={{
          backgroundColor: isOpen ? '#6D28D9' : '#8B5CF6',
          color: '#FFFFFF',
        }}
        aria-label={isOpen ? 'Đóng chat' : 'Mở chat'}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-150px)] rounded-2xl flex flex-col overflow-hidden shadow-2xl"
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
                    <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
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
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
              disabled={!inputValue.trim() || isLoading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{
                backgroundColor: inputValue.trim() ? '#8B5CF6' : '#262626',
                color: inputValue.trim() ? '#FFFFFF' : '#666',
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

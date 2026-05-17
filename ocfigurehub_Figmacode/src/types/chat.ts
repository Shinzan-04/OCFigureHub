export interface ChatMessageRequest {
  sessionId?: string;
  message: string;
}

export interface ChatMessageResponse {
  sessionId: string;
  reply: string;
  provider: string;
  fallbackUsed: boolean;
  createdAtUtc: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  createdAt: string;
}

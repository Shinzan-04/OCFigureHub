import API from './client';
import type { ChatMessageRequest, ChatMessageResponse } from '../types/chat';

export const chatApi = {
  sendMessage: async (data: ChatMessageRequest): Promise<ChatMessageResponse> => {
    const requestData = {
      ...data,
      sessionId: data.sessionId || undefined
    };
    const res = await API.post<ChatMessageResponse>('/chat/message', requestData);
    return res.data;
  }
};

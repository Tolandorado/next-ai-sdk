import { BaseApi } from "../BaseApi";

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: string;
}

class MessagesApi extends BaseApi {
  async getByThreadId(threadId: string): Promise<Message[]> {
    return this.get<Message[]>(`/api/messages/${threadId}`);
  }

  async createInternal(threadId: string, role: string, content: string): Promise<void> {
    return this.post<void>('/api/messages/create_internal', {
      threadId,
      role,
      content,
    });
  }
}

export const messagesApi = new MessagesApi();
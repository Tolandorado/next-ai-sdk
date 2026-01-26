import { Thread } from "@/lib/db/types";
import { BaseApi } from "../BaseApi";

class ThreadsApi extends BaseApi {
    async getAll(): Promise<Thread[]> {
        return this.get<Thread[]>('/api/threads');
    }

    async createThread(title: string): Promise<Thread> {
        return this.post<Thread>('/api/threads', { title });
    }

    async deleteThread(id: string): Promise<void> {
        return this.delete<void>(`/api/threads/${id}`);
    }
}

export const threadsApi = new ThreadsApi();
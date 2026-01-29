"use client";

import { useEffect, useState } from "react";
import { Chat } from "@/app/components/Chat";
import { ThreadList } from "@/app/components/ThreadList";
import { threadsApi } from "./api/threads/threadApi";
import { Thread } from "@/lib/db/types";

export default function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isLoadingThreads, setIsLoadingThreads] = useState(false);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        setIsLoadingThreads(true);
        const data = await threadsApi.getAll();
        setThreads(data);
        if (data.length > 0 && !currentThreadId) {
          setCurrentThreadId(data[0].id);
        }
      } finally {
        setIsLoadingThreads(false);
      }
    };

    fetchThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateThreadsLocal = (prev: Thread[], threadId: string) => {
    const newThreads = prev.filter((t) => t.id !== threadId);
    if (currentThreadId === threadId) {
      setCurrentThreadId(newThreads.length > 0 ? newThreads[0].id : null);
    }
    return newThreads;
  }

  const handleSelectThread = (threadId: string) => {
    setCurrentThreadId(threadId);
  };

  const handleCreateThread = async (title?: string): Promise<string | null> => {
    const thread = await threadsApi.createThread(title || "Новый тред");
    if (!thread) return null;
    setThreads((prev) => [thread, ...prev]);
    setCurrentThreadId(thread.id);
    return thread.id;
  };

  const handleDeleteThread = async (threadId: string) => {
    try {
      await threadsApi.deleteThread(threadId);
      setThreads((prev) => (updateThreadsLocal(prev, threadId)));
    } catch (error) {
      console.error("Failed to delete thread:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50 text-zinc-900">
      <ThreadList
        threads={threads}
        currentThreadId={currentThreadId}
        onSelect={handleSelectThread}
        onCreate={handleCreateThread}
        onDelete={handleDeleteThread}
        isLoading={isLoadingThreads}
      />
      <Chat
        // key={currentThreadId}
        threadId={currentThreadId}
        onEnsureThread={handleCreateThread}
      />
    </div>
  );
}
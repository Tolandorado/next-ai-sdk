import { Thread } from '@/lib/db/types';

interface ThreadListProps {
    threads: Thread[];
    currentThreadId: string | null;
    onSelect: (id: string) => void;
    onCreate: () => void;
    onDelete: (id: string) => void;
    isLoading: boolean;
}

export function ThreadList({
    threads,
    currentThreadId,
    onSelect,
    onCreate,
    onDelete,
    isLoading,
}: ThreadListProps) {
    return (
        <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white">
            <div className="flex items-center justify-between border-b border-zinc-200 p-4">
                <h2 className="font-semibold">Треды</h2>
                <button
                    onClick={() => onCreate()}
                    className="cursor-pointer rounded-md bg-black px-2 py-1 text-sm text-white hover:bg-zinc-800"
                >
                    Новый
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-sm text-zinc-500">Загрузка...</div>
                ) : threads.length === 0 ? (
                    <div className="p-4 text-sm text-zinc-500">
                        Тредов пока нет. Создайте новый.
                    </div>
                ) : (
                    <ul className="space-y-1 p-2">
                        {threads.map((thread) => (
                            <li key={thread.id} className="group relative">
                                <button
                                    onClick={() => onSelect(thread.id)}
                                    className={`cursor-pointer w-full rounded-md px-3 py-2 text-left text-sm  ${currentThreadId === thread.id
                                        ? "bg-zinc-900 text-white hover:bg-zinc-800"
                                        : "text-zinc-900 hover:bg-zinc-100"
                                        }`}
                                >
                                    <div className="truncate">{thread.title}</div>
                                    <div className="mt-1 text-[11px] text-zinc-500">
                                        {new Date(thread.updatedAt).toLocaleString()}
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Удалить этот чат?')) {
                                            onDelete(thread.id);
                                        }
                                    }}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0  rounded-md   transition-all
                                    ${currentThreadId === thread.id
                                            ? "hover:text-red-600 group-hover:opacity-80 hover:bg-red-50 text-zinc-100"
                                            : "hover:text-red-600 group-hover:opacity-100 hover:bg-red-50 text-zinc-400"
                                        }`}
                                    title="Удалить тред"
                                >    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </aside>
    );
}
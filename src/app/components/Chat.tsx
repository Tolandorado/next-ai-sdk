import { UpdateCellAction, UpdateRangeAction } from "@/lib/xlsx/types";
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from "react";
import { messagesApi } from "../api/messages/messagesApi";
import { xlsxApi } from "../api/xlsx/xlsxApi";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { TableModal } from "./TableModal";

interface ChatProps {
    threadId: string | null;
    onEnsureThread: (title?: string) => Promise<string | null>;
}

export function Chat({ threadId, onEnsureThread }: ChatProps) {
    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [input, setInput] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const threadIdRef = useRef(threadId);
    const transport =
        new DefaultChatTransport({
            api: "/api/chat",
            body: () => ({ threadId: threadIdRef.current }),
        })

    const {
        messages,
        sendMessage,
        status,
        setMessages,
        stop
    } = useChat({
        transport,
    });

    useEffect(() => { console.log('actual messages:', messages) }, [messages])

    useEffect(() => {
        threadIdRef.current = threadId;
    }, [threadId]);

    useEffect(() => {
        const loadMessages = async () => {
            if (threadId) {
                try {
                    const data = await messagesApi.getByThreadId(threadId);
                    setMessages(
                        data.map((m: any) => ({
                            id: m.id,
                            role: m.role,
                            parts: [{ type: 'text', text: m.content }],
                        })),
                    );
                } catch (error) {
                    console.error('Failed to load messages:', error);
                }
            } else {
                setMessages([]);
            }
        };
        loadMessages();
    }, [threadId, setMessages]);

    useEffect(() => {
        return () => {
            stop();
        };
    }, [threadId, stop]);

    const handleOpenTable = async () => {
        setIsTableModalOpen(true);
    };

    const handleConfirmCellUpdate = async (
        { sheet, cell, newValue }
            : UpdateCellAction
    ) => {
        setIsProcessing(true);
        try {
            await sendMessage({
                text: `Я подтверждаю обновление ячейки ${cell} на листе ${sheet} значением "${newValue}". Пожалуйста, выполните операцию.`,
            });
        } catch (error) {
            console.error("Error confirming update:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleConfirmRangeUpdate = async (
        { sheet, from, to, values }: UpdateRangeAction
    ) => {
        setIsProcessing(true);
        try {
            const cellCount = values.length * (values[0]?.length ?? 0);
            sendMessage({
                text: `Я подтверждаю обновление диапазона ${from}:${to} на листе ${sheet} (${cellCount} ячеек). Пожалуйста, выполните операцию.`,
            });
        } catch (error) {
            console.error("Error confirming range update:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancelUpdate = async () => {
        setIsProcessing(true);
        try {
            sendMessage({
                text: "Отмена операции. Не выполняйте обновление.",
            });
        } catch (error) {
            console.error("Error cancelling update:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSaveSelection = (mention: string) => {
        const space = input.endsWith(" ") || input.length === 0 ? "" : " ";
        setInput(`${input}${space}${mention}`);
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed) return;

        let currentId = threadId;
        if (!currentId) {
            const title = trimmed.length > 30 ? trimmed.substring(0, 15) + "..." : trimmed;
            currentId = await onEnsureThread(title);
            if (!currentId) {
                alert("Failed to create thread");
                return;
            }
            threadIdRef.current = currentId;
            setMessages([{
                id: Date.now().toString(),
                metadata: undefined,
                role: 'user',
                parts: [{ type: 'text', text: trimmed }],
            }])


        }
        setInput("");
        await sendMessage({
            text: trimmed,
        });
    };

    return (
        <main className="flex flex-1 flex-col h-screen overflow-hidden">
            <header className="flex items-center justify-between gap-4 border-b border-zinc-200 px-6 py-4">
                <div>
                    <h1 className="text-lg font-semibold">ChatGPT Lite</h1>
                    <p className="text-sm text-zinc-500">
                        Чат с тредами, сохранением истории и UI для работы с XLSX.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleOpenTable}
                    className="cursor-pointer rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                >
                    Открыть таблицу
                </button>
            </header>
            <section className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
                <MessageList
                    messages={messages}
                    onConfirmCellUpdate={handleConfirmCellUpdate}
                    onConfirmRangeUpdate={handleConfirmRangeUpdate}
                    onCancelUpdate={handleCancelUpdate}
                    isProcessing={isProcessing}
                    onSaveSelection={(mention) => handleSaveSelection(mention)}
                />
            </section>
            <MessageInput
                input={input}
                handleInputChange={(e) => setInput(e.target.value)}
                handleSubmit={onSubmit}
                isLoading={status === 'streaming' || status === 'submitted'}
            />
            <TableModal
                isOpen={isTableModalOpen}
                onClose={() => setIsTableModalOpen(false)}
                onSaveSelection={(mention) => handleSaveSelection(mention)}
            />
        </main>
    );
}
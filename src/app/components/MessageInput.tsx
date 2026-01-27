import React from "react";

interface MessageInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  placeholder?: string;
}

export function MessageInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  placeholder,
}: MessageInputProps) {
  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-3 border-t border-zinc-200 bg-white px-6 py-4"
    >
      <textarea
        value={input}
        onChange={handleInputChange}
        placeholder={placeholder || "Напишите сообщение..."}
        rows={2}
        className="flex-1 resize-none rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            const form = e.currentTarget.form;
            if (form) form.requestSubmit();
          }
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="cursor-pointer rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
      >
        {isLoading ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}
import { useState } from "react";
import { CellConfirmationResult } from "@/lib/xlsx/types";

interface ConfirmUpdateCellModalProps {
  confirmation: CellConfirmationResult;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmUpdateCellModal({
  confirmation,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmUpdateCellModalProps) {
  const [isHandled, setIsHandled] = useState(false);

  return (
    <div className="w-full max-w-md rounded-xl border-2 border-amber-300 bg-amber-50 p-4 shadow-md">
      {!isHandled && <div className="mb-3 flex items-center gap-2">
        <svg
          className="h-5 w-5 text-amber-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        <h3 className="font-semibold text-amber-900">Требуется подтверждение</h3>
      </div>}

      <div className="mb-4 space-y-2 rounded bg-white p-3 text-sm">
        <div>
          <span className="font-medium text-zinc-700">Лист: </span>
          <span className="text-zinc-600">{confirmation.sheet}</span>
        </div>
        <div>
          <span className="font-medium text-zinc-700">Ячейка: </span>
          <span className="text-zinc-600">{confirmation.cell}</span>
        </div>
        <div>
          <span className="font-medium text-zinc-700">Новое значение: </span>
          <span className="text-blue-600 font-mono font-semibold">
            {confirmation.newValue}
          </span>
        </div>
        {confirmation.reason && (
          <div>
            <span className="font-medium text-zinc-700">Причина: </span>
            <span className="text-zinc-600">{confirmation.reason}</span>
          </div>
        )}
      </div>

      {!isHandled && <div className="flex gap-2">
        <button
          onClick={() => {
            onCancel()
            setIsHandled(true)
          }}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
        >
          ❌ Отмена
        </button>
        <button
          onClick={() => {
            onConfirm()
            setIsHandled(true)
          }}
          disabled={isLoading}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "⏳ Применение..." : "✅ Подтвердить"}
        </button>
      </div>}
    </div>
  );
}
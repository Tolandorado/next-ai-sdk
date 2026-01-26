import { useState } from "react";

import { RangeConfirmationSuccess } from "@/lib/xlsx/types";

interface ConfirmUpdateRangeModalProps {
  confirmation: RangeConfirmationSuccess;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ConfirmUpdateRangeModal({
  confirmation,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmUpdateRangeModalProps) {
  const [isHandled, setIsHandled] = useState(false);

  return (
    <div className="w-full max-w-2xl rounded-xl border-2 border-amber-300 bg-amber-50 p-4 shadow-md">
      <div className="mb-3 flex items-center gap-2">
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
        <h3 className="font-semibold text-amber-900">Массовое обновление диапазона</h3>
      </div>

      <div className="mb-4 space-y-3 rounded bg-white p-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium text-zinc-700">Лист: </span>
            <span className="text-zinc-600">{confirmation.sheet}</span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">Диапазон: </span>
            <span className="font-mono text-zinc-600">
              {confirmation.from}:{confirmation.to}
            </span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">Ячеек: </span>
            <span className="font-mono text-zinc-600">{confirmation.cellCount}</span>
          </div>
          <div>
            <span className="font-medium text-zinc-700">Размер: </span>
            <span className="font-mono text-zinc-600">
              {confirmation.currentData?.length}x
              {confirmation.currentData[0]?.length || 0}
            </span>
          </div>
        </div>

        {/* Show comparison table */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-zinc-700">Сравнение:</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Current data */}
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-600">Текущие значения:</div>
              <div className="overflow-auto rounded border border-zinc-300 bg-white">
                <table className="border-collapse text-xs">
                  <tbody>
                    {confirmation.currentData.map((row, i) => (
                      <tr key={i}>
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className="max-w-[60px] truncate border border-zinc-200 px-1 py-0.5 text-center"
                          >
                            {cell.value ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* New values */}
            <div>
              <div className="mb-1 text-xs font-medium text-blue-600">Новые значения:</div>
              <div className="overflow-auto rounded border border-blue-300 bg-blue-50">
                <table className="border-collapse text-xs">
                  <tbody>
                    {confirmation.newValues.map((row, i) => (
                      <tr key={i}>
                        {row.map((value, j) => (
                          <td
                            key={j}
                            className="max-w-[60px] truncate border border-blue-200 px-1 py-0.5 text-center font-medium text-blue-700"
                          >
                            {value ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
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
          {isLoading ? "⏳ Применение..." : "✅ Обновить"}
        </button>
      </div>}
    </div>
  );
}
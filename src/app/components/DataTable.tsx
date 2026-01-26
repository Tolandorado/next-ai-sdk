import React from 'react';

interface DataTableProps {
  data: (string | number | null)[][];
  onCellMouseDown?: (row: number, col: number) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
  isCellSelected?: (row: number, col: number) => boolean;
   onCellDoubleClick?: (row: number, col: number) => void;
  tableClassName?: string;
  cellClassName?: string;
}

export function DataTable({
  data,
  onCellMouseDown,
  onCellMouseEnter,
  isCellSelected,
  onCellDoubleClick,
  tableClassName = "",
  cellClassName = "",
}: DataTableProps) {
  return (
    <table className={`border-collapse text-xs ${tableClassName}`}>
      <tbody>
        {data.map((row, r) => (
          <tr key={r}>
            {row.map((cell, c) => {
              const selected = isCellSelected?.(r, c);
              return (
                <td
                  key={c}
                  onMouseDown={() => onCellMouseDown?.(r, c)}
                  onMouseEnter={() => onCellMouseEnter?.(r, c)}
                    onDoubleClick={() => onCellDoubleClick?.(r, c)}
                  className={`border border-zinc-200 px-2 py-1 align-top ${cellClassName} ${
                    selected ? "bg-blue-100 ring-1 ring-blue-400" : "bg-white"
                  }`}
                >
                  {cell ?? ""}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
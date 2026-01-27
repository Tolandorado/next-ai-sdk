import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import { xlsxApi } from "../api/xlsx/xlsxApi";

interface TableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSelection: (mention: string) => void;
}

function columnToLetter(col: number): string {
  let letter = "";
  let temp = col + 1;
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

const from = process.env.NEXT_PUBLIC_DEFAULT_FROM || "A1";
const to = process.env.NEXT_PUBLIC_DEFAULT_TO || "C3";
const sheet = process.env.NEXT_PUBLIC_DEFAULT_SHEET || "Sheet1";

export function TableModal({
  isOpen,
  onClose,
  onSaveSelection,
}: TableModalProps) {
  const [selecting, setSelecting] = useState(false);
  const [start, setStart] = useState<{ row: number; col: number } | null>(null);
  const [end, setEnd] = useState<{ row: number; col: number } | null>(null);

  const [tableData, setTableData] = useState<(string | number | null)[][]>([]);

  useEffect(() => {
    const getTableData = async () => {
      const data = await xlsxApi.getRange({
        sheet,
        from,
        to,
      });

      setTableData(data.data.map((row: any[]) => row.map((c) => c.value)));
    }
    getTableData();
  }, [isOpen])

  if (!isOpen) return null;

  const handleMouseDown = (row: number, col: number) => {
    if (!selecting) {
      setSelecting(true);
      setStart({ row, col });
      setEnd({ row, col });
    } else {
      setSelecting(false);
      setEnd({ row, col });
    }
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!selecting || !start) return;
    setEnd({ row, col });
  };

  const handleMouseUp = () => {
    setSelecting(false);
  };

  const isSelected = (row: number, col: number) => {
    if (!start || !end) return false;
    const rowMin = Math.min(start.row, end.row);
    const rowMax = Math.max(start.row, end.row);
    const colMin = Math.min(start.col, end.col);
    const colMax = Math.max(start.col, end.col);
    return row >= rowMin && row <= rowMax && col >= colMin && col <= colMax;
  };

  const handleSaveSelection = () => {
    if (!start || !end) return;
    const rowMin = Math.min(start.row, end.row);
    const rowMax = Math.max(start.row, end.row);
    const colMin = Math.min(start.col, end.col);
    const colMax = Math.max(start.col, end.col);

    const fromCell = `${columnToLetter(colMin)}${rowMin + 1}`;
    const toCell = `${columnToLetter(colMax)}${rowMax + 1}`;
    const mention = fromCell === toCell
      ? `@${sheet}!${fromCell}`
      : `@${sheet}!${fromCell}:${toCell}`;

    onSaveSelection(mention);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div
        className="absolute inset-0"
        onMouseUp={handleMouseUp}
        aria-hidden="true"
      />
      <div className="relative z-50 flex max-h-[80vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <div className="text-sm font-medium">
            Таблица {sheet} ({from}-{to})
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-700 cursor-pointer"
          >
            Закрыть
          </button>
        </div>

        <div className="flex-1 overflow-auto px-4 py-3">
          <div className="inline-block rounded-lg border border-zinc-200 bg-white">
            <DataTable
              data={tableData}
              onCellMouseDown={handleMouseDown}
              onCellMouseEnter={handleMouseEnter}
              isCellSelected={isSelected}
              cellClassName="min-w-[72px] max-w-[120px] cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-4 py-3">
          <p className="text-xs text-zinc-500">
            Выделите диапазон ячеек мышкой, затем сохраните как меньшн для
            сообщения.
          </p>
          <button
            type="button"
            onClick={handleSaveSelection}
            disabled={!start || !end}
            className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40 cursor-pointer"
          >
            Сохранить выделение
          </button>
        </div>
      </div>
    </div>
  );
}
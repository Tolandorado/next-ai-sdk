import { UpdateCellAction, UpdateRangeAction } from "@/lib/xlsx/types";
import { UIMessage } from "ai";
import { ToolConfirmation } from "./Tool/ToolConfirmation";
import { xlsxApi } from "../api/xlsx/xlsxApi";
import { useState } from "react";
import { TableModal } from "./TableModal";

const tableRangeFrom = process.env.NEXT_PUBLIC_DEFAULT_FROM || "A1";
const tableRangeTo = process.env.NEXT_PUBLIC_DEFAULT_TO || "C3";
const tableSheet = process.env.NEXT_PUBLIC_DEFAULT_SHEET || "Sheet1";

interface MessageListProps {
  messages: UIMessage[];
  onConfirmCellUpdate?: (args: UpdateCellAction) => Promise<void>;
  onConfirmRangeUpdate?: (args: UpdateRangeAction) => Promise<void>;
  onCancelUpdate?: () => void;
  onSaveSelection: (mention: string) => void;
  isProcessing?: boolean;
}

export function MessageList({
  messages,
  onConfirmCellUpdate,
  onConfirmRangeUpdate,
  onCancelUpdate,
  onSaveSelection,
  isProcessing = false,
}: MessageListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableData, setTableData] = useState<(string | number | null)[][]>([]);;

  const handleClick = async () => {
    const data = await xlsxApi.getRange({
      sheet: tableSheet,
      from: tableRangeFrom,
      to: tableRangeTo,
    });

    setTableData(data.data.map((row: any[]) => row.map((c) => c.value)))
    setIsModalOpen(true);
  }

  if (messages.length === 0) {
    return (
      <div className="mt-10 text-center text-sm text-zinc-500">
        Начните диалог — сообщение будет сохранено в треде.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((m) => {
        const textParts = m.parts?.filter((p: any) => p.type === "text") || [];
        const text = textParts.map((p: any) => p.text).join("");
        const toolParts = m.parts?.filter((p) => p.type.startsWith('tool-') || []);
        const isExecutionResult = m.parts?.filter((p) => p.type.startsWith('tool-execute'));
        console.log("isExecutionResult", isExecutionResult)

        return (
          <div key={m.id}>
            {/* Text content from assistant */}
            {text && (
              isExecutionResult.length > 0 ? (
                <button
                  onClick={handleClick}
                  className="cursor-pointer"
                >
                  <Message m={m} text={text} />
                </button>
              ) : (
                <Message m={m} text={text} />
              )
            )}

            {/* Confirmation Dialogs */}
            {toolParts.length > 0 && (
              <div className="mt-3 space-y-3 flex justify-start flex-col">
                {toolParts.map((tool: any, idx: number) => {
                  const toolId = tool.toolCallId || `tool-${idx}`;
                  return (
                    <ToolConfirmation
                      key={`confirm-${toolId}`}
                      tool={tool}
                      toolCallId={toolId}
                      onConfirmCellUpdate={onConfirmCellUpdate}
                      onConfirmRangeUpdate={onConfirmRangeUpdate}
                      onCancelUpdate={onCancelUpdate}
                      isProcessing={isProcessing}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {tableData && (<TableModal
        isOpen={isModalOpen}
        sheet={tableSheet}
        from={tableRangeFrom}
        to={tableRangeTo}
        data={tableData}
        onClose={() => setIsModalOpen(false)}
        onSaveSelection={onSaveSelection}
      />)}
    </div>
  );
}

interface MessageProps {
  m: UIMessage,
  text: string
}

export function Message({ m, text }: MessageProps) {
  return <div className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
    <div
      className={`max-w-xl whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === "user"
        ? "bg-zinc-900 text-white"
        : "border border-zinc-200 bg-white text-zinc-900"
        }`}
    >
      {text}
    </div>
  </div>
}

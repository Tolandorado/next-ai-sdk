import { CellConfirmationResult, RangeConfirmationSuccess, UpdateCellAction, UpdateRangeAction, UpdateType } from "@/lib/xlsx/types";
import { ConfirmUpdateCellModal } from "../ConfirgCellUpdateModal";
import { ConfirmUpdateRangeModal } from "../ConfirmRangeUpdateModal";

interface ToolConfirmationProps {
  tool: any;
  toolCallId: string;
  onConfirmCellUpdate?: (args: UpdateCellAction) => Promise<void>;
  onConfirmRangeUpdate?: (args: UpdateRangeAction) => Promise<void>;
  onCancelUpdate?: () => void;
  isProcessing?: boolean;
}

export function ToolConfirmation({
  tool,
  toolCallId,
  onConfirmCellUpdate,
  onConfirmRangeUpdate,
  onCancelUpdate,
  isProcessing,
}: ToolConfirmationProps) {
  if (tool.type === "tool-confirmCellUpdate" && tool.output) {
    const output: CellConfirmationResult = tool.output;
    
    if (output.success === false && !output.type) {
      return (
        <div key={`confirm-error-${toolCallId}`} className="flex justify-start">
          <div className="max-w-xl rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-2 text-sm text-red-800">
            ❌ {output.reason}
          </div>
        </div>
      );
    }

    if (output.type === UpdateType.Cell) {
      const confirmation: CellConfirmationResult = output;
      return (
        <div key={`confirm-cell-${toolCallId}`}>
          <ConfirmUpdateCellModal
            confirmation={confirmation}
            onConfirm={() => {
              onConfirmCellUpdate?.({
                sheet: confirmation.sheet,
                cell: confirmation.cell,
                newValue: confirmation.newValue
              });
            }}
            onCancel={() => {
              onCancelUpdate?.();
            }}
            isLoading={isProcessing}
          />
        </div>
      );
    }
  }

  if (tool.type === "tool-confirmRangeUpdate" && tool.output) {
    const output = tool.output;

    if (output.success === false) {
      return (
        <div key={`confirm-error-${toolCallId}`} className="flex justify-start">
          <div className="max-w-xl rounded-lg border-l-4 border-red-500 bg-red-50 px-4 py-2 text-sm text-red-800">
            ❌ {output.message}
          </div>
        </div>
      );
    }

    const confirmation: RangeConfirmationSuccess = output;
    return (
      <div key={`confirm-range-${toolCallId}`}>
        <ConfirmUpdateRangeModal
          confirmation={confirmation}
          onConfirm={() => {
            onConfirmRangeUpdate?.({
              sheet: confirmation.sheet,
              from: confirmation.from,
              to: confirmation.to,
              values: confirmation.newValues
            });
          }}
          onCancel={() => {
            onCancelUpdate?.();
          }}
          isLoading={isProcessing}
        />
      </div>
    );
  }

  return null;
}
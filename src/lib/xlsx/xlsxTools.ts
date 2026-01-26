import { getCellValue, getFormula, getRange, updateCell, updateRange } from "@/lib/xlsx/xlsx-service";
import { CellConfirmationResult, ExecuteUpdateCellResult, ExecuteRangeUpdateResult, UpdateType, RangeConfirmationResult } from "./types";
import { confirmCellUpdateSchema, confirmRangeUpdateSchema, executeCellUpdateSchema, executeRangeUpdateSchema, explainFormulaSchema, getRangeSchema } from "./schemas";

const DEFAULT_SHEET = process.env.NEXT_PUBLIC_DEFAULT_SHEET || "Sheet1";
const DEFAULT_FROM = process.env.NEXT_PUBLIC_DEFAULT_FROM || "A1";
const DEFAULT_TO = process.env.NEXT_PUBLIC_DEFAULT_TO || "C3";

export const xlsxTools = {
    //=================================
    // Read ops
    //=================================
    getRange: {
        description: "Read a range of cells from an Excel sheet",
        inputSchema: getRangeSchema,
        execute: async ({
            sheet,
            from,
            to,
        }: {
            sheet: string;
            from: string;
            to: string;
        }) => {
            const rangeData = getRange({ sheet, from, to });
            const displayData = rangeData.data.map(row =>
                row.map(cell => `${cell.cell}: ${cell.value}${cell.formula ? ` (=${cell.formula})` : ''}`)
            ).join('\n');

            return {
                success: true,
                data: rangeData,
                displayData: displayData
            };
        },
    },
    explainFormula: {
        description: "Explain a formula in a specific cell",
        inputSchema: explainFormulaSchema,
        execute: async ({ sheet, cell }: { sheet: string; cell: string }) => {
            const formula = getFormula(sheet, cell);
            if (!formula) {
                return { success: false, message: `No formula found in cell ${cell}` };
            }
            return {
                success: true,
                cell,
                formula,
                explanation: `Formula in cell ${cell}: ${formula}`,
            };
        },
    },
    //=================================
    // Confirmation ops
    //=================================
    confirmCellUpdate: {
        description:
            "Request user confirmation before updating a cell. This does NOT modify the file, only prepares the operation.",
        inputSchema: confirmCellUpdateSchema,
        execute: async ({
            sheet,
            cell,
            newValue,
            reason,
        }: {
            sheet: string;
            cell: string;
            newValue: string | number;
            reason?: string;
        }): Promise<CellConfirmationResult> => {
            const currentValue = getCellValue(sheet, cell);

            return {
                success: true,
                type: UpdateType.Cell,
                sheet,
                cell,
                currentValue,
                newValue,
                reason,
            };
        },
    },
    confirmRangeUpdate: {
        description:
            "Request user confirmation before updating a range of cells. Does NOT modify the file, only previews the changes.",
        inputSchema: confirmRangeUpdateSchema,
        execute: async ({
            sheet,
            from,
            to,
            values,
            reason,
        }: {
            sheet: string;
            from: string;
            to: string;
            values: (string | number)[][];
            reason?: string;
        }): Promise<RangeConfirmationResult> => {
            try {
                const currentData = getRange({ sheet, from, to });
                const expectedRows = currentData.data.length;
                const expectedCols = currentData.data[0]?.length ?? 0;

                if (values.length !== expectedRows) {
                    return {
                        success: false,
                        message: `Row count mismatch: expected ${expectedRows}, got ${values.length}`,
                    };
                }

                for (let row of values) {
                    if (row.length !== expectedCols) {
                        return {
                            success: false,
                            message: `Column count mismatch in one of rows: expected ${expectedCols}, got ${row.length}`,
                        };
                    }
                }

                return {
                    success: true,
                    type: UpdateType.Range,
                    sheet,
                    from,
                    to,
                    currentData: currentData.data,
                    newValues: values,
                    reason,
                    cellCount: expectedRows * expectedCols,
                    message: `Update range ${from}:${to} (${expectedRows}x${expectedCols} = ${expectedRows * expectedCols} cells)?`,
                };
            } catch (error) {
                return {
                    success: false,
                    message: `Failed to prepare range update: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },
    //=================================
    // Update ops
    //=================================
    executeCellUpdate: {
        description:
            "Execute the cell update after user has confirmed. This actually modifies the file.",
        inputSchema: executeCellUpdateSchema,
        execute: async ({
            sheet,
            cell,
            newValue,
        }: {
            sheet: string;
            cell: string;
            newValue: string | number;
        }): Promise<ExecuteUpdateCellResult> => {
            try {
                const oldValue = getCellValue(sheet, cell);
                updateCell(sheet, cell, newValue);

                const updatedRange = getRange({
                    sheet: DEFAULT_SHEET,
                    from: DEFAULT_FROM,
                    to: DEFAULT_TO
                });

                return {
                    success: true,
                    sheet,
                    cell,
                    oldValue,
                    newValue,
                    fullTableContext: updatedRange,
                    message: `Cell ${cell} successfully updated from "${oldValue}" to "${newValue}"`,
                };
            } catch (error) {
                return {
                    success: false,
                    sheet,
                    cell,
                    oldValue: null,
                    newValue,
                    message: `Failed to update cell: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },
    executeRangeUpdate: {
        description:
            "Execute range update after user has confirmed. This actually modifies multiple cells in the file.",
        inputSchema: executeRangeUpdateSchema,
        execute: async ({
            sheet,
            from,
            to,
            values,
        }: {
            sheet: string;
            from: string;
            to: string;
            values: (string | number)[][];
        }): Promise<ExecuteRangeUpdateResult> => {
            try {
                updateRange(sheet, from, to, values);
                const updatedRange = getRange({
                    sheet: DEFAULT_SHEET,
                    from: DEFAULT_FROM,
                    to: DEFAULT_TO
                });

                const cellsUpdated = values.length * (values[0]?.length ?? 0);
                return {
                    success: true,
                    sheet,
                    from,
                    to,
                    cellsUpdated,
                    fullTableContext: updatedRange,
                    message: `Range ${from}:${to} successfully updated (${cellsUpdated} cells)`,
                };
            } catch (error) {
                return {
                    success: false,
                    cellsUpdated: null,
                    sheet,
                    from,
                    to,
                    message: `Failed to update range: ${error instanceof Error ? error.message : 'Unknown error'}`,
                };
            }
        },
    },

};
export interface CellRange {
  sheet: string;
  from: string;
  to: string;
}

export interface CellData {
  cell: string;
  value: string | number | null;
  formula?: string;
}

export interface RangeData {
  range: CellRange;
  data: CellData[][];
}

export enum UpdateType {
  Cell = 'cell',
  Range = 'range',
}

//=================================
// Actions
//=================================
export interface UpdateCellAction {
  sheet: string;
  cell: string;
  newValue: string | number;
}

export interface UpdateRangeAction {
  sheet: string;
  from: string;
  to: string;
  values: (string | number)[][];
}

//=================================
// Results
//=================================
export interface CellConfirmationResult {
  success: boolean;
  type: UpdateType.Cell;
  sheet: string;
  cell: string;
  currentValue: string | number | null;
  newValue: string | number;
  reason?: string;
}

export interface RangeConfirmationSuccess {
  success: boolean;
  type: UpdateType.Range;
  sheet: string;
  from: string;
  to: string;
  currentData: CellData[][];
  newValues: (string | number)[][];
  reason?: string;
  cellCount?: number;
  message: string;
}

export interface RangeConfirmationError {
  success: false;
  message: string;
}

export type RangeConfirmationResult =
  | RangeConfirmationSuccess
  | RangeConfirmationError;

export interface ExecuteUpdateCellResult {
  success: boolean;
  sheet: string;
  cell: string;
  oldValue: string | number | null;
  newValue: string | number;
  message: string;
}

export interface ExecuteRangeUpdateResult {
  success: boolean;
  sheet: string;
  from: string;
  to: string;
  cellsUpdated: number | null;
  message: string;
}

//=================================

export interface ConfirmationToolCall {
  toolName: 'confirmUpdate' | 'confirmRangeUpdate';
  args: UpdateCellAction | UpdateRangeAction;
  result?: CellConfirmationResult | RangeConfirmationResult;
}


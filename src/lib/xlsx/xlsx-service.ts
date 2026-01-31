import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { CellRange, RangeData, CellData } from './types';

const XLSX_FILE_PATH = path.resolve(
  process.cwd(),
  process.env.XLSX_FILE_PATH || './data/example.xlsx'
);

let workbook: XLSX.WorkBook | null = null;

function getWorkbook(): XLSX.WorkBook {


  if (!workbook) {
    try {
      const fileBuffer = fs.readFileSync(XLSX_FILE_PATH);
      workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    } catch (error) {
      console.log('XLSX file not found. Creating a new one.');
      workbook = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet([
        ['Email', 'Amount', 'Status'],
        ['user1@example.com', 100, 'Active'],
        ['user2@example.com', 200, 'Active'],
        ['user3@example.com', 150, 'Inactive'],
      ]);
      XLSX.utils.book_append_sheet(workbook, ws, 'Sheet1');

      const xlsxDir = path.dirname(XLSX_FILE_PATH);
      try {
        fs.mkdirSync(xlsxDir, { recursive: true });
      } catch {
        throw new Error('Failed to create data directory');
      }

      XLSX.writeFile(workbook, XLSX_FILE_PATH);
    }
  }
  return workbook;
}

function saveWorkbook() {
  if (workbook) {
    try {
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      fs.writeFileSync(XLSX_FILE_PATH, buffer);
    } catch (error) {
      throw new Error(`Ошибка системной записи файла: ${error}`);
    }
  }
}

export function getCellValue(sheetName: string, cell: string): string | number | null {
  const wb = getWorkbook();
  const sheet = wb.Sheets[sheetName];

  if (!sheet) {
    return null;
  }

  const cellData = sheet[cell];
  return cellData ? (cellData.v !== undefined ? cellData.v : null) : null;
}

export function getRange(range: CellRange): RangeData {
  const wb = getWorkbook();
  const sheet = wb.Sheets[range.sheet];

  if (!sheet) {
    throw new Error(`Sheet "${range.sheet}" not found. Available sheets: ${wb.SheetNames.join(", ")}`)
  }

  const fromCell = XLSX.utils.decode_cell(range.from);
  const toCell = XLSX.utils.decode_cell(range.to);

  const data: CellData[][] = [];

  for (let row = fromCell.r; row <= toCell.r; row++) {
    const rowData: CellData[] = [];
    for (let col = fromCell.c; col <= toCell.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = sheet[cellAddress];

      rowData.push({
        cell: cellAddress,
        value: cell ? (cell.v !== undefined ? cell.v : null) : null,
        formula: cell?.f || undefined,
      });
    }
    data.push(rowData);
  }

  return { range, data };
}

export function updateCell(sheetName: string, cell: string, value: string | number): void {
  const wb = getWorkbook();
  let sheet = wb.Sheets[sheetName];

  if (!sheet) {
    sheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
  }

  if (!sheet[cell]) {
    sheet[cell] = {};
  }

  if (sheet[cell].f) {
    delete sheet[cell].f;
  }

  typeof value === 'number'
    ? sheet[cell].t = 'n'
    : sheet[cell].t = 's'

  sheet[cell].v = value;
  saveWorkbook();
}

export function updateRange(sheetName: string, from: string, to: string, values: (string | number)[][]): void {
  const wb = getWorkbook();
  let sheet = wb.Sheets[sheetName];

  if (!sheet) {
    sheet = XLSX.utils.aoa_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, sheet, sheetName);
  }

  const fromCell = XLSX.utils.decode_cell(from);
  const toCell = XLSX.utils.decode_cell(to);

  for (let row = 0; row < values.length; row++) {
    for (let col = 0; col < values[row].length; col++) {
      const cellRef = { r: fromCell.r + row, c: fromCell.c + col };
      if (cellRef.r <= toCell.r && cellRef.c <= toCell.c) {
        const cellAddress = XLSX.utils.encode_cell(cellRef);
        if (!sheet[cellAddress]) {
          sheet[cellAddress] = {};
        }
        if (sheet[cellAddress].f) {
          delete sheet[cellAddress].f;
        }
        const currentValue = values[row][col];
        typeof currentValue === 'number'
          ? sheet[cellAddress].t = 'n'
          : sheet[cellAddress].t = 's'

        sheet[cellAddress].v = currentValue;
      }
    }
  }

  saveWorkbook();
}

export function getFormula(sheetName: string, cell: string): string | null {
  const wb = getWorkbook();
  const sheet = wb.Sheets[sheetName];

  if (!sheet) {
    return null;
  }

  const cellData = sheet[cell];
  return cellData?.f || null;
}


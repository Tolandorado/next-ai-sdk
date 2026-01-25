import z from "zod"

export const getRangeSchema = z.object({
    sheet: z.string().describe('Sheet name (e.g., "Sheet1")'),
    from: z.string().describe('Starting cell (e.g., "A1")'),
    to: z.string().describe('Ending cell (e.g., "B3")'),
})

export const explainFormulaSchema = z.object({
    sheet: z.string().describe('Sheet name'),
    cell: z.string().describe('Cell reference (e.g., "D4")'),
})

export const confirmCellUpdateSchema = z.object({
    sheet: z.string().describe('Sheet name (e.g., "Sheet1")'),
    cell: z.string().describe('Cell to update (e.g., "A2")'),
    newValue: z.union([z.string(), z.number()]).describe('New value to set'),
    reason: z.string().optional().describe('Reason for the update'),
})

export const confirmRangeUpdateSchema = z.object({
    sheet: z.string().describe('Sheet name (e.g., "Sheet1")'),
    from: z.string().describe('Starting cell (e.g., "A1")'),
    to: z.string().describe('Ending cell (e.g., "B3")'),
    values: z.array(z.array(z.union([z.string(), z.number()]))).describe('2D array of new values'),
    reason: z.string().optional().describe('Reason for the bulk update'),
})

export const executeCellUpdateSchema = z.object({
    sheet: z.string().describe('Sheet name'),
    cell: z.string().describe('Cell to update'),
    newValue: z.union([z.string(), z.number()]).describe('New value'),
})

export const executeRangeUpdateSchema = z.object({
    sheet: z.string().describe('Sheet name'),
    from: z.string().describe('Starting cell'),
    to: z.string().describe('Ending cell'),
    values: z.array(z.array(z.union([z.string(), z.number()]))).describe('2D array of values'),
})
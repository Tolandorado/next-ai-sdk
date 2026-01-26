import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updateCell, updateRange } from "@/lib/xlsx/xlsx-service";

const updateCellSchema = z.object({
  mode: z.literal("cell"),
  sheet: z.string(),
  cell: z.string(),
  value: z.union([z.string(), z.number()]),
});

const updateRangeSchema = z.object({
  mode: z.literal("range"),
  sheet: z.string(),
  from: z.string(),
  to: z.string(),
  values: z.array(z.array(z.union([z.string(), z.number()]))),
});

const bodySchema = z.discriminatedUnion("mode", [
  updateCellSchema,
  updateRangeSchema,
]);

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.parse(json);

    if (parsed.mode === "cell") {
      updateCell(parsed.sheet, parsed.cell, parsed.value);
    } else {
      updateRange(parsed.sheet, parsed.from, parsed.to, parsed.values);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating XLSX:", error);
    return NextResponse.json(
      { error: "Failed to update XLSX" },
      { status: 400 },
    );
  }
}



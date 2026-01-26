import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRange } from "@/lib/xlsx/xlsx-service";

const rangeSchema = z.object({
  sheet: z.string().default("Sheet1"),
  from: z.string(),
  to: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const parsed = rangeSchema.parse({
      sheet: searchParams.get("sheet") ?? undefined,
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    const rangeData = getRange({
      sheet: parsed.sheet,
      from: parsed.from,
      to: parsed.to,
    });

    return NextResponse.json(rangeData);
  } catch (error) {
    console.error("Error reading XLSX range:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read range" },
      { status: 400 }
    );
  }
}



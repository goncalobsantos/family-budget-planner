import { NextResponse } from "next/server";
import { listFiles } from "@/lib/storage";

export async function GET() {
  const csvFiles = await listFiles("csv");
  const budgetFiles = await listFiles("budgets");
  return NextResponse.json({ csvFiles, budgetFiles });
}

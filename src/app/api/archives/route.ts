import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const csvDir = path.join(process.cwd(), "public", "csv");
  const budgetDir = path.join(process.cwd(), "public", "budgets");

  if (!fs.existsSync(csvDir)) fs.mkdirSync(csvDir, { recursive: true });
  if (!fs.existsSync(budgetDir)) fs.mkdirSync(budgetDir, { recursive: true });

  const csvFiles = fs
    .readdirSync(csvDir)
    .filter((f) => f.endsWith(".csv"))
    .map((f) => ({
      name: f.replace(".csv", ""),
      filename: f,
      path: `/csv/${f}`,
      modified: fs.statSync(path.join(csvDir, f)).mtime.toISOString(),
    }))
    .sort((a, b) => b.name.localeCompare(a.name));

  const budgetFiles = fs
    .readdirSync(budgetDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => ({
      name: f.replace(".json", "").replace("budget-plan-", ""),
      filename: f,
      path: `/budgets/${f}`,
      modified: fs.statSync(path.join(budgetDir, f)).mtime.toISOString(),
    }))
    .sort((a, b) => b.name.localeCompare(a.name));

  return NextResponse.json({ csvFiles, budgetFiles });
}

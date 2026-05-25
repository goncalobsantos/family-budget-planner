import { NextRequest, NextResponse } from "next/server";
import { readStoredFile } from "@/lib/storage";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dir = searchParams.get("dir") as "csv" | "budgets" | null;
  const filename = searchParams.get("filename");

  if (!dir || !filename || (dir !== "csv" && dir !== "budgets")) {
    return NextResponse.json(
      { error: "Missing or invalid dir/filename" },
      { status: 400 }
    );
  }

  // Sanitize filename
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!sanitized) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const result = await readStoredFile(dir, sanitized);

  if (result.content === null) {
    return NextResponse.json(
      { error: result.error || "File not found" },
      { status: 404 }
    );
  }

  const contentType = dir === "csv" ? "text/csv" : "application/json";
  return new NextResponse(result.content, {
    headers: { "Content-Type": contentType },
  });
}

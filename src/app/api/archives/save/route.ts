import { NextRequest, NextResponse } from "next/server";
import { saveFile } from "@/lib/storage";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, filename, type } = body as {
    content: string;
    filename: string;
    type: "csv" | "budget";
  };

  if (!content || !filename || !type) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Sanitize filename — only allow alphanumeric, dots, hyphens, underscores
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!sanitized) {
    return NextResponse.json(
      { error: "Invalid filename" },
      { status: 400 }
    );
  }

  const dir = type === "csv" ? "csv" : "budgets";
  const savedPath = await saveFile(dir, sanitized, content);

  return NextResponse.json({
    success: true,
    path: savedPath,
  });
}

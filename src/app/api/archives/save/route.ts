import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

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
  const sanitized = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, "");
  if (!sanitized) {
    return NextResponse.json(
      { error: "Invalid filename" },
      { status: 400 }
    );
  }

  const dir = type === "csv" ? "csv" : "budgets";
  const targetDir = path.join(process.cwd(), "public", dir);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, sanitized);
  fs.writeFileSync(filePath, content, "utf-8");

  return NextResponse.json({
    success: true,
    path: `/${dir}/${sanitized}`,
  });
}

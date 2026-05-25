import { put, list, del } from "@vercel/blob";
import fs from "fs";
import path from "path";

const isVercel = !!process.env.BLOB_READ_WRITE_TOKEN;

interface StoredFile {
  name: string;
  filename: string;
  path: string;
  modified: string;
}

// ── List files by prefix/directory ──
export async function listFiles(
  dir: "csv" | "budgets"
): Promise<StoredFile[]> {
  if (isVercel) {
    const { blobs } = await list({ prefix: `${dir}/` });
    const ext = dir === "csv" ? ".csv" : ".json";
    return blobs
      .filter((blob) => {
        const filename = blob.pathname.replace(`${dir}/`, "");
        return filename.length > 0 && filename.endsWith(ext);
      })
      .map((blob) => {
        const filename = blob.pathname.replace(`${dir}/`, "");
        return {
          name: filename.replace(ext, ""),
          filename,
          path: blob.url,
          modified: blob.uploadedAt.toISOString(),
        };
      })
      .sort((a, b) => b.name.localeCompare(a.name));
  }

  // Local filesystem fallback
  const localDir = path.join(process.cwd(), "public", dir);
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
    return [];
  }

  const ext = dir === "csv" ? ".csv" : ".json";
  return fs
    .readdirSync(localDir)
    .filter((f) => f.endsWith(ext))
    .map((f) => ({
      name: f.replace(ext, ""),
      filename: f,
      path: `/${dir}/${f}`,
      modified: fs.statSync(path.join(localDir, f)).mtime.toISOString(),
    }))
    .sort((a, b) => b.name.localeCompare(a.name));
}

// ── Read a file's content ──
export async function readStoredFile(
  dir: "csv" | "budgets",
  filename: string
): Promise<string | null> {
  if (isVercel) {
    const { blobs } = await list({ prefix: `${dir}/${filename}` });
    const blob = blobs.find((b) => b.pathname === `${dir}/${filename}`);
    if (!blob) return null;
    // Use downloadUrl for private blob stores
    const url = blob.downloadUrl || blob.url;
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.text();
  }

  const filePath = path.join(process.cwd(), "public", dir, filename);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf-8");
}

// ── Save/upload a file ──
export async function saveFile(
  dir: "csv" | "budgets",
  filename: string,
  content: string
): Promise<string> {
  if (isVercel) {
    const blob = await put(`${dir}/${filename}`, content, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  // Local filesystem
  const targetDir = path.join(process.cwd(), "public", dir);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return `/${dir}/${filename}`;
}

// ── Delete a file ──
export async function deleteFile(
  dir: "csv" | "budgets",
  filename: string
): Promise<boolean> {
  if (isVercel) {
    const { blobs } = await list({ prefix: `${dir}/${filename}` });
    const blob = blobs.find((b) => b.pathname === `${dir}/${filename}`);
    if (!blob) return false;
    await del(blob.url);
    return true;
  }

  const filePath = path.join(process.cwd(), "public", dir, filename);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

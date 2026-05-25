import { SignJWT, jwtVerify } from "jose";

const SALT = "family-budget-salt-v1";
const VALID_HASHES = [
  "84fdeca8af0916d70351027f2ac381687b404330c6f2c809c2ded5663928a28f",
  "b8b22ca6d028935bced015d19ef877bf459be2074242bbf9a6e619a4ca7154e3",
];

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyPassword(password: string): Promise<boolean> {
  const hash = await hashPassword(password);
  // Constant-time comparison to prevent timing attacks
  if (hash.length !== VALID_HASHES[0].length) return false;
  for (const validHash of VALID_HASHES) {
    let match = true;
    for (let i = 0; i < hash.length; i++) {
      if (hash[i] !== validHash[i]) match = false;
    }
    if (match) return true;
  }
  return false;
}

export async function createSession(): Promise<string> {
  return new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getJwtSecret());
    return true;
  } catch {
    return false;
  }
}

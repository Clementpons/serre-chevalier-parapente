import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function readBody(req: Request): Promise<Buffer> {
  const body = await req.arrayBuffer();
  return Buffer.from(body);
}

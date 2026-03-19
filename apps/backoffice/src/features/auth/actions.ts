"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const getCurrent = async () => {
  try {
    const headersData = await headers();
    const session = await auth.api.getSession({ headers: headersData });
    if (!session) return null;
    return await prisma.user.findUnique({ where: { id: session.user.id } });
  } catch {
    return null;
  }
};

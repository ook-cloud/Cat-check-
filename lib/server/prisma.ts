import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/app/generated/prisma/client";
import { requireEnv } from "./errors";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const connectionString = requireEnv("DATABASE_URL");
    const isLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
    const adapter = new PrismaPg({
      connectionString,
      // Supabase's certificate is not in Node's trusted list. The connection is
      // still encrypted, but the server's identity is not checked.
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
    });
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  return globalForPrisma.prisma;
}

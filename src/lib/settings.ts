import { prisma } from "@/lib/prisma";

// Admin-editable configuration, stored in the Setting table so credentials
// can be filled in from /admin/settings instead of editing .env. Falls back
// to the matching env var when a key hasn't been set in the database yet.
export async function getSetting(key: string, envFallback?: string): Promise<string> {
  const row = await prisma.setting.findUnique({ where: { key } });
  if (row && row.value) return row.value;
  return envFallback ? (process.env[envFallback] ?? "") : "";
}

export async function getSettings(
  keys: string[]
): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const result: Record<string, string> = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}

export async function setSetting(key: string, value: string): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export async function setSettings(values: Record<string, string>): Promise<void> {
  await prisma.$transaction(
    Object.entries(values).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } })
    )
  );
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const demoPassword = await bcrypt.hash("demo1234", 10);

  await prisma.user.upsert({
    where: { email: "admin@socialswick.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@socialswick.com",
      passwordHash: adminPassword,
      role: "ADMIN",
      balance: 0,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "demo@socialswick.com" },
    update: {},
    create: {
      name: "Demo Customer",
      email: "demo@socialswick.com",
      passwordHash: demoPassword,
      role: "CUSTOMER",
      balance: 50,
      emailVerifiedAt: new Date(),
    },
  });

  const categories = [
    {
      name: "Instagram",
      slug: "instagram",
      services: [
        { name: "Instagram Followers [Real, HQ]", rate: 1.2, min: 100, max: 50000 },
        { name: "Instagram Likes [Instant]", rate: 0.5, min: 50, max: 20000 },
        { name: "Instagram Reels Views", rate: 0.3, min: 100, max: 100000 },
      ],
    },
    {
      name: "YouTube",
      slug: "youtube",
      services: [
        { name: "YouTube Subscribers [Real]", rate: 3.5, min: 50, max: 10000 },
        { name: "YouTube Views [High Retention]", rate: 1.0, min: 500, max: 500000 },
        { name: "YouTube Watch Time (Hours)", rate: 12.0, min: 100, max: 4000 },
      ],
    },
    {
      name: "TikTok",
      slug: "tiktok",
      services: [
        { name: "TikTok Followers", rate: 1.5, min: 100, max: 50000 },
        { name: "TikTok Views", rate: 0.2, min: 1000, max: 1000000 },
        { name: "TikTok Likes", rate: 0.6, min: 50, max: 50000 },
      ],
    },
    {
      name: "Telegram",
      slug: "telegram",
      services: [
        { name: "Telegram Channel Members", rate: 1.8, min: 100, max: 100000 },
        { name: "Telegram Post Views", rate: 0.15, min: 500, max: 500000 },
      ],
    },
  ];

  for (let i = 0; i < categories.length; i++) {
    const { name, slug, services } = categories[i];
    const category = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, position: i },
    });

    for (const s of services) {
      const existing = await prisma.service.findFirst({
        where: { categoryId: category.id, name: s.name },
      });
      if (!existing) {
        await prisma.service.create({
          data: { ...s, categoryId: category.id },
        });
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

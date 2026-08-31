import "dotenv/config";

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // This safely pulls your database link for Prisma Migrate
    url: process.env.DATABASE_URL,
  },
};

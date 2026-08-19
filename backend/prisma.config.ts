import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Connection URLs come from schema.prisma's own env("DATABASE_URL")/env("DIRECT_URL")
// (see backend-architecture.md §14) — no datasource override needed here.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});

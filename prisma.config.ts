import dotenv from 'dotenv';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

// Load .env.local (Next.js convention) dan .env sebagai fallback
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: process.env['DIRECT_URL']!,
    },
  }),
});

import dotenv from 'dotenv';
import { definePrismaConfig } from '@prisma/cli-engine';
import { defineConfig as ormConfig } from '@prisma/orm-postgres/config';

// Load .env.local (Next.js convention) dan .env sebagai fallback
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const directUrl = process.env['DIRECT_URL'];

if (!directUrl) {
  throw new Error('Missing required environment variable: DIRECT_URL');
}

export default definePrismaConfig({
  orm: ormConfig({
    contract: "./src/prisma/contract.prisma",
    db: {
      connection: directUrl,
    },
  }),
});

import 'server-only';
import { db } from '@/prisma/db';

// All interpolation uses Prisma bound parameters, never concatenated user SQL.
export const sql = db.raw.sql;
export async function readJson<T>(query: ReturnType<typeof sql>): Promise<T> {
  const rows = await db.runtime().query(query.returnsRow({ payload: 'pg/text@1' }).build());
  if (!rows[0]) throw new Error('Admin query returned no result');
  return JSON.parse(rows[0].payload) as T;
}
export async function execute(query: ReturnType<typeof sql>) {
  return db.runtime().execute(query.affectedCount().build());
}

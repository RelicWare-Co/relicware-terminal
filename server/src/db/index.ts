import { Database } from 'bun:sqlite';
import * as authSchema from "@/db/auth/schema"
import { drizzle } from 'drizzle-orm/bun-sqlite';

const sqlite = new Database(`${Bun.env.DATABASE_URL}`);
export const db = drizzle({
    schema: {
        ...authSchema,
    },
    client: sqlite,
});
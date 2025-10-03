import { Database } from 'bun:sqlite';
import * as authSchema from "@/db/auth/schema"
import * as workspaceSchema from "@/db/workspace/schema"
import { drizzle } from 'drizzle-orm/bun-sqlite';

const sqlite = new Database(`${Bun.env.DATABASE_URL}`);
export const db = drizzle({
    schema: {
        ...authSchema,
        ...workspaceSchema,
    },
    client: sqlite,
});
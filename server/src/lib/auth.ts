import { db } from "@/db/index"; // your drizzle instance
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins"
import { admin } from "better-auth/plugins"
import { openAPI } from 'better-auth/plugins'

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "sqlite",
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        organization(),
        admin(),
        openAPI()
    ],
    basePath: "/api"
});



let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>
// biome-ignore lint/suspicious/noAssignInExpressions: <explanation>
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema())

export const OpenAPI = {
    getPaths: (prefix = '/auth/api') =>
        getSchema().then(({ paths }) => {
            const reference: typeof paths = Object.create(null)

            for (const path of Object.keys(paths)) {
                const key = prefix + path
                reference[key] = paths[path]

                for (const method of Object.keys(paths[path])) {
                    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                    const operation = (reference[key] as any)[method]

                    operation.tags = ['Better Auth']
                }
            }

            return reference
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        }) as Promise<any>,
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    components: getSchema().then(({ components }) => components) as Promise<any>
} as const
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            readonly NODE_ENV: 'development' | 'production' | 'test'
            VERCEL?: string
            VERCEL_ENV?: 'production' | 'preview' | 'development'
            VERCEL_URL?: string
            VERCEL_REGION?: string
            VERCEL_GIT_PROVIDER?: string
            VERCEL_GIT_REPO_SLUG?: string
            VERCEL_GIT_REPO_OWNER?: string
            VERCEL_GIT_REPO_ID?: string
            VERCEL_GIT_COMMIT_REF?: string
            VERCEL_GIT_COMMIT_SHA?: string
            VERCEL_GIT_COMMIT_MESSAGE?: string
            VERCEL_GIT_COMMIT_AUTHOR_LOGIN?: string
            VERCEL_GIT_COMMIT_AUTHOR_NAME?: string
            PRODUCTION_URL?: string
        }
    }
}

export { }
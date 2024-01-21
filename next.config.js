// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
    reactStrictMode: true,
    modularizeImports: {
        '@mui/joy': {
            transform: '@mui/joy/{{member}}'
        },
        '@mui/icons-material/?(((\\w*)?/?)*)': {
            transform: '@mui/icons-material/{{ matches.[1] }}/{{member}}'
        }
    },
    async rewrites() {
        return [
            {
                source: '/lesson/:id',
                destination: '/lesson',
            },
        ]
    }
};

module.exports = nextConfig;
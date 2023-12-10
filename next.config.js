// @ts-check

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
    reactStrictMode: true,
    modularizeImports: {
        '@mui/joy': {
            transform: '@mui/joy/{{member}}'
        }
    }
};

module.exports = nextConfig;
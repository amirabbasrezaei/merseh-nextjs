/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: '9010',
            pathname: '/**',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '9010',
            pathname: '/**',
          },
          {
            protocol: 'http',
            hostname: '127.0.0.1',
            port: '9000',
            pathname: '/**',
          },
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '9000',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'static.mehrnil.com',
            pathname: '/**',
          },
          {
            protocol: 'https',
            hostname: 'trustseal.enamad.ir',
          },
          {
            protocol: 'https',
            hostname: 'portal.podro.com',
          },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        dangerouslyAllowLocalIP: true,
      },
      async headers() {
        return [
            {
                // matching all API routes
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
                    { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
                   
                ]
            }
        ]
    },
    httpAgentOptions: {
      keepAlive: false,
    },
};

export default nextConfig;

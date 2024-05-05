/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'merseh.storage.iran.liara.space',

          },
        ],
      },
};

export default nextConfig;

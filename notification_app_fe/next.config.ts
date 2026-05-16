/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['logging_middleware'],
  async rewrites() {
    return [
      {
        source: '/api/eval/:path*',
        destination: 'http://4.224.186.213/evaluation-service/:path*'
      }
    ]
  }
};

export default nextConfig;
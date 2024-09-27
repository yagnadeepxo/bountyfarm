/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vldhwuxhpskjvcdbwrir.supabase.co'], // Add the Supabase storage domain here
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;

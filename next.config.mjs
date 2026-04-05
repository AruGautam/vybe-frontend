/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the phone on the local network to receive hot-reload updates
  allowedDevOrigins: ['192.168.1.3',
    '192.168.1.3:3000'
  ],
};

export default nextConfig;

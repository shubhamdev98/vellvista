import type { NextConfig } from "next";

const getBackendUrlConfig = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  let expandedUrl = backendUrl;
  if (backendUrl.includes('${NEXT_PUBLIC_SERVER_IP}')) {
    const ip = process.env.NEXT_PUBLIC_SERVER_IP || 'localhost';
    expandedUrl = backendUrl.replace('${NEXT_PUBLIC_SERVER_IP}', ip);
  }
  try {
    const parsed = new URL(expandedUrl);
    return {
      protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
      hostname: parsed.hostname,
      port: parsed.port || '',
    };
  } catch {
    return {
      protocol: 'http' as const,
      hostname: 'localhost',
      port: '3001',
    };
  }
};

const backendConfig = getBackendUrlConfig();
const serverIp = backendConfig.hostname;

const nextConfig: NextConfig = {
  allowedDevOrigins: [serverIp],
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: backendConfig.protocol,
        hostname: backendConfig.hostname,
        port: backendConfig.port,
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

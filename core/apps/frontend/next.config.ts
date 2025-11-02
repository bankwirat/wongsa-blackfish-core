import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  serverExternalPackages: ['@prisma/client'],
  output: 'standalone',
  webpack: (config, { isServer }) => {
    // Allow importing from workspace packages
    config.resolve.alias = {
      ...config.resolve.alias,
      '@wongsa/sales-order': path.resolve(__dirname, '../../../packages/@wongsa/sales-order'),
      '@wongsa/sales-order/frontend': path.resolve(__dirname, '../../../packages/@wongsa/sales-order/frontend/src/index.ts'),
      // Map all common dependencies to frontend's node_modules for workspace packages
      'lucide-react': path.resolve(__dirname, 'node_modules/lucide-react'),
      'react': path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      'next': path.resolve(__dirname, 'node_modules/next'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/contexts': path.resolve(__dirname, 'src/contexts'),
    };
    
    // Ensure modules resolve dependencies from frontend's node_modules first
    // This allows workspace packages to use dependencies from the frontend app
    config.resolve.modules = [
      path.resolve(__dirname, 'node_modules'), // Frontend's node_modules first (priority)
      path.resolve(__dirname, '../../../packages'), // Workspace packages
      'node_modules', // Fallback to any node_modules
      ...(config.resolve.modules || []),
    ];
    
    // For workspace packages, symlink resolution should work, but ensure
    // dependencies resolve from the consuming package (frontend) not the workspace package
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
      };
    }
    
    return config;
  },
};

export default nextConfig;

import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Si usas una URL como usuario.github.io/repo/, descomenta y edita:
  // basePath: '/nombre-del-repo',
};

export default nextConfig;

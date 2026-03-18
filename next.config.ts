import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // IMPORTANTE: Si tu repositorio se llama "mi-juego", 
  // descomenta la línea de abajo y cámbiala a: basePath: '/mi-juego',
  // basePath: '',
};

export default nextConfig;

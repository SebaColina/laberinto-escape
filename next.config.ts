import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Si tu repo NO es username.github.io (es decir, es un subproyecto), 
  // descomenta las líneas de abajo y pon el nombre de tu repositorio:
  // basePath: '/nombre-de-tu-repo',
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // better-sqlite3 é módulo nativo (.node): precisa ficar fora do bundle
  // e ser carregado pelo require do Node em tempo de execução.
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;

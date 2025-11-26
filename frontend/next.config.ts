import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      { source: '/pdv', destination: '/vendas/nova', permanent: false },
      { source: '/estoque/produtos', destination: '/produtos', permanent: false },
      { source: '/estoque/movimentacoes', destination: '/estoque', permanent: false },
      { source: '/estoque/baixo', destination: '/produtos?filter=baixo', permanent: false },
      { source: '/relatorios/estoque', destination: '/estoque', permanent: false },
      { source: '/relatorios/vendas', destination: '/vendas', permanent: false },
    ];
  },
};

export default nextConfig;


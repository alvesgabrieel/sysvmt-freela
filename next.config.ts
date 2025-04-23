import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração do App Router (não precisa mais do experimental.appDir)
  rewrites: async () => {
    return [
      {
        source: "/changepassword/:token*",
        destination: "/changepassword/[[...token]]",
      },
    ];
  },

  // Outras configurações globais...
};

export default nextConfig;

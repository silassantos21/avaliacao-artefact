import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Evita que o Next.js suba até um package-lock.json não relacionado,
  // presente na pasta pessoal do usuário fora deste projeto.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;

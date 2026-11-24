import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: resolve(fileURLToPath(new URL("../../", import.meta.url))),
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The finance kernel reads the frozen benchmark at runtime — bank.csv,
   * ledger.csv, demo.json, supplement.json, policy.pack.json, review.json and
   * expected.json — through `path.join(process.cwd(), 'bench', ...)`.
   *
   * Those paths are built at runtime, so Next's file tracing cannot see them and
   * a serverless deploy would ship without them: every page and route would fail
   * with ENOENT the moment it touched the store. Tracing them in explicitly is
   * what makes the deployed app work at all.
   */
  outputFileTracingIncludes: {
    "/**": ["./bench/fixtures/**", "./bench/expected.json"],
  },
};

export default nextConfig;

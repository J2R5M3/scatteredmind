/// <reference types="@cloudflare/workers-types" />
/// <reference types="astro/client" />
/// <reference types="vite/client" />
/// <reference types="../vendor/integration/types.d.ts" />

// Define a type for the Cloudflare Workers AI binding
// Using 'unknown' instead of 'any' to avoid the ESLint error,
// requiring explicit type assertions where used.
interface CloudflareWorkersAI {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}

interface Ai {
  run(model: string, inputs: object): Promise<unknown>;
}

// interface Runtime {
//   env: {
//     ECHOES_BUCKET: R2Bucket;
//     AI: CloudflareWorkersAI; // Use the more specific type here
//   };
// }

declare namespace App {
  interface Locals {
    runtime: {
      env: {
        ECHOES_BUCKET: R2Bucket;
        AI: Ai;
        R2_PUBLIC_URL: string;
      };
    };
  }
}

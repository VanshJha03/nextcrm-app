const withNextIntl = require("next-intl/plugin")(
  "./i18n/request.ts"
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "localhost" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "minio-cwg0o4ss0scoccgwso8sk004.coolify.cz" },
      { protocol: "http", hostname: "minio" },
    ],
  },
  // Provide default values for all environment variables to ensure build completes
  // even when .env file is missing or incomplete. These defaults are used at build
  // time only - runtime values from actual env vars will override them.
  env: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "placeholder-openai-key",
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY || "placeholder-openai-key",
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "placeholder-openai-key",
    RESEND_API_KEY: process.env.RESEND_API_KEY || "placeholder-resend-key",
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL || "noreply@placeholder.com",
    EMAIL_HOST: process.env.EMAIL_HOST || "smtp.placeholder.com",
    EMAIL_FROM: process.env.EMAIL_FROM || "info@placeholder.com",
    EMAIL_USERNAME: process.env.EMAIL_USERNAME || "smtp@placeholder.com",
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "placeholder-email-password",
    IMAP_HOST: process.env.IMAP_HOST || "imap.placeholder.com",
    IMAP_PORT: process.env.IMAP_PORT || "993",
    IMAP_USER: process.env.IMAP_USER || "user@placeholder.com",
    IMAP_PASSWORD: process.env.IMAP_PASSWORD || "placeholder-imap-password",
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || "placeholder-encryption-key-must-be-64-chars-here-for-build",
    ROSSUM_API_URL: process.env.ROSSUM_API_URL || "https://elis.rossum.ai/api/v1",
    ROSSUM_QUEUE_ID: process.env.ROSSUM_QUEUE_ID || "placeholder-queue-id",
    ROSSUM_USER: process.env.ROSSUM_USER || "placeholder-rossum-user",
    ROSSUM_PASS: process.env.ROSSUM_PASS || "placeholder-rossum-pass",
    DO_ENDPOINT: process.env.DO_ENDPOINT || "placeholder-do-endpoint",
    DO_REGION: process.env.DO_REGION || "placeholder-do-region",
    DO_BUCKET: process.env.DO_BUCKET || "placeholder-do-bucket",
    DO_ACCESS_KEY_ID: process.env.DO_ACCESS_KEY_ID || "placeholder-do-key",
    DO_ACCESS_KEY_SECRET: process.env.DO_ACCESS_KEY_SECRET || "placeholder-do-secret",
    E2B_API_KEY: process.env.E2B_API_KEY || "placeholder-e2b-api-key",
    E2B_ENRICHMENT_TEMPLATE: process.env.E2B_ENRICHMENT_TEMPLATE || "nextcrm-enrichment",
  },
  async redirects() {
    return [
      {
        source: "/:locale/crm/targets/:path*",
        destination: "/:locale/campaigns/targets/:path*",
        permanent: true,
      },
      {
        source: "/:locale/crm/target-lists/:path*",
        destination: "/:locale/campaigns/target-lists/:path*",
        permanent: true,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);

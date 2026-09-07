import { execSync } from "node:child_process";
import type { NextConfig } from "next";

// Build-time version info: baked into the client bundle via the `env` config.
// Preferred source is Vercel's system env vars; falls back to local git when
// building outside Vercel (dev / CI without Vercel env).
function gitValue(vercelVar: string | undefined, cmd: string): string {
  if (vercelVar) return vercelVar.trim();
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const commitSha = gitValue(process.env.VERCEL_GIT_COMMIT_SHA, "git rev-parse HEAD");
const commitMessage = gitValue(
  process.env.VERCEL_GIT_COMMIT_MESSAGE,
  "git log -1 --format=%s",
);
const sha8 = commitSha.slice(0, 8);

const repoUrl =
  process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
    ? `https://github.com/${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
    : "https://github.com/henryw2019/diviseek";

// Build timestamp rendered in Asia/Shanghai (user-facing), e.g. "2026-09-07 17:32".
function buildTime(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["diviseek.com", "ioex.top", "localhost"],
  env: {
    NEXT_PUBLIC_APP_VERSION: sha8 ? `${buildTime()} · ${sha8}` : "dev",
    NEXT_PUBLIC_APP_BUILD_TIME: buildTime(),
    NEXT_PUBLIC_APP_COMMIT_SHA: sha8,
    NEXT_PUBLIC_APP_COMMIT_MESSAGE: commitMessage,
    NEXT_PUBLIC_APP_COMMIT_URL: commitSha
      ? `${repoUrl}/commit/${commitSha}`
      : "",
  },
};

export default nextConfig;
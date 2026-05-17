import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./client";

export const rateLimits = {
  uploadResume: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
    analytics: true,
    prefix: "rl:upload-resume",
  }),

  aiGeneration: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    analytics: true,
    prefix: "rl:ai-generation",
  }),

  parserJob: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 m"),
    analytics: true,
    prefix: "rl:parser-job",
  }),

  pdfExport: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    analytics: true,
    prefix: "rl:pdf-export",
  }),

  publicResumeView: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "rl:public-resume-view",
  }),
};

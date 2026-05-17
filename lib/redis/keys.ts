export const redisKeys = {
  rate: {
    uploadByUser: (userId: string) => `rate:user:${userId}:upload`,
    uploadByIp: (ip: string) => `rate:ip:${ip}:upload`,
    aiByUser: (userId: string) => `rate:user:${userId}:ai`,
    pdfByUser: (userId: string) => `rate:user:${userId}:pdf`,
    publicViewByIp: (ip: string) => `rate:ip:${ip}:public-view`,
    parserByUser: (userId: string) => `rate:user:${userId}:parser`,
  },

  cache: {
    fileHash: (hash: string) => `cache:file:${hash}`,
    parseResult: (parser: "llamaparse" | "reducto", hash: string) =>
      `cache:parse:${parser}:${hash}`,
    resumeJson: (hash: string) => `cache:resume-json:${hash}`,
    aiGeneration: (resumeId: string, promptHash: string) =>
      `cache:ai:${resumeId}:${promptHash}`,
    publicResume: (slug: string) => `cache:public-resume:${slug}`,
    pdfExport: (resumeId: string, theme: string) =>
      `cache:pdf:${resumeId}:${theme}`,
  },

  job: {
    parseStatus: (resumeId: string) => `job:parse:${resumeId}:status`,
    parseLock: (hash: string) => `lock:parse:${hash}`,
    aiLock: (resumeId: string) => `lock:ai:${resumeId}`,
    activeParserJobsByUser: (userId: string) => `active:user:${userId}:parser-jobs`,
  },

  usage: {
    dailyCredits: (provider: "llamaparse" | "reducto", date: string) =>
      `usage:${provider}:${date}:credits`,
    userDailyCredits: (userId: string, date: string) =>
      `usage:user:${userId}:${date}:credits`,
  },
};

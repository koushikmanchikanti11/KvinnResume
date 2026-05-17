// TODO: ResumeData TypeScript types and Zod schema
import { z } from "zod";
export const resumeSchema = z.object({}).passthrough(); // TODO: Full schema from docs/resume schema.json
export type ResumeDataSchema = z.infer<typeof resumeSchema>;

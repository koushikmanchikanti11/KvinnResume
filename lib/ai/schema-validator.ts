// TODO: Zod validation for AI JSON output
import { z } from "zod";
export const resumeDataSchema = z.object({}).passthrough(); // Placeholder
export function validateAIOutput(data: unknown) { return resumeDataSchema.safeParse(data); }

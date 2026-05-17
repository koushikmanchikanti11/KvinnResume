// TODO: useParseJob — track parse job polling
export function useParseJob(jobId: string | null) {
  return { status: "idle", result: null };
}

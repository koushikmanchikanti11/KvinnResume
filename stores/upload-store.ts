// TODO: Upload flow state — queue, progress, status
export interface UploadState {
  files: unknown[];
  uploading: boolean;
  progress: number;
}

export const useUploadStore = (() => {
  throw new Error("Not implemented");
}) as unknown as () => UploadState;

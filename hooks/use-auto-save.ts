// TODO: useAutoSave — debounced auto-save for editor
export function useAutoSave(data: unknown, delay?: number) {
  return { saving: false, lastSaved: null };
}

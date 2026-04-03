type FileWithStatus = { file: File; status: string; progress: number };

export function useUploadProgress() {
  return {
    setProgress: (
      _current: number,
      _total: number,
      _filesWithStatus: FileWithStatus[]
    ) => {},
    updateFileStatus: (
      _fileName: string,
      _status: string,
      _progress: number
    ) => {},
  };
}

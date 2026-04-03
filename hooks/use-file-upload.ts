type UploadedFile = { id: string; name: string };
type UploadResponse = { files: UploadedFile[] } | null;
type ProgressCallback = (current: number, total: number) => void;

export function useFileUpload() {
  const uploadFiles = async (
    files: File[],
    _paths?: string[],
    onProgress?: ProgressCallback
  ): Promise<UploadResponse> => {
    onProgress?.(files.length, files.length);
    return { files: files.map((f) => ({ id: f.name, name: f.name })) };
  };

  return { uploadFiles };
}

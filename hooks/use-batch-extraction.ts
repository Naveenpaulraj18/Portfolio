type ExtractedFile = { id: string; name: string };

export function useBatchExtraction() {
  const extractBatchWithProgress = async (
    _responseFiles: ExtractedFile[],
    _localFiles: File[]
  ): Promise<void> => {
    // stub – implement extraction logic here
  };

  return { extractBatchWithProgress };
}

export const ALLOWED_FILE_TYPES = [
  ".pdf",
  ".txt",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
] as const;

export const UPLOAD_MESSAGES = {
  draggable: {
    INVALID_TYPE:
      "unsupported file(s) detected. Only PDF, TXT, DOCX, PNG, JPG, and JPEG are allowed.",
  },
};

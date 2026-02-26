"use client";
import { useDragAndDrop } from "@/hooks/use-draganddrop";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useBatchExtraction } from "@/hooks/use-batch-extraction";
import { useUploadProgress } from "@/contexts/upload-progress-context";
import {
  ALLOWED_FILE_TYPES,
  UPLOAD_MESSAGES,
} from "@/constants/file-constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Upload, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import ErrorDialog from "./unsupport-file-dialog";
import useDrivePicker from "react-google-drive-picker";

declare module "react" {
  interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
    webkitdirectory?: string;
  }
}
type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
};

type DraggableAreaProps = {
  disableFolderUpload?: boolean;
  onFileChosen?: (fileName: string, file_id: string) => void;
};
// interface GoogleOAuth2 {
//   initTokenClient: (config: {
//     client_id: string;
//     scope: string;
//     callback: (response: TokenResponse) => void;
//   }) => {
//     requestAccessToken: () => void;
//   };
// }

// interface GoogleAccounts {
//   oauth2: GoogleOAuth2;
// }

// interface GoogleAPI {
//   accounts: GoogleAccounts;
// }

// interface Window {
//   google?: GoogleAPI;
// }

export default function DraggableArea({
  disableFolderUpload = false,
  onFileChosen,
}: DraggableAreaProps) {
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFiles } = useFileUpload();
  const { extractBatchWithProgress } = useBatchExtraction();
  const { setProgress, updateFileStatus, updateFileId } = useUploadProgress();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  const CLIENT_ID =
    "668276778263-arhdpmcuvtcvt3trg2m4v6dgp19hnupq.apps.googleusercontent.com";
  const DEVELOPER_KEY = "AIzaSyCqqGS8xazXigUbv1GKTU5kzH8OwZbIAYU";
  const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

  const [openPicker] = useDrivePicker();
  const validFiles: File[] = [];
  const invalidFiles: File[] = [];
  // ✅ Load Google OAuth script once
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setGsiLoaded(true);
    document.body.appendChild(script);
  }, []);

  // ✅ Request Google OAuth token
  const handleGoogleSignIn = () => {
    if (!gsiLoaded) {
      console.error("Google Identity script not loaded yet");
      return;
    }
    const googleAccounts = window.google?.accounts?.oauth2;
    if (!googleAccounts) {
      console.error("Google OAuth2 API not available on window");
      return;
    }

    const client = googleAccounts.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: TokenResponse) => {
        if (response?.access_token) {
          console.log("✅ Got Google Drive access token");
          setAccessToken(response.access_token);
          handleOpenPicker(response.access_token);
        } else {
          console.error("Failed to get access token", response);
        }
      },
    });

    client.requestAccessToken({ prompt: "" });
    console.log("Requesting Google Drive access token...", client);
  };

  const handleOpenPicker = (token?: string) => {
    if (!openPicker) return;

    openPicker({
      clientId: CLIENT_ID,
      developerKey: DEVELOPER_KEY,
      token: token || accessToken || "",
      viewId: "DOCS",
      showUploadView: true,
      viewMimeTypes: [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/png",
        "image/jpeg",
      ].join(","),
      showUploadFolders: true,
      supportDrives: true,
      multiselect: false,
      callbackFunction: async (data) => {
        if (data.action === "cancel") {
          console.log("User closed the picker");
          return;
        }

        if (data.docs && data.docs.length > 0) {
          console.log("Selected Google Drive files:", data.docs);

          const driveFiles: File[] = [];

          for (const doc of data.docs) {
            try {
              const response = await fetch(
                `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
                {
                  headers: { Authorization: `Bearer ${token || accessToken}` },
                }
              );

              if (!response.ok) {
                throw new Error(`Drive fetch failed: ${response.statusText}`);
              }

              const blob = await response.blob();
              const file = new File([blob], doc.name, { type: doc.mimeType });
              driveFiles.push(file);
              console.log("Fetched file from Drive:", file);
            } catch (error) {
              console.error(`Failed to fetch ${doc.name}:`, error);
            }
          }
          driveFiles.forEach((file) => {
            if (isFileTypeAllowed(file)) validFiles.push(file);
            else invalidFiles.push(file);
          });
          if (validFiles.length > 5) {
            setErrorMessage("You can only upload up to 5 files at a time.");
            setIsErrorOpen(true);
            return;
          }

          if (invalidFiles.length > 0) {
            setErrorMessage(
              `${invalidFiles.length} unsupported file(s) detected. Only PDF, TXT, DOCX, PNG, JPG, and JPEG are allowed.`
            );
            setIsErrorOpen(true);
          }

          if (validFiles.length === 0) return;

          if (driveFiles.length > 0) {
            const filesWithStatus = driveFiles.map((file) => ({
              file,
              status: "inprogress" as const,
              progress: 0,
            }));

            setProgress(0, driveFiles.length, filesWithStatus);

            const response = await uploadFiles(
              driveFiles,
              undefined,
              (current, total) => {
                setProgress(current, total, filesWithStatus);

                driveFiles.forEach((file, index) => {
                  if (index < current) {
                    updateFileStatus(file.name, "completed", 100);
                  } else if (index === current) {
                    const progressPercent = Math.min(
                      95,
                      (current / total) * 100
                    );
                    updateFileStatus(file.name, "inprogress", progressPercent);
                  } else {
                    updateFileStatus(file.name, "inprogress", 0);
                  }
                });
              }
            );

            if (response?.files && response.files.length > 0) {
              driveFiles.forEach((file) =>
                updateFileStatus(file.name, "completed", 100)
              );

              try {
                await extractBatchWithProgress(response.files, driveFiles);
              } catch (error) {
                console.error("Error during Drive batch extraction:", error);
              }

              try {
                const documentModule = await import(
                  "../../documents/_components/document-table"
                );
                await documentModule.refreshDocuments?.();
              } catch {
                window.dispatchEvent(
                  new CustomEvent("documents-refresh", {
                    detail: { source: "drive-upload" },
                  })
                );
              }
            }
          }
        }
      },
    });
  };

  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isErrorOpen, setIsErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isFileTypeAllowed = (file: File): boolean => {
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    return ALLOWED_FILE_TYPES.includes(
      extension as (typeof ALLOWED_FILE_TYPES)[number]
    );
  };

  const handleFileDrop = async (files: File[], paths?: string[]) => {
    files.forEach((file) => {
      if (isFileTypeAllowed(file)) validFiles.push(file);
      else invalidFiles.push(file);
    });

    if (validFiles.length > 5) {
      setErrorMessage("You can only upload up to 5 files at a time.");
      setIsErrorOpen(true);
      return;
    }

    if (invalidFiles.length > 0) {
      setErrorMessage(
        `${invalidFiles.length} ${UPLOAD_MESSAGES.draggable.INVALID_TYPE}`
      );
      setIsErrorOpen(true);
    }

    if (validFiles.length === 0) return;

    const filesWithStatus = validFiles.map((file) => ({
      file,
      status: "inprogress" as const,
      progress: 0,
    }));

    setProgress(0, validFiles.length, filesWithStatus);

    const response = await uploadFiles(validFiles, paths, (current, total) => {
      setProgress(current, total, filesWithStatus);
      validFiles.forEach((file, index) => {
        if (index < current) updateFileStatus(file.name, "completed", 100);
        else if (index === current)
          updateFileStatus(
            file.name,
            "inprogress",
            Math.min(95, (current / total) * 100)
          );
      });
    });

    if (response?.files) {
      validFiles.forEach((file) =>
        updateFileStatus(file.name, "completed", 100)
      );
      await extractBatchWithProgress(response.files, validFiles);
    }
  };

  const HandleDrop = async (files: File[], paths?: string[]) => {
    if (isPickerOpen) return;
    await handleFileDrop(files, paths);
  };

  const { isLoading, isDragging, dragProps } = useDragAndDrop(HandleDrop);

  const handleFolderClick = () => {
    setIsPickerOpen(true);
    folderInputRef.current?.click();
  };

  const handleFileClick = () => {
    setIsPickerOpen(true);
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPickerOpen(false);
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const paths = files.map((f) => (f as any).webkitRelativePath || f.name);
      handleFileDrop(files, paths);
    }
    e.target.value = "";
  };

  return (
    <>
      <div>
        <div
          {...dragProps}
          className={cn(
            "border-dashed border-2 max-sm:w-[310px] rounded-xl p-8 flex flex-col items-center justify-center h-50 w-full relative transition-all duration-300 transform",
            isDragging
              ? "border-blue-900 bg-blue-100 shadow-[0_0_0_4px_rgba(37,99,235,0.4)] scale-[1.02]"
              : "border-blue-400 bg-blue-50 scale-100"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-12 h-12 mb-2 text-primary animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mb-2 text-primary" />
          )}

          <div className="text-center mb-2">
            {isLoading ? (
              <span>Processing files...</span>
            ) : (
              <>
                Drag and drop files, or
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-primary font-medium hover:underline focus:outline-none px-1">
                    Select for Upload
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-white rounded-md">
                    {!disableFolderUpload && (
                      <DropdownMenuItem
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={handleFolderClick}
                      >
                        Upload Folder
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={handleFileClick}
                    >
                      Upload File
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={handleGoogleSignIn}
                    >
                      Upload from Drive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
          {!disableFolderUpload && (
            <input
              type="file"
              ref={folderInputRef}
              className="hidden"
              multiple
              webkitdirectory=""
              accept={ALLOWED_FILE_TYPES.join(",")}
              onChange={handleFileInputChange}
              title="Upload Folder"
            />
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept={ALLOWED_FILE_TYPES.join(",")}
            onChange={handleFileInputChange}
            title="Upload File"
          />
          <p className="text-gray-500 text-sm text-center">
            .pdf, .txt, .docx, .png, .jpg, .jpeg
          </p>
        </div>
      </div>
      <ErrorDialog
        open={isErrorOpen}
        message={errorMessage}
        onClose={() => setIsErrorOpen(false)}
      />
    </>
  );
}

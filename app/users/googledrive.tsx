"use client";

import { useState } from "react";
import GoogleDrivePicker from "../components/GoogleDrivePicker";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export default function GoogleDrivePage() {
  const [selectedFiles, setSelectedFiles] = useState<DriveFile[]>([]);

  const handleFileSelect = (files: DriveFile[]) => {
    console.log("Selected files:", files);
    setSelectedFiles(files);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload from Google Drive</h1>
      <GoogleDrivePicker/>

      {selectedFiles.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Selected Files</h2>
          <ul className="mt-2 space-y-2">
            {selectedFiles.map((file) => (
              <li key={file.id} className="border rounded p-2">
                {file.name} ({file.mimeType})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

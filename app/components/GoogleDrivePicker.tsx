"use client"; // important in Next.js 13 app directory

import React, { useState } from "react";
import useDrivePicker from "react-google-drive-picker";

interface FileObject {
  id: string;
  name: string;
  mimeType: string;
  url: string;
}

const CLIENT_ID =
  "668276778263-arhdpmcuvtcvt3trg2m4v6dgp19hnupq.apps.googleusercontent.com";
const DEVELOPER_KEY = "AIzaSyCqqGS8xazXigUbv1GKTU5kzH8OwZbIAYU";

const GoogleDrivePicker: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileObject[]>([]);
  const [openPicker] = useDrivePicker();

  const handleOpenPicker = () => {
    if (!openPicker) return;

    openPicker({
      clientId: CLIENT_ID,
      developerKey: DEVELOPER_KEY,
      viewId: "DOCS",
      showUploadView: true,
      showUploadFolders: true,
      supportDrives: true,
      multiselect: true,
      callbackFunction: (data) => {
        if (data.action === "cancel") {
          console.log("User clicked cancel/close button");
        } else if (data.docs) {
          console.log("Selected files:", data.docs);
          setSelectedFiles(data.docs);
        }
      },
    });
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <button onClick={handleOpenPicker} style={{ marginBottom: "20px" }}>
        Open Picker
      </button>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {selectedFiles.map((file, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              width: "200px",
              textAlign: "left",
            }}
          >
            <h4 style={{ fontSize: "14px", marginBottom: "10px" }}>
              {file.name}
            </h4>
            <p style={{ fontSize: "12px", marginBottom: "10px" }}>
              <strong>Type:</strong> {file.mimeType}
            </p>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              Open File
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoogleDrivePicker;

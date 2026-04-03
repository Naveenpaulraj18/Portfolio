"use client";

import GoogleDrivePicker from "../components/GoogleDrivePicker";


export default function GoogleDrivePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Upload from Google Drive</h1>
      <GoogleDrivePicker/>
    </div>
  );
}

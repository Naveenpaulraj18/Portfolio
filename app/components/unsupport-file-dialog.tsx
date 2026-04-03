interface ErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function ErrorDialog({ open, message, onClose }: ErrorDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        <p className="text-sm text-gray-700 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white rounded px-4 py-2 text-sm hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

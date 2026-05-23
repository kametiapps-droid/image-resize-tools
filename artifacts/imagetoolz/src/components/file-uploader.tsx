import { useState, useCallback, useRef } from "react";
import { UploadCloud, Plus } from "lucide-react";

export function FileUploader({
  onUpload,
  accept = "image/*",
  multiple = false,
  label = "Upload your image",
  formats = ["JPG", "PNG", "WEBP", "GIF"],
}: {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  label?: string;
  formats?: string[];
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onUpload(multiple ? Array.from(e.dataTransfer.files) : [e.dataTransfer.files[0]]);
      }
    },
    [onUpload, multiple]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(multiple ? Array.from(e.target.files) : [e.target.files[0]]);
      }
    },
    [onUpload, multiple]
  );

  return (
    <div
      data-testid="file-uploader-zone"
      className={`relative rounded-2xl cursor-pointer transition-all duration-200 ${isDragging ? "scale-[1.01]" : ""}`}
      style={{
        background: isDragging ? "linear-gradient(135deg, #f0fdf4, #dcfce7)" : "white",
        border: isDragging ? "2px dashed #16a34a" : "2px dashed #d1d5db",
        boxShadow: isDragging
          ? "0 0 0 4px rgba(22,163,74,0.12), 0 8px 30px rgba(0,0,0,0.08)"
          : "0 4px 20px rgba(0,0,0,0.06)",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        data-testid="file-input"
      />

      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-all"
          style={{
            background: isDragging
              ? "linear-gradient(135deg, #16a34a, #22c55e)"
              : "linear-gradient(135deg, #f0fdf4, #dcfce7)",
          }}
        >
          <UploadCloud
            className="w-9 h-9 transition-colors"
            style={{ color: isDragging ? "white" : "#16a34a" }}
          />
        </div>

        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {isDragging ? "Drop to upload" : label}
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 max-w-xs leading-relaxed">
          Drag &amp; drop {multiple ? "files" : "a file"} here, or click to browse.
          <br />
          <span className="text-green-600 dark:text-green-400 font-medium">Files never leave your device.</span>
        </p>

        <button
          data-testid="button-select-file"
          type="button"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #15803d, #16a34a)",
            boxShadow: "0 4px 14px rgba(22,163,74,0.4)",
          }}
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          <Plus className="w-4 h-4" />
          Select {multiple ? "Files" : "File"}
        </button>

        <div className="flex items-center gap-2 mt-6">
          {formats.map((fmt) => (
            <span key={fmt} className="px-2.5 py-1 rounded-md text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800">
              {fmt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useCallback, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUploader({
  onUpload,
  accept = "image/*",
  multiple = false,
}: {
  onUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
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
        const files = Array.from(e.dataTransfer.files);
        onUpload(multiple ? files : [files[0]]);
      }
    },
    [onUpload, multiple]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        onUpload(multiple ? files : [files[0]]);
      }
    },
    [onUpload, multiple]
  );

  return (
    <div
      data-testid="file-uploader-zone"
      className={`rounded-2xl border-2 border-dashed p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
        isDragging
          ? "border-primary bg-blue-50"
          : "border-border bg-white hover:border-primary hover:bg-blue-50/40"
      }`}
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
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-5 transition-colors ${isDragging ? "bg-primary text-white" : "bg-blue-50 text-primary"}`}>
        <UploadCloud className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {multiple ? "Upload your images" : "Upload your image"}
      </h3>
      <p className="text-sm text-muted-foreground mb-5 max-w-xs">
        Drag & drop {multiple ? "files" : "a file"} here, or click to select.{" "}
        <span className="text-primary font-medium">Your files never leave your device.</span>
      </p>
      <Button
        variant="default"
        data-testid="button-select-file"
        onClick={(e) => {
          e.stopPropagation();
          inputRef.current?.click();
        }}
      >
        Select {multiple ? "Files" : "File"}
      </Button>
    </div>
  );
}

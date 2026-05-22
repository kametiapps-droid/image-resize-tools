import { useState, useCallback, useRef } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FileUploader({ 
  onUpload, 
  accept = "image/*", 
  multiple = false 
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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      onUpload(multiple ? files : [files[0]]);
    }
  }, [onUpload, multiple]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      onUpload(multiple ? files : [files[0]]);
    }
  }, [onUpload, multiple]);

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-accent/50'
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
      />
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
        <UploadCloud className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Upload your image</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Drag and drop your file here, or click to browse. Files are processed locally and never sent to a server.
      </p>
      <Button variant="secondary">Select File</Button>
    </div>
  );
}

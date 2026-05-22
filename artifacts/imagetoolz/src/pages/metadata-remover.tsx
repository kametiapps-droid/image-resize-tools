import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, ShieldCheck } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function MetadataRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [cleanFile, setCleanFile] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    processImage(selected);
  };

  const processImage = async (inputFile: File) => {
    setIsProcessing(true);
    
    // To remove EXIF without losing quality or relying on complex parser,
    // draw to canvas and export back. EXIF data is dropped when drawing to canvas.
    const url = URL.createObjectURL(inputFile);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setCleanFile(blob);
            recordUse.mutate({ id: "metadata-remover", data: { fileType: inputFile.type, fileSizeKb: Math.round(blob.size / 1024) } });
            toast({ title: "Success", description: "Metadata removed successfully." });
          }
          setIsProcessing(false);
        }, inputFile.type, 1.0);
      }
    };
    img.src = url;
  };

  const downloadImage = () => {
    if (!cleanFile || !file) return;
    const url = URL.createObjectURL(cleanFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clean-${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout toolId="metadata-remover" title="Metadata Remover" description="Strip EXIF data from images for privacy before sharing.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center bg-muted/20 min-h-[400px] text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Image Sanitized</h3>
                  <p className="text-muted-foreground max-w-md">
                    All hidden EXIF data including GPS location, camera model, and dates have been removed from this file.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Original size:</span>
                    <span>{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                  {cleanFile && (
                    <div className="text-sm font-medium text-foreground flex justify-between pt-2 border-t">
                      <span>Clean size:</span>
                      <span>{(cleanFile.size / 1024).toFixed(2)} KB</span>
                    </div>
                  )}
                </div>

                <Button className="w-full" size="lg" onClick={downloadImage} disabled={isProcessing || !cleanFile}>
                  <Download className="w-4 h-4 mr-2" /> {isProcessing ? "Cleaning..." : "Download Clean Image"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setCleanFile(null); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Process Another
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

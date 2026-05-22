import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setCompressedFile(null);
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const options = {
        maxSizeMB: file.size / 1024 / 1024 * quality,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
      };
      
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);

      recordUse.mutate({
        params: { id: "image-compressor" },
        data: {
          fileType: file.type,
          fileSizeKb: Math.round(compressed.size / 1024),
        },
      });
      
      toast({ title: "Success", description: "Image compressed successfully." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to compress image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${compressedFile.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout toolId="image-compressor" title="Image Compressor" description="Compress images to reduce file size without significant quality loss.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[400px]">
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain shadow-sm border border-border rounded-md" />
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Quality: {Math.round(quality * 100)}%</Label>
                  </div>
                  <Slider value={[quality * 100]} max={100} min={10} step={1} onValueChange={(v) => setQuality(v[0] / 100)} />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Original Size: {(file.size / 1024).toFixed(2)} KB</div>
                  {compressedFile && (
                    <div className="text-sm font-bold text-primary">Compressed Size: {(compressedFile.size / 1024).toFixed(2)} KB</div>
                  )}
                </div>

                <Button className="w-full" size="lg" onClick={compressedFile ? handleDownload : processImage} disabled={isProcessing}>
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : compressedFile ? "Download Compressed Image" : "Compress Image"}
                </Button>

                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setPreviewUrl(null); setCompressedFile(null); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

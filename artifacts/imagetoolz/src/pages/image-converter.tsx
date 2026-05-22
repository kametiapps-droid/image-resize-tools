import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageConverter() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState("image/png");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => { imageRef.current = img; };
    img.src = url;
  };

  const processImage = () => {
    if (!imageRef.current || !canvasRef.current || !file) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = imageRef.current.width;
    canvas.height = imageRef.current.height;
    ctx.drawImage(imageRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format.split("/")[1];
      a.download = `converted-${file.name.split(".")[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Image converted successfully." });
      recordUse.mutate({ id: "3", data: { fileType: format, fileSizeKb: Math.round(blob.size / 1024) } });
      setIsProcessing(false);
    }, format, 0.9);
  };

  return (
    <ToolLayout toolId="image-converter" title="Image Converter" description="Convert images between PNG, JPEG, WEBP, and more.">
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
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger><SelectValue placeholder="Select format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/jpeg">JPEG (.jpg)</SelectItem>
                      <SelectItem value="image/png">PNG (.png)</SelectItem>
                      <SelectItem value="image/webp">WEBP (.webp)</SelectItem>
                      <SelectItem value="image/gif">GIF (.gif)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" size="lg" onClick={processImage} disabled={isProcessing}>
                  <Download className="w-4 h-4 mr-2" /> {isProcessing ? "Processing..." : "Convert & Download"}
                </Button>

                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setPreviewUrl(null); }}>
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

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainRatio, setMaintainRatio] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [aspectRatio, setAspectRatio] = useState(1);
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
    img.onload = () => {
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
      imageRef.current = img;
    };
    img.src = url;
  };

  const handleWidthChange = (val: string) => {
    const num = parseInt(val) || 0;
    setWidth(num);
    if (maintainRatio && aspectRatio) {
      setHeight(Math.round(num / aspectRatio));
    }
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val) || 0;
    setHeight(num);
    if (maintainRatio && aspectRatio) {
      setWidth(Math.round(num * aspectRatio));
    }
  };

  const processImage = () => {
    if (!imageRef.current || !canvasRef.current || !file) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(imageRef.current, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = format.split("/")[1];
      a.download = `resized-${file.name.split(".")[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Image resized successfully.",
      });

      recordUse.mutate({
        id: "1", // using dummy id if needed or map to slug
        data: {
          fileType: file.type,
          fileSizeKb: Math.round(file.size / 1024)
        }
      });
      setIsProcessing(false);
    }, format, 0.9);
  };

  return (
    <ToolLayout 
      toolId="image-resizer" 
      title="Image Resizer" 
      description="Change the dimensions of your image quickly without losing quality."
    >
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[400px]">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-w-full max-h-[500px] object-contain shadow-sm border border-border rounded-md"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Dimensions</Label>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="maintain-ratio" 
                        checked={maintainRatio} 
                        onCheckedChange={setMaintainRatio} 
                      />
                      <Label htmlFor="maintain-ratio" className="text-xs text-muted-foreground">Maintain Ratio</Label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width (px)</Label>
                      <Input 
                        type="number" 
                        value={width || ""} 
                        onChange={(e) => handleWidthChange(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (px)</Label>
                      <Input 
                        type="number" 
                        value={height || ""} 
                        onChange={(e) => handleHeightChange(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/jpeg">JPEG</SelectItem>
                      <SelectItem value="image/png">PNG</SelectItem>
                      <SelectItem value="image/webp">WEBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={processImage}
                  disabled={isProcessing || !width || !height}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Download Resized Image"}
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

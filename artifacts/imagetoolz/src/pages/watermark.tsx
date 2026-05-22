import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function Watermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("Watermark");
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(48);
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

    const img = new Image();
    img.onload = () => { 
      imageRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        drawCanvas();
      }
    };
    img.src = url;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.globalAlpha = opacity;
    ctx.fillStyle = "white";
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Add black stroke for visibility
    ctx.lineWidth = Math.max(1, fontSize / 20);
    ctx.strokeStyle = "black";
    
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    ctx.globalAlpha = 1.0;
  };

  useEffect(() => {
    if (file) drawCanvas();
  }, [text, opacity, fontSize, file]);

  const processImage = () => {
    if (!canvasRef.current || !file) return;
    setIsProcessing(true);

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watermarked-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Watermarked image downloaded." });
      recordUse.mutate({ id: "watermark", data: { fileType: file.type, fileSizeKb: Math.round(blob.size / 1024) } });
      setIsProcessing(false);
    }, file.type, 0.9);
  };

  return (
    <ToolLayout toolId="watermark" title="Add Watermark" description="Protect your images by adding text watermarks.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[400px]">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full max-h-[500px] object-contain shadow-sm border border-border rounded-md"
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input value={text} onChange={(e) => setText(e.target.value)} />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Font Size: {fontSize}px</Label>
                  </div>
                  <Slider value={[fontSize]} max={200} min={12} step={1} onValueChange={(v) => setFontSize(v[0])} />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                  </div>
                  <Slider value={[opacity * 100]} max={100} min={0} step={1} onValueChange={(v) => setOpacity(v[0] / 100)} />
                </div>

                <Button className="w-full" size="lg" onClick={processImage} disabled={isProcessing || !text}>
                  <Download className="w-4 h-4 mr-2" /> Download Image
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setFile(null); }}>
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

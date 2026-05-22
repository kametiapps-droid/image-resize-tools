import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageRotator() {
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
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
      drawCanvas();
    };
    img.src = url;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rad = (rotation * Math.PI) / 180;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    
    const w = img.width;
    const h = img.height;

    // Calculate new bounds
    const newW = Math.abs(w * cos) + Math.abs(h * sin);
    const newH = Math.abs(w * sin) + Math.abs(h * cos);
    
    canvas.width = newW;
    canvas.height = newH;

    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
  };

  useEffect(() => {
    if (file) drawCanvas();
  }, [rotation, flipH, flipV, file]);

  const processImage = () => {
    if (!canvasRef.current || !file) return;

    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rotated-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({ title: "Success", description: "Image rotated successfully." });
      recordUse.mutate({ id: "image-rotator", data: { fileType: file.type, fileSizeKb: Math.round(blob.size / 1024) } });
    }, file.type, 0.9);
  };

  return (
    <ToolLayout toolId="image-rotator" title="Image Rotator" description="Rotate and flip your images perfectly.">
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
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => setRotation(r => (r - 90) % 360)}>
                    <RotateCcw className="w-4 h-4 mr-2" /> Left 90°
                  </Button>
                  <Button variant="outline" onClick={() => setRotation(r => (r + 90) % 360)}>
                    <RotateCw className="w-4 h-4 mr-2" /> Right 90°
                  </Button>
                  <Button variant="outline" onClick={() => setFlipH(f => !f)} className={flipH ? "bg-primary/10" : ""}>
                    <FlipHorizontal className="w-4 h-4 mr-2" /> Flip H
                  </Button>
                  <Button variant="outline" onClick={() => setFlipV(f => !f)} className={flipV ? "bg-primary/10" : ""}>
                    <FlipVertical className="w-4 h-4 mr-2" /> Flip V
                  </Button>
                </div>

                <Button className="w-full" size="lg" onClick={processImage}>
                  <Download className="w-4 h-4 mr-2" /> Download Image
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setRotation(0); setFlipH(false); setFlipV(false); }}>
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

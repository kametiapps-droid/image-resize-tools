import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Copy } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function ColorPicker() {
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState<{ hex: string, rgb: string, hsl: string } | null>(null);
  
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
      recordUse.mutate({ id: "color-picker", data: { fileType: selected.type, fileSizeKb: Math.round(selected.size / 1024) } });
    };
    img.src = url;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
  };

  const handleCanvasClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const p = ctx.getImageData(x, y, 1, 1).data;
    const hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6);
    const rgb = `rgb(${p[0]}, ${p[1]}, ${p[2]})`;
    
    // Quick HSL conversion
    const r = p[0] / 255;
    const g = p[1] / 255;
    const b = p[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;

    setColor({ hex, rgb, hsl });
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${text} copied to clipboard.` });
  };

  return (
    <ToolLayout toolId="color-picker" title="Color Picker" description="Extract accurate colors from any image.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[400px]">
                <p className="text-sm text-muted-foreground mb-4">Click anywhere on the image to pick a color.</p>
                <canvas 
                  ref={canvasRef} 
                  onClick={handleCanvasClick}
                  className="max-w-full max-h-[500px] object-contain shadow-sm border border-border rounded-md cursor-crosshair"
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="h-32 rounded-lg border flex items-center justify-center transition-colors" style={{ backgroundColor: color?.hex || 'transparent' }}>
                  {!color && <span className="text-muted-foreground text-sm font-medium">Select a color</span>}
                </div>
                
                {color && (
                  <div className="space-y-3">
                    {[
                      { label: 'HEX', val: color.hex.toUpperCase() },
                      { label: 'RGB', val: color.rgb },
                      { label: 'HSL', val: color.hsl }
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-3 bg-muted rounded-md border">
                        <span className="text-xs font-bold text-muted-foreground w-12">{item.label}</span>
                        <span className="text-sm font-mono flex-1 text-center">{item.val}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(item.val)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setColor(null); }}>
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

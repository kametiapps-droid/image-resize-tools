import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const positions = [
  { value: "center", label: "Center" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

export default function Watermark() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("© ImageToolz");
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [position, setPosition] = useState("center");
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

  const getTextPosition = (canvas: HTMLCanvasElement, textWidth: number, textHeight: number) => {
    const pad = 20;
    switch (position) {
      case "top-left": return { x: pad + textWidth / 2, y: pad + textHeight };
      case "top-right": return { x: canvas.width - pad - textWidth / 2, y: pad + textHeight };
      case "bottom-left": return { x: pad + textWidth / 2, y: canvas.height - pad };
      case "bottom-right": return { x: canvas.width - pad - textWidth / 2, y: canvas.height - pad };
      default: return { x: canvas.width / 2, y: canvas.height / 2 };
    }
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
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const metrics = ctx.measureText(text);
    const { x, y } = getTextPosition(canvas, metrics.width, fontSize);
    ctx.lineWidth = Math.max(1, fontSize / 25);
    ctx.strokeStyle = color === "#ffffff" ? "#000000" : "#ffffff";
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1.0;
  };

  useEffect(() => {
    if (file) drawCanvas();
  }, [text, opacity, fontSize, color, position, file]);

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
      recordUse.mutate({ params: { id: "watermark" }, data: { fileType: file.type, fileSizeKb: Math.round(blob.size / 1024) } });
      setIsProcessing(false);
    }, file.type, 0.92);
  };

  return (
    <ToolLayout toolId="watermark" title="Add Watermark" description="Protect your images with custom text watermarks — adjust position, opacity, and style.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[400px]">
                <canvas ref={canvasRef} className="max-w-full max-h-[500px] object-contain shadow-sm border border-border rounded-md" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label>Watermark Text</Label>
                  <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Your text here" />
                </div>

                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={position} onValueChange={setPosition}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {positions.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-200" />
                    <span className="text-sm text-muted-foreground font-mono">{color.toUpperCase()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {fontSize}px</Label>
                  <Slider value={[fontSize]} max={200} min={12} step={1} onValueChange={(v) => setFontSize(v[0])} />
                </div>

                <div className="space-y-2">
                  <Label>Opacity: {Math.round(opacity * 100)}%</Label>
                  <Slider value={[opacity * 100]} max={100} min={5} step={1} onValueChange={(v) => setOpacity(v[0] / 100)} />
                </div>

                <Button className="w-full" size="lg" onClick={processImage} disabled={isProcessing || !text}>
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Download Watermarked Image"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setFile(null); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Article Guide */}
      <div className="mt-14 border-t border-gray-200 pt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Add a Watermark to Photos — Complete Guide</h2>
          <p className="text-gray-500 text-sm mb-8">Learn why watermarks matter, how to place them effectively, and best practices for photographers and businesses.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Add a Watermark?</h3>
              <p className="text-gray-600 leading-relaxed">
                Watermarks are a simple and effective way to protect your creative work when sharing images online. Whether you're a photographer, designer, content creator, or business, adding a watermark helps establish ownership, discourages unauthorized use, and keeps your brand visible when images are shared across the web.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                While watermarks don't make copying technically impossible, they serve as a clear copyright declaration and make it significantly harder to present your work as someone else's.
              </p>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Watermark Placement Best Practices</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Center placement", d: "Most difficult to remove. Ideal for portfolio previews where you want to discourage theft." },
                  { t: "Bottom corners", d: "Less intrusive for product or social media images. Easy to read while preserving composition." },
                  { t: "Diagonal / full coverage", d: "Maximum protection. Best for images you want viewers to see but not use." },
                  { t: "Over key details", d: "Place over the most unique or valuable part of the image for maximum protection." },
                ].map((item) => (
                  <div key={item.t} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.t}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Opacity Guide</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Opacity</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Visibility</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["80–100%", "Very visible", "Portfolio previews, proof-of-concept images"],
                      ["50–70%", "Moderately visible", "Social media, balanced protection"],
                      ["20–40%", "Subtle", "Product photos, editorial images"],
                      ["10–20%", "Very subtle", "Brand reinforcement without distraction"],
                    ].map(([o, v, u], i) => (
                      <tr key={i} className={`border border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2 font-mono text-gray-700 border-r border-gray-200">{o}</td>
                        <td className="px-4 py-2 text-gray-600 border-r border-gray-200">{v}</td>
                        <td className="px-4 py-2 text-gray-500">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Pro Watermark Tips</h3>
              <ul className="space-y-2.5">
                {[
                  "Include your website URL or @handle as the watermark",
                  "Use white text with dark stroke for universal visibility",
                  "Keep opacity at 40–60% for a professional balance",
                  "Use consistent watermarks across all your images",
                  "Place watermarks before sharing — not after",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">FAQs</h3>
              <div className="space-y-4">
                {[
                  { q: "Can I use emojis or symbols in the watermark?", a: "Yes, any Unicode text is supported including ©, ®, ™, and emoji." },
                  { q: "Is the watermark permanent?", a: "Yes — it's baked into the image pixels. Someone with editing software could potentially remove it, but it provides clear copyright declaration." },
                  { q: "Does watermarking affect image quality?", a: "No. The watermark is added directly to the canvas at full quality and the image is exported at 92% JPEG quality." },
                ].map((faq, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-800">{faq.q}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, CheckCircle2, Move } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function ImageCropper() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 200, h: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      const initW = Math.round(img.width * 0.6);
      const initH = Math.round(img.height * 0.6);
      const initX = Math.round((img.width - initW) / 2);
      const initY = Math.round((img.height - initH) / 2);
      setCropBox({ x: initX, y: initY, w: initW, h: initH });
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
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
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.drawImage(img, cropBox.x, cropBox.y, cropBox.w, cropBox.h, cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    // Corner handles
    const handleSize = 8;
    ctx.fillStyle = "#3b82f6";
    [[cropBox.x, cropBox.y], [cropBox.x + cropBox.w, cropBox.y], [cropBox.x, cropBox.y + cropBox.h], [cropBox.x + cropBox.w, cropBox.y + cropBox.h]].forEach(([hx, hy]) => {
      ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
    });
  };

  useEffect(() => {
    if (file) drawCanvas();
  }, [cropBox, file]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasCoords(e);
    if (x >= cropBox.x && x <= cropBox.x + cropBox.w && y >= cropBox.y && y <= cropBox.y + cropBox.h) {
      setIsDragging(true);
      setDragStart({ x: x - cropBox.x, y: y - cropBox.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getCanvasCoords(e);
    setCropBox(prev => ({
      ...prev,
      x: Math.max(0, Math.min(canvas.width - prev.w, x - dragStart.x)),
      y: Math.max(0, Math.min(canvas.height - prev.h, y - dragStart.y)),
    }));
  };

  const handleMouseUp = () => setIsDragging(false);

  const processImage = () => {
    if (!imageRef.current || !file) return;
    const outCanvas = document.createElement("canvas");
    outCanvas.width = cropBox.w;
    outCanvas.height = cropBox.h;
    const ctx = outCanvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(imageRef.current, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cropBox.w, cropBox.h);
    outCanvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cropped-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Image cropped and downloaded." });
      recordUse.mutate({ params: { id: "image-cropper" }, data: { fileType: file.type, fileSizeKb: Math.round(blob.size / 1024) } });
    }, file.type, 0.92);
  };

  return (
    <ToolLayout toolId="image-cropper" title="Image Cropper" description="Visually crop any part of your image with an interactive drag-and-drop crop tool.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[400px]">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <Move className="w-4 h-4" />
                  Drag the highlighted area to move the crop region
                </div>
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[500px] object-contain shadow-sm border border-border rounded-md cursor-move"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Crop Region</Label>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <Label className="text-xs text-muted-foreground">X (px)</Label>
                      <Input type="number" value={Math.round(cropBox.x)} onChange={(e) => setCropBox(p => ({ ...p, x: parseInt(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Y (px)</Label>
                      <Input type="number" value={Math.round(cropBox.y)} onChange={(e) => setCropBox(p => ({ ...p, y: parseInt(e.target.value) || 0 }))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Width (px)</Label>
                      <Input type="number" value={Math.round(cropBox.w)} onChange={(e) => setCropBox(p => ({ ...p, w: parseInt(e.target.value) || 1 }))} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Height (px)</Label>
                      <Input type="number" value={Math.round(cropBox.h)} onChange={(e) => setCropBox(p => ({ ...p, h: parseInt(e.target.value) || 1 }))} className="mt-1" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Output: {Math.round(cropBox.w)} × {Math.round(cropBox.h)} px</p>
                </div>
                <Button className="w-full" size="lg" onClick={processImage}>
                  <Download className="w-4 h-4 mr-2" /> Download Cropped Image
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setPreviewUrl(null); }}>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Crop Images Online — Complete Guide</h2>
          <p className="text-gray-500 text-sm mb-8">Learn professional image cropping techniques, aspect ratios for social media, and composition tips.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What Is Image Cropping?</h3>
              <p className="text-gray-600 leading-relaxed">
                Cropping removes the outer parts of an image to improve framing, focus on a subject, or resize to a specific aspect ratio. Unlike resizing, cropping changes the composition of an image by cutting away areas — not by scaling pixels.
              </p>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Use This Cropper</h3>
              <ol className="space-y-3">
                {[
                  { n: "1", t: "Upload your image", d: "Drag and drop or click to select a JPEG, PNG, WEBP, or GIF file." },
                  { n: "2", t: "Drag the crop box", d: "The blue highlighted region is your crop area. Click and drag it over the area you want to keep." },
                  { n: "3", t: "Fine-tune with numbers", d: "Enter exact pixel values for X position, Y position, width, and height for precision cropping." },
                  { n: "4", t: "Download the result", d: "Click 'Download Cropped Image' to save the cropped result to your device." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{step.n}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{step.t}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ideal Crop Dimensions by Platform</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Platform</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Dimensions</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Instagram Square Post", "1080 × 1080 px", "1:1"],
                      ["Instagram Portrait", "1080 × 1350 px", "4:5"],
                      ["Instagram Story / Reel", "1080 × 1920 px", "9:16"],
                      ["Twitter Post", "1200 × 675 px", "16:9"],
                      ["Facebook Post", "1200 × 630 px", "1.91:1"],
                      ["LinkedIn Post", "1200 × 627 px", "1.91:1"],
                      ["YouTube Thumbnail", "1280 × 720 px", "16:9"],
                      ["Pinterest Pin", "1000 × 1500 px", "2:3"],
                    ].map(([p, d, r], i) => (
                      <tr key={i} className={`border border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2 text-gray-700 border-r border-gray-200">{p}</td>
                        <td className="px-4 py-2 font-mono text-gray-600 border-r border-gray-200">{d}</td>
                        <td className="px-4 py-2 text-gray-500">{r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Pro Cropping Tips</h3>
              <ul className="space-y-2.5">
                {[
                  "Use the Rule of Thirds — place subjects off-center",
                  "Always crop at or above your target resolution",
                  "Crop portraits to head-and-shoulders for social profiles",
                  "For products: leave breathing room around the subject",
                  "Avoid cropping through joints (wrists, ankles, knees)",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">FAQs</h3>
              <div className="space-y-4">
                {[
                  { q: "Does cropping reduce quality?", a: "No. Cropping only removes pixels — it doesn't change the resolution or quality of the remaining area." },
                  { q: "Can I undo a crop?", a: "Click 'Start Over' to re-upload your original image and crop again." },
                  { q: "Why is my crop box small?", a: "The crop box is sized relative to your image. Drag it larger or enter values in the input fields." },
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

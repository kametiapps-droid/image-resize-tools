import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, CheckCircle2 } from "lucide-react";
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
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const w = img.width;
    const h = img.height;
    const newW = Math.round(w * cos + h * sin);
    const newH = Math.round(w * sin + h * cos);
    canvas.width = newW;
    canvas.height = newH;
    ctx.clearRect(0, 0, newW, newH);
    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
      toast({ title: "Success", description: "Image downloaded." });
      recordUse.mutate({ params: { id: "image-rotator" }, data: { fileType: file.type, fileSizeKb: Math.round(blob.size / 1024) } });
    }, file.type, 0.92);
  };

  return (
    <ToolLayout toolId="image-rotator" title="Rotate & Flip Image" description="Rotate your image to any angle and flip horizontally or vertically with one click.">
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
              <CardContent className="p-6 space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Quick Rotate</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setRotation(r => ((r - 90) % 360 + 360) % 360)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> 90° Left
                    </Button>
                    <Button variant="outline" onClick={() => setRotation(r => (r + 90) % 360)}>
                      <RotateCw className="w-4 h-4 mr-2" /> 90° Right
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Custom Angle: {rotation}°</Label>
                  <Slider value={[rotation]} min={0} max={359} step={1} onValueChange={(v) => setRotation(v[0])} />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-semibold">Flip</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => setFlipH(f => !f)} className={flipH ? "bg-blue-50 border-blue-300 text-blue-700" : ""}>
                      <FlipHorizontal className="w-4 h-4 mr-2" /> Horizontal
                    </Button>
                    <Button variant="outline" onClick={() => setFlipV(f => !f)} className={flipV ? "bg-blue-50 border-blue-300 text-blue-700" : ""}>
                      <FlipVertical className="w-4 h-4 mr-2" /> Vertical
                    </Button>
                  </div>
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

      {/* Article Guide */}
      <div className="mt-14 border-t border-gray-200 pt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Rotate & Flip Images Online</h2>
          <p className="text-gray-500 text-sm mb-8">Fix photo orientation, create mirror effects, and straighten images with this free browser-based tool.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Rotate or Flip an Image?</h3>
              <p className="text-gray-600 leading-relaxed">
                Modern smartphones and cameras embed orientation metadata (EXIF data) that tells software how to display a photo. When you share images across platforms, this metadata is often stripped, leaving images sideways or upside down. Rotating fixes the actual pixel data, not just metadata — so the corrected image displays correctly everywhere.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                Flipping is useful for creating mirror effects, correcting selfie camera inversions, and design use cases where a mirrored version improves composition.
              </p>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Rotation Use Cases</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Fix phone photo orientation", d: "Photos taken in portrait on some devices come out sideways. Rotate 90° right or left to fix." },
                  { t: "Straighten a crooked horizon", d: "Use custom angle (e.g., 2–5°) to straighten slightly tilted landscape photos." },
                  { t: "Create mirror images", d: "Flip horizontally to create a mirrored version for design or creative use." },
                  { t: "Flip for text in design", d: "Flip watermarked or text-heavy images for background use without distracting text." },
                ].map((item) => (
                  <div key={item.t} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.t}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Rotation Tips</h3>
              <ul className="space-y-2.5">
                {[
                  "90° increments are lossless — no quality change",
                  "Custom angles may add white borders — crop after",
                  "For scanned documents, use 1–3° to deskew",
                  "Flip Horizontal = mirror effect",
                  "Flip Vertical = upside-down effect",
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
                  { q: "Does rotating change the file size?", a: "Slightly — the canvas is re-drawn and exported. For 90° rotations the change is minimal." },
                  { q: "What happens at non-90° angles?", a: "The canvas expands to fit the rotated image, which may add transparent/white borders." },
                  { q: "Can I combine rotation and flip?", a: "Yes — apply both and click Download. The tool applies them simultaneously." },
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

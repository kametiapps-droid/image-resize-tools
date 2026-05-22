import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react";
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
    if (maintainRatio && aspectRatio) setHeight(Math.round(num / aspectRatio));
  };

  const handleHeightChange = (val: string) => {
    const num = parseInt(val) || 0;
    setHeight(num);
    if (maintainRatio && aspectRatio) setWidth(Math.round(num * aspectRatio));
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
      toast({ title: "Success", description: "Image resized and downloaded." });
      recordUse.mutate({ params: { id: "image-resizer" }, data: { fileType: file.type, fileSizeKb: Math.round(file.size / 1024) } });
      setIsProcessing(false);
    }, format, 0.9);
  };

  return (
    <ToolLayout toolId="image-resizer" title="Image Resizer" description="Change the dimensions of your image instantly — no quality loss, no upload required." badge="Most Popular">
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
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Dimensions</Label>
                    <div className="flex items-center space-x-2">
                      <Switch id="maintain-ratio" checked={maintainRatio} onCheckedChange={setMaintainRatio} />
                      <Label htmlFor="maintain-ratio" className="text-xs text-muted-foreground">Lock Ratio</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width (px)</Label>
                      <Input type="number" value={width || ""} onChange={(e) => handleWidthChange(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (px)</Label>
                      <Input type="number" value={height || ""} onChange={(e) => handleHeightChange(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="image/jpeg">JPEG</SelectItem>
                      <SelectItem value="image/png">PNG</SelectItem>
                      <SelectItem value="image/webp">WEBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" size="lg" onClick={processImage} disabled={isProcessing || !width || !height}>
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Processing..." : "Download Resized Image"}
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
      <div className="mt-14 space-y-10">
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Resize an Image Online — Complete Guide</h2>
          <p className="text-gray-500 text-sm mb-8">Learn everything about image resizing, dimensions, aspect ratios, and best practices for web, print, and social media.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <article className="prose prose-gray max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">What Is Image Resizing?</h3>
                <p className="text-gray-600 leading-relaxed">
                  Image resizing is the process of changing the pixel dimensions (width and height) of an image. Whether you need to shrink a large photo for email, scale up an image for a poster, or hit exact pixel requirements for a social media platform, resizing is one of the most common image editing tasks.
                </p>
                <p className="text-gray-600 leading-relaxed mt-3">
                  Our Image Resizer tool uses the browser's native Canvas API to redraw your image at the new dimensions. This means processing is instant, runs entirely on your device, and produces high-quality output — no server upload needed.
                </p>
              </article>

              <article>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step: How to Use the Image Resizer</h3>
                <ol className="space-y-3">
                  {[
                    { n: "1", t: "Upload your image", d: "Drag and drop a JPG, PNG, WEBP, or GIF file into the upload area, or click 'Select File' to browse." },
                    { n: "2", t: "Set your target dimensions", d: "Enter the width and height in pixels. Enable 'Lock Ratio' to automatically maintain the aspect ratio as you type." },
                    { n: "3", t: "Choose an output format", d: "Select JPEG for photos (smaller file), PNG for graphics with transparency, or WEBP for the best compression." },
                    { n: "4", t: "Download your resized image", d: "Click 'Download Resized Image'. The file is processed in your browser and saved directly to your device." },
                  ].map((step) => (
                    <li key={step.n} className="flex gap-4">
                      <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{step.n}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{step.t}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{step.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </article>

              <article>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Common Image Size Presets</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border border-gray-200">
                        <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Platform / Use Case</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Width × Height</th>
                        <th className="text-left px-4 py-2 font-semibold text-gray-700">Format</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        ["Instagram Post", "1080 × 1080 px", "JPEG"],
                        ["Twitter / X Header", "1500 × 500 px", "JPEG"],
                        ["Facebook Cover Photo", "851 × 315 px", "JPEG"],
                        ["LinkedIn Profile Photo", "400 × 400 px", "JPEG/PNG"],
                        ["YouTube Thumbnail", "1280 × 720 px", "JPEG"],
                        ["Standard HD Wallpaper", "1920 × 1080 px", "JPEG/PNG"],
                        ["Email Signature Image", "600 × 150 px", "PNG"],
                        ["Website Hero Banner", "1440 × 600 px", "WEBP"],
                      ].map(([name, size, fmt], i) => (
                        <tr key={i} className={`border border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                          <td className="px-4 py-2 text-gray-700 border-r border-gray-200">{name}</td>
                          <td className="px-4 py-2 font-mono text-gray-600 border-r border-gray-200">{size}</td>
                          <td className="px-4 py-2 text-gray-500">{fmt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>

              <article>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Aspect Ratios</h3>
                <p className="text-gray-600 leading-relaxed">
                  An aspect ratio is the proportional relationship between an image's width and height. For example, a 1920×1080 image has a 16:9 aspect ratio. When you resize an image and the "Lock Ratio" option is enabled, the tool automatically calculates the other dimension to maintain the original proportions — preventing distortion.
                </p>
                <p className="text-gray-600 leading-relaxed mt-3">
                  Common aspect ratios: <strong>1:1</strong> (square, Instagram), <strong>4:3</strong> (traditional photo), <strong>16:9</strong> (widescreen, YouTube, HD), <strong>9:16</strong> (vertical/portrait, Stories), <strong>3:2</strong> (DSLR photos).
                </p>
              </article>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Tips</h3>
                <ul className="space-y-2.5">
                  {[
                    "Always keep 'Lock Ratio' on to avoid stretching",
                    "Use WEBP for web — 30% smaller than JPEG",
                    "Use PNG for logos, screenshots, and images with text",
                    "Upscaling degrades quality — resize down, not up",
                    "For print: 300 DPI is standard (multiply inch × 300 for pixels)",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
                <div className="space-y-4">
                  {[
                    { q: "Does resizing reduce quality?", a: "Reducing size is lossless in PNG and near-lossless in JPEG. Enlarging always reduces sharpness." },
                    { q: "What's the maximum image size?", a: "There's no enforced limit — your browser's memory is the only constraint." },
                    { q: "Is my image uploaded anywhere?", a: "No. All processing is done in your browser. Your image never leaves your device." },
                    { q: "Can I resize animated GIFs?", a: "The Canvas API only captures the first frame of a GIF. For animated GIFs, use a dedicated GIF tool." },
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
      </div>
    </ToolLayout>
  );
}

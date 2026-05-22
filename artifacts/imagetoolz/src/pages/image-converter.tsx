import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const formats = [
  { value: "image/jpeg", label: "JPEG (.jpg)", desc: "Best for photos. Smaller file, slight quality loss." },
  { value: "image/png", label: "PNG (.png)", desc: "Lossless. Best for graphics, screenshots, transparency." },
  { value: "image/webp", label: "WEBP (.webp)", desc: "Best for web. Smaller than JPEG and PNG." },
  { value: "image/gif", label: "GIF (.gif)", desc: "256 colors only. Best for simple animations." },
];

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
      const ext = format === "image/jpeg" ? "jpg" : format.split("/")[1];
      a.download = `converted-${file.name.split(".")[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Success", description: "Image converted and downloaded." });
      recordUse.mutate({ params: { id: "image-converter" }, data: { fileType: format, fileSizeKb: Math.round(blob.size / 1024) } });
      setIsProcessing(false);
    }, format, 0.92);
  };

  const selectedFormat = formats.find((f) => f.value === format);

  return (
    <ToolLayout toolId="image-converter" title="Image Converter" description="Convert images between JPEG, PNG, WEBP, and GIF instantly in your browser.">
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
                  <Label className="text-base font-semibold">Output Format</Label>
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {formats.map((f) => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFormat && (
                    <p className="text-xs text-muted-foreground mt-1">{selectedFormat.desc}</p>
                  )}
                </div>

                <div className="p-3 bg-muted/30 rounded-lg text-sm space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Original format:</span>
                    <span className="font-medium text-foreground">{file.type.split("/")[1].toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>File size:</span>
                    <span className="font-medium text-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <Button className="w-full" size="lg" onClick={processImage} disabled={isProcessing}>
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Converting..." : "Convert & Download"}
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Format Conversion Guide — JPEG vs PNG vs WEBP vs GIF</h2>
          <p className="text-gray-500 text-sm mb-8">Understand when to use each image format and how to convert between them for optimal quality and file size.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Format Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Format</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Compression</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Transparency</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Best For</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["JPEG", "Lossy", "No", "Photos, social media, email"],
                      ["PNG", "Lossless", "Yes (alpha)", "Logos, UI graphics, screenshots"],
                      ["WEBP", "Lossy + Lossless", "Yes", "Web images — best overall compression"],
                      ["GIF", "Lossless (256 colors)", "Yes (1-bit)", "Simple animations, memes"],
                    ].map(([fmt, comp, trans, use], i) => (
                      <tr key={i} className={`border border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2 font-bold text-gray-900 border-r border-gray-200">{fmt}</td>
                        <td className="px-4 py-2 text-gray-600 border-r border-gray-200">{comp}</td>
                        <td className="px-4 py-2 text-gray-600 border-r border-gray-200">{trans}</td>
                        <td className="px-4 py-2 text-gray-500">{use}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">When to Convert to WEBP</h3>
              <p className="text-gray-600 leading-relaxed">
                WEBP is a modern image format developed by Google. It produces files that are <strong>25–35% smaller than JPEG</strong> at the same visual quality, and also supports transparency like PNG. If you're building a website, converting all images to WEBP is one of the fastest ways to improve load times and Core Web Vitals scores.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                Browser support for WEBP is now excellent — all major modern browsers (Chrome, Firefox, Safari, Edge) support it. For legacy compatibility, keep a JPEG fallback.
              </p>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">PNG to JPEG: When Should You Convert?</h3>
              <p className="text-gray-600 leading-relaxed">
                Convert PNG to JPEG when: (1) The image is a photograph with no transparency. (2) You need a smaller file size. PNG uses lossless compression which is great for graphics but inefficient for photos. A photo saved as PNG might be 5MB while the same photo as JPEG at 90% quality is only 500KB — with nearly invisible quality loss.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                <strong>Don't convert</strong> PNG to JPEG when your image has a transparent background (e.g., a logo) — JPEG doesn't support transparency and will fill it with white.
              </p>
            </article>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 border border-green-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Decision Guide</h3>
              <ul className="space-y-3">
                {[
                  { label: "Photo for web → WEBP or JPEG" },
                  { label: "Logo / graphic → PNG" },
                  { label: "Screenshot → PNG" },
                  { label: "Social media → JPEG" },
                  { label: "Animated content → GIF" },
                  { label: "Email photo → JPEG" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">FAQs</h3>
              <div className="space-y-4">
                {[
                  { q: "Does converting lose quality?", a: "Converting to JPEG or WEBP (lossy) may reduce quality slightly. Converting to PNG is always lossless." },
                  { q: "Can I convert back to the original format?", a: "Yes, but if you converted to lossy (JPEG), some quality is permanently lost. Convert from originals." },
                  { q: "Do converted images keep transparency?", a: "Only PNG and WEBP support transparency. Converting transparent PNG to JPEG will lose the transparency." },
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

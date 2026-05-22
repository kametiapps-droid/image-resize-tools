import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, CheckCircle2, TrendingDown } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";

export default function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setCompressedFile(null);
  };

  const processImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const options = {
        maxSizeMB: (file.size / 1024 / 1024) * quality,
        maxWidthOrHeight: 4096,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      setCompressedFile(compressed);
      recordUse.mutate({ params: { id: "image-compressor" }, data: { fileType: file.type, fileSizeKb: Math.round(compressed.size / 1024) } });
      toast({ title: "Success", description: "Image compressed successfully." });
    } catch {
      toast({ title: "Error", description: "Failed to compress image.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${compressedFile.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const savedPercent = file && compressedFile
    ? Math.round((1 - compressedFile.size / file.size) * 100)
    : null;

  return (
    <ToolLayout toolId="image-compressor" title="Image Compressor" description="Reduce image file size dramatically while keeping it looking great.">
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
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Quality: {Math.round(quality * 100)}%</Label>
                  </div>
                  <Slider value={[quality * 100]} max={100} min={10} step={1} onValueChange={(v) => { setQuality(v[0] / 100); setCompressedFile(null); }} />
                  <p className="text-xs text-muted-foreground">Lower quality = smaller file size. 70–85% is usually ideal for photos.</p>
                </div>

                <div className="space-y-2 p-3 bg-muted/40 rounded-lg">
                  <div className="text-sm text-muted-foreground flex justify-between">
                    <span>Original:</span>
                    <span className="font-medium text-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                  {compressedFile && (
                    <>
                      <div className="text-sm text-muted-foreground flex justify-between">
                        <span>Compressed:</span>
                        <span className="font-bold text-green-600">{(compressedFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                      {savedPercent !== null && savedPercent > 0 && (
                        <div className="flex items-center gap-1.5 pt-1">
                          <TrendingDown className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-bold text-green-600">{savedPercent}% smaller!</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <Button className="w-full" size="lg" onClick={compressedFile ? handleDownload : processImage} disabled={isProcessing}>
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Compressing..." : compressedFile ? "Download Compressed Image" : "Compress Image"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setPreviewUrl(null); setCompressedFile(null); }}>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Compress Images Without Losing Quality</h2>
          <p className="text-gray-500 text-sm mb-8">A complete guide to image compression, file sizes, and when to use each format for the web, email, and social media.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What Is Image Compression?</h3>
              <p className="text-gray-600 leading-relaxed">
                Image compression reduces the file size of an image by removing or approximating data that the human eye is unlikely to notice. There are two types: <strong>lossless compression</strong> (perfectly preserves quality, smaller reduction) and <strong>lossy compression</strong> (achieves much smaller sizes by discarding some detail, ideal for photos).
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                Our compressor uses the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">browser-image-compression</code> library, which runs entirely in your browser using Web Workers for background processing — keeping the UI responsive even with large files.
              </p>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Compress Images?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Faster Website", d: "Smaller images load faster, improving user experience and Google PageSpeed scores." },
                  { t: "Email Attachments", d: "Most email providers cap attachments at 10–25 MB. Compression keeps photos shareable." },
                  { t: "Social Media", d: "Platforms recompress uploads. Pre-compressing gives you more control over the final quality." },
                  { t: "Storage Savings", d: "Reduce storage costs on cloud services like Google Drive, Dropbox, or iCloud." },
                ].map((item) => (
                  <div key={item.t} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <p className="font-semibold text-gray-900 text-sm mb-1">{item.t}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Quality Settings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Quality Setting</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Use Case</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Expected Reduction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["90–100%", "Printing, archiving, professional use", "~10–20%"],
                      ["75–90%", "Web photos, social media", "~40–60%"],
                      ["50–75%", "Email, messaging apps", "~60–75%"],
                      ["30–50%", "Thumbnails, previews", "~75–85%"],
                      ["Below 30%", "Not recommended — visible artifacts", ">85%"],
                    ].map(([q, u, r], i) => (
                      <tr key={i} className={`border border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2 font-mono text-gray-700 border-r border-gray-200">{q}</td>
                        <td className="px-4 py-2 text-gray-600 border-r border-gray-200">{u}</td>
                        <td className="px-4 py-2 text-gray-500">{r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Best Practices</h3>
              <ul className="space-y-2.5">
                {[
                  "Start at 80% quality — ideal for most photos",
                  "Always keep your original file as backup",
                  "Use WEBP format for the best compression on the web",
                  "Resize before compressing for maximum reduction",
                  "PNG files compress better as JPEG if no transparency needed",
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
                  { q: "Does compression change image dimensions?", a: "No. Compression only reduces file size. Dimensions remain the same." },
                  { q: "Can I compress PNG files?", a: "Yes. PNG files are converted and compressed. Note: PNG with transparency may lose it in JPEG output." },
                  { q: "How much can I expect to save?", a: "Typically 40–80% reduction depending on the original and quality setting." },
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

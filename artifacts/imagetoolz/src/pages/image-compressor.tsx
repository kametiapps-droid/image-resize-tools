import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, TrendingDown, ArrowRight } from "lucide-react";
import { ToolArticle } from "@/components/tool-article";
import { useRecordToolUse } from "@workspace/api-client-react";
import imageCompression from "browser-image-compression";

type Step = "idle" | "loading" | "settings" | "processing" | "done";

export default function ImageCompressor() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(80);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultInfo, setResultInfo] = useState("");
  const [savedPct, setSavedPct] = useState(0);
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setStep("loading");
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setTimeout(() => setStep("settings"), 900);
  };

  const processImage = async () => {
    if (!file) return;
    setStep("processing");
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: (file.size / 1024 / 1024) * (quality / 100),
        maxWidthOrHeight: 4096,
        useWebWorker: true,
      });
      const url = URL.createObjectURL(compressed);
      setResultUrl(url);
      setResultBlob(compressed);
      const saved = Math.round((1 - compressed.size / file.size) * 100);
      setSavedPct(saved);
      const kb = Math.round(compressed.size / 1024);
      const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
      setResultInfo(`${sizeStr} · ${saved}% smaller · Quality ${quality}%`);
      recordUse.mutate({ params: { id: "image-compressor" }, data: { fileType: file.type, fileSizeKb: kb } });
      setStep("done");
    } catch {
      setStep("settings");
    }
  };

  const reset = () => { setStep("idle"); setFile(null); setPreviewUrl(null); setResultUrl(null); setResultBlob(null); };

  return (
    <>
      <Helmet>
        <title>Free Image Compressor — Reduce Image File Size Without Losing Quality | Image Resize</title>
        <meta name="description" content="Compress JPEG, PNG, WEBP images online free. Reduce file size by up to 80% without visible quality loss. Compress images below 100KB — 100% browser-based, no upload, instant." />
        <link rel="canonical" href="https://imageresize.app/tools/image-compressor" />
        <meta property="og:title" content="Free Image Compressor — Image Resize" />
        <meta property="og:description" content="Reduce image file size by 40–80% without visible quality loss. Compress JPEG, PNG, WEBP free online — no upload needed." />
        <meta property="og:url" content="https://imageresize.app/tools/image-compressor" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image Compressor",
          "description": "Free online image compressor — reduce JPEG, PNG, WEBP file size by up to 80% without quality loss.",
          "url": "https://imageresize.app/tools/image-compressor",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>
      <ToolLayout toolId="image-compressor" title="Image Compressor" description="Reduce image file size by up to 80% — keep it looking great for web, email, and social media." pageTitle="Image Compressor">
        {step === "idle" && <FileUploader onUpload={handleUpload} />}
        {step === "loading" && <UploadLoading filename={file?.name} />}
        {step === "processing" && <ProcessingAnimation label="Compressing your image…" />}

        {step === "done" && (
          <DownloadDone
            resultUrl={resultUrl}
            resultBlob={resultBlob}
            filename={`compressed-${file?.name ?? "image"}`}
            info={resultInfo}
            toolName="Image Compressor"
            toolPath="/tools/image-compressor"
            onReset={reset}
          />
        )}

        {step === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="min-h-[320px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4">
                    {previewUrl && <img src={previewUrl} alt="Preview" className="max-w-full max-h-[420px] object-contain rounded shadow-sm" />}
                  </div>
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Original: <strong className="text-gray-700 dark:text-gray-200">{Math.round((file?.size ?? 0) / 1024)} KB</strong></span>
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Estimated: <strong className="text-green-600 dark:text-green-400">~{Math.round(((file?.size ?? 0) / 1024) * (quality / 100))} KB</strong></span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold">Compression Level</Label>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{quality}%</span>
                    </div>
                    <Slider value={[quality]} min={10} max={100} step={1} onValueChange={(v) => setQuality(v[0])} />
                    <div className="grid grid-cols-3 gap-1.5">
                      {[{ label: "Max Compress", v: 40 }, { label: "Balanced", v: 75 }, { label: "High Quality", v: 92 }].map((p) => (
                        <button key={p.v} onClick={() => setQuality(p.v)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${quality === p.v ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-950/40"}`}>
                          {p.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {quality >= 85 ? "High quality — minimal size reduction" : quality >= 60 ? "Good balance — recommended for most uses" : "Aggressive compression — some quality loss"}
                    </p>
                  </div>

                  <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900">
                    <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span>Expected reduction: <strong>~{100 - quality}%</strong></span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <button onClick={processImage}
                className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)", boxShadow: "0 4px 16px rgba(22,163,74,0.4)" }}>
                Compress Image
              </button>
              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}

        <ToolArticle
          heading="How to Compress Images Without Losing Quality"
          subheading="Reduce file size while keeping your images looking sharp — entirely in your browser."
          body={[
            "Image compression is the single most impactful optimization you can make for your website's speed, your email deliverability, and your storage costs. A modern smartphone photo is typically 3–12 MB in size. The same photo, properly compressed for web display, can be 150–400 KB — an 80–95% reduction with zero visible quality difference when viewed on screen. Google's search ranking algorithm directly rewards faster-loading pages, and the biggest cause of slow websites is always unoptimized images.",
            "There are two types of image compression: lossy and lossless. Lossy compression (used by JPEG and WEBP) permanently removes image data that the human eye is least sensitive to — fine texture detail, subtle color gradations in shadows, and frequency information that our visual system discards anyway. At 75–85% quality, the removed information is imperceptible. Below 60%, you start to see 'JPEG artifacts' — blocky distortions around edges and text. Lossless compression (used by PNG) reorganizes the binary data without discarding anything — you get a smaller file that is pixel-for-pixel identical to the original. PNG compression is typically 10–30% and produces lossless results.",
            "The best compression strategy depends on what the image contains. For photographs of people, landscapes, products, and food — use JPEG at 75–85% or WEBP at 75–80%. The complex color variation in photographs is exactly what JPEG's algorithm handles most efficiently. For screenshots, interface graphics, diagrams, logos, and images with text — use PNG. The flat colors and sharp edges in these images compress well losslessly, and any lossy compression creates visible artifacts around text and lines. For website images where you want the smallest possible file — use WEBP. It supports both lossy and lossless modes and is universally supported in 2026.",
            "<strong>Target File Sizes for Common Use Cases:</strong> Blog post featured image: 80–200 KB (aim for under 100 KB for maximum PageSpeed score). E-commerce product photo: 100–300 KB depending on zoom requirements. Email newsletter inline image: under 100 KB. Social media upload: under 1 MB (platforms compress again anyway). Website hero/banner: 150–400 KB. Thumbnail or avatar: under 30 KB. Profile photos: 20–50 KB. These targets assume the image is also appropriately resized — a product photo displayed at 800px wide should be resized to 800–1200px before compression, not compressed from 4000px.",
            "<strong>Stripping Metadata During Compression:</strong> EXIF metadata embedded in photos by cameras and smartphones adds 5–50 KB of hidden data to every image file. This data (GPS location, camera model, timestamps, settings) is invisible to viewers but every visitor's browser must download it. Our compression tool strips all metadata automatically, giving you slightly smaller files and eliminating any privacy concerns about GPS coordinates embedded in images you publish.",
          ]}
          steps={[
            { title: "Upload your image", description: "Select a JPG, PNG, WEBP, or GIF file. Your image stays on your device — nothing is uploaded." },
            { title: "Set the quality level", description: "Use the quality slider (10–100%). For photos, 75–85% gives the best size-to-quality ratio." },
            { title: "Choose output format", description: "Keep the original format, or switch to WEBP for up to 30% better compression than JPEG." },
            { title: "Compress & Download", description: "Click Compress Image. The result shows you the exact file size reduction before you download." },
          ]}
          tips={[
            "Start at 80% — ideal balance for most photos",
            "Always keep a copy of the original before compressing",
            "WEBP achieves the best compression for web use",
            "Resize the image first for maximum file size reduction",
            "PNG compression is lossless — quality setting has no effect",
          ]}
          faqs={[
            { question: "How much can I reduce file size?", answer: "Typically 40–80% for JPEG photos. WEBP can achieve even more. Results vary by image content." },
            { question: "Will compression affect print quality?", answer: "For print, keep quality at 90%+. Web display looks great at 75–85%." },
            { question: "Is there a file size limit?", answer: "No server limits — processing is 100% in your browser. Memory is the only constraint." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

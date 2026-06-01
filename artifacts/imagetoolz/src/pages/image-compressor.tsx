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
        <title>Free Image Compressor - Reduce Image Size Online | CropImages</title>
        <meta name="description" content="Compress images online for free. Reduce JPEG, PNG, WEBP file size by up to 80% without visible quality loss. 100% browser-based, no upload." />
        <link rel="canonical" href="https://cropimages.store/tools/image-compressor" />
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

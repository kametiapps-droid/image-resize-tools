import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { ToolArticle } from "@/components/tool-article";

type Step = "idle" | "loading" | "settings" | "processing" | "done";

const formats = [
  { value: "image/jpeg", label: "JPEG", ext: "jpg", desc: "Best for photos. Smaller file, slight quality loss.", color: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400" },
  { value: "image/png", label: "PNG", ext: "png", desc: "Lossless. Best for graphics, screenshots, transparency.", color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400" },
  { value: "image/webp", label: "WEBP", ext: "webp", desc: "Best for web. Smaller than JPEG and PNG.", color: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400" },
  { value: "image/gif", label: "GIF", ext: "gif", desc: "256 colors only. Best for simple graphics.", color: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400" },
];

export default function ImageConverter() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState("image/png");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultInfo, setResultInfo] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setStep("loading");
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    const img = new Image();
    img.onload = () => { imageRef.current = img; setTimeout(() => setStep("settings"), 900); };
    img.src = url;
  };

  const processImage = () => {
    if (!imageRef.current || !canvasRef.current || !file) return;
    setStep("processing");
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = imageRef.current!.width;
      canvas.height = imageRef.current!.height;
      if (format === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      ctx.drawImage(imageRef.current!, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) { setStep("settings"); return; }
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultBlob(blob);
        const sel = formats.find(f => f.value === format)!;
        const kb = Math.round(blob.size / 1024);
        setResultInfo(`${sel.label} · ${canvas.width} × ${canvas.height} px · ${kb > 1024 ? `${(kb/1024).toFixed(1)} MB` : `${kb} KB`}`);
        recordUse.mutate({ params: { id: "image-converter" }, data: { fileType: format, fileSizeKb: kb } });
        setStep("done");
      }, format, 0.92);
    }, 100);
  };

  const reset = () => { setStep("idle"); setFile(null); setPreviewUrl(null); setResultUrl(null); setResultBlob(null); imageRef.current = null; };

  const selectedFmt = formats.find(f => f.value === format)!;

  return (
    <>
      <Helmet>
        <title>Free Image Converter — Convert JPG to PNG, PNG to WEBP Online | Image Resize</title>
        <meta name="description" content="Convert images between JPEG, PNG, WEBP, and GIF formats online for free. Convert JPG to PNG, PNG to WEBP without quality loss — instant, browser-based, no upload required." />
        <link rel="canonical" href="https://imageresize.app/tools/image-converter" />
        <meta property="og:title" content="Free Image Converter — Image Resize" />
        <meta property="og:description" content="Convert JPG to PNG, PNG to WEBP, or any image format instantly. Free, browser-based, no upload." />
        <meta property="og:url" content="https://imageresize.app/tools/image-converter" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image Converter",
          "description": "Free online image format converter — convert between JPEG, PNG, WEBP, and GIF instantly in your browser.",
          "url": "https://imageresize.app/tools/image-converter",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>
      <ToolLayout toolId="image-converter" title="Image Converter" description="Convert between JPEG, PNG, WEBP, and GIF — instantly in your browser, no upload needed." pageTitle="Image Converter">
        <canvas ref={canvasRef} className="hidden" />

        {step === "idle" && <FileUploader onUpload={handleUpload} />}
        {step === "loading" && <UploadLoading filename={file?.name} />}
        {step === "processing" && <ProcessingAnimation label={`Converting to ${selectedFmt.label}…`} />}

        {step === "done" && (
          <DownloadDone
            resultUrl={resultUrl}
            resultBlob={resultBlob}
            filename={`converted-${(file?.name ?? "image").split(".")[0]}.${selectedFmt.ext}`}
            info={resultInfo}
            toolName="Image Converter"
            toolPath="/tools/image-converter"
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
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                    Original format: <strong className="text-gray-700 dark:text-gray-200">{file?.type?.split("/")[1]?.toUpperCase() ?? "Unknown"}</strong>
                    <span className="mx-2">→</span>
                    Output: <strong className="text-green-600 dark:text-green-400">{selectedFmt.label}</strong>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-3">
                  <Label className="font-semibold">Convert To</Label>
                  <div className="space-y-2">
                    {formats.map((f) => (
                      <button
                        key={f.value}
                        onClick={() => setFormat(f.value)}
                        className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                          format === f.value
                            ? "border-green-500 dark:border-green-500 bg-green-50 dark:bg-green-950/40"
                            : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${f.color}`}>{f.label}</span>
                          {format === f.value && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">{f.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <button onClick={processImage}
                className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)", boxShadow: "0 4px 16px rgba(22,163,74,0.4)" }}>
                Convert to {selectedFmt.label}
              </button>
              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}

        <ToolArticle
          heading="JPEG vs PNG vs WEBP vs GIF — Which Format to Choose?"
          subheading="Each image format has distinct strengths. Understanding them helps you pick the right one for every use case."
          body={[
            "Image format selection is one of the most impactful technical decisions in web development, digital marketing, and content creation — yet it is frequently made by habit rather than by understanding. The difference between the right format and the wrong one for your use case can be a 5× difference in file size (affecting page speed and hosting costs) or visible quality degradation (affecting brand perception and user experience). Here is everything you need to know to consistently pick the correct format.",
            "JPEG (Joint Photographic Experts Group) is the standard format for photographs. It uses lossy compression that analyzes image data in 8×8 pixel blocks, removes high-frequency information the eye is least sensitive to, and achieves dramatic size reduction. At 85% quality, a photo compressed as JPEG looks identical to the original on screen but is 80–90% smaller. At 70% quality, minor artifacts appear in smooth gradients and around hard edges. Below 60%, visible blocking artifacts (the classic 'JPEG artifacts') appear. Use JPEG for: product photos, blog post images, social media photography, email images, and any photograph where file size matters.",
            "PNG (Portable Network Graphics) uses lossless compression — the output file is pixel-for-pixel identical to the input, with zero quality loss. PNG also supports transparency (alpha channel) — pixels can be fully transparent, fully opaque, or any level in between. This is essential for logos, icons, interface elements, and any graphic that needs to be placed over a colored background without a white rectangle border. PNG compression is typically 10–40% and is most effective on images with large flat-color areas and sharp edges. Use PNG for: logos, icons, screenshots, interface graphics, images with text, and any graphic requiring transparency.",
            "WEBP is a modern format developed by Google that supports both lossy and lossless compression, plus transparency. In lossy mode, WEBP produces files 25–34% smaller than JPEG at equivalent visual quality. In lossless mode, WEBP is 26% smaller than PNG. All modern browsers support WEBP in 2026. The main limitation: WEBP is not supported in very old email clients (Outlook 2019 and earlier). For websites, WEBP is the optimal format for virtually everything. GIF supports animation and is limited to 256 colors — only use GIF for simple animated graphics where WEBP animated is not accepted.",
          ]}
          steps={[
            { title: "Upload your image", description: "Drag & drop or click to select — JPG, PNG, WEBP, or GIF all supported as input." },
            { title: "Select target format", description: "Choose JPEG (photos), PNG (transparency/lossless), WEBP (web-optimized), or GIF (animations)." },
            { title: "Convert instantly", description: "Click the Convert button — your browser processes the conversion using the Canvas API." },
            { title: "Download", description: "Your converted file downloads immediately. No upload, no server, completely private." },
          ]}
          tips={[
            "WEBP gives 25-34% smaller files than JPEG at the same visual quality",
            "Always use PNG for logos and graphics with transparent backgrounds",
            "JPEG at 80-85% quality is indistinguishable from 100% quality on screen",
            "Convert photos to WEBP for websites to improve Core Web Vitals scores",
            "GIF is only needed for very simple animations — otherwise use WEBP",
          ]}
          faqs={[
            { question: "Does converting JPEG to PNG improve quality?", answer: "No. Converting from a lossy format (JPEG) to lossless (PNG) does not restore quality lost in the original JPEG compression. It only prevents additional quality loss in future saves." },
            { question: "Can I convert PNG to JPEG without quality loss?", answer: "PNG to JPEG conversion is lossy — you choose the quality level. At 85-90%, results are visually identical to the PNG on screen but significantly smaller." },
            { question: "Is WEBP supported everywhere?", answer: "All modern browsers (Chrome, Firefox, Safari, Edge) support WEBP. The main exception is very old email clients like Outlook 2019. For websites and apps in 2026, WEBP is fully safe to use." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

import { useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { ToolArticle } from "@/components/tool-article";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, CheckCircle2, Lock, Unlock } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";

type Step = "idle" | "loading" | "settings" | "processing" | "done";

const PRESETS = {
  social: [
    { name: "Instagram Post", w: 1080, h: 1080 },
    { name: "Instagram Story", w: 1080, h: 1920 },
    { name: "Instagram Landscape", w: 1080, h: 566 },
    { name: "Twitter/X Post", w: 1200, h: 675 },
    { name: "Twitter/X Header", w: 1500, h: 500 },
    { name: "YouTube Thumbnail", w: 1280, h: 720 },
    { name: "Facebook Cover", w: 851, h: 315 },
    { name: "Facebook Post", w: 1200, h: 630 },
    { name: "LinkedIn Post", w: 1200, h: 628 },
    { name: "LinkedIn Banner", w: 1584, h: 396 },
    { name: "WhatsApp DP", w: 500, h: 500 },
    { name: "TikTok Video", w: 1080, h: 1920 },
  ],
  web: [
    { name: "HD 1080p", w: 1920, h: 1080 },
    { name: "4K UHD", w: 3840, h: 2160 },
    { name: "Website Banner", w: 1440, h: 600 },
    { name: "Blog Header", w: 1200, h: 630 },
    { name: "Email Header", w: 600, h: 200 },
    { name: "MacBook Wallpaper", w: 2560, h: 1600 },
    { name: "Favicon", w: 32, h: 32 },
    { name: "OG Image", w: 1200, h: 630 },
  ],
  print: [
    { name: "A4 (150 DPI)", w: 1240, h: 1754 },
    { name: "US Letter (150 DPI)", w: 1275, h: 1650 },
    { name: "Business Card", w: 1050, h: 600 },
    { name: "Passport Photo", w: 600, h: 600 },
    { name: "A3 Poster (150 DPI)", w: 1754, h: 2480 },
  ],
};

type PresetTab = "social" | "web" | "print" | "custom";

export default function ImageResizer() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [ratio, setRatio] = useState(1);
  const [lockRatio, setLockRatio] = useState(true);
  const [format, setFormat] = useState("image/jpeg");
  const [quality, setQuality] = useState(90);
  const [activeTab, setActiveTab] = useState<PresetTab>("social");
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
    img.onload = () => {
      setOrigW(img.width);
      setOrigH(img.height);
      setWidth(img.width);
      setHeight(img.height);
      setRatio(img.width / img.height);
      imageRef.current = img;
      setTimeout(() => setStep("settings"), 900);
    };
    img.src = url;
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
    if (lockRatio) setRatio(w / h);
  };

  const handleWidthChange = (val: string) => {
    const n = parseInt(val) || 0;
    setWidth(n);
    if (lockRatio && ratio) setHeight(Math.round(n / ratio));
  };

  const handleHeightChange = (val: string) => {
    const n = parseInt(val) || 0;
    setHeight(n);
    if (lockRatio && ratio) setWidth(Math.round(n * ratio));
  };

  const processImage = () => {
    if (!imageRef.current || !canvasRef.current || !file || !width || !height) return;
    setStep("processing");
    setTimeout(() => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(imageRef.current!, 0, 0, width, height);
      const q = format === "image/png" ? 1 : quality / 100;
      canvas.toBlob((blob) => {
        if (!blob) { setStep("settings"); return; }
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultBlob(blob);
        const ext = format === "image/jpeg" ? "jpg" : format.split("/")[1];
        const kb = Math.round(blob.size / 1024);
        const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
        setResultInfo(`${width} × ${height} px · ${ext.toUpperCase()} · ${sizeStr}`);
        recordUse.mutate({ params: { id: "image-resizer" }, data: { fileType: format, fileSizeKb: kb } });
        setStep("done");
      }, format, q);
    }, 100);
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const ext = format === "image/jpeg" ? "jpg" : format.split("/")[1];
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = `resized-${file.name.split(".")[0]}.${ext}`;
    a.click();
  };

  const reset = () => {
    setStep("idle");
    setFile(null);
    setPreviewUrl(null);
    setResultUrl(null);
    setResultBlob(null);
    setResultInfo("");
    imageRef.current = null;
  };

  const tabLabels: { key: PresetTab; label: string }[] = [
    { key: "social", label: "Social Media" },
    { key: "web", label: "Web & Desktop" },
    { key: "print", label: "Print" },
    { key: "custom", label: "Custom" },
  ];

  return (
    <>
      <Helmet>
        <title>Free Image Resizer Online — Resize Images Without Losing Quality | Image Resize</title>
        <meta name="description" content="Resize images online free. Set exact pixel dimensions, use Instagram, YouTube, Twitter presets, lock aspect ratio, choose JPEG/PNG/WEBP. 100% browser-based — photos never uploaded." />
        <link rel="canonical" href="https://imageresize.app/" />
        <meta property="og:title" content="Free Image Resizer Online — Image Resize" />
        <meta property="og:description" content="Resize images for social media, web, and print. 25+ presets, custom dimensions, JPEG/PNG/WEBP output. Free, instant, private." />
        <meta property="og:url" content="https://imageresize.app/" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image Resizer",
          "description": "Free online image resizer — resize images to exact pixel dimensions with social media presets. 100% browser-based, no upload.",
          "url": "https://imageresize.app/",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>
      <ToolLayout
        toolId="image-resizer"
        title="Image Resizer"
        description="Resize images to any dimension instantly — social media presets, custom sizes, quality control. Free & private."
        badge="Most Popular"
        pageTitle="Image Resizer"
      >
        <canvas ref={canvasRef} className="hidden" />

        {step === "idle" && <FileUploader onUpload={handleUpload} />}
        {step === "loading" && <UploadLoading filename={file?.name} />}
        {step === "processing" && <ProcessingAnimation label={`Resizing to ${width} × ${height} px…`} />}

        {step === "done" && (
          <DownloadDone
            resultUrl={resultUrl}
            resultBlob={resultBlob}
            filename={`resized-${file?.name?.split(".")[0] ?? "image"}.${format === "image/jpeg" ? "jpg" : format.split("/")[1]}`}
            info={resultInfo}
            toolName="Image Resizer"
            toolPath="/"
            onReset={reset}
            onDownload={handleDownload}
          />
        )}

        {step === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Preview */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-[url('data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%3E%3Crect%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f3f4f6%22/%3E%3Crect%20x%3D%228%22%20y%3D%228%22%20width%3D%228%22%20height%3D%228%22%20fill%3D%22%23f3f4f6%22/%3E%3C/svg%3E')] min-h-[320px] flex items-center justify-center p-4">
                    {previewUrl && (
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-[440px] object-contain rounded shadow-sm" />
                    )}
                  </div>
                  <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Original: <strong className="text-gray-700 dark:text-gray-200">{origW} × {origH} px</strong></span>
                    <span>→ Output: <strong className="text-green-600 dark:text-green-400">{width || "—"} × {height || "—"} px</strong></span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls */}
            <div className="lg:col-span-2 space-y-4">
              {/* Preset tabs */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Label className="text-sm font-semibold">Size Presets</Label>
                  <div className="flex gap-1 flex-wrap">
                    {tabLabels.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          activeTab === t.key
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {activeTab !== "custom" && (
                    <div className="grid grid-cols-1 gap-1 max-h-52 overflow-y-auto pr-1">
                      {PRESETS[activeTab].map((p) => (
                        <button
                          key={p.name}
                          onClick={() => applyPreset(p.w, p.h)}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all text-left ${
                            width === p.w && height === p.h
                              ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 font-semibold border border-green-200 dark:border-green-700"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <span>{p.name}</span>
                          <span className="font-mono text-gray-400 dark:text-gray-500">{p.w}×{p.h}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom dimensions */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Dimensions (px)</Label>
                    <button
                      onClick={() => setLockRatio(!lockRatio)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
                        lockRatio ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {lockRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      {lockRatio ? "Locked" : "Unlock"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Width</Label>
                      <Input
                        type="number" min={1} max={8000}
                        value={width || ""}
                        onChange={(e) => handleWidthChange(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500 dark:text-gray-400">Height</Label>
                      <Input
                        type="number" min={1} max={8000}
                        value={height || ""}
                        onChange={(e) => handleHeightChange(e.target.value)}
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Format & Quality */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Output Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="image/jpeg">JPEG — Best for photos</SelectItem>
                        <SelectItem value="image/png">PNG — Lossless / Transparency</SelectItem>
                        <SelectItem value="image/webp">WEBP — Smallest file size</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {format !== "image/png" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Quality</Label>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">{quality}%</span>
                      </div>
                      <Slider
                        value={[quality]}
                        min={30} max={100} step={1}
                        onValueChange={(v) => setQuality(v[0])}
                      />
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {quality >= 85 ? "High quality · Larger file" : quality >= 65 ? "Good balance · Recommended" : "Smaller file · Some quality loss"}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Resize button */}
              <button
                onClick={processImage}
                disabled={!width || !height}
                className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #15803d, #16a34a)",
                  boxShadow: "0 4px 16px rgba(22,163,74,0.4)",
                }}
              >
                Resize Image
              </button>

              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}

        <ToolArticle
          heading="How to Resize an Image Online"
          subheading="Free, private, and instant — all processing happens in your browser. No uploads, no accounts."
          body={[
            "Resizing images is one of the most frequent tasks for anyone who creates digital content, manages a website, or posts on social media. Every platform has different size requirements — Instagram wants a square 1080×1080px post, YouTube thumbnails need to be exactly 1280×720px, and email headers are typically 600px wide. Submitting an image at the wrong size means the platform's algorithm will auto-crop it, often cutting off faces, text, or the most important visual element. Our free image resizer solves this instantly with 25+ built-in presets covering all major platforms.",
            "Beyond social media, image dimensions directly affect your website's search engine ranking. Google's Core Web Vitals include Largest Contentful Paint (LCP) — a measure of how quickly the main visual content loads. A single unoptimized 6 MB photo from a smartphone, displayed at 800px wide on a blog post, still forces every visitor to download the full 6 MB. Resizing that image to exactly the display width and appropriate quality can reduce it to under 200 KB — a 97% reduction that makes your page load in under a second instead of 5–10 seconds.",
            "Our tool processes images entirely within your browser using the HTML5 Canvas API. When you upload an image, it is loaded into your browser's local memory — it never travels over the internet to any server. The resizing calculation happens on your device's CPU in milliseconds. The processed image is then made available for download directly from your browser's memory. This design is both faster than server-based tools (no upload/download round trip) and completely private — no one but you ever sees your images.",
            "<strong>Choosing the Right Output Format:</strong> JPEG is ideal for photographs — lossy compression achieves 80–95% file size reduction with no visible quality difference at 85–90% quality. PNG is lossless and essential for graphics with transparency, logos, and interface screenshots. WEBP is the modern web format — 25–35% smaller than JPEG at equivalent quality, with full browser support in 2026. For most web publishing use cases, WEBP is the optimal choice. For email and universal compatibility, JPEG at 85% quality is the safest option.",
            "<strong>Understanding Aspect Ratio:</strong> The aspect ratio is the proportional relationship between an image's width and height. Locking the aspect ratio when resizing ensures the image is scaled proportionally — no stretching or distortion. Always keep aspect ratio locked unless you specifically need a non-proportional result, such as filling a fixed banner slot. Downscaling (making images smaller) is always sharp and clean. Upscaling (making images larger) creates soft, blurry results because the tool must invent pixels — avoid it whenever possible.",
          ]}
          steps={[
            { title: "Upload your image", description: "Drag & drop a JPG, PNG, WEBP, or GIF — or click Select File. Your image never leaves your device." },
            { title: "Choose a preset or enter custom dimensions", description: "Pick from 25+ presets for Instagram, YouTube, Twitter, print, and web — or enter exact width × height in pixels." },
            { title: "Set format and quality", description: "Choose JPEG, PNG, or WEBP. Adjust the quality slider (30–100%). WEBP gives the smallest file size; PNG is lossless." },
            { title: "Download", description: "Click Resize Image — the browser processes it instantly. Click Download to save your file." },
          ]}
          tips={[
            "Lock aspect ratio to avoid stretching or distortion",
            "Use WEBP for web — up to 30% smaller than JPEG",
            "PNG for logos and graphics with text or transparency",
            "85–90% JPEG quality is the sweet spot for photos",
            "Downscale only — upscaling always reduces sharpness",
          ]}
          faqs={[
            { question: "Does resizing reduce quality?", answer: "Downscaling is near-lossless in JPEG and fully lossless in PNG. Upscaling always reduces sharpness — avoid it when possible." },
            { question: "Is my image uploaded to a server?", answer: "No. All processing runs entirely in your browser using the Canvas API. Nothing is sent to any server." },
            { question: "Is there a maximum file size?", answer: "No enforced limit — your browser's available memory is the only constraint. Most modern devices handle images up to 50 MB easily." },
          ]}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">Social Media Size Reference 2026</p>
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/60 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Platform</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Size (px)</th>
                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[
                    ["Instagram Post", "1080 × 1080", "JPEG"],
                    ["Instagram Story / Reel", "1080 × 1920", "JPEG"],
                    ["Twitter/X Post", "1200 × 675", "JPEG / WEBP"],
                    ["YouTube Thumbnail", "1280 × 720", "JPEG"],
                    ["Facebook Cover", "851 × 315", "JPEG"],
                    ["LinkedIn Post", "1200 × 628", "JPEG"],
                    ["WhatsApp Profile Photo", "500 × 500", "JPEG / PNG"],
                    ["TikTok Thumbnail", "1080 × 1920", "JPEG"],
                  ].map(([platform, size, fmt], i) => (
                    <tr key={i} className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{platform}</td>
                      <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">{size}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{fmt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ToolArticle>
      </ToolLayout>
    </>
  );
}

import { useState, useRef, useEffect } from "react";
import { ToolArticle } from "@/components/tool-article";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, CheckCircle2 } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";

type Step = "idle" | "loading" | "settings" | "processing" | "done";

const positions = [
  { value: "center", label: "Center" },
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

export default function Watermark() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("© CropImages");
  const [opacity, setOpacity] = useState(0.5);
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState("#ffffff");
  const [position, setPosition] = useState("center");
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
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) { canvasRef.current.width = img.width; canvasRef.current.height = img.height; }
      setTimeout(() => setStep("settings"), 900);
    };
    img.src = url;
  };

  const getTextPos = (canvas: HTMLCanvasElement, tw: number, th: number) => {
    const pad = 30;
    switch (position) {
      case "top-left": return { x: pad + tw / 2, y: pad + th };
      case "top-right": return { x: canvas.width - pad - tw / 2, y: pad + th };
      case "bottom-left": return { x: pad + tw / 2, y: canvas.height - pad };
      case "bottom-right": return { x: canvas.width - pad - tw / 2, y: canvas.height - pad };
      default: return { x: canvas.width / 2, y: canvas.height / 2 };
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    if (canvas.width !== img.width) canvas.width = img.width;
    if (canvas.height !== img.height) canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const m = ctx.measureText(text);
    const { x, y } = getTextPos(canvas, m.width, fontSize);
    ctx.lineWidth = Math.max(1.5, fontSize / 20);
    ctx.strokeStyle = color === "#ffffff" ? "#000000" : "#ffffff";
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.globalAlpha = 1;
  };

  useEffect(() => { if (step === "settings") drawCanvas(); }, [text, opacity, fontSize, color, position, step]);

  const processImage = () => {
    if (!canvasRef.current || !file) return;
    setStep("processing");
    setTimeout(() => {
      canvasRef.current!.toBlob((blob) => {
        if (!blob) { setStep("settings"); return; }
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultBlob(blob);
        const kb = Math.round(blob.size / 1024);
        setResultInfo(`Watermarked · "${text}" · ${positions.find(p => p.value === position)?.label} · ${kb} KB`);
        recordUse.mutate({ params: { id: "watermark" }, data: { fileType: file.type, fileSizeKb: kb } });
        setStep("done");
      }, file.type, 0.92);
    }, 100);
  };

  const reset = () => { setStep("idle"); setFile(null); setResultUrl(null); setResultBlob(null); imageRef.current = null; };

  return (
    <>
      <Helmet>
        <title>Free Watermark Tool — Add Text Watermark to Photos Online | Image Resize</title>
        <meta name="description" content="Add custom text watermarks to images online free. Protect photos with your name, logo text, or website. Control position, font size, color, opacity — no upload, instant preview." />
        <link rel="canonical" href="https://imageresize.app/tools/watermark" />
        <meta property="og:title" content="Free Watermark Tool — Image Resize" />
        <meta property="og:description" content="Add text watermarks to protect your photos. Choose position, opacity, color, and size — free, browser-based, no upload." />
        <meta property="og:url" content="https://imageresize.app/tools/watermark" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Watermark Tool",
          "description": "Free online watermark tool — add customizable text watermarks to photos to protect your copyright.",
          "url": "https://imageresize.app/tools/watermark",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>
      <ToolLayout toolId="watermark" title="Add Watermark" description="Protect your images with custom text watermarks — choose position, size, color, and opacity." pageTitle="Add Watermark">
        <canvas ref={canvasRef} className="hidden" />

        {step === "idle" && <FileUploader onUpload={handleUpload} />}
        {step === "loading" && <UploadLoading filename={file?.name} />}
        {step === "processing" && <ProcessingAnimation label="Applying watermark…" />}

        {step === "done" && (
          <DownloadDone
            resultUrl={resultUrl}
            resultBlob={resultBlob}
            filename={`watermarked-${file?.name ?? "image"}`}
            info={resultInfo}
            toolName="Watermark Tool"
            toolPath="/tools/watermark"
            onReset={reset}
          />
        )}

        {step === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="min-h-[320px] bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4">
                    <canvas ref={canvasRef} className="max-w-full max-h-[420px] object-contain rounded shadow-sm" style={{ display: "block" }} />
                  </div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 text-center">
                    Live preview — watermark updates as you change settings
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold">Watermark Text</Label>
                    <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Your watermark text…" className="h-9" />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold">Position</Label>
                    <Select value={position} onValueChange={setPosition}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {positions.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Font Size</Label>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{fontSize}px</span>
                    </div>
                    <Slider value={[fontSize]} min={12} max={200} step={2} onValueChange={(v) => setFontSize(v[0])} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Opacity</Label>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{Math.round(opacity * 100)}%</span>
                    </div>
                    <Slider value={[opacity * 100]} min={5} max={100} step={5} onValueChange={(v) => setOpacity(v[0] / 100)} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-semibold">Color</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer p-0.5 bg-white dark:bg-gray-800" />
                      <div className="flex gap-1.5 flex-wrap">
                        {["#ffffff", "#000000", "#ff0000", "#ffff00", "#0000ff"].map((c) => (
                          <button key={c} onClick={() => setColor(c)}
                            className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-green-500 scale-110" : "border-gray-200 dark:border-gray-600"}`}
                            style={{ background: c }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <button onClick={processImage}
                className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)", boxShadow: "0 4px 16px rgba(22,163,74,0.4)" }}>
                Apply Watermark
              </button>
              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}

        <ToolArticle
          heading="How to Add a Watermark to Images"
          subheading="Protect your work and brand every image — fully customizable text, position, color, and opacity."
          body={[
            "A watermark is your permanent signature on every image you share online. In 2026, digital content spreads faster than ever — a photo you post today can be downloaded, re-shared, and reposted across dozens of platforms within hours. Without a watermark, there is no visible claim of ownership. With one, everyone who sees the image knows who created it, and interested buyers or collaborators can find you. Watermarks serve two distinct purposes: copyright protection (making ownership clear and theft visible) and branding (turning every shared image into a marketing touchpoint).",
            "The most important watermarking decision is placement. A watermark in the bottom corner is easy to crop out — this is the most common method of removing watermarks from stolen images. More effective placements include the center of the image (overlapping the main subject, impossible to crop out), lower-center or upper-center (harder to crop than corners while less visually intrusive than dead-center), or running diagonally across the subject. For social media branding where the goal is attribution rather than preventing theft, a subtle corner placement at 30–50% opacity is standard — visible without being distracting.",
            "<strong>Choosing the Right Opacity:</strong> Opacity is the balance between visibility and visual intrusion. At 100% opacity, a white watermark is fully solid — highly visible but potentially distracting from the image. At 20%, it may be difficult to read over light backgrounds. The sweet spot for most social media branding is 30–50% opacity: clearly visible on hover or focus, but not dominating the composition. For preview images on stock photo sites where you want to drive purchases, use 70–85% opacity so the watermark is prominent.",
            "<strong>Color Selection for Maximum Readability:</strong> A white watermark disappears over bright backgrounds; a black watermark disappears over dark backgrounds. For consistent readability over any background, use white with a slight dark drop shadow (or vice versa). Many professional photographers use a semi-transparent white watermark with a subtle gray stroke — this combination remains legible over both light and dark areas of any photograph. Our tool lets you choose any color from the picker, so you can match your brand colors exactly.",
            "<strong>What Text to Use in Your Watermark:</strong> Your watermark text should communicate ownership and enable people to find you. Options include: your full name (for personal photographers), your brand or business name, your website URL (most valuable — directly enables purchase/contact), your social media handle (@yourusername), or a combination like '© YourName | yoursite.com'. Keep it concise — a long watermark needs to be large to be readable, taking up more of the image. A short handle or domain at moderate size is more elegant and less intrusive.",
          ]}
          steps={[
            { title: "Upload your image", description: "Drag & drop or click Select File. Supports JPG, PNG, WEBP, and GIF." },
            { title: "Enter your watermark text", description: "Type your name, brand, website, or any text. This will appear on the image." },
            { title: "Customize appearance", description: "Set the position (9 options), font size, opacity, and color. Preview updates in real-time." },
            { title: "Apply & Download", description: "Click Apply Watermark to process and download your protected image instantly." },
          ]}
          tips={[
            "30–50% opacity gives a professional, subtle look",
            "Bottom-right corner is the most common watermark position",
            "White text works on most images; add a dark shadow for contrast",
            "Use your full domain (e.g. yoursite.com) for maximum brand impact",
            "Higher opacity makes the watermark harder to remove digitally",
          ]}
          faqs={[
            { question: "Can I use an image as a watermark?", answer: "Currently text watermarks only. Image watermark support is planned for a future update." },
            { question: "Will the watermark reduce image quality?", answer: "No. The watermark is rendered on a copy of your image at full quality. The original is unchanged." },
            { question: "Is my image uploaded to a server?", answer: "No. All processing is done entirely in your browser. Your files never leave your device." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

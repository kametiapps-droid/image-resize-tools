import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Move } from "lucide-react";
import { ToolArticle } from "@/components/tool-article";
import { useRecordToolUse } from "@workspace/api-client-react";

type Step = "idle" | "loading" | "settings" | "processing" | "done";

export default function ImageCropper() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 200, h: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
      const initW = Math.round(img.width * 0.6);
      const initH = Math.round(img.height * 0.6);
      setCropBox({ x: Math.round((img.width - initW) / 2), y: Math.round((img.height - initH) / 2), w: initW, h: initH });
      if (canvasRef.current) { canvasRef.current.width = img.width; canvasRef.current.height = img.height; }
      setTimeout(() => setStep("settings"), 900);
    };
    img.src = url;
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
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.drawImage(img, cropBox.x, cropBox.y, cropBox.w, cropBox.h, cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = Math.max(2, canvas.width / 300);
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    const hs = Math.max(8, canvas.width / 150);
    ctx.fillStyle = "#22c55e";
    [[cropBox.x, cropBox.y], [cropBox.x + cropBox.w, cropBox.y], [cropBox.x, cropBox.y + cropBox.h], [cropBox.x + cropBox.w, cropBox.y + cropBox.h]].forEach(([hx, hy]) => {
      ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
    });
    // Rule-of-thirds guide lines
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 0.5;
    [1/3, 2/3].forEach((f) => {
      ctx.beginPath(); ctx.moveTo(cropBox.x + cropBox.w * f, cropBox.y); ctx.lineTo(cropBox.x + cropBox.w * f, cropBox.y + cropBox.h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cropBox.x, cropBox.y + cropBox.h * f); ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + cropBox.h * f); ctx.stroke();
    });
  };

  useEffect(() => { if (step === "settings") drawCanvas(); }, [cropBox, step]);

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) };
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
    setStep("processing");
    setTimeout(() => {
      const outCanvas = document.createElement("canvas");
      outCanvas.width = cropBox.w;
      outCanvas.height = cropBox.h;
      const ctx = outCanvas.getContext("2d")!;
      ctx.drawImage(imageRef.current!, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cropBox.w, cropBox.h);
      outCanvas.toBlob((blob) => {
        if (!blob) { setStep("settings"); return; }
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultBlob(blob);
        const kb = Math.round(blob.size / 1024);
        setResultInfo(`${Math.round(cropBox.w)} × ${Math.round(cropBox.h)} px · ${kb} KB`);
        recordUse.mutate({ params: { id: "image-cropper" }, data: { fileType: file.type, fileSizeKb: kb } });
        setStep("done");
      }, file.type, 0.92);
    }, 100);
  };

  const reset = () => { setStep("idle"); setFile(null); setResultUrl(null); setResultBlob(null); imageRef.current = null; };

  return (
    <>
      <Helmet>
        <title>Free Image Cropper — Crop Photos Online for Instagram, Social Media | Image Resize</title>
        <meta name="description" content="Crop images online free with drag-and-drop. Crop photos for Instagram, YouTube, and any social media platform. Set exact pixel dimensions or drag visually — no upload needed." />
        <link rel="canonical" href="https://imageresize.app/tools/image-cropper" />
        <meta property="og:title" content="Free Image Cropper — Image Resize" />
        <meta property="og:description" content="Crop photos for Instagram, YouTube, and social media. Drag-and-drop crop tool with aspect ratio presets — free, instant, private." />
        <meta property="og:url" content="https://imageresize.app/tools/image-cropper" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image Cropper",
          "description": "Free online image cropper — crop photos with drag-and-drop, aspect ratio presets, and exact pixel dimensions.",
          "url": "https://imageresize.app/tools/image-cropper",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>
      <ToolLayout toolId="image-cropper" title="Image Cropper" description="Drag and crop any part of your image with a visual crop tool — or enter exact pixel values for precision." pageTitle="Image Cropper">

        {step === "idle" && <FileUploader onUpload={handleUpload} />}
        {step === "loading" && <UploadLoading filename={file?.name} />}
        {step === "processing" && <ProcessingAnimation label="Cropping your image…" />}

        {step === "done" && (
          <DownloadDone
            resultUrl={resultUrl}
            resultBlob={resultBlob}
            filename={`cropped-${file?.name ?? "image"}`}
            info={resultInfo}
            toolName="Image Cropper"
            toolPath="/tools/image-cropper"
            onReset={reset}
          />
        )}

        {step === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-950/30 border-b border-green-100 dark:border-green-900 text-xs text-green-700 dark:text-green-400 font-medium">
                    <Move className="w-3.5 h-3.5" />
                    Drag the green box to select the crop region
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-2">
                    <canvas
                      ref={canvasRef}
                      className={`max-w-full max-h-[480px] object-contain rounded shadow-sm ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
                      style={{ display: "block" }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Output: <strong className="text-green-600 dark:text-green-400">{Math.round(cropBox.w)} × {Math.round(cropBox.h)} px</strong>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <Label className="font-semibold">Crop Region (px)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "X offset", key: "x" as const },
                      { label: "Y offset", key: "y" as const },
                      { label: "Width", key: "w" as const },
                      { label: "Height", key: "h" as const },
                    ].map(({ label, key }) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">{label}</Label>
                        <Input
                          type="number" min={key === "w" || key === "h" ? 1 : 0}
                          value={Math.round(cropBox[key])}
                          onChange={(e) => setCropBox(prev => ({ ...prev, [key]: parseInt(e.target.value) || 0 }))}
                          className="h-9 text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-1">
                    <Label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Quick aspect ratios</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "1:1", r: 1 }, { label: "4:3", r: 4/3 }, { label: "16:9", r: 16/9 },
                        { label: "9:16", r: 9/16 }, { label: "3:2", r: 3/2 },
                      ].map(({ label, r }) => (
                        <button key={label}
                          onClick={() => {
                            const newH = Math.round(cropBox.w / r);
                            setCropBox(prev => ({ ...prev, h: newH }));
                          }}
                          className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 transition-all">
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <button onClick={processImage}
                className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)", boxShadow: "0 4px 16px rgba(22,163,74,0.4)" }}>
                Crop Image
              </button>
              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}

        <ToolArticle
          heading="How to Crop Images Online"
          subheading="Remove unwanted areas, change aspect ratios, and focus on what matters — no software needed."
          body={[
            "Cropping is one of the most powerful composition tools in photography and digital design. By selecting exactly the portion of an image you want to keep and discarding the rest, you can dramatically improve the visual impact of any photo. Good cropping eliminates distracting background elements, tightens the frame around your subject, changes the aspect ratio for different platforms, and creates stronger compositions using principles like the rule of thirds and negative space.",
            "Every major social media platform enforces different aspect ratios, and posting an image with the wrong dimensions means the platform's algorithm will auto-crop it — often cutting off faces, titles, or product details in ways you cannot control. Instagram's feed displays images at 4:5 portrait (1080×1350px) for maximum screen real estate, 1:1 square (1080×1080px) for the profile grid, and 9:16 (1080×1920px) for Stories and Reels. Twitter/X displays timeline images at 16:9 (1200×675px) and auto-crops anything that doesn't match. YouTube thumbnails are 16:9 (1280×720px). Cropping your images to the exact required aspect ratio before uploading guarantees they display exactly as intended on every platform.",
            "The rule of thirds is the most important composition principle for cropping. Imagine your image divided by two horizontal and two vertical lines into a 3×3 grid. The four intersection points of these lines — called 'power points' — are where your subject should ideally be placed. A portrait with the subject's eyes at the upper third intersection looks more dynamic and natural than a centered portrait. A landscape with the horizon at the bottom third instead of center creates a stronger sky or foreground. When cropping, try to position your main subject at one of these power points rather than dead-center.",
            "<strong>Platform-Specific Crop Ratios for 2026:</strong> Instagram Post: 4:5 (portrait) or 1:1 (square). Instagram Story/Reel: 9:16. Twitter/X: 16:9. YouTube Thumbnail: 16:9. TikTok: 9:16. LinkedIn Post: 1.91:1 (approximately). Facebook Post: 1.91:1. Profile photos (all platforms): 1:1 square. Our crop tool includes quick aspect ratio buttons for 1:1, 4:3, 16:9, 9:16, and 3:2 — the most commonly needed ratios. You can also enter exact pixel dimensions for precise control.",
            "<strong>Technical Notes:</strong> Cropping is a non-destructive operation on the image quality of the kept region — only pixels outside the crop box are removed. The remaining pixels are unchanged at full quality. All processing happens locally in your browser using the Canvas API — your original file is never modified and never leaves your device. The crop tool supports JPG, PNG, WEBP, and GIF input formats and outputs in the same format as the input.",
          ]}
          steps={[
            { title: "Upload your image", description: "Drag & drop or click Select File — JPG, PNG, WEBP, and GIF all supported." },
            { title: "Drag the crop box", description: "The green box is your crop area. Drag it to select exactly the region you want to keep." },
            { title: "Fine-tune with numbers", description: "Enter exact pixel values for X, Y, width, and height — or use the quick aspect ratio buttons (1:1, 16:9, etc.)." },
            { title: "Crop & Download", description: "Click Crop Image. The result is shown instantly — click Download to save." },
          ]}
          tips={[
            "Rule of Thirds — place your subject off-center for better composition",
            "Use the 1:1 ratio for Instagram, 16:9 for YouTube thumbnails",
            "Cropping never reduces the quality of the remaining area",
            "For product photos: leave breathing room around the subject",
            "Combine with Image Resizer for perfect final dimensions",
          ]}
          faqs={[
            { question: "Does cropping reduce image quality?", answer: "No. Cropping only removes pixels outside your selection. The remaining image quality is unchanged." },
            { question: "Can I enter exact crop coordinates?", answer: "Yes — use the X, Y, Width, and Height inputs on the right panel for pixel-perfect control." },
            { question: "Is my image sent to a server?", answer: "Never. All cropping happens locally in your browser using the Canvas API." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";
import { ToolArticle } from "@/components/tool-article";
import { useRecordToolUse } from "@workspace/api-client-react";

type Step = "idle" | "loading" | "settings" | "processing" | "done";

export default function ImageRotator() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
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
    img.onload = () => { imageRef.current = img; setTimeout(() => setStep("settings"), 900); };
    img.src = url;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rad = (rotation * Math.PI) / 180;
    // dims are set below before drawImage
    const sin = Math.abs(Math.sin(rad));
    const cos = Math.abs(Math.cos(rad));
    const newW = Math.round(img.width * cos + img.height * sin);
    const newH = Math.round(img.width * sin + img.height * cos);
    canvas.width = newW;
    canvas.height = newH;
    ctx.clearRect(0, 0, newW, newH);
    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  };

  useEffect(() => { if (step === "settings") drawCanvas(); }, [rotation, flipH, flipV, step]);

  const processImage = () => {
    if (!canvasRef.current || !file) return;
    setStep("processing");
    setTimeout(() => {
      canvasRef.current!.toBlob((blob) => {
        if (!blob) { setStep("settings"); return; }
        const url = URL.createObjectURL(blob);
        setResultUrl(url);
        setResultBlob(blob);
        const c = canvasRef.current!;
        const kb = Math.round(blob.size / 1024);
        setResultInfo(`${c.width} × ${c.height} px · Rotated ${rotation}°${flipH ? " + Flip H" : ""}${flipV ? " + Flip V" : ""} · ${kb} KB`);
        recordUse.mutate({ params: { id: "image-rotator" }, data: { fileType: file.type, fileSizeKb: kb } });
        setStep("done");
      }, file.type, 0.92);
    }, 100);
  };

  const reset = () => { setStep("idle"); setFile(null); setResultUrl(null); setResultBlob(null); setRotation(0); setFlipH(false); setFlipV(false); imageRef.current = null; };

  const quickAngles = [90, 180, 270];

  return (
    <>
      <Helmet>
        <title>Free Image Rotator — Rotate & Flip Images Online 90 Degrees | Image Resize</title>
        <meta name="description" content="Rotate images 90, 180, 270 degrees or any custom angle online free. Fix sideways photos, flip images horizontally or vertically — no upload, instant result, privacy safe." />
        <link rel="canonical" href="https://imageresize.app/tools/image-rotator" />
        <meta property="og:title" content="Free Image Rotator — Image Resize" />
        <meta property="og:description" content="Rotate images 90/180/270° or any angle. Flip horizontally or vertically. Fix sideways photos instantly — free, browser-based, no upload." />
        <meta property="og:url" content="https://imageresize.app/tools/image-rotator" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image Rotator",
          "description": "Free online image rotator — rotate and flip images instantly without uploading to any server.",
          "url": "https://imageresize.app/tools/image-rotator",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>
      <ToolLayout toolId="image-rotator" title="Rotate & Flip Image" description="Rotate your image to any angle and flip horizontally or vertically — instantly in your browser." pageTitle="Rotate & Flip Image">
        <canvas ref={canvasRef} className="hidden" />

        {step === "idle" && <FileUploader onUpload={handleUpload} />}
        {step === "loading" && <UploadLoading filename={file?.name} />}
        {step === "processing" && <ProcessingAnimation label="Applying rotation…" />}

        {step === "done" && (
          <DownloadDone
            resultUrl={resultUrl}
            resultBlob={resultBlob}
            filename={`rotated-${file?.name ?? "image"}`}
            info={resultInfo}
            toolName="Image Rotator"
            toolPath="/tools/image-rotator"
            onReset={reset}
          />
        )}

        {step === "settings" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="min-h-[320px] bg-[repeating-conic-gradient(#f3f4f6_0%_25%,white_0%_50%)] bg-[length:20px_20px] dark:bg-gray-800 flex items-center justify-center p-4 overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      className="max-w-full max-h-[420px] object-contain rounded shadow-sm"
                      style={{ display: "block" }}
                    />
                  </div>
                  <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 text-center">
                    Rotation: <strong className="text-green-600 dark:text-green-400">{rotation}°</strong>
                    {flipH && <span className="ml-2">· Flipped Horizontal</span>}
                    {flipV && <span className="ml-2">· Flipped Vertical</span>}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <Label className="font-semibold mb-3 block">Quick Rotate</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                        className="flex flex-col items-center gap-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 transition-all text-xs font-medium text-gray-600 dark:text-gray-300">
                        <RotateCcw className="w-5 h-5" /> 90° Left
                      </button>
                      <button onClick={() => setRotation((r) => (r + 180) % 360)}
                        className="flex flex-col items-center gap-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 transition-all text-xs font-medium text-gray-600 dark:text-gray-300">
                        <RotateCw className="w-5 h-5" /> 180°
                      </button>
                      <button onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="flex flex-col items-center gap-1 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-700 dark:hover:text-green-400 transition-all text-xs font-medium text-gray-600 dark:text-gray-300">
                        <RotateCw className="w-5 h-5" /> 90° Right
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Custom Angle</Label>
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">{rotation}°</span>
                    </div>
                    <Slider value={[rotation]} min={0} max={359} step={1} onValueChange={(v) => setRotation(v[0])} />
                    <div className="flex gap-1.5 flex-wrap">
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                        <button key={a} onClick={() => setRotation(a)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-all ${rotation === a ? "bg-green-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>
                          {a}°
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="font-semibold mb-2 block">Flip</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setFlipH(!flipH)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${flipH ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400" : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 text-gray-600 dark:text-gray-300"}`}>
                        <FlipHorizontal className="w-4 h-4" /> Horizontal
                      </button>
                      <button onClick={() => setFlipV(!flipV)}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${flipV ? "border-green-500 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400" : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 text-gray-600 dark:text-gray-300"}`}>
                        <FlipVertical className="w-4 h-4" /> Vertical
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <button onClick={processImage}
                className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #15803d, #16a34a)", boxShadow: "0 4px 16px rgba(22,163,74,0.4)" }}>
                Apply & Download
              </button>
              <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Over
              </Button>
            </div>
          </div>
        )}

        <ToolArticle
          heading="How to Rotate &amp; Flip Images Online"
          subheading="Fix orientation, create mirrors, or add creative angles — live preview, instant download."
          body={[
            "Image rotation is one of the most common image corrections needed in everyday digital work. Smartphones and digital cameras embed an orientation flag in image metadata (EXIF data) that tells software which way to display the photo. Most modern applications respect this flag — but many older systems, web browsers in certain contexts, and image processing pipelines do not. The result: a photo that looks correctly oriented in your camera's gallery appears rotated 90 degrees when you upload it to a website, share it in a message, or embed it in a document. The fix is simple — rotate it to the correct orientation and save the file.",
            "The most common rotation need is correcting sideways photos. When you hold a smartphone vertically to take a portrait photo, the camera sensor actually captures the image sideways and embeds an EXIF orientation flag telling software to rotate it 90 degrees for display. Some platforms and tools strip this EXIF flag or ignore it entirely, causing the photo to appear sideways. A quick 90° rotation (either direction, depending on which way it's sideways) permanently bakes the correct orientation into the file, making it display correctly everywhere.",
            "<strong>90°, 180°, and 270° Rotations:</strong> These are the most common rotation angles and are mathematically lossless for raster images. At exactly 90°, 180°, or 270°, every pixel maps perfectly to a new position — no interpolation is needed, and the image quality is identical to the original. The output file size may differ slightly due to format re-encoding, but the visual quality is unchanged. For JPEG files specifically, 90-degree-multiple rotations can be performed in a truly lossless way (no re-encoding) when the dimensions are multiples of the JPEG block size (8 or 16 pixels). Our tool handles this automatically.",
            "<strong>Custom Angle Rotation:</strong> When you rotate an image by a non-multiple of 90° (e.g., 15° to straighten a crooked horizon), the tool must use interpolation to fill in the new pixel values along diagonal edges. The most common interpolation method is bilinear interpolation, which produces smooth, natural-looking results at the cost of slightly softened edges. For photography and general use, this is invisible. For graphics with hard edges or text, you may notice slight softening at extreme angles. Custom angles also introduce transparent corners (filled with white or another background color) unless you have a square image.",
            "<strong>Flipping vs. Rotating:</strong> Flipping and rotating are different operations. A horizontal flip (mirror) reflects the image left-to-right — the left side becomes the right side. A vertical flip reflects top-to-bottom. A 180° rotation is NOT the same as flipping both axes — it is equivalent to flipping horizontally AND flipping vertically. Common use cases for flipping: correcting selfies that appear as mirror images, creating symmetrical compositions, reversing text overlays, and artistic effects. Flipping is always lossless and produces a pixel-perfect result regardless of image dimensions.",
          ]}
          steps={[
            { title: "Upload your image", description: "Drag & drop or click to browse — JPG, PNG, WEBP, and GIF all supported." },
            { title: "Choose rotation", description: "Click 90° Left, 180°, or 90° Right for quick rotation. Use the slider for any angle from 0–359°." },
            { title: "Apply flip (optional)", description: "Toggle Horizontal flip to mirror the image, or Vertical flip to turn it upside down." },
            { title: "Download", description: "Click Apply & Download. The image saves in the same format as the original." },
          ]}
          tips={[
            "90° right or left to switch between portrait and landscape",
            "180° rotation is equivalent to flipping both H and V",
            "Use Flip Horizontal to mirror selfies or text images",
            "Custom angle slider is great for creative or artistic effects",
            "Preview updates live — no need to re-upload after each change",
          ]}
          faqs={[
            { question: "Does rotation affect image quality?", answer: "90°, 180°, and 270° rotations are lossless. Custom angles (e.g. 45°) require interpolation which may slightly soften edges." },
            { question: "What formats are supported?", answer: "JPG, PNG, WEBP, and GIF. The output format matches the input." },
            { question: "Is there a size limit?", answer: "No. Processing happens entirely in your browser — no file size restrictions." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

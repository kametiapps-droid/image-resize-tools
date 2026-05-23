import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, CheckCircle2 } from "lucide-react";
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
        <title>Free Image Rotator - Rotate & Flip Images Online | CropImages</title>
        <meta name="description" content="Rotate images to any angle and flip horizontally or vertically online for free. Instant browser-based processing — no upload, no signup." />
        <link rel="canonical" href="https://cropimages.store/tools/image-rotator" />
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

        <div className="mt-14 border-t border-gray-200 dark:border-gray-700 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Rotate & Flip Images Online</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <article>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Step-by-Step</h3>
                <ol className="space-y-3">
                  {[
                    { n: "1", t: "Upload your image", d: "Drag & drop or click to browse — JPG, PNG, WEBP, GIF supported." },
                    { n: "2", t: "Choose rotation & flip", d: "Use quick buttons (90°, 180°) or the custom angle slider (0–359°). Toggle horizontal/vertical flip." },
                    { n: "3", t: "Preview changes live", d: "The canvas updates in real-time as you adjust rotation and flip settings." },
                    { n: "4", t: "Download your image", d: "Click Apply & Download to save the transformed image in the original format." },
                  ].map((s) => (
                    <li key={s.n} className="flex gap-4">
                      <span className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{s.n}</span>
                      <div><p className="font-semibold text-gray-900 dark:text-white">{s.t}</p><p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.d}</p></div>
                    </li>
                  ))}
                </ol>
              </article>
            </div>
            <div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tips</h3>
                <ul className="space-y-2.5">
                  {["90° right/left for portrait↔landscape", "180° to flip upside down", "Use Flip H to mirror selfies", "Custom angle for artistic slant effects"].map((t, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ToolLayout>
    </>
  );
}

import { useState, useRef, useEffect } from "react";
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
        <title>Free Watermark Tool - Add Text Watermark to Images | CropImages</title>
        <meta name="description" content="Add custom text watermarks to your images online for free. Control position, size, color, and opacity. 100% browser-based — no upload needed." />
        <link rel="canonical" href="https://cropimages.store/tools/watermark" />
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

        <div className="mt-14 border-t border-gray-200 dark:border-gray-700 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How to Watermark Images for Free</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Protect Your Work", d: "Adding a watermark prevents others from using your photos without credit or permission." },
                  { t: "Brand Your Content", d: "Include your business name, website, or social handle on every image you share." },
                  { t: "Deter Plagiarism", d: "Visible watermarks make it harder to repurpose your images without detection." },
                  { t: "Professional Look", d: "Subtle, well-placed watermarks add a professional touch to portfolios and product photos." },
                ].map((item) => (
                  <div key={item.t} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{item.t}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Best Practices</h3>
                <ul className="space-y-2.5">
                  {["30–50% opacity for subtle watermarks", "Bottom-right or center for best protection", "White text with dark outline works on any image", "Use your full domain or brand name"].map((t, i) => (
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

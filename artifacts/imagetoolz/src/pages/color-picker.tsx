import { useState, useRef, MouseEvent as ReactMouseEvent } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading } from "@/components/tool-steps";
import { ShareButtons } from "@/components/share-buttons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Copy, Check, Crosshair } from "lucide-react";
import { ToolArticle } from "@/components/tool-article";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

type Step = "idle" | "loading" | "picking";
type ColorResult = { hex: string; rgb: string; hsl: string; r: number; g: number; b: number };

export default function ColorPicker() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState<ColorResult | null>(null);
  const [history, setHistory] = useState<ColorResult[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const recordUse = useRecordToolUse();
  const { toast } = useToast();

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setStep("loading");
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        canvasRef.current.getContext("2d")?.drawImage(img, 0, 0);
      }
      recordUse.mutate({ params: { id: "color-picker" }, data: { fileType: f.type, fileSizeKb: Math.round(f.size / 1024) } });
      setTimeout(() => setStep("picking"), 900);
    };
    img.src = url;
  };

  const rgbToHex = (r: number, g: number, b: number) => "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  const rgbToHsl = (r: number, g: number, b: number) => {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
        case gn: h = (bn - rn) / d + 2; break;
        case bn: h = (rn - gn) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const handleCanvasClick = (e: ReactMouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const p = ctx.getImageData(x, y, 1, 1).data;
    const [r, g, b] = [p[0], p[1], p[2]];
    const result: ColorResult = { hex: rgbToHex(r, g, b), rgb: `rgb(${r}, ${g}, ${b})`, hsl: rgbToHsl(r, g, b), r, g, b };
    setColor(result);
    setHistory((prev) => [result, ...prev.slice(0, 7)]);
  };

  const copyValue = async (val: string, key: string) => {
    try {
      await navigator.clipboard.writeText(val);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
      toast({ title: "Copied!", description: val });
    } catch {}
  };

  const reset = () => { setStep("idle"); setFile(null); setColor(null); setHistory([]); imageRef.current = null; };

  const CopyBtn = ({ val, label }: { val: string; label: string }) => (
    <button onClick={() => copyValue(val, label)}
      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg border transition-all text-sm ${copied === label ? "border-green-400 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400" : "border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"}`}>
      <span className="font-mono text-xs">{val}</span>
      <span className="flex items-center gap-1 text-xs font-semibold shrink-0 ml-2">
        {copied === label ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> {label}</>}
      </span>
    </button>
  );

  return (
    <>
      <Helmet>
        <title>Free Color Picker - Extract Colors from Images | CropImages</title>
        <meta name="description" content="Pick colors from any image online for free. Get HEX, RGB, and HSL values instantly by clicking anywhere on your image. 100% browser-based." />
        <link rel="canonical" href="https://cropimages.store/tools/color-picker" />
      </Helmet>
      <ToolLayout toolId="color-picker" title="Color Picker" description="Click anywhere on your image to extract exact HEX, RGB, and HSL color values — instantly." pageTitle="Color Picker">

        {step === "idle" && <FileUploader onUpload={handleUpload} label="Upload image to pick colors" />}
        {step === "loading" && <UploadLoading filename={file?.name} />}

        {step === "picking" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <canvas
                        ref={canvasRef}
                        onClick={handleCanvasClick}
                        className="max-w-full block cursor-crosshair rounded-t-lg"
                        style={{ maxHeight: "480px", objectFit: "contain" }}
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-medium">
                        <Crosshair className="w-3.5 h-3.5" />
                        Click anywhere to pick a color
                      </div>
                    </div>
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 text-center">
                      {color ? `Last picked: ${color.hex}` : "Click on the image to pick a color"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {color && (
                  <Card>
                    <CardContent className="p-5 space-y-4">
                      <div className="w-full h-24 rounded-xl border-4 border-white dark:border-gray-700 shadow-md transition-colors" style={{ background: color.hex }} />
                      <div className="space-y-2">
                        <CopyBtn val={color.hex} label="HEX" />
                        <CopyBtn val={color.rgb} label="RGB" />
                        <CopyBtn val={color.hsl} label="HSL" />
                      </div>
                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {[{ label: "R", v: color.r, color: "#ef4444" }, { label: "G", v: color.g, color: "#22c55e" }, { label: "B", v: color.b, color: "#3b82f6" }].map((c) => (
                          <div key={c.label} className="flex flex-col items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span className="text-xs font-bold" style={{ color: c.color }}>{c.label}</span>
                            <span className="text-sm font-mono font-bold text-gray-800 dark:text-gray-200">{c.v}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {history.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Color History</p>
                      <div className="grid grid-cols-4 gap-2">
                        {history.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => setColor(c)}
                            title={c.hex}
                            className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${color?.hex === c.hex ? "border-green-500 scale-110" : "border-transparent"}`}
                            style={{ background: c.hex }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Button variant="outline" className="w-full" onClick={reset}>
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Pick from Another Image
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-5">
              <ShareButtons toolName="Color Picker" toolPath="/tools/color-picker" />
            </div>
          </div>
        )}

        <ToolArticle
          heading="How to Pick Colors from Images"
          subheading="Click anywhere on any image to extract exact HEX, RGB, and HSL color values — instantly."
          steps={[
            { title: "Upload your image", description: "Select any JPG, PNG, WEBP, or GIF file — a logo, screenshot, photo, or design reference." },
            { title: "Click anywhere on the image", description: "Your cursor becomes a crosshair. Click any pixel to extract its exact color value." },
            { title: "Copy the color code", description: "Click to copy HEX (for web/CSS), RGB (for Photoshop/Figma), or HSL (for design tools)." },
            { title: "Compare with history", description: "Your last 8 picked colors are shown below. Click any swatch to view its values again." },
          ]}
          tips={[
            "HEX is the standard format for web and CSS development",
            "RGB is used directly in Photoshop, Figma, and Illustrator",
            "HSL is best when you need to adjust hue, saturation, or brightness",
            "Zoom your browser in (Ctrl+) for more precise pixel-level picking",
            "Use the color history to build a palette from a single image",
          ]}
          faqs={[
            { question: "What color formats does this tool provide?", answer: "HEX (#rrggbb), RGB (r, g, b), and HSL (h°, s%, l%) — all three are shown and individually copyable." },
            { question: "How many colors can I pick per session?", answer: "Unlimited picks per session. The last 8 colors are shown in the history panel for easy comparison." },
            { question: "Is my image uploaded anywhere?", answer: "No. Color picking uses the Canvas API entirely in your browser. Your image never leaves your device." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

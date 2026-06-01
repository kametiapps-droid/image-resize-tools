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
        <title>Free Color Picker — Extract HEX, RGB, HSL Colors from Any Image | Image Resize</title>
        <meta name="description" content="Pick exact colors from any image online free. Get HEX, RGB, and HSL color codes instantly by clicking any pixel. Extract brand colors, build palettes — no upload, no signup." />
        <link rel="canonical" href="https://imageresize.app/tools/color-picker" />
        <meta property="og:title" content="Free Color Picker from Image — Image Resize" />
        <meta property="og:description" content="Extract HEX, RGB, HSL color codes from any image by clicking. Free, browser-based, instant — no upload needed." />
        <meta property="og:url" content="https://imageresize.app/tools/color-picker" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Color Picker from Image",
          "description": "Free online color picker — click any pixel in any image to get HEX, RGB, and HSL color values instantly.",
          "url": "https://imageresize.app/tools/color-picker",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
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
          body={[
            "Color picking is an essential skill in web development, graphic design, UI/UX design, and brand work. When you see a color you want to match — in a logo, a photograph, a competitor's website, a design reference — you need the exact color code in the format your tool accepts. CSS accepts HEX (#3b82f6) or RGB (rgb(59, 130, 246)) or HSL values. Figma and Sketch accept HEX or RGB. Photoshop and Illustrator use RGB values in their color pickers. Our tool gives you all three formats simultaneously with a single click on any pixel of any image.",
            "The most common use case is brand color matching. A client gives you their logo as a JPEG or PNG, and you need to match the exact green from their logo for a website header, button color, or email template. Instead of guessing or using an imprecise approximation, upload the logo to our color picker, click on the exact shade of green, and get the precise HEX value (#22c55e, not just 'some green'). This eliminates the color inconsistency that undermines brand professionalism across digital touchpoints.",
            "<strong>Understanding the Three Color Formats:</strong> HEX (#rrggbb) is the six-character hexadecimal representation used in CSS, HTML, and most web design tools. It encodes red, green, and blue values each from 00 (zero intensity) to ff (full intensity). HEX is the default format in CSS, Tailwind CSS, and web design tools. RGB (red, green, blue) expresses the same three channels as decimal numbers from 0 to 255. This is the format used natively by most design software color pickers and directly in CSS's rgb() function. HSL (hue, saturation, lightness) is the most human-intuitive format — hue is the color on the color wheel (0–360°), saturation is the color intensity (0% gray to 100% vivid), and lightness is how light or dark the color is (0% black to 100% white). HSL is the easiest format for programmatically generating color variations: lighten by adding 10 to L, desaturate by reducing S.",
            "<strong>Building a Color Palette from Images:</strong> Our tool saves your last 8 picked colors in the history panel below the picker. This makes it easy to build a complete color palette from a single image — pick the primary brand color, the secondary accent, background tones, and text colors, then compare them side-by-side in the history swatches. This workflow replaces manual eyedropper tools in Photoshop for quick palette extraction without leaving your browser.",
            "<strong>Accuracy and Rendering:</strong> Color picking uses the HTML5 Canvas API's getImageData() function, which reads the exact rendered pixel color at the clicked coordinate. On standard sRGB displays (the vast majority of monitors and screens), values are accurate to within 1-2 units per channel. Note that display color profiles, browser rendering, and gamma settings can affect perceived color on wide-gamut (P3) displays — if color accuracy is critical for print production, verify colors in a color-managed application like Photoshop with the correct ICC profile.",
          ]}
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

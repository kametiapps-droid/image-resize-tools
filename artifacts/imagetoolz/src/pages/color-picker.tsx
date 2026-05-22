import { useState, useRef, MouseEvent as ReactMouseEvent } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Copy, CheckCircle2, Crosshair } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

type ColorResult = { hex: string; rgb: string; hsl: string; r: number; g: number; b: number };

export default function ColorPicker() {
  const [file, setFile] = useState<File | null>(null);
  const [color, setColor] = useState<ColorResult | null>(null);
  const [history, setHistory] = useState<ColorResult[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const url = URL.createObjectURL(selected);
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      if (canvasRef.current) {
        canvasRef.current.width = img.width;
        canvasRef.current.height = img.height;
        const ctx = canvasRef.current.getContext("2d");
        ctx?.drawImage(img, 0, 0);
      }
      recordUse.mutate({ params: { id: "color-picker" }, data: { fileType: selected.type, fileSizeKb: Math.round(selected.size / 1024) } });
    };
    img.src = url;
  };

  const rgbToHex = (r: number, g: number, b: number) =>
    "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");

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
    const result: ColorResult = {
      hex: rgbToHex(r, g, b),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: rgbToHsl(r, g, b),
      r, g, b,
    };
    setColor(result);
    setHistory(prev => [result, ...prev.slice(0, 7)]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: `${text} copied to clipboard.` });
  };

  const isLight = color ? (color.r * 299 + color.g * 587 + color.b * 114) / 1000 > 128 : true;

  return (
    <ToolLayout toolId="color-picker" title="Color Picker" description="Click anywhere on your image to extract precise HEX, RGB, and HSL color values instantly.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center bg-muted/20 min-h-[400px]">
                <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                  <Crosshair className="w-4 h-4" />
                  Click anywhere on the image to pick a color
                </div>
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  className="max-w-full max-h-[500px] object-contain shadow-sm border border-border rounded-md cursor-crosshair"
                />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-5">
            <Card>
              <CardContent className="p-6 space-y-5">
                {/* Color swatch */}
                <div
                  className="h-28 rounded-xl border-2 border-gray-200 flex items-center justify-center transition-colors duration-150"
                  style={{ backgroundColor: color?.hex || "#f1f5f9" }}
                >
                  {!color && <span className="text-gray-400 text-sm font-medium">Click image to pick</span>}
                  {color && (
                    <span className="font-bold text-lg tracking-wider" style={{ color: isLight ? "#1e293b" : "#f8fafc" }}>
                      {color.hex.toUpperCase()}
                    </span>
                  )}
                </div>

                {color && (
                  <div className="space-y-2">
                    {[
                      { label: "HEX", val: color.hex.toUpperCase() },
                      { label: "RGB", val: color.rgb },
                      { label: "HSL", val: color.hsl },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-2.5 bg-muted/40 rounded-lg border">
                        <span className="text-xs font-bold text-muted-foreground w-10">{item.label}</span>
                        <span className="text-xs font-mono flex-1 text-center truncate px-2">{item.val}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => copyToClipboard(item.val)}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {history.length > 1 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Color History</p>
                    <div className="flex flex-wrap gap-2">
                      {history.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setColor(c)}
                          title={c.hex.toUpperCase()}
                          className="w-7 h-7 rounded-md border-2 border-white shadow-sm hover:scale-110 transition-transform"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setColor(null); setHistory([]); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Start Over
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Article Guide */}
      <div className="mt-14 border-t border-gray-200 pt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Pick Colors from Images — Complete Guide</h2>
          <p className="text-gray-500 text-sm mb-8">Learn color formats, when to use HEX vs RGB vs HSL, and how to build color palettes from photos.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Understanding Color Formats</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Format</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Example</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Used In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["HEX", "#3B82F6", "Web CSS, design tools (Figma, Sketch), HTML"],
                      ["RGB", "rgb(59, 130, 246)", "CSS, JavaScript, image processing libraries"],
                      ["HSL", "hsl(217, 91%, 60%)", "CSS animations, dynamic theming, color math"],
                    ].map(([f, e, u], i) => (
                      <tr key={i} className={`border border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2 font-bold text-gray-900 border-r border-gray-200">{f}</td>
                        <td className="px-4 py-2 font-mono text-gray-600 border-r border-gray-200">{e}</td>
                        <td className="px-4 py-2 text-gray-500">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Building a Brand Color Palette from a Photo</h3>
              <p className="text-gray-600 leading-relaxed">
                The Color Picker tool is perfect for extracting a brand palette from a product photo, logo, or mood board. A good brand palette typically has: 1 primary color (dominant, used most), 1–2 secondary colors (supporting accents), and 1–2 neutral colors (backgrounds, text).
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                Click on the most prominent areas of your image — highlights, midtones, and shadows — to extract 4–6 colors that feel cohesive. Use the color history to track your picks.
              </p>
            </article>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Pro Tips</h3>
              <ul className="space-y-2.5">
                {[
                  "Pick from shadows for deep neutrals",
                  "Highlights give you light accent colors",
                  "Use HSL to create tints/shades (adjust lightness)",
                  "HEX is what Figma and Tailwind CSS use",
                  "RGB is best for JavaScript canvas operations",
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">FAQs</h3>
              <div className="space-y-4">
                {[
                  { q: "How accurate is the color picker?", a: "It reads the exact pixel color from the canvas — 100% accurate to the pixel you click." },
                  { q: "Can I pick colors from PNG with transparency?", a: "Yes — the picker reads all four channels (RGBA). Fully transparent pixels will show black." },
                  { q: "What is the color history?", a: "The last 8 colors you picked are saved as swatches. Click any swatch to restore it." },
                ].map((faq, i) => (
                  <div key={i}>
                    <p className="text-sm font-semibold text-gray-800">{faq.q}</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

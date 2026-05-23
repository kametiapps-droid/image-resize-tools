import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, X, Plus, CheckCircle2, FileText } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import jsPDF from "jspdf";

type Step = "idle" | "processing" | "done";

const pageSizes: Record<string, [number, number]> = {
  A4: [210, 297], Letter: [215.9, 279.4], A3: [297, 420], Legal: [215.9, 355.6],
};

export default function ImageToPdf() {
  const [step, setStep] = useState<Step>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultInfo, setResultInfo] = useState("");
  const recordUse = useRecordToolUse();

  const handleUpload = (newFiles: File[]) => {
    const updated = [...files, ...newFiles].slice(0, 20);
    setFiles(updated);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, 20));
  };

  const removeFile = (i: number) => {
    URL.revokeObjectURL(previews[i]);
    setFiles((f) => f.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  const processPdf = async () => {
    if (!files.length) return;
    setStep("processing");
    try {
      const pdf = new jsPDF({ orientation, unit: "mm", format: pageSize.toLowerCase() as any });
      const [pw, ph] = pageSizes[pageSize];
      const pdfW = orientation === "landscape" ? ph : pw;
      const pdfH = orientation === "landscape" ? pw : ph;
      const margin = 10;

      for (let i = 0; i < files.length; i++) {
        const url = previews[i];
        const img = await new Promise<HTMLImageElement>((res) => {
          const el = new Image();
          el.onload = () => res(el);
          el.src = url;
        });
        if (i > 0) pdf.addPage();
        const availW = pdfW - margin * 2;
        const availH = pdfH - margin * 2;
        const imgRatio = img.width / img.height;
        const pageRatio = availW / availH;
        let drawW = availW, drawH = availH;
        if (imgRatio > pageRatio) { drawH = availW / imgRatio; } else { drawW = availH * imgRatio; }
        const x = margin + (availW - drawW) / 2;
        const y = margin + (availH - drawH) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = img.width; canvas.height = img.height;
        canvas.getContext("2d")!.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        pdf.addImage(dataUrl, "JPEG", x, y, drawW, drawH);
      }

      const pdfBytes = pdf.output("arraybuffer");
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setResultBlob(blob);
      const kb = Math.round(blob.size / 1024);
      setResultInfo(`${files.length} page${files.length > 1 ? "s" : ""} · ${pageSize} ${orientation} · ${kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`}`);
      recordUse.mutate({ params: { id: "image-to-pdf" }, data: { fileType: "application/pdf", fileSizeKb: kb } });
      setStep("done");
    } catch {
      setStep("idle");
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = "images.pdf";
    a.click();
  };

  const reset = () => {
    previews.forEach((p) => URL.revokeObjectURL(p));
    setStep("idle"); setFiles([]); setPreviews([]); setResultBlob(null);
  };

  return (
    <>
      <Helmet>
        <title>Free Image to PDF Converter - Combine Images into PDF | CropImages</title>
        <meta name="description" content="Convert images to PDF online for free. Combine multiple JPG, PNG, WEBP images into one PDF document. Choose A4, Letter, or A3 page size. 100% browser-based." />
        <link rel="canonical" href="https://cropimages.store/tools/image-to-pdf" />
      </Helmet>
      <ToolLayout toolId="image-to-pdf" title="Image to PDF" description="Combine one or multiple images into a single PDF — choose page size and orientation, free & private." pageTitle="Image to PDF">

        {step === "processing" && <ProcessingAnimation label={`Building PDF with ${files.length} image${files.length > 1 ? "s" : ""}…`} />}

        {step === "done" && (
          <DownloadDone
            resultUrl={null}
            resultBlob={resultBlob}
            filename="images.pdf"
            info={resultInfo}
            toolName="Image to PDF"
            toolPath="/tools/image-to-pdf"
            onReset={reset}
            onDownload={handleDownload}
          />
        )}

        {step === "idle" && (
          <div className="space-y-5">
            {files.length === 0 ? (
              <FileUploader onUpload={handleUpload} multiple label="Upload images for PDF" />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {previews.map((p, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 group">
                      <img src={p} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => removeFile(i)} className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/60 text-white text-xs rounded font-medium">{i + 1}</div>
                    </div>
                  ))}
                  {files.length < 20 && (
                    <button
                      onClick={() => document.getElementById("pdf-add-input")?.click()}
                      className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all text-gray-400 dark:text-gray-500">
                      <Plus className="w-6 h-6" />
                      <span className="text-xs">Add more</span>
                      <input id="pdf-add-input" type="file" accept="image/*" multiple className="hidden"
                        onChange={(e) => e.target.files && handleUpload(Array.from(e.target.files))} />
                    </button>
                  )}
                </div>

                <Card>
                  <CardContent className="p-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-semibold">Page Size</Label>
                        <Select value={pageSize} onValueChange={setPageSize}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(pageSizes).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-semibold">Orientation</Label>
                        <Select value={orientation} onValueChange={(v) => setOrientation(v as any)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="portrait">Portrait</SelectItem>
                            <SelectItem value="landscape">Landscape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-100 dark:border-green-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                      <span className="text-xs text-green-700 dark:text-green-400">
                        <strong>{files.length} image{files.length > 1 ? "s" : ""}</strong> → 1 PDF · {pageSize} · {orientation}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <button onClick={processPdf}
                  className="w-full py-4 rounded-xl font-bold text-base text-white transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #15803d, #16a34a)", boxShadow: "0 4px 16px rgba(22,163,74,0.4)" }}>
                  Create PDF ({files.length} image{files.length > 1 ? "s" : ""})
                </button>
                <Button variant="outline" size="sm" className="w-full" onClick={reset}>
                  <RefreshCw className="w-3.5 h-3.5 mr-2" /> Start Over
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="mt-14 border-t border-gray-200 dark:border-gray-700 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">How to Convert Images to PDF Online</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ol className="space-y-3">
                {[
                  { n: "1", t: "Upload your images", d: "Select one or multiple JPG, PNG, WEBP, or GIF files. Up to 20 images per PDF." },
                  { n: "2", t: "Review the order", d: "Images are shown as thumbnails in order. Click ✕ to remove any you don't want." },
                  { n: "3", t: "Choose page settings", d: "Select PDF page size (A4, Letter, A3, Legal) and orientation (portrait or landscape)." },
                  { n: "4", t: "Create & Download", d: "Click Create PDF — the file is generated in your browser and downloaded instantly." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{s.n}</span>
                    <div><p className="font-semibold text-gray-900 dark:text-white">{s.t}</p><p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{s.d}</p></div>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Tips</h3>
                <ul className="space-y-2.5">
                  {["A4 is standard for most documents", "Landscape for wide/panoramic photos", "Portrait for receipts and portraits", "Up to 20 images per PDF", "No file size limit — browser memory only"].map((t, i) => (
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

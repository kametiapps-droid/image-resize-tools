import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

const pageSizes: Record<string, [number, number]> = {
  A4: [210, 297],
  Letter: [215.9, 279.4],
  A3: [297, 420],
  Legal: [215.9, 355.6],
};

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageSize, setPageSize] = useState("A4");
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (uploaded: File[]) => {
    setFiles(prev => [...prev, ...uploaded]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processPdf = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const [w, h] = pageSizes[pageSize];
      const pdfW = orientation === "landscape" ? h : w;
      const pdfH = orientation === "landscape" ? w : h;
      const pdf = new jsPDF({ orientation, unit: "mm", format: pageSize.toLowerCase() });

      for (let i = 0; i < files.length; i++) {
        if (i > 0) pdf.addPage();
        const file = files[i];
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const ratio = Math.min(pdfW / img.width, pdfH / img.height);
            const iW = img.width * ratio;
            const iH = img.height * ratio;
            const x = (pdfW - iW) / 2;
            const y = (pdfH - iH) / 2;
            pdf.addImage(img, "JPEG", x, y, iW, iH);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      }
      pdf.save("images.pdf");
      toast({ title: "Success", description: `PDF with ${files.length} page${files.length > 1 ? "s" : ""} downloaded.` });
      recordUse.mutate({ params: { id: "image-to-pdf" }, data: { fileType: "application/pdf", fileSizeKb: 0 } });
    } catch {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout toolId="image-to-pdf" title="Image to PDF" description="Combine one or more images into a single PDF document. Choose page size and orientation.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <FileUploader onUpload={handleUpload} multiple={true} />
          {files.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-3">{files.length} image{files.length !== 1 ? "s" : ""} selected — each image = one PDF page</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="relative group border rounded-lg overflow-hidden bg-muted aspect-square">
                    <img src={URL.createObjectURL(f)} className="object-cover w-full h-full" alt={`Page ${i + 1}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeFile(i)} className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors">
                        <X className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <span className="absolute bottom-1 left-1 text-xs font-bold text-white bg-black/50 px-1.5 py-0.5 rounded">p{i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label>Page Size</Label>
                <Select value={pageSize} onValueChange={setPageSize}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(pageSizes).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Orientation</Label>
                <Select value={orientation} onValueChange={(v) => setOrientation(v as "portrait" | "landscape")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg">
                {files.length} page{files.length !== 1 ? "s" : ""} · {pageSize} · {orientation}
              </div>
              <Button className="w-full" size="lg" onClick={processPdf} disabled={files.length === 0 || isProcessing}>
                <Download className="w-4 h-4 mr-2" />
                {isProcessing ? "Generating PDF..." : "Download PDF"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setFiles([])}>
                <RefreshCw className="w-4 h-4 mr-2" /> Clear All
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Article Guide */}
      <div className="mt-14 border-t border-gray-200 pt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How to Convert Images to PDF Online</h2>
          <p className="text-gray-500 text-sm mb-8">A complete guide to creating PDF documents from photos and images for sharing, printing, and archiving.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Convert Images to PDF?</h3>
              <p className="text-gray-600 leading-relaxed">
                PDF (Portable Document Format) is the universal standard for sharing documents that look the same on every device. Converting images to PDF is ideal for: sharing multiple photos as a single attachment, creating a photo album or lookbook, submitting scanned documents to institutions, presenting a portfolio, or archiving images in a structured format.
              </p>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Step-by-Step Guide</h3>
              <ol className="space-y-3">
                {[
                  { n: "1", t: "Upload your images", d: "Select multiple images at once. Each image becomes one page in the PDF. You can upload JPG, PNG, or WEBP files." },
                  { n: "2", t: "Review and reorder", d: "See all uploaded images as numbered thumbnails. Remove any unwanted images with the × button." },
                  { n: "3", t: "Choose page settings", d: "Select your page size (A4, Letter, A3, Legal) and orientation (portrait or landscape)." },
                  { n: "4", t: "Download your PDF", d: "Click 'Download PDF'. The file is generated entirely in your browser using jsPDF and saved instantly." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-4">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">{step.n}</span>
                    <div>
                      <p className="font-semibold text-gray-900">{step.t}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{step.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Page Size Reference</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border border-gray-200">
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Size</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700 border-r border-gray-200">Dimensions (mm)</th>
                      <th className="text-left px-4 py-2 font-semibold text-gray-700">Common Use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["A4", "210 × 297", "International standard, most common"],
                      ["Letter", "215.9 × 279.4", "US standard, business documents"],
                      ["A3", "297 × 420", "Posters, large prints, presentations"],
                      ["Legal", "215.9 × 355.6", "US legal documents"],
                    ].map(([s, d, u], i) => (
                      <tr key={i} className={`border border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                        <td className="px-4 py-2 font-bold text-gray-900 border-r border-gray-200">{s}</td>
                        <td className="px-4 py-2 font-mono text-gray-600 border-r border-gray-200">{d}</td>
                        <td className="px-4 py-2 text-gray-500">{u}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Tips for Best Results</h3>
              <ul className="space-y-2.5">
                {[
                  "Use landscape orientation for wide photos",
                  "Use portrait for tall/vertical images",
                  "Images are centered and scaled to fit the page",
                  "Order matters — arrange images before uploading",
                  "Compress large photos first for smaller PDF files",
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
                  { q: "How many images can I add?", a: "There's no hard limit — however, very large files may be slow to process in the browser." },
                  { q: "Is the PDF searchable?", a: "No. Images embedded in a PDF are not searchable text. For searchable PDFs, you need OCR software." },
                  { q: "Are images uploaded to a server?", a: "Never. The PDF is created entirely in your browser using jsPDF. No data is transmitted." },
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

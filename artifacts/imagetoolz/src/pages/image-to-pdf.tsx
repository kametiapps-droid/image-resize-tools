import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { ProcessingAnimation, DownloadDone } from "@/components/tool-steps";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, X, Plus, FileText } from "lucide-react";
import { ToolArticle } from "@/components/tool-article";
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
        <title>Free Image to PDF Converter — Combine Multiple Photos into One PDF | Image Resize</title>
        <meta name="description" content="Convert JPG, PNG, WEBP images to PDF online free. Combine multiple photos into a single PDF document. Choose A4, Letter, or A3 page size — 100% browser-based, no upload." />
        <link rel="canonical" href="https://imageresize.app/tools/image-to-pdf" />
        <meta property="og:title" content="Free Image to PDF — Image Resize" />
        <meta property="og:description" content="Convert multiple JPG, PNG images into one PDF. Choose page size and orientation — free, instant, no upload needed." />
        <meta property="og:url" content="https://imageresize.app/tools/image-to-pdf" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Image to PDF Converter",
          "description": "Free online image to PDF converter — combine multiple photos into a single PDF document instantly in your browser.",
          "url": "https://imageresize.app/tools/image-to-pdf",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
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

        <ToolArticle
          heading="How to Convert Images to PDF"
          subheading="Combine one or more images into a single PDF document — choose page size, orientation, and order."
          body={[
            "Converting images to PDF is one of the most practical document tasks in both professional and personal contexts. PDFs are the universal document format — they display identically on every device and operating system, preserve image quality exactly, cannot be accidentally edited, and are accepted by virtually every system that receives documents. When you need to submit multiple photos as a single document (application forms, project portfolios, receipts for expense reports, ID verification, property inspection photos), combining them into a PDF is always cleaner than attaching multiple separate image files.",
            "The most common use case is consolidating paper documents that have been photographed or scanned. A multi-page form photographed one page at a time produces 4–8 separate JPEG files. Combining them into a single ordered PDF makes the document coherent, easy to review, and appropriate to send or submit. Similarly, e-commerce sellers photographing products from multiple angles can combine 6–8 product shots into a single PDF catalog page. Real estate agents combine interior and exterior photos into PDF walk-through documents.",
            "<strong>Choosing the Right Page Size:</strong> A4 (210×297mm / 8.27×11.69 inches) is the international standard document size — used throughout Europe, Asia, and most of the world. Letter (8.5×11 inches) is the North American standard used in the US and Canada. A3 (297×420mm) is double the size of A4 — appropriate for architectural drawings, large format plans, and oversized prints. Legal (8.5×14 inches) is used for legal documents in the US. For most purposes, use A4 unless you know your recipient or submission system expects Letter. When in doubt, A4 is the safer choice for international submissions.",
            "<strong>Portrait vs. Landscape Orientation:</strong> Choose portrait (tall) for documents, receipts, forms, portraits, and any image that is taller than it is wide. Choose landscape (wide) for panoramic photos, wide landscapes, spreadsheet screenshots, presentation slides, and any image wider than it is tall. Our tool automatically fits each image to the selected page size while maintaining its aspect ratio — white margins are added to fill any remaining space, keeping images sharp and un-distorted.",
            "<strong>File Size Considerations:</strong> PDF files containing images can be large — especially if you include many high-resolution photos. A PDF with 10 uncompressed 4K photos can exceed 50 MB. For submissions with file size limits, compress your images first using our Image Compressor tool (reducing each photo to 200–400 KB at 80% JPEG quality), then combine them into a PDF. This typically produces a 2–5 MB document from 10 photos while maintaining professional appearance. All PDF generation happens entirely in your browser using jsPDF — nothing is uploaded to any server.",
          ]}
          steps={[
            { title: "Upload your images", description: "Select one or multiple JPG, PNG, WEBP, or GIF files. Up to 20 images per PDF." },
            { title: "Review order", description: "Images appear as numbered thumbnails. Click ✕ on any to remove it, or add more with the + button." },
            { title: "Set page options", description: "Choose page size (A4, Letter, A3, Legal) and orientation (Portrait or Landscape)." },
            { title: "Create & Download", description: "Click Create PDF — the file is generated entirely in your browser and downloaded immediately." },
          ]}
          tips={[
            "A4 (210×297mm) is the global standard for documents",
            "Use Landscape orientation for wide or panoramic photos",
            "Portrait works best for receipts, ID cards, and portraits",
            "Compress images first to reduce final PDF file size",
            "Up to 20 images per PDF — no file size limit",
          ]}
          faqs={[
            { question: "Can I reorder images before creating the PDF?", answer: "The images appear in the order you selected them. Remove and re-add them to change the order." },
            { question: "What PDF page sizes are available?", answer: "A4, A3, Letter (US), and Legal. Portrait and landscape are both supported for each." },
            { question: "Are my images uploaded to a server?", answer: "No. The PDF is generated 100% in your browser using jsPDF. Nothing is sent anywhere." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

import { useState, useRef } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (uploaded: File[]) => {
    setFiles(prev => [...prev, ...uploaded]);
  };

  const processPdf = async () => {
    if (files.length === 0) return;

    try {
      const pdf = new jsPDF();
      
      for (let i = 0; i < files.length; i++) {
        if (i > 0) pdf.addPage();
        const file = files[i];
        const url = URL.createObjectURL(file);
        
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const ratio = Math.min(pdfWidth / img.width, pdfHeight / img.height);
            
            const w = img.width * ratio;
            const h = img.height * ratio;
            const x = (pdfWidth - w) / 2;
            const y = (pdfHeight - h) / 2;
            
            pdf.addImage(img, 'JPEG', x, y, w, h);
            URL.revokeObjectURL(url);
            resolve();
          };
          img.src = url;
        });
      }

      pdf.save("images.pdf");
      toast({ title: "Success", description: "PDF generated successfully." });
      recordUse.mutate({ id: "image-to-pdf", data: { fileType: "application/pdf", fileSizeKb: 0 } });
    } catch (e) {
      toast({ title: "Error", description: "Failed to generate PDF.", variant: "destructive" });
    }
  };

  return (
    <ToolLayout toolId="image-to-pdf" title="Image to PDF" description="Combine multiple images into a single PDF document.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <FileUploader onUpload={handleUpload} multiple={true} />
          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {files.map((f, i) => (
                <div key={i} className="relative border rounded-md overflow-hidden bg-muted aspect-square">
                  <img src={URL.createObjectURL(f)} className="object-cover w-full h-full" alt="Preview" />
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="text-sm text-muted-foreground">{files.length} images selected</div>
              <Button className="w-full" size="lg" onClick={processPdf} disabled={files.length === 0}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setFiles([])}>
                <RefreshCw className="w-4 h-4 mr-2" /> Clear All
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ToolLayout>
  );
}

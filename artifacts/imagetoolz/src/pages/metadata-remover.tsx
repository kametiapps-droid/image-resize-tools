import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, RefreshCw, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const exifFields = [
  "GPS Location (latitude & longitude)",
  "Camera make and model",
  "Lens information",
  "Date and time taken",
  "Exposure settings (ISO, aperture, shutter speed)",
  "Device serial number",
  "Software used to edit",
  "Copyright and artist name",
  "Thumbnail preview",
];

export default function MetadataRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [cleanFile, setCleanFile] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    processImageFile(selected);
  };

  const processImageFile = async (inputFile: File) => {
    setIsProcessing(true);
    const url = URL.createObjectURL(inputFile);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            setCleanFile(blob);
            recordUse.mutate({ params: { id: "metadata-remover" }, data: { fileType: inputFile.type, fileSizeKb: Math.round(blob.size / 1024) } });
            toast({ title: "Done", description: "All metadata removed successfully." });
          }
          setIsProcessing(false);
          URL.revokeObjectURL(url);
        }, inputFile.type === "image/png" ? "image/png" : "image/jpeg", 1.0);
      }
    };
    img.src = url;
  };

  const downloadImage = () => {
    if (!cleanFile || !file) return;
    const url = URL.createObjectURL(cleanFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clean-${file.name}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout toolId="metadata-remover" title="EXIF Metadata Remover" description="Strip GPS location, camera data, and all hidden EXIF metadata from images before sharing.">
      {!file ? (
        <FileUploader onUpload={handleUpload} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center bg-muted/20 min-h-[400px] text-center space-y-6">
                {isProcessing ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                      <ShieldCheck className="w-10 h-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Removing Metadata...</h3>
                      <p className="text-muted-foreground text-sm">Redrawing image to a clean canvas</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                      <ShieldCheck className="w-11 h-11" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2 text-green-700">Image Sanitized</h3>
                      <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
                        All hidden EXIF data — including GPS location, camera model, device serial number, and capture timestamps — has been completely removed from this image.
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
                      {["GPS Removed", "Camera Data Gone", "100% Private"].map((label) => (
                        <div key={label} className="flex flex-col items-center gap-1 p-3 bg-green-50 rounded-lg border border-green-100">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <span className="text-xs font-medium text-green-700 text-center leading-tight">{label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-5">
                {file && (
                  <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground font-medium">File: {file.name}</p>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Original size:</span>
                      <span className="font-medium text-foreground">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                    {cleanFile && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Clean size:</span>
                        <span className="font-medium text-green-600">{(cleanFile.size / 1024).toFixed(1)} KB</span>
                      </div>
                    )}
                  </div>
                )}

                <Button className="w-full" size="lg" onClick={downloadImage} disabled={isProcessing || !cleanFile}>
                  <Download className="w-4 h-4 mr-2" />
                  {isProcessing ? "Cleaning..." : "Download Clean Image"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => { setFile(null); setCleanFile(null); }}>
                  <RefreshCw className="w-4 h-4 mr-2" /> Process Another
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Article Guide */}
      <div className="mt-14 border-t border-gray-200 pt-10 space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">What Is EXIF Metadata and Why Remove It?</h2>
          <p className="text-gray-500 text-sm mb-8">A complete guide to image metadata, privacy risks, and how to protect your personal information when sharing photos online.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What Is EXIF Metadata?</h3>
              <p className="text-gray-600 leading-relaxed">
                EXIF (Exchangeable Image File Format) is a standard that embeds technical and contextual data inside image files. Every photo taken with a smartphone or digital camera contains EXIF data. This data is invisible to the naked eye but can be read by anyone using free tools — including law enforcement, advertisers, and malicious actors.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                <strong>EXIF data can include your exact GPS coordinates at the moment a photo was taken</strong> — revealing your home address, workplace, or daily routine if you post photos publicly online.
              </p>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What Metadata Is Removed?</h3>
              <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-sm font-semibold text-red-700">Data that may be in your photos</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {exifFields.map((field, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-red-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            </article>

            <article>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How the Metadata Remover Works</h3>
              <p className="text-gray-600 leading-relaxed">
                Our tool uses a proven technique: it draws your image onto an HTML5 Canvas and exports it as a new file. The Canvas API only copies visible pixel data — it discards all metadata headers (EXIF, IPTC, XMP) in the process. The result is a visually identical image with zero metadata attached.
              </p>
              <p className="text-gray-600 leading-relaxed mt-3">
                This method is 100% effective at removing all standard metadata. It works in your browser — your image is never uploaded to our servers.
              </p>
            </article>
          </div>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <h3 className="font-semibold text-gray-900 mb-3">When to Remove Metadata</h3>
              <ul className="space-y-2.5">
                {[
                  "Before posting on social media",
                  "When selling items on marketplace sites",
                  "Before emailing photos to strangers",
                  "When publishing photos publicly on a website",
                  "Before sharing photos in online forums",
                  "Before submitting photos to news/media",
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
                  { q: "Does removing metadata change the image?", a: "No. The image looks identical. Only the hidden data embedded in the file header is removed." },
                  { q: "Does social media remove metadata automatically?", a: "Most platforms (Instagram, Twitter) strip EXIF on upload. But not all do, and the original file still contains it." },
                  { q: "Can I recover the metadata after removal?", a: "No. Once metadata is removed and the clean file is saved, it cannot be recovered. Keep your original file." },
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

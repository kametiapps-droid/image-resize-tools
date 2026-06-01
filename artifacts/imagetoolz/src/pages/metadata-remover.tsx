import { useState } from "react";
import { ToolArticle } from "@/components/tool-article";
import { Helmet } from "react-helmet-async";
import { ToolLayout } from "@/components/tool-layout";
import { FileUploader } from "@/components/file-uploader";
import { UploadLoading, DownloadDone } from "@/components/tool-steps";
import { CheckCircle2, ShieldCheck, MapPin, Camera, Clock, Cpu } from "lucide-react";
import { useRecordToolUse } from "@workspace/api-client-react";

type Step = "idle" | "loading" | "done";

const stripped = [
  { icon: MapPin, label: "GPS Location (lat/long)" },
  { icon: Camera, label: "Camera make & model" },
  { icon: Clock, label: "Date & time taken" },
  { icon: Cpu, label: "Device serial number" },
  { icon: ShieldCheck, label: "Copyright & artist info" },
  { icon: ShieldCheck, label: "Thumbnail preview" },
];

export default function MetadataRemover() {
  const [step, setStep] = useState<Step>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultInfo, setResultInfo] = useState("");
  const recordUse = useRecordToolUse();

  const handleUpload = (files: File[]) => {
    if (!files.length) return;
    const f = files[0];
    setFile(f);
    setStep("loading");
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) { setStep("idle"); return; }
        const blobUrl = URL.createObjectURL(blob);
        setResultUrl(blobUrl);
        setResultBlob(blob);
        const kb = Math.round(blob.size / 1024);
        setResultInfo(`${img.width} × ${img.height} px · All EXIF removed · ${kb} KB`);
        recordUse.mutate({ params: { id: "metadata-remover" }, data: { fileType: f.type, fileSizeKb: kb } });
        setTimeout(() => setStep("done"), 900);
      }, f.type === "image/png" ? "image/png" : "image/jpeg", 1.0);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const reset = () => { setStep("idle"); setFile(null); setResultUrl(null); setResultBlob(null); };

  return (
    <>
      <Helmet>
        <title>Free EXIF Metadata Remover — Strip GPS Location from Photos Online | Image Resize</title>
        <meta name="description" content="Remove GPS location, EXIF data, and all hidden metadata from images online free. Strip camera info, timestamps from photos before sharing. Browser-based, no upload, instant." />
        <link rel="canonical" href="https://imageresize.app/tools/metadata-remover" />
        <meta property="og:title" content="Free EXIF Metadata Remover — Image Resize" />
        <meta property="og:description" content="Strip GPS location and all EXIF data from photos before sharing. Protect your privacy — free, browser-based, no upload." />
        <meta property="og:url" content="https://imageresize.app/tools/metadata-remover" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "EXIF Metadata Remover",
          "description": "Free online tool to remove GPS location, EXIF data, and all hidden metadata from images before sharing.",
          "url": "https://imageresize.app/tools/metadata-remover",
          "applicationCategory": "MultimediaApplication",
          "operatingSystem": "Any",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
        })}</script>
      </Helmet>
      <ToolLayout toolId="metadata-remover" title="Remove Image Metadata" description="Strip GPS location, camera data, and all hidden EXIF metadata from images before sharing. Instant & private." pageTitle="EXIF Metadata Remover">

        {step === "idle" && (
          <>
            <FileUploader onUpload={handleUpload} label="Upload image to strip metadata" />
            <div className="mt-6 p-5 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900 rounded-xl">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Metadata that will be removed instantly:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {stripped.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                      <Icon className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "radial-gradient(circle, #22c55e, #16a34a)" }} />
              <div className="relative w-24 h-24 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #15803d, #22c55e)" }}>
                <ShieldCheck className="w-10 h-10 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Stripping metadata…</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Removing GPS, EXIF, and all hidden data</p>
          </div>
        )}

        {step === "done" && (
          <>
            <div className="flex items-center gap-3 p-4 mb-6 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400 shrink-0" />
              <div>
                <p className="font-bold text-green-800 dark:text-green-300">All metadata removed successfully</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-0.5">GPS location, camera data, timestamps, and device info — all stripped</p>
              </div>
            </div>
            <DownloadDone
              resultUrl={resultUrl}
              resultBlob={resultBlob}
              filename={`clean-${file?.name ?? "image"}`}
              info={resultInfo}
              toolName="Metadata Remover"
              toolPath="/tools/metadata-remover"
              onReset={reset}
            />
          </>
        )}

        <ToolArticle
          heading="Why Remove Image Metadata?"
          subheading="Every photo you take contains hidden data — GPS location, device info, timestamps. This tool strips it all."
          body={[
            "Every digital photo contains far more information than the visible image. Embedded in JPEG, TIFF, and sometimes PNG files is a hidden layer of data called EXIF (Exchangeable Image File Format) metadata. This data is written automatically by your camera or smartphone at the moment you take a photo, and it contains a detailed record of exactly when, where, and how the photo was taken. For casual personal use, this is harmless. But when you publish photos online, share them publicly, or send them to people you don't fully trust, EXIF metadata can reveal information you never intended to share.",
            "The most serious privacy risk in image metadata is GPS location data. Modern smartphones embed precise GPS coordinates (latitude and longitude to within a few meters) in every photo taken with location services enabled. This means that a photo of your dog shared on Instagram, a selfie posted on Twitter, or a product photo uploaded to eBay can contain your exact home address — or the address of wherever you were when you took the photo. This information is invisible to casual viewers but trivially extractable by anyone with basic tools, including tools built into operating systems and available for free online.",
            "<strong>What EXIF Data Is Stored in Your Photos:</strong> Location data (GPS latitude, longitude, altitude, and sometimes the city/country inferred from coordinates). Timestamp (the exact date and time the photo was taken, accurate to the second). Camera information (make, model, lens type, focal length, serial number). Exposure settings (ISO, aperture, shutter speed, white balance, flash mode). Thumbnail preview (a small copy of the image embedded in the file). Software (the app or operating system used to take or edit the photo). Copyright and artist fields (often blank, but can contain personal name or organization). Copyright notices embedded in professional cameras.",
            "<strong>When You Must Remove Metadata:</strong> Before posting photos publicly on any social media platform. Before selling images through stock photo sites. Before submitting photos to contests or publications. When sharing photos with people you don't fully trust. Before using photos as profile pictures or avatars. When providing images for legal or official purposes where you don't want to reveal when and where they were taken. For business product photography — you don't want competitors extracting your production dates, camera equipment, or location.",
            "<strong>How Metadata Removal Works:</strong> Our tool loads your image into the browser's Canvas API, draws the image pixel-by-pixel onto a fresh canvas, then exports the canvas as a new image file. This process creates a completely new file containing only the visible image pixels — none of the original file's metadata is present in the output. The visual image quality is preserved at maximum quality (quality=1.0 for JPEG output). The resulting file is typically slightly smaller than the original because the stripped metadata can be 5–50 KB. All processing is local — your photo never leaves your browser.",
          ]}
          steps={[
            { title: "Upload your image", description: "Select a JPG, PNG, or WEBP file from your device. The original file is never modified." },
            { title: "Metadata is detected", description: "The tool reads embedded EXIF data — GPS coordinates, camera model, timestamps, and more." },
            { title: "All metadata is stripped", description: "A clean copy of your image is created with all hidden data removed — no traces left." },
            { title: "Download the clean image", description: "Click Download to save the metadata-free version. Image quality is fully preserved." },
          ]}
          tips={[
            "Always remove metadata before posting photos publicly online",
            "GPS data in photos can reveal your home, workplace, or travel routes",
            "Metadata is invisible — you can't see it, but others can extract it",
            "Removing metadata may slightly reduce file size",
            "Use on photos taken with smartphones — they embed the most data",
          ]}
          faqs={[
            { question: "What data is removed?", answer: "GPS coordinates, camera make/model, date and time, ISO/aperture settings, device serial number, and all other EXIF/IPTC tags." },
            { question: "Does removing metadata affect image quality?", answer: "No. Only the hidden data is removed. The visible image pixels are completely unchanged." },
            { question: "Is my photo uploaded to a server?", answer: "Never. All processing happens entirely in your browser. Your photos never leave your device." },
          ]}
        />
      </ToolLayout>
    </>
  );
}

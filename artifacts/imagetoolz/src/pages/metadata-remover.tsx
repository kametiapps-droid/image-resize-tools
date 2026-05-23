import { useState } from "react";
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
        <title>Free EXIF Metadata Remover - Strip GPS & Image Data | CropImages</title>
        <meta name="description" content="Remove EXIF metadata, GPS location, and private data from images online for free. Protect your privacy before sharing photos. 100% browser-based." />
        <link rel="canonical" href="https://cropimages.store/tools/metadata-remover" />
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

        <div className="mt-14 border-t border-gray-200 dark:border-gray-700 pt-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Remove Image Metadata?</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <article>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">What Is EXIF Metadata?</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  EXIF (Exchangeable Image File Format) metadata is hidden data embedded in every photo taken by a smartphone or digital camera. This data can include your <strong>exact GPS coordinates</strong>, the make and model of your camera/phone, the date and time the photo was taken, camera settings (ISO, aperture, shutter speed), and even your device's serial number.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-3">
                  When you share photos online — on social media, via email, or in documents — this hidden data often travels with the image, potentially revealing your location or personal information to anyone who views it.
                </p>
              </article>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { t: "Privacy Protection", d: "Prevent strangers from seeing where you live, work, or travel based on GPS data in your photos." },
                  { t: "Safe Sharing", d: "Share photos on public forums, marketplaces, or social media without exposing personal data." },
                  { t: "Professional Use", d: "Remove client or location data before sharing images with third parties or publishing online." },
                  { t: "Smaller File Size", d: "Removing metadata can slightly reduce file size, especially for images with large EXIF blocks." },
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
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Always remove metadata before:</h3>
                <ul className="space-y-2.5">
                  {["Posting on social media", "Selling photos online", "Sharing your home address", "Sending to strangers", "Publishing on websites"].map((t, i) => (
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

import { Download, RefreshCw, CheckCircle2 } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import { Button } from "@/components/ui/button";

/* ── Loading animation (shown after upload, ~900ms) ── */
export function UploadLoading({ filename }: { filename?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      {/* Pulsing ring */}
      <div className="relative w-24 h-24 mb-8">
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: "radial-gradient(circle, #22c55e, #16a34a)" }}
        />
        <div
          className="absolute inset-2 rounded-full animate-ping opacity-30 animation-delay-150"
          style={{ background: "radial-gradient(circle, #22c55e, #16a34a)" }}
        />
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #15803d, #22c55e)" }}
        >
          <svg className="w-10 h-10 text-white animate-spin" style={{ animationDuration: "1s" }} viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Analyzing your image…</h3>
      {filename && <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 font-medium">{filename}</p>}
      <p className="text-sm text-gray-400 dark:text-gray-500">Reading dimensions, format, and metadata</p>
    </div>
  );
}

/* ── Processing animation (shown while canvas processes) ── */
export function ProcessingAnimation({ label = "Processing your image…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="flex items-end gap-1.5 mb-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-3 rounded-full animate-bounce"
            style={{
              height: `${20 + i * 8}px`,
              background: `linear-gradient(to top, #15803d, #22c55e)`,
              animationDelay: `${i * 0.12}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
        {[3, 2, 1, 0].map((i, idx) => (
          <div
            key={`b${idx}`}
            className="w-3 rounded-full animate-bounce"
            style={{
              height: `${20 + i * 8}px`,
              background: `linear-gradient(to top, #15803d, #22c55e)`,
              animationDelay: `${(5 + idx) * 0.12}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{label}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500">This happens entirely in your browser</p>
    </div>
  );
}

/* ── Download + Share card (shown after processing) ── */
export function DownloadDone({
  resultUrl,
  resultBlob,
  filename,
  info,
  toolName,
  toolPath,
  onReset,
  onDownload,
}: {
  resultUrl: string | null;
  resultBlob: Blob | null;
  filename: string;
  info: string;
  toolName: string;
  toolPath: string;
  onReset: () => void;
  onDownload?: () => void;
}) {
  const handleDownload = () => {
    if (onDownload) { onDownload(); return; }
    if (!resultBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(resultBlob);
    a.download = filename;
    a.click();
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Success banner */}
      <div
        className="rounded-2xl p-1 mb-6"
        style={{ background: "linear-gradient(135deg, #14532d, #16a34a)" }}
      >
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">Done! Your image is ready</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{info}</p>
            </div>
          </div>

          {/* Thumbnail */}
          {resultUrl && (
            <div className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700 mb-5 bg-gray-50 dark:bg-gray-800 flex items-center justify-center min-h-[120px] max-h-[300px]">
              <img
                src={resultUrl}
                alt="Result"
                className="max-w-full max-h-[300px] object-contain"
              />
            </div>
          )}

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg, #15803d, #16a34a)",
              boxShadow: "0 4px 16px rgba(22,163,74,0.4)",
            }}
          >
            <Download className="w-5 h-5" />
            Download Image
          </button>
        </div>
      </div>

      {/* Share buttons */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 px-6 py-5">
        <ShareButtons toolName={toolName} toolPath={toolPath} />
      </div>

      {/* Reset */}
      <div className="mt-4">
        <Button variant="outline" className="w-full" onClick={onReset}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Process Another Image
        </Button>
      </div>
    </div>
  );
}

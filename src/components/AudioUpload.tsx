import { useCallback, useState } from "react";
import { Upload, FileAudio } from "lucide-react";

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const AudioUpload = ({ onFileSelect, isProcessing }: AudioUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type === "audio/wav" || file.type === "audio/mpeg" || file.name.endsWith(".wav") || file.name.endsWith(".mp3"))) {
        setFileName(file.name);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-10 transition-all duration-300 cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5 glow-border"
          : "border-border hover:border-primary/50 hover:bg-secondary/30"
      } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        type="file"
        accept=".wav,.mp3,audio/wav,audio/mpeg"
        onChange={handleFileInput}
        className="absolute inset-0 opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        {fileName ? (
          <FileAudio className="h-8 w-8 text-primary" />
        ) : (
          <Upload className="h-8 w-8 text-primary" />
        )}
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">
          {fileName || "Drop your audio file here"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {fileName ? "Click or drop to replace" : "Supports .wav and .mp3 files"}
        </p>
      </div>
    </div>
  );
};

export default AudioUpload;

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Mic, FileText, BarChart3, MessageSquare } from "lucide-react";
import AudioUpload from "@/components/AudioUpload";
import ScoreGauge from "@/components/ScoreGauge";
import MetricBar from "@/components/MetricBar";
import GradeBadge from "@/components/GradeBadge";

interface AnalysisResult {
  transcript: string;
  analysis: {
    grammar_errors_count: number;
    sentence_structure_score: number;
    fluency_score: number;
    vocabulary_score: number;
    repetition_count: number;
    filler_words_count: number;
    feedback: string;
  };
  score: number;
  grade: string;
}

const Index = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileSelect = async (file: File) => {
    setAudioUrl(URL.createObjectURL(file));
    setIsProcessing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("audio", file);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-audio`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Processing failed (${res.status})`);
      }

      const data: AnalysisResult = await res.json();
      setResult(data);
      toast.success("Analysis complete!");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to process audio");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Glow effect */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[500px]" style={{ background: "var(--gradient-glow)" }} />

      <div className="relative mx-auto max-w-5xl px-4 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Mic className="h-4 w-4" />
            <span className="font-mono">Voice Grammar Engine</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Voice Grammar <span className="text-gradient">Scoring Engine</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Upload a spoken English audio file to get an AI-powered grammar quality assessment with detailed metrics and feedback.
          </p>
        </header>

        {/* Upload */}
        <section className="mb-10">
          <AudioUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        </section>

        {/* Audio Player */}
        {audioUrl && (
          <section className="mb-10 animate-fade-up">
            <div className="card-gradient rounded-lg border border-border p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <Mic className="h-4 w-4 text-primary" />
                Audio Playback
              </div>
              <audio ref={audioRef} controls src={audioUrl} className="w-full" />
            </div>
          </section>
        )}

        {/* Loading */}
        {isProcessing && (
          <div className="flex flex-col items-center gap-4 py-16 animate-fade-up">
            <div className="relative">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 h-12 w-12 animate-pulse-glow rounded-full" />
            </div>
            <p className="text-muted-foreground font-mono text-sm">
              Transcribing & analyzing grammar...
            </p>
          </div>
        )}

        {/* Results */}
        {result && !isProcessing && (
          <div className="space-y-8 animate-fade-up">
            {/* Score + Grade Row */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Score Card */}
              <div className="card-gradient flex flex-col items-center gap-4 rounded-lg border border-border p-8">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Final Score
                </div>
                <ScoreGauge score={result.score} />
                <GradeBadge grade={result.grade} />
              </div>

              {/* Metrics Card */}
              <div className="card-gradient rounded-lg border border-border p-8">
                <div className="mb-6 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Detailed Metrics
                </div>
                <div className="space-y-5">
                  <MetricBar label="Sentence Structure" value={result.analysis.sentence_structure_score} max={10} />
                  <MetricBar label="Fluency" value={result.analysis.fluency_score} max={10} />
                  <MetricBar label="Vocabulary" value={result.analysis.vocabulary_score} max={10} />
                  <MetricBar label="Grammar Errors" value={result.analysis.grammar_errors_count} max={20} unit=" found" />
                  <MetricBar label="Repetitions" value={result.analysis.repetition_count} max={20} unit=" found" />
                  <MetricBar label="Filler Words" value={result.analysis.filler_words_count} max={20} unit=" found" />
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div className="card-gradient rounded-lg border border-border p-8">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <FileText className="h-4 w-4 text-primary" />
                Transcript
              </div>
              <p className="text-foreground leading-relaxed font-mono text-sm whitespace-pre-wrap">
                {result.transcript}
              </p>
            </div>

            {/* Feedback */}
            <div className="card-gradient rounded-lg border border-border p-8">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                <MessageSquare className="h-4 w-4 text-primary" />
                Feedback
              </div>
              <p className="text-foreground leading-relaxed">
                {result.analysis.feedback}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

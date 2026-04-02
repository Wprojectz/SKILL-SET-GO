import { useEffect, useState, useMemo } from "react";

interface AnalysisAnimationProps {
  resumeText: string;
  jobText: string;
}

const AnalysisAnimation = ({ resumeText, jobText }: AnalysisAnimationProps) => {
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowScore(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const resumeLines = useMemo(() => resumeText.split('\n').filter(l => l.trim()), [resumeText]);
  const jobLines = useMemo(() => jobText.split('\n').filter(l => l.trim()), [jobText]);

  // Repeat lines to fill the animation
  const repeatedResume = useMemo(() => {
    const repeated = [];
    for (let i = 0; i < 5; i++) repeated.push(...resumeLines);
    return repeated;
  }, [resumeLines]);

  const repeatedJob = useMemo(() => {
    const repeated = [];
    for (let i = 0; i < 5; i++) repeated.push(...jobLines);
    return repeated;
  }, [jobLines]);

  if (showScore) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-fade-in-scale text-center">
          <div className="animate-pulse-glow inline-block rounded-2xl bg-card px-12 py-8">
            <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">
              Analysis Complete
            </p>
            <p className="mt-2 font-heading text-6xl font-bold text-primary">
              Ready
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center overflow-hidden">
      <div className="grid w-full max-w-[700px] grid-cols-2 gap-4">
        {/* Resume column - scrolls up */}
        <div className="relative h-[400px] overflow-hidden rounded-lg border border-border/30">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
          <div className="animate-scroll-up space-y-2 p-4">
            {repeatedResume.map((line, i) => (
              <p key={i} className={`font-body text-xs transition-colors ${
                i % 7 === 0 ? "text-aqua font-medium" : "text-muted-foreground/60"
              }`}>
                {line.slice(0, 80)}
              </p>
            ))}
          </div>
        </div>

        {/* Job column - scrolls down */}
        <div className="relative h-[400px] overflow-hidden rounded-lg border border-border/30">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
          <div className="animate-scroll-down space-y-2 p-4">
            {repeatedJob.map((line, i) => (
              <p key={i} className={`font-body text-xs transition-colors ${
                i % 5 === 0 ? "text-muted-red font-medium" : "text-muted-foreground/60"
              }`}>
                {line.slice(0, 80)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisAnimation;

interface ATSScoreProps {
  score: number;
}

const ATSScore = ({ score }: ATSScoreProps) => {
  const getColor = () => {
    if (score >= 70) return "text-aqua";
    if (score >= 40) return "text-primary";
    return "text-muted-red";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">ATS Compatibility</h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        Simulated applicant tracking system score.
      </p>
      <div className="mt-4 flex items-end gap-2">
        <span className={`font-heading text-5xl font-bold ${getColor()}`}>{score}</span>
        <span className="mb-1 font-body text-lg text-muted-foreground">/100</span>
      </div>
      {/* Progress bar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            score >= 70 ? "bg-aqua" : score >= 40 ? "bg-primary" : "bg-muted-red"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};

export default ATSScore;

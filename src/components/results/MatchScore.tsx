interface MatchScoreProps {
  percentage: number;
}

const MatchScore = ({ percentage }: MatchScoreProps) => {
  const getColor = () => {
    if (percentage >= 70) return "text-aqua";
    if (percentage >= 40) return "text-primary";
    return "text-muted-red";
  };

  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <p className="font-body text-sm uppercase tracking-widest text-muted-foreground">
        Match Score
      </p>
      <p className={`mt-2 font-heading text-7xl font-bold ${getColor()}`}>
        {percentage}%
      </p>
      <p className="mt-2 font-body text-sm text-muted-foreground">
        {percentage >= 70 ? "Strong alignment with this role." :
         percentage >= 40 ? "Partial match. Review missing skills below." :
         "Significant gaps detected. See the learning pathway."}
      </p>
    </div>
  );
};

export default MatchScore;

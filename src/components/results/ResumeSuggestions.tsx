interface ResumeSuggestionsProps {
  suggestions: string[];
}

const ResumeSuggestions = ({ suggestions }: ResumeSuggestionsProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">Resume Suggestions</h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        Improvements to strengthen your resume.
      </p>
      <ul className="mt-4 space-y-3">
        {suggestions.map((suggestion, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <p className="font-body text-sm text-foreground">{suggestion}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResumeSuggestions;

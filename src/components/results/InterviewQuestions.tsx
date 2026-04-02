import type { InterviewQuestion } from "@/lib/skillEngine";

interface InterviewQuestionsProps {
  questions: InterviewQuestion[];
}

const InterviewQuestions = ({ questions }: InterviewQuestionsProps) => {
  if (questions.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">Interview Questions</h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        Potential questions based on detected skills.
      </p>
      <div className="mt-4 space-y-6">
        {questions.map((item) => (
          <div key={item.skill}>
            <p className="font-heading text-sm font-semibold capitalize text-primary">
              {item.skill}
            </p>
            <ol className="mt-2 space-y-1.5">
              {item.questions.map((q, i) => (
                <li key={i} className="flex gap-2 font-body text-sm text-foreground">
                  <span className="shrink-0 text-muted-foreground">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterviewQuestions;

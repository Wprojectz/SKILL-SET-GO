import type { AnalysisResult } from "@/lib/skillEngine";
import MatchScore from "@/components/results/MatchScore";
import SkillsPanel from "@/components/results/SkillsPanel";
import MissingSkills from "@/components/results/MissingSkills";
import LearningPathway from "@/components/results/LearningPathway";
import ATSScore from "@/components/results/ATSScore";
import ResumeSuggestions from "@/components/results/ResumeSuggestions";
import InterviewQuestions from "@/components/results/InterviewQuestions";
import SkillChart from "@/components/results/SkillChart";

interface ResultsSectionProps {
  results: AnalysisResult;
}

const ResultsSection = ({ results }: ResultsSectionProps) => {
  return (
    <div className="space-y-8">
      <MatchScore percentage={results.matchPercentage} />
      <SkillChart results={results} />
      <SkillsPanel
        title="Your Skills"
        skills={results.resumeSkills}
        matchedSkills={results.matchedSkills}
        variant="resume"
      />
      <SkillsPanel
        title="Required Skills"
        skills={results.jobSkills}
        matchedSkills={results.matchedSkills}
        variant="job"
      />
      <MissingSkills skills={results.missingSkills} />
      <ATSScore score={results.atsScore} />
      <LearningPathway steps={results.learningPathway} />
      <ResumeSuggestions suggestions={results.resumeSuggestions} />
      <InterviewQuestions questions={results.interviewQuestions} />
    </div>
  );
};

export default ResultsSection;

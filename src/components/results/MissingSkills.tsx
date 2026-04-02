interface MissingSkillsProps {
  skills: string[];
}

const MissingSkills = ({ skills }: MissingSkillsProps) => {
  if (skills.length === 0) {
    return (
      <div className="rounded-lg border border-aqua/30 bg-aqua/5 p-6">
        <h3 className="font-heading text-lg font-semibold text-aqua">No Skill Gaps</h3>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Your resume covers all required skills for this role.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="font-heading text-lg font-semibold text-foreground">Missing Skills</h3>
      <p className="mt-1 font-body text-sm text-muted-foreground">
        {skills.length} skill{skills.length !== 1 ? "s" : ""} found in the job description but not in your resume.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-md border border-muted-red/30 bg-muted-red/10 px-2.5 py-1 font-body text-xs font-medium text-muted-red"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MissingSkills;

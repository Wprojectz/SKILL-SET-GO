// Comprehensive skill dataset for extraction
const SKILL_DATABASE: Record<string, string[]> = {
  "Programming Languages": [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust", "ruby", "php",
    "swift", "kotlin", "scala", "r", "matlab", "perl", "haskell", "lua", "dart", "elixir",
    "objective-c", "assembly", "fortran", "cobol", "sql", "html", "css", "sass", "less"
  ],
  "Frontend": [
    "react", "angular", "vue", "svelte", "next.js", "nuxt", "gatsby", "remix",
    "tailwind", "bootstrap", "material ui", "chakra ui", "redux", "zustand", "mobx",
    "webpack", "vite", "babel", "eslint", "prettier", "storybook", "jest", "cypress",
    "playwright", "responsive design", "accessibility", "web components", "pwa"
  ],
  "Backend": [
    "node.js", "express", "fastapi", "django", "flask", "spring boot", "asp.net",
    "rails", "laravel", "gin", "fiber", "nestjs", "graphql", "rest api", "grpc",
    "websockets", "microservices", "serverless", "oauth", "jwt", "authentication"
  ],
  "Database": [
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch", "cassandra",
    "dynamodb", "firebase", "supabase", "sqlite", "oracle", "sql server",
    "neo4j", "couchdb", "influxdb", "prisma", "sequelize", "mongoose", "typeorm"
  ],
  "DevOps & Cloud": [
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "jenkins", "github actions", "gitlab ci", "circleci", "nginx", "apache",
    "linux", "bash", "powershell", "monitoring", "logging", "prometheus", "grafana",
    "cloud deployment", "ci/cd", "infrastructure as code"
  ],
  "Data & AI": [
    "machine learning", "deep learning", "natural language processing", "nlp",
    "computer vision", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "data analysis", "data visualization", "tableau", "power bi", "spark",
    "hadoop", "airflow", "etl", "data pipeline", "statistics", "neural networks",
    "transformers", "bert", "gpt", "llm", "generative ai", "rag"
  ],
  "Mobile": [
    "react native", "flutter", "ios", "android", "swift ui", "jetpack compose",
    "xamarin", "ionic", "capacitor", "mobile development"
  ],
  "Tools & Practices": [
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack",
    "agile", "scrum", "kanban", "tdd", "bdd", "code review", "pair programming",
    "design patterns", "solid principles", "clean code", "refactoring",
    "system design", "api design", "documentation", "technical writing"
  ]
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^\w\s.#+]/g, " ").replace(/\s+/g, " ");
}

export interface ExtractedSkills {
  skills: string[];
  categories: Record<string, string[]>;
}

export function extractSkills(text: string): ExtractedSkills {
  const normalized = normalizeText(text);
  const found: Set<string> = new Set();
  const categories: Record<string, string[]> = {};

  for (const [category, skills] of Object.entries(SKILL_DATABASE)) {
    for (const skill of skills) {
      const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')}\\b`, 'i');
      if (pattern.test(normalized)) {
        found.add(skill);
        if (!categories[category]) categories[category] = [];
        if (!categories[category].includes(skill)) categories[category].push(skill);
      }
    }
  }

  return { skills: Array.from(found), categories };
}

export interface AnalysisResult {
  resumeSkills: ExtractedSkills;
  jobSkills: ExtractedSkills;
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  atsScore: number;
  learningPathway: LearningStep[];
  interviewQuestions: InterviewQuestion[];
  resumeSuggestions: string[];
}

export interface LearningStep {
  step: number;
  skill: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
}

export interface InterviewQuestion {
  skill: string;
  questions: string[];
}

const DIFFICULTY_MAP: Record<string, "Beginner" | "Intermediate" | "Advanced"> = {
  "html": "Beginner", "css": "Beginner", "git": "Beginner", "bash": "Beginner",
  "javascript": "Beginner", "python": "Beginner", "sql": "Beginner",
  "react": "Intermediate", "node.js": "Intermediate", "docker": "Intermediate",
  "rest api": "Intermediate", "typescript": "Intermediate", "mongodb": "Intermediate",
  "postgresql": "Intermediate", "redis": "Intermediate", "graphql": "Intermediate",
  "kubernetes": "Advanced", "microservices": "Advanced", "system design": "Advanced",
  "machine learning": "Advanced", "cloud deployment": "Advanced", "terraform": "Advanced",
  "deep learning": "Advanced", "ci/cd": "Intermediate",
};

const INTERVIEW_QUESTIONS_DB: Record<string, string[]> = {
  "react": ["Explain the Virtual DOM and its benefits.", "What are React Hooks? Name the most common ones.", "How does useEffect differ from useLayoutEffect?", "Explain React's reconciliation algorithm."],
  "javascript": ["What is the event loop in JavaScript?", "Explain closures with an example.", "What is the difference between var, let, and const?", "How does prototypal inheritance work?"],
  "typescript": ["What are generics in TypeScript?", "Explain the difference between interface and type.", "What are utility types? Give examples.", "How does TypeScript's type narrowing work?"],
  "python": ["What are Python decorators?", "Explain list comprehensions.", "What is the GIL in Python?", "How do generators work in Python?"],
  "node.js": ["Explain the Node.js event loop.", "What is middleware in Express?", "How does the cluster module work?", "What are streams in Node.js?"],
  "docker": ["What is the difference between an image and a container?", "Explain Docker Compose.", "How do you optimize a Dockerfile?", "What are Docker volumes used for?"],
  "sql": ["What is the difference between INNER JOIN and LEFT JOIN?", "Explain database normalization.", "What are indexes and when should you use them?", "What is an ACID transaction?"],
  "mongodb": ["Explain the difference between SQL and NoSQL.", "What is sharding in MongoDB?", "How do you design schemas in MongoDB?", "What are aggregation pipelines?"],
  "aws": ["What is the difference between EC2 and Lambda?", "Explain S3 storage classes.", "What is a VPC?", "How does IAM work?"],
  "kubernetes": ["What is a Pod in Kubernetes?", "Explain Deployments vs StatefulSets.", "What is a Service in Kubernetes?", "How does horizontal pod autoscaling work?"],
  "machine learning": ["Explain bias-variance tradeoff.", "What is cross-validation?", "Explain the difference between supervised and unsupervised learning.", "What are common regularization techniques?"],
  "git": ["What is the difference between merge and rebase?", "How does git bisect work?", "Explain git stash.", "What is a detached HEAD state?"],
  "rest api": ["What are HTTP methods and their purposes?", "Explain REST constraints.", "What is the difference between PUT and PATCH?", "How do you version an API?"],
  "graphql": ["How does GraphQL differ from REST?", "What are resolvers?", "Explain mutations vs queries.", "What is the N+1 problem in GraphQL?"],
  "microservices": ["What are the benefits and challenges of microservices?", "How do microservices communicate?", "What is service discovery?", "Explain the saga pattern."],
};

function getDifficulty(skill: string): "Beginner" | "Intermediate" | "Advanced" {
  return DIFFICULTY_MAP[skill] || "Intermediate";
}

function generateLearningPathway(missingSkills: string[]): LearningStep[] {
  const difficultyOrder = { "Beginner": 0, "Intermediate": 1, "Advanced": 2 };
  const sorted = [...missingSkills].sort((a, b) =>
    difficultyOrder[getDifficulty(a)] - difficultyOrder[getDifficulty(b)]
  );

  return sorted.map((skill, i) => ({
    step: i + 1,
    skill,
    difficulty: getDifficulty(skill),
    description: `Learn ${skill} fundamentals and apply them in projects.`,
  }));
}

function generateInterviewQuestions(skills: string[]): InterviewQuestion[] {
  return skills
    .filter(s => INTERVIEW_QUESTIONS_DB[s])
    .slice(0, 6)
    .map(skill => ({
      skill,
      questions: INTERVIEW_QUESTIONS_DB[skill],
    }));
}

function generateResumeSuggestions(resumeText: string, missingSkills: string[]): string[] {
  const suggestions: string[] = [];
  const lower = resumeText.toLowerCase();

  if (missingSkills.length > 0) {
    suggestions.push(`Add these keywords: ${missingSkills.slice(0, 5).join(", ")}.`);
  }
  if (!lower.includes("project") && !lower.includes("built") && !lower.includes("developed")) {
    suggestions.push("Include project descriptions with specific technologies used.");
  }
  if (!/\d+%|\d+x|\$\d+|\d+ users/i.test(resumeText)) {
    suggestions.push("Add measurable achievements (e.g., 'Reduced load time by 40%').");
  }
  if (resumeText.length < 500) {
    suggestions.push("Resume appears too short. Expand on experience and projects.");
  }
  if (resumeText.length > 5000) {
    suggestions.push("Resume may be too long. Focus on the most relevant experience.");
  }
  if (!lower.includes("github") && !lower.includes("portfolio") && !lower.includes("linkedin")) {
    suggestions.push("Include links to GitHub, portfolio, or LinkedIn profile.");
  }
  if (!lower.includes("education") && !lower.includes("degree") && !lower.includes("university")) {
    suggestions.push("Add an education section with degree and institution.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Resume looks well-structured. Keep it updated with recent projects.");
  }

  return suggestions;
}

function calculateATSScore(resumeText: string, matchPercentage: number, resumeSkills: string[]): number {
  let score = 0;
  score += matchPercentage * 0.4;
  score += Math.min(resumeSkills.length * 2, 20);
  if (/\d+%|\d+x|\$\d+/i.test(resumeText)) score += 10;
  if (resumeText.length > 300 && resumeText.length < 4000) score += 10;
  if (/experience|education|skills|projects/i.test(resumeText)) score += 10;
  if (/github|linkedin|portfolio/i.test(resumeText)) score += 5;
  if (resumeText.split('\n').length > 10) score += 5;
  return Math.min(Math.round(score), 100);
}

export function analyzeResume(resumeText: string, jobText: string): AnalysisResult {
  const resumeSkills = extractSkills(resumeText);
  const jobSkills = extractSkills(jobText);

  const matchedSkills = resumeSkills.skills.filter(s => jobSkills.skills.includes(s));
  const missingSkills = jobSkills.skills.filter(s => !resumeSkills.skills.includes(s));

  const matchPercentage = jobSkills.skills.length > 0
    ? Math.round((matchedSkills.length / jobSkills.skills.length) * 100)
    : 0;

  const atsScore = calculateATSScore(resumeText, matchPercentage, resumeSkills.skills);
  const learningPathway = generateLearningPathway(missingSkills);
  const interviewQuestions = generateInterviewQuestions([...matchedSkills, ...missingSkills]);
  const resumeSuggestions = generateResumeSuggestions(resumeText, missingSkills);

  return {
    resumeSkills,
    jobSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    atsScore,
    learningPathway,
    interviewQuestions,
    resumeSuggestions,
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
}

export interface Resume {
  id: string;
  userId: string;
  name: string;
  template: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    title: string;
    summary: string;
  };
  education: Array<{
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
    isCurrent: boolean;
  }>;
  projects: Array<{
    title: string;
    technologies: string;
    link: string;
    description: string;
  }>;
  skills: string[];
  certifications: string[];
  achievements: string[];
  socialLinks: {
    linkedin: string;
    github: string;
    portfolio: string;
  };
  scoreAnalysis?: {
    score: number;
    feedback: string;
    missingKeywords: string[];
    improvementSuggestions: string[];
    jobMatching: Array<{ role: string; matchPercentage: number }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InterviewQuestion {
  id: string;
  role: string;
  experienceLevel: string;
  category: "technical" | "behavioral" | "hr" | "scenario";
  question: string;
  difficulty: "Easy" | "Medium" | "Hard";
  expectedAnswer: string;
}

export interface SavedAnswer {
  id: string;
  userId: string;
  questionId: string;
  question: string;
  savedAnswer: string;
  aiFeedback?: {
    correctness: number;
    feedback: string;
    suggestedAnswer: string;
  };
  isFavorite?: boolean;
  createdAt: string;
}

export interface MockInterview {
  id: string;
  userId: string;
  role: string;
  experienceLevel: string;
  questions: Array<{
    id: string;
    category: string;
    question: string;
    difficulty: string;
    expectedAnswer: string;
  }>;
  answers: Record<string, string>;
  scores?: {
    communication: number;
    technical: number;
    confidence: number;
    total: number;
    feedback: string;
  };
  status: "in-progress" | "completed";
  createdAt: string;
}

export interface DashboardAnalytics {
  resumeCompletion: number;
  resumeScore: number;
  totalInterviews: number;
  completedInterviewsCount: number;
  savedAnswersCount: number;
  averageScores: {
    communication: number;
    technical: number;
    confidence: number;
    total: number;
  };
  chartData: Array<{
    name: string;
    technical: number;
    communication: number;
    confidence: number;
    total: number;
  }>;
}

export interface AdminMetrics {
  users: Omit<User, "passwordHash">[];
  metrics: {
    totalUsers: number;
    totalResumes: number;
    totalInterviews: number;
    questionsCount: number;
    apiUsageCount: number;
  };
}

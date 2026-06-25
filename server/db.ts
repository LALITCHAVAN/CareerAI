import fs from "fs";
import path from "path";
import crypto from "crypto";

const OLD_DB_FILE = path.join(process.cwd(), "data", "db.json");
const DB_FILE = path.join(process.cwd(), "node_modules", "db.json");

// Ensure the directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Migrate old database if it exists and new one does not
if (fs.existsSync(OLD_DB_FILE) && !fs.existsSync(DB_FILE)) {
  try {
    fs.copyFileSync(OLD_DB_FILE, DB_FILE);
  } catch (e) {
    console.error("Failed to migrate database file:", e);
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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
  answers: Record<string, string>; // questionId -> userAnswer
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

export interface Session {
  token: string;
  userId: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: User[];
  resumes: Resume[];
  questions: InterviewQuestion[];
  mockInterviews: MockInterview[];
  savedAnswers: SavedAnswer[];
  sessions: Session[];
}

const DEFAULT_QUESTIONS: InterviewQuestion[] = [
  {
    id: "q1",
    role: "Software Engineer",
    experienceLevel: "Fresher",
    category: "technical",
    question: "Explain the difference between stack and queue data structures.",
    difficulty: "Easy",
    expectedAnswer: "A stack follows First-In-Last-Out (FILO) order where elements are inserted and removed from the same end. A queue follows First-In-First-Out (FIFO) order where elements are inserted at the back and removed from the front."
  },
  {
    id: "q2",
    role: "Frontend Developer",
    experienceLevel: "Junior",
    category: "technical",
    question: "What is the Virtual DOM and how does React use it to optimize rendering?",
    difficulty: "Medium",
    expectedAnswer: "The Virtual DOM is an in-memory representation of the real DOM. When components state changes, React updates the virtual representation first, compares it with the previous version (diffing), and then updates only the changed parts in the real DOM (reconciliation)."
  },
  {
    id: "q3",
    role: "Backend Developer",
    experienceLevel: "Mid-Level",
    category: "technical",
    question: "How do database indexes speed up search queries and what are their trade-offs?",
    difficulty: "Medium",
    expectedAnswer: "Indexes act like a book index, storing references to database rows using B-Tree or Hash data structures to achieve logarithmic or constant-time lookups. However, they slow down write operations (INSERT/UPDATE/DELETE) because the index must also be updated and take additional storage space."
  },
  {
    id: "q4",
    role: "Product Manager",
    experienceLevel: "Senior",
    category: "scenario",
    question: "How would you handle a situation where engineering says a high-priority feature cannot be completed on time?",
    difficulty: "Hard",
    expectedAnswer: "I would first understand the root cause (technical debt, scope creep, resource issues) and collaborate with engineering leads. Then, I would assess if we can reduce scope for an MVP, adjust milestones, shift resources, or manage stakeholder expectations by offering transparent trade-offs."
  },
  {
    id: "q5",
    role: "Full Stack Developer",
    experienceLevel: "Junior",
    category: "behavioral",
    question: "Tell me about a time you had to learn a new framework or technology quickly for a task.",
    difficulty: "Easy",
    expectedAnswer: "The candidate should explain: 1. The challenge (the technology to learn), 2. The action taken (learning resources, documentation, building mini-projects), and 3. The result (successful delivery, learnings applied)."
  },
  {
    id: "q6",
    role: "UI/UX Designer",
    experienceLevel: "Mid-Level",
    category: "scenario",
    question: "How do you handle negative feedback on your design from a client or product lead?",
    difficulty: "Medium",
    expectedAnswer: "I avoid getting defensive and seek to understand the underlying issues or user paint points they are highlighting. I ask clarifying questions, request user research or analytical backing if available, and propose collaborative iteration to address the concerns."
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    if (this.data.questions.length === 0) {
      this.data.questions = [...DEFAULT_QUESTIONS];
      this.save();
    }
  }

  private load(): DatabaseSchema {
    const defaultData: DatabaseSchema = {
      users: [],
      resumes: [],
      questions: [],
      mockInterviews: [],
      savedAnswers: [],
      sessions: []
    };

    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        // Safely merge with defaults to prevent missing fields in existing databases
        return {
          ...defaultData,
          ...parsed,
          users: parsed.users || [],
          resumes: parsed.resumes || [],
          questions: parsed.questions || [],
          mockInterviews: parsed.mockInterviews || [],
          savedAnswers: parsed.savedAnswers || [],
          sessions: parsed.sessions || []
        };
      }
    } catch (e) {
      console.error("Error reading database file, resetting:", e);
    }
    return defaultData;
  }

  private save(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Error writing database file:", e);
    }
  }

  // --- Users ---
  getUsers() { return this.data.users; }
  getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  createUser(user: Omit<User, "id" | "createdAt">) {
    const newUser: User = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }
  updateUser(id: string, updates: Partial<User>) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx !== -1) {
      this.data.users[idx] = { ...this.data.users[idx], ...updates };
      this.save();
      return this.data.users[idx];
    }
    return null;
  }
  deleteUser(id: string) {
    this.data.users = this.data.users.filter(u => u.id !== id);
    this.data.resumes = this.data.resumes.filter(r => r.userId !== id);
    this.data.mockInterviews = this.data.mockInterviews.filter(m => m.userId !== id);
    this.data.savedAnswers = this.data.savedAnswers.filter(s => s.userId !== id);
    this.save();
  }

  // --- Resumes ---
  getResumes() { return this.data.resumes; }
  getResumeById(id: string) { return this.data.resumes.find(r => r.id === id); }
  getResumesByUserId(userId: string) { return this.data.resumes.filter(r => r.userId === userId); }
  createResume(resume: Omit<Resume, "id" | "createdAt" | "updatedAt">) {
    const newResume: Resume = {
      ...resume,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.resumes.push(newResume);
    this.save();
    return newResume;
  }
  updateResume(id: string, updates: Partial<Resume>) {
    const idx = this.data.resumes.findIndex(r => r.id === id);
    if (idx !== -1) {
      this.data.resumes[idx] = {
        ...this.data.resumes[idx],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.save();
      return this.data.resumes[idx];
    }
    return null;
  }
  deleteResume(id: string) {
    this.data.resumes = this.data.resumes.filter(r => r.id !== id);
    this.save();
  }

  // --- Questions ---
  getQuestions() { return this.data.questions; }
  getQuestionById(id: string) { return this.data.questions.find(q => q.id === id); }
  createQuestion(q: Omit<InterviewQuestion, "id">) {
    const newQ: InterviewQuestion = {
      ...q,
      id: crypto.randomUUID()
    };
    this.data.questions.push(newQ);
    this.save();
    return newQ;
  }

  // --- Saved Answers ---
  getSavedAnswers(userId: string) { return this.data.savedAnswers.filter(s => s.userId === userId); }
  getSavedAnswerById(id: string) { return this.data.savedAnswers.find(s => s.id === id); }
  createSavedAnswer(sa: Omit<SavedAnswer, "id" | "createdAt">) {
    const newSA: SavedAnswer = {
      ...sa,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    this.data.savedAnswers.push(newSA);
    this.save();
    return newSA;
  }
  updateSavedAnswer(id: string, updates: Partial<SavedAnswer>) {
    const idx = this.data.savedAnswers.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.savedAnswers[idx] = { ...this.data.savedAnswers[idx], ...updates };
      this.save();
      return this.data.savedAnswers[idx];
    }
    return null;
  }
  deleteSavedAnswer(id: string) {
    this.data.savedAnswers = this.data.savedAnswers.filter(s => s.id !== id);
    this.save();
  }

  // --- Mock Interviews ---
  getMockInterviewsByUserId(userId: string) { return this.data.mockInterviews.filter(m => m.userId === userId); }
  getMockInterviews() { return this.data.mockInterviews; }
  getMockInterviewById(id: string) { return this.data.mockInterviews.find(m => m.id === id); }
  createMockInterview(mi: Omit<MockInterview, "id" | "createdAt" | "status">) {
    const newMI: MockInterview = {
      ...mi,
      id: crypto.randomUUID(),
      status: "in-progress",
      createdAt: new Date().toISOString()
    };
    this.data.mockInterviews.push(newMI);
    this.save();
    return newMI;
  }
  updateMockInterview(id: string, updates: Partial<MockInterview>) {
    const idx = this.data.mockInterviews.findIndex(m => m.id === id);
    if (idx !== -1) {
      this.data.mockInterviews[idx] = { ...this.data.mockInterviews[idx], ...updates };
      this.save();
      return this.data.mockInterviews[idx];
    }
    return null;
  }

  // --- Sessions (JWT alternative with direct cookie token authentication) ---
  createSession(userId: string) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(); // 7 days
    const session: Session = { token, userId, expiresAt };
    this.data.sessions.push(session);
    this.save();
    return session;
  }
  getSession(token: string) {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(token);
      return null;
    }
    return session;
  }
  deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.save();
  }
}

export const db = new Database();

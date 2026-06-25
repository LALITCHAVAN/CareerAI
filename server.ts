import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db, User } from "./server/db.js";
import {
  analyzeResumeWithGemini,
  generateInterviewQuestionsWithGemini,
  evaluateAnswerWithGemini,
  evaluateFullMockInterviewWithGemini
} from "./server/geminiService.js";

// Extend Express Request interface to include session user
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Simplistic Custom Cookie/Token Parser Middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    let token = "";
    // Check Authorization header or Cookie
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(";").reduce((acc: Record<string, string>, c) => {
        const [k, v] = c.trim().split("=");
        if (k && v) acc[k] = v;
        return acc;
      }, {});
      token = cookies["session_token"] || "";
    }

    if (token) {
      const session = db.getSession(token);
      if (session) {
        const user = db.getUserById(session.userId);
        if (user) {
          req.user = user;
          req.token = token;
        }
      }
    }
    next();
  });

  // Authentication Guard Middleware
  const protect = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, please log in." });
    }
    next();
  };

  // Admin Guard Middleware
  const protectAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden, administrator access required." });
    }
    next();
  };

  // --- API ROUTES ---

  // Auth: Check Current User Session
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (req.user) {
      const { passwordHash, ...userResponse } = req.user;
      res.json({ user: userResponse });
    } else {
      res.json({ user: null });
    }
  });

  // Auth: Register
  app.post("/api/auth/register", (req: Request, res: Response) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: "Please specify all registration fields." });
      }

      const existing = db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email is already registered." });
      }

      // Simple secure local password hash
      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

      // Set the first user as admin, others as normal users
      const role = db.getUsers().length === 0 ? "admin" : "user";

      const newUser = db.createUser({
        name,
        email,
        passwordHash,
        role
      });

      const session = db.createSession(newUser.id);
      res.setHeader("Set-Cookie", `session_token=${session.token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`);
      
      const { passwordHash: _, ...userResponse } = newUser;
      res.status(201).json({ user: userResponse, token: session.token });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Registration failed." });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Please enter email and password." });
      }

      const user = db.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      const hash = crypto.createHash("sha256").update(password).digest("hex");
      if (user.passwordHash !== hash) {
        return res.status(400).json({ message: "Invalid email or password." });
      }

      const session = db.createSession(user.id);
      res.setHeader("Set-Cookie", `session_token=${session.token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict`);

      const { passwordHash: _, ...userResponse } = user;
      res.json({ user: userResponse, token: session.token });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Login failed." });
    }
  });

  // Auth: Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    if (req.token) {
      db.deleteSession(req.token);
    }
    res.setHeader("Set-Cookie", "session_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict");
    res.json({ success: true, message: "Logged out successfully." });
  });

  // Auth: Password recovery simulator
  app.post("/api/auth/forgot-password", (req: Request, res: Response) => {
    const { email } = req.body;
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "No account found with this email." });
    }
    // Simulation
    res.json({ success: true, message: "A recovery code has been simulated for testing. Please reset below." });
  });

  app.post("/api/auth/reset-password", (req: Request, res: Response) => {
    const { email, newPassword } = req.body;
    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const passwordHash = crypto.createHash("sha256").update(newPassword).digest("hex");
    db.updateUser(user.id, { passwordHash });
    res.json({ success: true, message: "Password reset successful. Please login now." });
  });

  // --- Resume Builder API ---

  // Get all resumes of active user
  app.get("/api/resumes", protect, (req: Request, res: Response) => {
    const userId = req.user!.id;
    const resumes = db.getResumesByUserId(userId);
    res.json({ resumes });
  });

  // Create single resume
  app.post("/api/resumes", protect, (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { name, template, personalInfo, education, experience, projects, skills, certifications, achievements, socialLinks } = req.body;

      const newResume = db.createResume({
        userId,
        name: name || "My New Resume",
        template: template || "modern",
        personalInfo: personalInfo || { fullName: "", email: "", phone: "", location: "", title: "", summary: "" },
        education: education || [],
        experience: experience || [],
        projects: projects || [],
        skills: skills || [],
        certifications: certifications || [],
        achievements: achievements || [],
        socialLinks: socialLinks || { linkedin: "", github: "", portfolio: "" }
      });

      res.status(201).json({ resume: newResume });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to create resume." });
    }
  });

  // Update resume
  app.put("/api/resumes/:id", protect, (req: Request, res: Response) => {
    try {
      const resume = db.getResumeById(req.params.id);
      if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ message: "Resume not found." });
      }

      const updated = db.updateResume(req.params.id, req.body);
      res.json({ resume: updated });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to update resume." });
    }
  });

  // Delete resume
  app.delete("/api/resumes/:id", protect, (req: Request, res: Response) => {
    const resume = db.getResumeById(req.params.id);
    if (!resume || resume.userId !== req.user!.id) {
      return res.status(404).json({ message: "Resume not found." });
    }
    db.deleteResume(req.params.id);
    res.json({ success: true, message: "Resume deleted." });
  });

  // Trigger AI Resume Analysis Score
  app.post("/api/resumes/:id/analyze", protect, async (req: Request, res: Response) => {
    try {
      const resume = db.getResumeById(req.params.id);
      if (!resume || resume.userId !== req.user!.id) {
        return res.status(404).json({ message: "Resume not found." });
      }

      // Concatenate fields into a readable text block
      const resumeText = `
        Full Name: ${resume.personalInfo.fullName}
        Professional Title: ${resume.personalInfo.title}
        Summary: ${resume.personalInfo.summary}
        
        Skills: ${resume.skills.join(", ")}
        
        Experience:
        ${resume.experience.map(exp => `${exp.position} at ${exp.company} (${exp.startDate} - ${exp.endDate}): ${exp.description}`).join("\n")}
        
        Education:
        ${resume.education.map(edu => `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school}`).join("\n")}
        
        Projects:
        ${resume.projects.map(proj => `${proj.title} - Technologies: ${proj.technologies}. Description: ${proj.description}`).join("\n")}
      `;

      const analysis = await analyzeResumeWithGemini(resumeText);
      const updated = db.updateResume(resume.id, { scoreAnalysis: analysis });

      res.json({ scoreAnalysis: analysis, resume: updated });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Resume analysis failed." });
    }
  });

  // --- AI Question Generator & Saved Answers API ---

  // Get Questions by parameters or generate dynamically
  app.post("/api/questions/generate", protect, async (req: Request, res: Response) => {
    try {
      const { role, experienceLevel } = req.body;
      if (!role || !experienceLevel) {
        return res.status(400).json({ message: "Specify both role and experienceLevel" });
      }

      // Check if we already have compiled questions for this role and experience level
      const existing = db.getQuestions().filter(
        q => q.role.toLowerCase() === role.toLowerCase() && 
             q.experienceLevel.toLowerCase() === experienceLevel.toLowerCase()
      );

      if (existing.length >= 4) {
        return res.json({ questions: existing });
      }

      // Generate dynamically from Gemini
      const questions = await generateInterviewQuestionsWithGemini(role, experienceLevel);
      
      // Save newly generated questions into the db so they are cached
      const savedQuestions = questions.map(q => {
        return db.createQuestion({
          role,
          experienceLevel,
          category: q.category,
          question: q.question,
          difficulty: q.difficulty,
          expectedAnswer: q.expectedAnswer
        });
      });

      res.json({ questions: savedQuestions });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Question generation failed." });
    }
  });

  // Save/Update an answer with AI feedback evaluation
  app.post("/api/answers/evaluate", protect, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { questionId, question, savedAnswer } = req.body;

      if (!question || !savedAnswer) {
        return res.status(400).json({ message: "Please supply question and savedAnswer." });
      }

      const aiFeedback = await evaluateAnswerWithGemini(question, savedAnswer);

      const record = db.createSavedAnswer({
        userId,
        questionId: questionId || "custom",
        question,
        savedAnswer,
        aiFeedback,
        isFavorite: false
      });

      res.json({ savedAnswer: record });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Evaluation failed." });
    }
  });

  // Get all saved answers/favorites for active user
  app.get("/api/answers", protect, (req: Request, res: Response) => {
    const userId = req.user!.id;
    res.json({ savedAnswers: db.getSavedAnswers(userId) });
  });

  // Toggle favorite saved answer
  app.post("/api/answers/:id/favorite", protect, (req: Request, res: Response) => {
    const record = db.getSavedAnswerById(req.params.id);
    if (!record || record.userId !== req.user!.id) {
      return res.status(404).json({ message: "Saved answer record not found." });
    }
    const updated = db.updateSavedAnswer(req.params.id, { isFavorite: !record.isFavorite });
    res.json({ savedAnswer: updated });
  });

  // Delete saved answer
  app.delete("/api/answers/:id", protect, (req: Request, res: Response) => {
    const record = db.getSavedAnswerById(req.params.id);
    if (!record || record.userId !== req.user!.id) {
      return res.status(404).json({ message: "Record not found." });
    }
    db.deleteSavedAnswer(req.params.id);
    res.json({ success: true });
  });

  // --- Mock Interview System API ---

  // Initiate an interview
  app.post("/api/interviews", protect, async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { role, experienceLevel } = req.body;

      if (!role || !experienceLevel) {
        return res.status(400).json({ message: "Please specify role and experienceLevel." });
      }

      // Automatically generate a set of questions for this session
      const questions = await generateInterviewQuestionsWithGemini(role, experienceLevel);

      const interview = db.createMockInterview({
        userId,
        role,
        experienceLevel,
        questions: questions.map((q, idx) => ({
          id: `q-${idx}`,
          category: q.category,
          question: q.question,
          difficulty: q.difficulty,
          expectedAnswer: q.expectedAnswer
        })),
        answers: {}
      });

      res.status(201).json({ interview });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to start mock interview." });
    }
  });

  // Submit/Update interview progress (answers)
  app.put("/api/interviews/:id", protect, (req: Request, res: Response) => {
    try {
      const interview = db.getMockInterviewById(req.params.id);
      if (!interview || interview.userId !== req.user!.id) {
        return res.status(404).json({ message: "Interview session not found." });
      }

      const { answers } = req.body;
      const updated = db.updateMockInterview(interview.id, {
        answers: { ...interview.answers, ...answers }
      });

      res.json({ interview: updated });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Failed to save progress." });
    }
  });

  // Complete and trigger comprehensive AI interview score
  app.post("/api/interviews/:id/submit", protect, async (req: Request, res: Response) => {
    try {
      const interview = db.getMockInterviewById(req.params.id);
      if (!interview || interview.userId !== req.user!.id) {
        return res.status(404).json({ message: "Interview session not found." });
      }

      const qaPairs = interview.questions.map(q => ({
        question: q.question,
        answer: interview.answers[q.id] || "No response provided."
      }));

      const evaluation = await evaluateFullMockInterviewWithGemini(
        interview.role,
        interview.experienceLevel,
        qaPairs
      );

      const updated = db.updateMockInterview(interview.id, {
        scores: evaluation,
        status: "completed"
      });

      res.json({ interview: updated });
    } catch (e: any) {
      res.status(500).json({ message: e.message || "Evaluation failed." });
    }
  });

  // Get active user's completed/in-progress mock interviews
  app.get("/api/interviews", protect, (req: Request, res: Response) => {
    const userId = req.user!.id;
    const interviews = db.getMockInterviewsByUserId(userId);
    res.json({ interviews });
  });

  // Get single interview by id
  app.get("/api/interviews/:id", protect, (req: Request, res: Response) => {
    const interview = db.getMockInterviewById(req.params.id);
    if (!interview || interview.userId !== req.user!.id) {
      return res.status(404).json({ message: "Interview not found." });
    }
    res.json({ interview });
  });

  // --- Statistics & Learning Analytics API ---

  app.get("/api/analytics/dashboard", protect, (req: Request, res: Response) => {
    const userId = req.user!.id;
    const resumes = db.getResumesByUserId(userId);
    const answers = db.getSavedAnswers(userId);
    const interviews = db.getMockInterviewsByUserId(userId);

    // Completion calculation
    const latestResume = resumes[resumes.length - 1];
    let resumeCompletion = 0;
    let resumeScore = 0;
    if (latestResume) {
      let fields = 0;
      let filled = 0;
      if (latestResume.personalInfo.fullName) filled++; fields++;
      if (latestResume.personalInfo.email) filled++; fields++;
      if (latestResume.personalInfo.phone) filled++; fields++;
      if (latestResume.skills.length > 0) filled++; fields++;
      if (latestResume.education.length > 0) filled++; fields++;
      if (latestResume.experience.length > 0) filled++; fields++;
      resumeCompletion = Math.round((filled / fields) * 100);
      resumeScore = latestResume.scoreAnalysis?.score || 0;
    }

    const completedInterviews = interviews.filter(i => i.status === "completed");
    const totalInterviews = interviews.length;
    
    // Average scores
    let avgComm = 0;
    let avgTech = 0;
    let avgConf = 0;
    let avgTotal = 0;
    if (completedInterviews.length > 0) {
      const sumComm = completedInterviews.reduce((acc, curr) => acc + (curr.scores?.communication || 0), 0);
      const sumTech = completedInterviews.reduce((acc, curr) => acc + (curr.scores?.technical || 0), 0);
      const sumConf = completedInterviews.reduce((acc, curr) => acc + (curr.scores?.confidence || 0), 0);
      const sumTotal = completedInterviews.reduce((acc, curr) => acc + (curr.scores?.total || 0), 0);
      avgComm = Math.round(sumComm / completedInterviews.length);
      avgTech = Math.round(sumTech / completedInterviews.length);
      avgConf = Math.round(sumConf / completedInterviews.length);
      avgTotal = Math.round(sumTotal / completedInterviews.length);
    }

    // Progression over time
    const chartData = completedInterviews.map((i, idx) => ({
      name: `Session ${idx + 1}`,
      technical: i.scores?.technical || 0,
      communication: i.scores?.communication || 0,
      confidence: i.scores?.confidence || 0,
      total: i.scores?.total || 0
    }));

    res.json({
      resumeCompletion,
      resumeScore,
      totalInterviews,
      completedInterviewsCount: completedInterviews.length,
      savedAnswersCount: answers.length,
      averageScores: {
        communication: avgComm,
        technical: avgTech,
        confidence: avgConf,
        total: avgTotal
      },
      chartData
    });
  });

  // --- Admin Panel API ---

  // Get administrative overview metrics
  app.get("/api/admin/metrics", protect, protectAdmin, (req: Request, res: Response) => {
    const users = db.getUsers().map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    });
    const totalResumes = db.getResumes().length;
    const totalInterviews = db.getMockInterviews().length;
    const questionsCount = db.getQuestions().length;

    res.json({
      users,
      metrics: {
        totalUsers: users.length,
        totalResumes,
        totalInterviews,
        questionsCount,
        apiUsageCount: totalInterviews * 4 + totalResumes, // proxy formula
      }
    });
  });

  // Serve static files and hook Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerAI server running successfully on http://localhost:${PORT}`);
  });
}

import crypto from "crypto";
startServer();

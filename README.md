# CareerAI — Premium Full-Stack Interview Preparation & Career Coaching Platform

CareerAI is an enterprise-grade career preparation suite designed to help candidates conquer technical, behavioral, and situational interviews. By combining real-time performance tracking, structured evaluation workflows, and advanced semantic analysis, the platform provides actionable insights that bridge the gap between practice and real-world hiring standards.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion
- **Backend:** Node.js, Express, TypeScript (transpiled natively)
- **State Management & Context:** React Context API with persistent session caches
- **Database Architecture:** Optimized single-source JSON document database with self-healing migration mechanisms
- **Development & Tooling:** Vite, ESBuild, ESLint, TypeScript Type-Stripping Compiler

---

## 🌟 Core Features

### 1. Interactive Question Pool Generator
- **Custom Compiling:** Instantly generates tailored behavioral, technical, and scenario-based questions based on custom industry roles (Software Engineer, Full Stack, Product Manager, etc.) and experience levels.
- **STAR Assessment Pipeline:** Evaluates response formatting against the industry-standard **STAR** structure (Situation, Task, Action, Result).
- **Suggested Model Answers:** Provides reference-quality sample answers highlighting professional terminology and phrasing structure.

### 2. Live Mock Simulator
- **Responsive Media Integration:** Implements clean webcam preview overlays and microphone integration for realistic session practice.
- **Pacing Visualizers:** Real-time countdowns and guidelines ensure responses fit targeted duration brackets.
- **Comprehensive Scorecard Audits:** Grades technical accuracy, structure, delivery posture, and delivers actionable written suggestions.

### 3. Smart Resume Builder & ATS Auditor
- **Tailored Formulator:** Dynamic section-by-section input form fields (Experience, Education, Skills, and Projects).
- **ATS Alignment Engine:** Instantly evaluates resume files against key-phrase density trackers and target industry profiles to deliver an overall compatibility score and bulleted improvement points.
- **Export Capabilities:** Clean, printable, and structured document design stylesheets.

### 4. Admin Management & Deep Analytics
- **System Metrics Trackers:** High-level metrics tracking for performance history, category-specific strength indicators, and session counts.
- **User Activity Audit Logs:** Fully operational administrative panel managing authentication states, global telemetry metrics, and platform usage databases.

---

## 🚀 Key Architectural Engineering Highlights

- **Anti-Reflicker Page Logic:** Eliminates automatic page load states or loop cycles by structuring conditional fetching inside controlled, dependency-stable `useEffect` blocks.
- **Zero-Dependency DB Migration:** Engineered a modular database utility capable of migrating configuration trees between filesystem structures natively on container initialization.
- **Unified ESBuild Bundle:** The backend is compiled into a highly optimized, self-contained CommonJS (`.cjs`) output layer, avoiding ES module resolution overhead on serverless startup.
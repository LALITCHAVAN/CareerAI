import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { 
  BarChart3, 
  FileText, 
  Video, 
  Cpu, 
  Sparkles, 
  CheckCircle, 
  Activity, 
  ArrowRight,
  TrendingUp,
  FileCheck2,
  Bookmark
} from "lucide-react";
import { DashboardAnalytics, MockInterview } from "../types.js";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resAnal, resInt] = await Promise.all([
        fetch("/api/analytics/dashboard"),
        fetch("/api/interviews")
      ]);

      if (resAnal.ok && resInt.ok) {
        const dAnal = await resAnal.json();
        const dInt = await resInt.json();
        setAnalytics(dAnal);
        setInterviews(dInt.interviews || []);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium animate-pulse">Compiling dashboard analytics...</span>
      </div>
    );
  }

  // Fallbacks if server returns empty or fresh user
  const resumeScore = analytics?.resumeScore || 0;
  const resumeCompletion = analytics?.resumeCompletion || 0;
  const totalInterviews = analytics?.totalInterviews || 0;
  const completedInterviewsCount = analytics?.completedInterviewsCount || 0;
  const savedAnswersCount = analytics?.savedAnswersCount || 0;
  const averageScores = analytics?.averageScores || { communication: 0, technical: 0, confidence: 0, total: 0 };

  const recentInterviews = [...interviews]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-purple-500/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 tracking-wider uppercase">
            <Sparkles className="h-4 w-4" /> Personal Training Dashboard
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Your career preparative roadmap is active. Run mock interview simulations or audit your portfolio resume scores to identify and patch your technical skill gaps.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/interview"
            className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:brightness-110 transition active:scale-95"
          >
            <Video className="h-4 w-4" />
            Launch Mock Interview
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Resume completion percentage */}
        <div className="glass-card-interactive rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Resume Completion</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{resumeCompletion}%</span>
            </div>
            <div className="w-28 h-1.5 bg-slate-950/50 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${resumeCompletion}%` }} />
            </div>
          </div>
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2: ATS Score */}
        <div className="glass-card-interactive rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">ATS Resume Audit</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{resumeScore || "N/A"}</span>
              {resumeScore > 0 && <span className="text-xs text-slate-500">/ 100</span>}
            </div>
            <span className="text-2xs text-slate-500 block">
              {resumeScore >= 80 ? "🔥 Excellent ATS Rating" : resumeScore > 0 ? "⚡ Needs minor optimizations" : "⚠️ Upload resume to analyze"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <FileCheck2 className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3: Mock Interviews Completed */}
        <div className="glass-card-interactive rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Mock Simulations</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{completedInterviewsCount}</span>
              <span className="text-xs text-slate-500">completed</span>
            </div>
            <span className="text-2xs text-slate-500 block">Out of {totalInterviews} total launched</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Video className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4: Saved Answers */}
        <div className="glass-card-interactive rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">Saved Question Answers</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{savedAnswersCount}</span>
            </div>
            <span className="text-2xs text-slate-500 block">For offline STAR methodology review</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Bookmark className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1 & 2: Recent Activity / Progress & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-400" /> Quick Preparative Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <Link
                to="/resume"
                className="glass-card-interactive rounded-xl p-4 group space-y-2"
              >
                <FileText className="h-6 w-6 text-pink-400" />
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-pink-400 transition">Resume Builder</h4>
                <p className="text-2xs text-slate-500 leading-relaxed">Build & edit ATS-friendly resumes with live template previewing.</p>
              </Link>

              <Link
                to="/questions"
                className="glass-card-interactive rounded-xl p-4 group space-y-2"
              >
                <Cpu className="h-6 w-6 text-purple-400" />
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-purple-400 transition">Question Gen</h4>
                <p className="text-2xs text-slate-500 leading-relaxed">Dynamically compile category-based lists for 8 core roles.</p>
              </Link>

              <Link
                to="/interview"
                className="glass-card-interactive rounded-xl p-4 group space-y-2"
              >
                <Video className="h-6 w-6 text-blue-400" />
                <h4 className="text-sm font-bold text-slate-200 group-hover:text-blue-400 transition">Mock Sandbox</h4>
                <p className="text-2xs text-slate-500 leading-relaxed">Simulate hot-seats with countdowns and webcam integration.</p>
              </Link>

            </div>
          </div>

          {/* Recent Mock Interviews List */}
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" /> Recent Mock Histories
              </h2>
              <Link to="/analytics" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium">
                View all analytics <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {recentInterviews.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs sm:text-sm">
                No mock interviews launched yet. Let's start with your first custom sandbox!
              </div>
            ) : (
              <div className="space-y-3">
                {recentInterviews.map((int) => (
                  <div
                    key={int.id}
                    className="flex items-center justify-between p-4 glass-card-interactive rounded-xl"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-200">{int.role}</h4>
                        <span className="px-2 py-0.5 bg-white/5 text-slate-400 text-3xs font-semibold rounded">{int.experienceLevel}</span>
                      </div>
                      <p className="text-2xs text-slate-500">Started on {new Date(int.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {int.status === "completed" ? (
                        <div className="text-right">
                          <span className="text-sm font-black text-emerald-400 block">{int.scores?.total}% Score</span>
                          <span className="text-3xs text-slate-500">Evaluation finished</span>
                        </div>
                      ) : (
                        <span className="text-xs text-amber-400 font-semibold bg-amber-400/5 px-2.5 py-1 rounded border border-amber-400/10">
                          In Progress
                        </span>
                      )}

                      <Link
                        to={`/interview?session_id=${int.id}`}
                        className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Column 3: Skill Scoring Profiles & Tips */}
        <div className="space-y-6">
          
          {/* Average Competency Graph-like list */}
          <div className="glass-panel rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pink-400" /> Career Profile Rating
            </h2>

            <div className="space-y-4">
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Technical Accuracy</span>
                  <span className="text-pink-400">{averageScores.technical}%</span>
                </div>
                <div className="h-2 bg-slate-950/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500" style={{ width: `${averageScores.technical}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Communication Delivery</span>
                  <span className="text-purple-400">{averageScores.communication}%</span>
                </div>
                <div className="h-2 bg-slate-950/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: `${averageScores.communication}%` }} />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Confidence & Pace</span>
                  <span className="text-blue-400">{averageScores.confidence}%</span>
                </div>
                <div className="h-2 bg-slate-950/50 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${averageScores.confidence}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 text-center">
                <div className="inline-flex flex-col items-center">
                  <span className="text-2xs text-slate-500 font-medium">Composite Preparation Strength</span>
                  <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-400 mt-0.5">
                    {averageScores.total ? `${averageScores.total}%` : "No Rank Yet"}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Quick coaching checklist */}
          <div className="glass-panel rounded-2xl p-6 space-y-3.5">
            <h3 className="text-sm font-bold text-slate-200">Daily Preparation Goals</h3>
            <ul className="space-y-2.5 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>Audit your resume to ensure it exceeds an ATS Score of 80.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>Complete at least 1 mock interview simulation to improve delivery.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                <span>Practice 3 system design or behavioral scenario questions.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}

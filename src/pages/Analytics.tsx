import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  BookmarkCheck, 
  FileCheck2, 
  Video, 
  CheckCircle, 
  Sparkles, 
  ChevronRight, 
  Trash2,
  Calendar
} from "lucide-react";
import { DashboardAnalytics, MockInterview, SavedAnswer } from "../types.js";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [interviews, setInterviews] = useState<MockInterview[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchAnalyticsData();
  }, [user]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [resAnal, resInt, resAns] = await Promise.all([
        fetch("/api/analytics/dashboard"),
        fetch("/api/interviews"),
        fetch("/api/answers")
      ]);

      if (resAnal.ok && resInt.ok && resAns.ok) {
        setAnalytics(await resAnal.json());
        
        const dInt = await resInt.json();
        setInterviews(dInt.interviews || []);

        const dAns = await resAns.json();
        setSavedAnswers(dAns.savedAnswers || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnswer = async (recordId: string) => {
    try {
      const res = await fetch(`/api/answers/${recordId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSavedAnswers(savedAnswers.filter(a => a.id !== recordId));
        // Refresh analytics numbers
        const resAnal = await fetch("/api/analytics/dashboard");
        if (resAnal.ok) setAnalytics(await resAnal.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium animate-pulse">Compiling analytical metrics & SVG graphs...</span>
      </div>
    );
  }

  const averageScores = analytics?.averageScores || { communication: 0, technical: 0, confidence: 0, total: 0 };
  const finishedMockCount = interviews.filter(i => i.status === "completed").length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Title block */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 tracking-wider uppercase">
          <BarChart3 className="h-4 w-4" /> Career Progress Metrics
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Performance Analytics Dashboard
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Trace your trajectory. Dive deep into technical mastery ratings, communication trends, and resume optimization history compiled over all practice simulations.
        </p>
      </div>

      {/* Bento Grid Stats Rows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Strengths breakdown */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:col-span-2 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800/60">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" /> Competency Vector Progress
            </h3>
            <span className="text-2xs text-slate-500 font-medium">Real-Time feedback synced</span>
          </div>

          <div className="space-y-4">
            
            {/* Communication bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Verbal Communication Delivery</span>
                <span className="text-purple-400 font-bold">{averageScores.communication}%</span>
              </div>
              <div className="h-3.5 bg-slate-950 rounded-xl overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700" 
                  style={{ width: `${averageScores.communication || 15}%` }} 
                />
              </div>
              <span className="text-3xs text-slate-500 block pl-0.5">Measures narrative clarity, structure, and pacing posture.</span>
            </div>

            {/* Technical bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Technical Industry Nomenclature</span>
                <span className="text-pink-400 font-bold">{averageScores.technical}%</span>
              </div>
              <div className="h-3.5 bg-slate-950 rounded-xl overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700" 
                  style={{ width: `${averageScores.technical || 15}%` }} 
                />
              </div>
              <span className="text-3xs text-slate-500 block pl-0.5">Evaluates architectural accuracy, stack knowledge, and logic reasoning.</span>
            </div>

            {/* Confidence bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-300">
                <span>Assertive Composure</span>
                <span className="text-blue-400 font-bold">{averageScores.confidence}%</span>
              </div>
              <div className="h-3.5 bg-slate-950 rounded-xl overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 transition-all duration-700" 
                  style={{ width: `${averageScores.confidence || 15}%` }} 
                />
              </div>
              <span className="text-3xs text-slate-500 block pl-0.5">Reflects speech rate, pause frequency, and general assertion composure.</span>
            </div>

          </div>
        </div>

        {/* Global Composite Rating Card */}
        <div className="bg-gradient-to-tr from-slate-900 to-purple-950/40 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <span className="text-3xs font-extrabold text-purple-400 uppercase tracking-widest block">Simulation Rating</span>
            <h3 className="text-lg font-bold text-white">Composite Readiness</h3>
            <p className="text-2xs text-slate-500 leading-relaxed">
              Based on completed mock sessions, ATS keyword inclusions, and STAR answers submitted.
            </p>
          </div>

          <div className="py-6 text-center">
            <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
              {averageScores.total ? `${averageScores.total}%` : "0%"}
            </span>
            <span className="text-3xs text-slate-500 block mt-2">Recommended benchmark target: 80%</span>
          </div>

          <div className="bg-slate-950/60 border border-slate-900 rounded-xl p-3 text-center text-3xs text-slate-400">
            🔥 Rank status: {averageScores.total >= 80 ? "Premium Level ready" : "Requires iterative practice"}
          </div>
        </div>

      </div>

      {/* Trajectory vector trends using raw vector SVG rendering */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
        <h3 className="text-sm font-bold text-slate-200">Historical Trendline Visualization</h3>
        
        {interviews.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            Launch and finish a mock session to draw trend vectors.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Visual Vector SVG overlay */}
            <div className="relative h-44 bg-slate-950 border border-slate-900 rounded-2xl p-4 flex items-end justify-between overflow-hidden">
              
              {/* Plot horizontal coordinates */}
              <div className="absolute inset-x-0 bottom-4 border-b border-slate-900" />
              <div className="absolute inset-y-0 left-10 border-r border-slate-900" />

              {/* Draw connected trend polygon paths if coordinates exist */}
              <svg className="absolute inset-0 w-full h-full p-4 pointer-events-none">
                <path
                  d={`M ${interviews.map((item, idx) => {
                    const x = 50 + (idx * 120);
                    const y = 140 - ((item.scores?.total || 30) * 1.1);
                    return `${x} ${y}`;
                  }).join(" L ")}`}
                  fill="none"
                  stroke="url(#purple-gradient)"
                  strokeWidth="3.5"
                />
                <defs>
                  <linearGradient id="purple-gradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Data Dot anchors */}
              <div className="relative z-10 w-full flex justify-around pl-10 pr-4">
                {interviews.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div 
                      className="h-3 w-3 rounded-full bg-purple-500 border-2 border-white mb-2"
                      style={{ transform: `translateY(-${(item.scores?.total || 30) * 0.4}px)` }}
                    />
                    <span className="text-3xs text-slate-500 font-mono">Session {idx + 1}</span>
                    <span className="text-2xs font-bold text-purple-400">{item.scores?.total}%</span>
                  </div>
                ))}
              </div>

            </div>
            <p className="text-[10px] text-slate-500 text-center">Plot represents composite readiness scoring trends tracked across subsequent sandbox loops.</p>
          </div>
        )}
      </div>

      {/* Historical Logs listings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        
        {/* Mock Interview Histories */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Video className="h-4.5 w-4.5 text-blue-400" /> Completed Mock Sessions ({finishedMockCount})
          </h3>

          {interviews.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No mock interview sessions recorded yet.</div>
          ) : (
            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {interviews.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800/60 hover:bg-slate-900 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-200">{item.role}</h4>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-4xs font-bold rounded uppercase">{item.experienceLevel}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-3xs text-slate-500">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-400 block">{item.scores?.total}% Score</span>
                      <span className="text-[10px] text-slate-500">AI evaluated</span>
                    </div>

                    <Link
                      to={`/interview?session_id=${item.id}`}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Saved Answers Hist */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <BookmarkCheck className="h-4.5 w-4.5 text-yellow-500" /> Answer Evaluations Pool ({savedAnswers.length})
          </h3>

          {savedAnswers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No formulated question evaluations stored yet.</div>
          ) : (
            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {savedAnswers.map((ans) => (
                <div
                  key={ans.id}
                  className="bg-slate-900/80 border border-slate-800/60 rounded-xl p-4 space-y-2 relative"
                >
                  <button
                    id={`btn-del-anal-${ans.id}`}
                    onClick={() => handleDeleteAnswer(ans.id)}
                    className="absolute top-4 right-4 p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-950 border border-transparent hover:border-slate-850 rounded"
                    title="Delete Answer Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="space-y-1 pr-6">
                    <span className="text-4xs text-slate-500 block uppercase font-bold tracking-wider">Stored Answer</span>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{ans.question}</h4>
                    <p className="text-3xs text-slate-500 italic line-clamp-2">" {ans.savedAnswer} "</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-950/60 pt-2 text-[10px]">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <Award className="h-3.5 w-3.5" />
                      {ans.aiFeedback?.correctness}% AI Score
                    </span>
                    {ans.isFavorite && (
                      <span className="text-yellow-500 font-semibold uppercase text-4xs">Favorite ⭐</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

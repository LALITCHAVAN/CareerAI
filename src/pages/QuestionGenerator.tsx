import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { 
  Cpu, 
  Sparkles, 
  Bookmark, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  CheckCircle2, 
  Award, 
  ShieldAlert,
  Loader2,
  BookmarkCheck,
  Trash2
} from "lucide-react";
import { InterviewQuestion, SavedAnswer } from "../types.js";

const SUPPORTED_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "DevOps Engineer"
];

const EXPERIENCE_LEVELS = [
  "Fresher",
  "Junior",
  "Mid-Level",
  "Senior"
];

export default function QuestionGenerator() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState(SUPPORTED_ROLES[0]);
  const [selectedExp, setSelectedExp] = useState(EXPERIENCE_LEVELS[1]); // Junior
  
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswer[]>([]);
  
  const [generating, setGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

// Card state managers
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [evaluating, setEvaluating] = useState<Record<string, boolean>>({}); // questionId -> loading state
  const [evalResults, setEvalResults] = useState<Record<string, SavedAnswer>>({}); // questionId -> evaluation

  useEffect(() => {
    fetchAnswerHistory();
  }, []);

  const fetchAnswerHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch("/api/answers");
      if (res.ok) {
        const data = await res.json();
        setSavedAnswers(data.savedAnswers || []);
        
        // Map any already evaluated custom answers to our state
        const mappedEvals: Record<string, SavedAnswer> = {};
        data.savedAnswers.forEach((ans: SavedAnswer) => {
          if (ans.questionId) {
            mappedEvals[ans.questionId] = ans;
          }
        });
        setEvalResults(mappedEvals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerateQuestions = async (role = selectedRole, exp = selectedExp) => {
    setGenerating(true);
    setQuestions([]);
    try {
      const res = await fetch("/api/questions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, experienceLevel: exp })
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
        if (data.questions && data.questions.length > 0) {
          setExpandedCard(data.questions[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };



  const handleEvaluateAnswer = async (qId: string, questionText: string, answerText: string) => {
    if (!answerText || !answerText.trim()) return;

    setEvaluating((prev) => ({ ...prev, [qId]: true }));
    try {
      const res = await fetch("/api/answers/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: qId,
          question: questionText,
          savedAnswer: answerText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEvalResults((prev) => ({ ...prev, [qId]: data.savedAnswer }));
        // Refresh full history list
        fetchAnswerHistory();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating((prev) => ({ ...prev, [qId]: false }));
    }
  };

  const handleToggleFavorite = async (recordId: string, qId: string) => {
    try {
      const res = await fetch(`/api/answers/${recordId}/favorite`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        // Update evalResults & history
        setEvalResults((prev) => ({ ...prev, [qId]: data.savedAnswer }));
        fetchAnswerHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAnswer = async (recordId: string, qId: string) => {
    try {
      const res = await fetch(`/api/answers/${recordId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setEvalResults((prev) => {
          const updated = { ...prev };
          delete updated[qId];
          return updated;
        });
        fetchAnswerHistory();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Title block */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 tracking-wider uppercase">
          <Cpu className="h-4 w-4 animate-pulse" /> Dynamic Practice Pools
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Interview Question Generator
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Instantly generate deep specialized question pools. Formulate your answers and trigger automatic evaluation pipelines to get ratings, recommendations, and perfect mock suggestions.
        </p>
      </div>

      {/* Selectors and trigger Panel */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end shadow-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Industry Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
          >
            {SUPPORTED_ROLES.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Experience Level</label>
          <select
            value={selectedExp}
            onChange={(e) => setSelectedExp(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none"
          >
            {EXPERIENCE_LEVELS.map((e, i) => (
              <option key={i} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <button
          id="btn-generate-questions"
          onClick={() => handleGenerateQuestions(selectedRole, selectedExp)}
          disabled={generating}
          className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-bold text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition duration-300 flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Compiling Questions...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Compile Custom Pool
            </>
          )}
        </button>
      </div>

      {/* Question Results list */}
      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Compiled Pool for {selectedRole} ({selectedExp})
          </h2>

          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                q={q}
                isExpanded={expandedCard === q.id}
                onToggleExpand={() => setExpandedCard(expandedCard === q.id ? null : q.id)}
                hasEval={evalResults[q.id]}
                isChecking={!!evaluating[q.id]}
                onEvaluate={handleEvaluateAnswer}
                onToggleFavorite={handleToggleFavorite}
                onDeleteAnswer={handleDeleteAnswer}
              />
            ))}
          </div>
        </div>
      )}

      {/* Answer History collection list */}
      {!loadingHistory && savedAnswers.length > 0 && (
        <div className="space-y-4 border-t border-slate-900 pt-8 mt-12">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookmarkCheck className="h-5 w-5 text-yellow-500" /> Saved Answer History ({savedAnswers.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedAnswers.map((item) => (
              <div key={item.id} className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-slate-500 font-mono">Saved on {new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.isFavorite && (
                      <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-3xs font-bold rounded uppercase">
                        Favorite
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-2">{item.question}</h4>
                    <p className="text-2xs text-slate-500 mt-2 line-clamp-3 italic">" {item.savedAnswer} "</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-900/60 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400">{item.aiFeedback?.correctness}% AI Score</span>
                  </div>

                  <button
                    id={`btn-del-hist-${item.id}`}
                    onClick={() => handleDeleteAnswer(item.id, item.questionId)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

interface QuestionCardProps {
  key?: string | number;
  q: InterviewQuestion;
  isExpanded: boolean;
  onToggleExpand: () => void;
  hasEval: SavedAnswer | undefined;
  isChecking: boolean;
  onEvaluate: (qId: string, questionText: string, answerText: string) => Promise<void> | void;
  onToggleFavorite: (recordId: string, qId: string) => Promise<void> | void;
  onDeleteAnswer: (recordId: string, qId: string) => Promise<void> | void;
}

function QuestionCard({
  q,
  isExpanded,
  onToggleExpand,
  hasEval,
  isChecking,
  onEvaluate,
  onToggleFavorite,
  onDeleteAnswer,
}: QuestionCardProps) {
  const [localAnswer, setLocalAnswer] = useState("");

  return (
    <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300">
      {/* Card Header toggle */}
      <div
        onClick={onToggleExpand}
        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-900/20 select-none"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 text-3xs font-bold uppercase rounded ${
            q.category === "technical" 
              ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" 
              : q.category === "behavioral" 
                ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                : q.category === "scenario"
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
          }`}>
            {q.category}
          </span>
          <h3 className="text-xs sm:text-sm font-bold text-slate-200 pr-4">{q.question}</h3>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xs text-slate-500 font-medium">Difficulty: {q.difficulty}</span>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </div>
      </div>

      {/* Card Content body */}
      {isExpanded && (
        <div className="px-5 pb-6 pt-2 border-t border-slate-900/60 space-y-5">
          
          {/* Expert expected criteria */}
          <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-1.5">
            <span className="text-3xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" /> Expected Key Competencies
            </span>
            <p className="text-2xs sm:text-xs text-slate-400 leading-relaxed">{q.expectedAnswer}</p>
          </div>

          {/* Evaluation result show */}
          {hasEval ? (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Your Evaluation Score</span>
                    <span className="px-1.5 py-0.5 bg-purple-500/15 text-purple-400 text-3xs font-bold rounded uppercase">STAR Assessment</span>
                  </div>
                  <p className="text-2xs text-slate-400 max-w-md">{hasEval.aiFeedback?.feedback}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-base font-black text-emerald-400 block">{hasEval.aiFeedback?.correctness}% Accuracy</span>
                    <span className="text-3xs text-slate-500">Evaluation Score</span>
                  </div>

                  <button
                    id={`btn-fav-${q.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(hasEval.id, q.id);
                    }}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      hasEval.isFavorite
                        ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                    title={hasEval.isFavorite ? "Favorited" : "Save to Favorites"}
                  >
                    {hasEval.isFavorite ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>

                  <button
                    id={`btn-delete-ans-${q.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteAnswer(hasEval.id, q.id);
                    }}
                    className="p-2 bg-slate-950 text-rose-500 hover:text-rose-400 rounded-lg border border-slate-800 cursor-pointer"
                    title="Delete Evaluation"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-3xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 text-purple-400">
                  <Sparkles className="h-3.5 w-3.5" /> Suggested Model Answer:
                </h4>
                <p className="text-2xs sm:text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {hasEval.aiFeedback?.suggestedAnswer}
                </p>
              </div>
            </div>
          ) : (
            /* Textarea Answer Formulation */
            <div className="space-y-3">
              <label className="text-2xs font-bold text-slate-400 uppercase tracking-wide">Formulate Your Answer response</label>
              <textarea
                rows={4}
                value={localAnswer}
                onChange={(e) => setLocalAnswer(e.target.value)}
                placeholder="Type or copy-paste your practice response. Protip: structure behavioral responses using STAR (Situation, Task, Action, Result)."
                className="w-full text-xs sm:text-sm bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
              />

              <div className="flex justify-end">
                <button
                  id={`btn-eval-${q.id}`}
                  onClick={() => onEvaluate(q.id, q.question, localAnswer)}
                  disabled={isChecking || !localAnswer.trim()}
                  className="flex items-center gap-1.5 px-4.5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-white rounded-xl text-xs shadow-md hover:brightness-110 active:scale-95 disabled:opacity-50 transition duration-300 cursor-pointer"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      Submit for Evaluation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext.js";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  CheckCircle, 
  Award, 
  MessageSquare,
  Sparkles,
  AlertTriangle,
  Timer,
  Loader2,
  TrendingUp,
  RotateCcw
} from "lucide-react";
import { MockInterview } from "../types.js";

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

export default function MockInterviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [session, setSession] = useState<MockInterview | null>(null);
  const [role, setRole] = useState(SUPPORTED_ROLES[0]);
  const [exp, setExp] = useState(EXPERIENCE_LEVELS[1]);

  // Stages: "config" | "active" | "results"
  const [stage, setStage] = useState<"config" | "active" | "results">("config");
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({}); // questionId -> text
  const [timerLeft, setTimerLeft] = useState(90); // 90 seconds per question
  
  // Webcam & Mic feeds
  const [webcamActive, setWebcamActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Loaders
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Extract session_id if provided directly via query string
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sId = params.get("session_id");
    if (sId) {
      loadExistingSession(sId);
    }
  }, [location]);

  // Live timer countdown
  useEffect(() => {
    if (stage !== "active") return;
    if (timerLeft <= 0) {
      // Auto move to next question or end
      handleNextQuestion();
      return;
    }

    const interval = setInterval(() => {
      setTimerLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, timerLeft]);

  // WebRTC Stream cleaner
  useEffect(() => {
    return () => {
      stopStreams();
    };
  }, []);

  const loadExistingSession = async (id: string) => {
    try {
      const res = await fetch(`/api/interviews/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSession(data.interview);
        setUserAnswers(data.interview.answers || {});
        if (data.interview.status === "completed") {
          setStage("results");
        } else {
          setStage("active");
          // Calculate active question based on first unanswered
          const unansweredIdx = data.interview.questions.findIndex(
            (q: any) => !data.interview.answers[q.id]
          );
          setActiveQuestionIdx(unansweredIdx !== -1 ? unansweredIdx : 0);
          startStreams();
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartInterview = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, experienceLevel: exp })
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.interview);
        setUserAnswers({});
        setStage("active");
        setActiveQuestionIdx(0);
        setTimerLeft(90);
        await startStreams();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStarting(false);
    }
  };

  const startStreams = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360 },
        audio: true
      });
      streamRef.current = stream;
      setWebcamActive(true);
      setMicActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Media stream request rejected or unavailable:", err);
      // Degrades gracefully
      setWebcamActive(false);
      setMicActive(false);
    }
  };

  const stopStreams = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setWebcamActive(false);
    setMicActive(false);
  };

  const toggleWebcam = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setWebcamActive(videoTrack.enabled);
      }
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  const saveCurrentAnswerProgress = async (answersToSave: Record<string, string>) => {
    if (!session) return;
    try {
      await fetch(`/api/interviews/${session.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answersToSave })
      });
    } catch (e) {
      console.error("Progress save failed:", e);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;
    const currentQ = session.questions[activeQuestionIdx];
    const updatedAnswers = {
      ...userAnswers,
      [currentQ.id]: userAnswers[currentQ.id] || "No verbal/text response recorded."
    };

    setUserAnswers(updatedAnswers);
    saveCurrentAnswerProgress(updatedAnswers);

    if (activeQuestionIdx < session.questions.length - 1) {
      setActiveQuestionIdx((prev) => prev + 1);
      setTimerLeft(90);
    } else {
      // Completed last question, trigger evaluation
      handleSubmitInterview(updatedAnswers);
    }
  };

  const handlePrevQuestion = () => {
    if (activeQuestionIdx > 0) {
      setActiveQuestionIdx((prev) => prev - 1);
      setTimerLeft(90);
    }
  };

  const handleSubmitInterview = async (finalAnswers: Record<string, string>) => {
    if (!session) return;
    setSubmitting(true);
    stopStreams();

    try {
      // First save progress
      await saveCurrentAnswerProgress(finalAnswers);

      // Trigger full evaluation
      const res = await fetch(`/api/interviews/${session.id}/submit`, {
        method: "POST"
      });

      if (res.ok) {
        const data = await res.json();
        setSession(data.interview);
        setStage("results");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Title Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 tracking-wider uppercase">
          <Video className="h-4 w-4" /> Live Board simulation
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Real-Time Mock Interview Sandbox
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Put yourself in the hot-seat. Replicate true pressure with circular countdowns, simulated video/audio recording rails, and get an instant professional scorecard breakdown.
        </p>
      </div>

      {/* Stage 1: CONFIGURATION */}
      {stage === "config" && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-10 max-w-2xl mx-auto space-y-8 shadow-2xl relative overflow-hidden">
          
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Initialize Your Session</h2>
            <p className="text-2xs text-slate-400">Select target career attributes to calibrate the simulator questions.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Target Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none focus:border-purple-500"
              >
                {SUPPORTED_ROLES.map((r, i) => (
                  <option key={i} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Applied Level</label>
              <select
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 focus:outline-none"
              >
                {EXPERIENCE_LEVELS.map((e, i) => (
                  <option key={i} value={e}>{e}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Device check notifications */}
          <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-300">Webcam & Microphone Request</h4>
              <p className="text-3xs text-slate-500 leading-relaxed">
                This platform utilizes local audio and video capture to simulate high-stakes interviews. This feedback runs entirely locally inside your browser sandbox and is never saved.
              </p>
            </div>
          </div>

          <button
            id="btn-start-sandbox"
            onClick={handleStartInterview}
            disabled={starting}
            className="w-full py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-bold text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {starting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Compiling Mock interview track...
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Launch Simulation Sandbox
              </>
            )}
          </button>
        </div>
      )}

      {/* Stage 2: ACTIVE SANDBOX LOOP */}
      {stage === "active" && session && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Question panel & response area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Session stats indicator */}
            <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-3xs font-bold uppercase rounded">
                  Question {activeQuestionIdx + 1} of {session.questions.length}
                </span>
                <span className="text-2xs text-slate-500">{session.role} ({session.experienceLevel})</span>
              </div>

              {/* Circular or bar timer */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Timer className={`h-4 w-4 ${timerLeft <= 15 ? "text-rose-500 animate-pulse" : "text-purple-400"}`} />
                <span className={timerLeft <= 15 ? "text-rose-400" : "text-slate-300"}>{timerLeft}s left</span>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-4">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wider block">Target Question Context</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                {session.questions[activeQuestionIdx].question}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Category: {session.questions[activeQuestionIdx].category} | Difficulty: {session.questions[activeQuestionIdx].difficulty}
              </p>
            </div>

            {/* Text Response panel */}
            <div className="space-y-2">
              <label className="text-2xs font-bold text-slate-400 uppercase tracking-wide">Record Answer Transcription / text Response</label>
              <textarea
                rows={5}
                value={userAnswers[session.questions[activeQuestionIdx].id] || ""}
                onChange={(e) => setUserAnswers({ ...userAnswers, [session.questions[activeQuestionIdx].id]: e.target.value })}
                placeholder="Simulate your response out loud into your microphone, or formulate and type your complete transcript response directly in this area..."
                className="w-full text-xs sm:text-sm bg-slate-900/30 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>

            {/* Step navigation triggers */}
            <div className="flex justify-between items-center pt-2">
              <button
                id="btn-prev-q"
                onClick={handlePrevQuestion}
                disabled={activeQuestionIdx === 0}
                className="flex items-center gap-1.5 px-4.5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 rounded-xl text-xs font-bold"
              >
                <ChevronLeft className="h-4 w-4" /> Prev Question
              </button>

              <button
                id="btn-next-q"
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-white rounded-xl text-xs shadow-md hover:brightness-110"
              >
                {activeQuestionIdx === session.questions.length - 1 ? "Submit Interview" : "Next Question"}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* Webcam sidebar & microphone control */}
          <div className="space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                <span className="text-xs font-bold text-slate-300">Live Practice Sandbox</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* HTML5 video feed stream */}
              <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform scale-x-[-1] ${!webcamActive ? "hidden" : "block"}`}
                />
                {!webcamActive && (
                  <div className="text-center space-y-2 p-4 text-slate-600">
                    <VideoOff className="h-8 w-8 text-slate-700 mx-auto animate-pulse" />
                    <p className="text-3xs leading-relaxed max-w-xs mx-auto">Webcam stream deactivated or permission missing. Practice out loud and type your response transcript.</p>
                  </div>
                )}
              </div>

              {/* Feed quick toggles */}
              <div className="flex gap-2">
                <button
                  id="btn-toggle-cam"
                  onClick={toggleWebcam}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    webcamActive 
                      ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                  }`}
                >
                  {webcamActive ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                  Camera
                </button>

                <button
                  id="btn-toggle-mic"
                  onClick={toggleMic}
                  className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    micActive 
                      ? "bg-slate-900 border-slate-800 text-slate-300 hover:text-white" 
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                  }`}
                >
                  {micActive ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                  Microphone
                </button>
              </div>

              {/* Simulated visual micro-volume decibel levels */}
              {micActive && (
                <div className="space-y-1">
                  <div className="flex justify-between text-3xs font-semibold text-slate-500">
                    <span>Microphone capture level</span>
                    <span className="text-emerald-400 font-bold">Optimal</span>
                  </div>
                  <div className="h-1 bg-slate-950 rounded-full overflow-hidden flex gap-0.5">
                    <div className="h-full bg-emerald-400 w-1/4 rounded-sm animate-pulse" />
                    <div className="h-full bg-emerald-400 w-1/5 rounded-sm animate-pulse delay-75" />
                    <div className="h-full bg-emerald-400 w-1/12 rounded-sm" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick tips panel */}
            <div className="bg-slate-900/20 border border-slate-800/80 rounded-3xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-300">Mock Interview Guidelines</h4>
              <ul className="space-y-2 text-3xs text-slate-500 leading-relaxed list-decimal list-inside">
                <li>Formulate responses directly and back claims using concrete statistics.</li>
                <li>Pace yourself. Use the full 90-second segment if possible.</li>
                <li>When complete, our automated system evaluates structural clarity, terminology accuracy, and response structure.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* Stage 3: RESULTS SCORECARD */}
      {stage === "results" && session && session.scores && (
        <div className="space-y-8 max-w-4xl mx-auto bg-slate-900/40 border border-slate-800 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 p-8">
            <Award className="h-16 w-16 text-purple-500/10" />
          </div>

          <div className="text-center space-y-3">
            <div className="inline-flex p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Simulation Completed!</h2>
            <p className="text-sm text-slate-400">Your session scores have been computed via our automated scoring algorithm.</p>
          </div>

          {/* Core Composite Score Gauge */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 pt-6 text-center">
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wide">Overall Rating</span>
              <h3 className="text-2xl sm:text-3xl font-black text-purple-400">{session.scores.total}%</h3>
              <span className="text-3xs text-slate-600 block">Combined profile</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wide">Technical Depth</span>
              <h3 className="text-2xl sm:text-3xl font-black text-pink-400">{session.scores.technical}%</h3>
              <span className="text-3xs text-slate-600 block">Nomenclature & accuracy</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wide">Communication</span>
              <h3 className="text-2xl sm:text-3xl font-black text-blue-400">{session.scores.communication}%</h3>
              <span className="text-3xs text-slate-600 block">Structuring & pace</span>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-3xs font-bold text-slate-500 uppercase tracking-wide">Confidence Composure</span>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-400">{session.scores.confidence}%</h3>
              <span className="text-3xs text-slate-600 block">Assertiveness & rate</span>
            </div>

          </div>

          {/* In-depth Coach Summarization text */}
          <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-3 mt-6">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 text-purple-400 uppercase tracking-wide">
              <Sparkles className="h-4 w-4" /> AI Coaching summary verdict
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
              {session.scores.feedback}
            </p>
          </div>

          {/* Transcript question-by-question review */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" /> QA Transcript review
            </h3>

            <div className="space-y-4">
              {session.questions.map((q, idx) => {
                const ans = session.answers[q.id] || "No response supplied.";
                return (
                  <div key={q.id} className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-3xs font-bold text-slate-500 uppercase">Question {idx + 1} ({q.category})</span>
                      <span className="text-3xs text-slate-600">Difficulty: {q.difficulty}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-200">{q.question}</h4>
                    
                    <div className="space-y-1">
                      <span className="text-3xs text-purple-400 font-semibold block">Your Response Transcript:</span>
                      <p className="text-xs text-slate-400 leading-relaxed italic">" {ans} "</p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4.5 space-y-1 text-2xs">
                      <span className="text-3xs text-slate-500 font-bold uppercase tracking-wide block">Perfect Reference Answer Model:</span>
                      <p className="text-slate-400 leading-relaxed">{q.expectedAnswer}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Restart triggers */}
          <div className="pt-6 border-t border-slate-800 flex justify-center">
            <button
              id="btn-restart-sandbox"
              onClick={() => setStage("config")}
              className="flex items-center gap-1.5 px-6 py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-bold text-white rounded-xl text-xs hover:scale-105 active:scale-95 transition"
            >
              <RotateCcw className="h-4 w-4" /> Start Fresh Simulation session
            </button>
          </div>

        </div>
      )}

      {/* Global pending submission loader */}
      {submitting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex flex-col items-center justify-center text-slate-400 gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <h3 className="text-lg font-bold text-white animate-pulse">Running full scorecard audit...</h3>
          <p className="text-xs text-slate-500 max-w-sm text-center">Our evaluation engine is grading your technical accuracy, STAR delivery metrics, and compiling personalized feedback summary tips.</p>
        </div>
      )}

    </div>
  );
}

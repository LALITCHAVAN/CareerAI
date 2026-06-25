import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { 
  Shield, 
  Users, 
  FileSpreadsheet, 
  Video, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  AlertOctagon,
  Award,
  Loader2,
  Trash2
} from "lucide-react";
import { AdminMetrics, User } from "../types.js";

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    // Basic guard: Route back if not logged in
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchAdminData();
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resMetrics, resUsers] = await Promise.all([
        fetch("/api/admin/metrics"),
        fetch("/api/admin/users")
      ]);

      if (resMetrics.ok && resUsers.ok) {
        setMetrics(await resMetrics.json());
        setUsers(await resUsers.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDatabaseSeed = async () => {
    if (!window.confirm("WARNING: This will clear data logs and restore the default system configuration, mock candidates, and starter resumes. Do you wish to continue?")) {
      return;
    }

    setSeeding(true);
    setSuccessMsg("");
    try {
      const res = await fetch("/api/admin/reset-seed", {
        method: "POST"
      });
      if (res.ok) {
        setSuccessMsg("Database successfully wiped and seeded with starter blueprints!");
        await fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium animate-pulse font-mono text-purple-400">Loading master admin registry...</span>
      </div>
    );
  }

  const m = metrics || { totalUsers: 0, totalResumes: 0, totalInterviews: 0, averageOverallScore: 0 };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Title block */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-rose-500 tracking-wider uppercase font-mono">
          <Shield className="h-4 w-4" /> System Control Center
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          SaaS Admin Panel
        </h1>
        <p className="text-slate-400 text-sm max-w-2xl">
          Supervise active accounts, compile systemwide performance metrics, audit global interview pipelines, and wipe/seed simulated environments in one unified dashboard.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs sm:text-sm text-center font-medium">
          {successMsg}
        </div>
      )}

      {/* Metrics breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Candidates</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{m.totalUsers}</span>
              <span className="text-xs text-slate-500">users</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Compiled Portfolios</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{m.totalResumes}</span>
              <span className="text-xs text-slate-500">resumes</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mock Runs Completed</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{m.totalInterviews}</span>
              <span className="text-xs text-slate-500">sessions</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Video className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">System Average Score</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-white">{m.averageOverallScore}%</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Award className="h-5 w-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Accounts list */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Registered Candidate Directory ({users.length})</h3>
          
          <div className="space-y-3.5 max-h-[480px] overflow-y-auto pr-1">
            {users.map((u) => (
              <div 
                key={u.id}
                className="flex items-center justify-between p-4 bg-slate-900/80 rounded-xl border border-slate-800/60"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">{u.name}</h4>
                  <p className="text-3xs text-slate-500 font-mono">{u.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-950 text-slate-500 text-4xs font-bold rounded">
                    ID: {u.id.substring(0, 8)}...
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone controls */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 text-rose-500 font-mono uppercase tracking-wide">
              <AlertOctagon className="h-4.5 w-4.5" /> Maintenance Zone
            </h3>
            <p className="text-2xs text-slate-500 leading-relaxed">
              Use the master trigger below to wipe transient simulation databases (`data/db.json`) and restore clean, pre-seeded accounts and blueprints.
            </p>
          </div>

          <div className="bg-slate-950 border border-rose-500/20 p-4 rounded-2xl flex items-start gap-2.5">
            <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0" />
            <span className="text-3xs text-slate-500 leading-relaxed">
              Performing database re-seeds is destructive. It terminates all active sessions, deletes uploaded portfolios, and resets custom progress charts.
            </span >
          </div>

          <button
            id="btn-admin-reset-db"
            onClick={handleResetDatabaseSeed}
            disabled={seeding}
            className="w-full py-4.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/30 font-bold text-rose-400 rounded-xl text-xs transition duration-300 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {seeding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Reseeding Database...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4" />
                Wipe & Re-Seed Simulated DB
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}

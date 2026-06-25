import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { Lock, Mail, User as UserIcon, Sparkles, ArrowLeft, ShieldAlert } from "lucide-react";

export default function AuthPage() {
  const { login, register, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Route back to dashboard if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Read query params for toggling registration initially
  const queryParams = new URLSearchParams(location.search);
  const isRegisterParam = queryParams.get("signup") === "true";

  const [isRegister, setIsRegister] = useState(isRegisterParam);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryStep, setRecoveryStep] = useState(1); // 1: send email, 2: reset pass
  const [resetPassword, setResetPassword] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    if (isRegister) {
      if (!name || !email || !password) {
        setError("Please fill out all credentials.");
        setSubmitting(false);
        return;
      }
      const res = await register(name, email, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Registration failed.");
      }
    } else {
      if (!email || !password) {
        setError("Please specify email and password.");
        setSubmitting(false);
        return;
      }
      const res = await login(email, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Invalid credentials.");
      }
    }
    setSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Recovery simulated successfully!");
        setRecoveryStep(2);
      } else {
        setError(data.message || "Email address not found.");
      }
    } catch (err: any) {
      setError(err.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: recoveryEmail, newPassword: resetPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Password changed successfully! Please login with your new credentials.");
        setIsForgotPassword(false);
        setRecoveryStep(1);
        setIsRegister(false);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err: any) {
      setError(err.message || "Reset failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden text-slate-100">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-8 bg-slate-900/40 backdrop-blur-md p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-4">
            <ArrowLeft className="h-3 w-3" /> Back to home
          </Link>

          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white mb-2 shadow-lg">
            <Sparkles className="h-6 w-6" />
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {isForgotPassword 
              ? "Reset Password" 
              : isRegister 
                ? "Create your account" 
                : "Welcome back"}
          </h2>
          <p className="text-sm text-slate-400">
            {isForgotPassword 
              ? "Change your security settings" 
              : isRegister 
                ? "Get immediate access to premium prep suites" 
                : "Resume your tailored interview training"}
          </p>
        </div>

        {/* Global Error/Success indicators */}
        {error && (
          <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs sm:text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs sm:text-sm text-center font-medium">
            {success}
          </div>
        )}

        {/* Auth Sub-Forms */}
        {isForgotPassword ? (
          recoveryStep === 1 ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Registered Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold text-white rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 transition"
              >
                {submitting ? "Processing..." : "Generate Security Code"}
              </button>
              <button
                type="button"
                onClick={() => setIsForgotPassword(false)}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition"
              >
                Back to Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">New Secure Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold text-white rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 transition"
              >
                {submitting ? "Resetting..." : "Save New Password"}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setRecoveryStep(1);
                      setError("");
                      setSuccess("");
                    }}
                    className="text-2xs text-purple-400 hover:text-purple-300 transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold text-white rounded-xl shadow-lg shadow-purple-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition duration-300"
            >
              {submitting ? "Authorizing..." : isRegister ? "Sign Up Free" : "Sign In Account"}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                  setSuccess("");
                }}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                {isRegister ? (
                  <>
                    Already have an account? <span className="text-purple-400 font-bold">Sign In</span>
                  </>
                ) : (
                  <>
                    Don't have an account? <span className="text-purple-400 font-bold">Register Free</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

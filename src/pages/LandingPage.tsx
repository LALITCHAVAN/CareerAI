import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { 
  ArrowRight, 
  Video, 
  FileCheck, 
  Cpu, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Check, 
  Plus, 
  Minus 
} from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const features = [
    {
      icon: Video,
      title: "Real-time Mock Interview Sandbox",
      desc: "Simulate a live engineering board with audio indicators, live camera streams, progress tracking, and interactive timers.",
      color: "from-pink-500 to-purple-600",
    },
    {
      icon: FileCheck,
      title: "AI Resume & ATS Optimizer",
      desc: "Check your resume structure against advanced ATS standards, extract missing keywords, and get custom layout correction recommendations.",
      color: "from-purple-500 to-blue-500",
    },
    {
      icon: Cpu,
      title: "Dynamic AI Question Bank",
      desc: "Instantly compile technical, behavioral (STAR format), scenario, or HR questions custom-tailored to 8 core job titles and 4 experience tiers.",
      color: "from-blue-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "SaaS Learning Analytics",
      desc: "Track interview scores, completion trends, and key technical vs. communication growth profiles on rich graphical dashboards.",
      color: "from-orange-500 to-pink-500",
    }
  ];

  const testimonials = [
    {
      quote: "The mock interview system evaluated my responses so accurately. It detected that I was rambling and showed me exactly how to structure my STAR responses. Got a Senior Dev offer at Stripe!",
      author: "Alex Rivers",
      role: "Staff Backend Engineer",
      avatar: "AR"
    },
    {
      quote: "ATS analysis scanned my resume and identified 6 critical missing Cloud Native keywords. After adding them and using the builder, my response rate jumped from 5% to 45%!",
      author: "Priya Patel",
      role: "Frontend Developer",
      avatar: "PP"
    },
    {
      quote: "As a fresher, mock interview anxiety was real. Practicing with CareerAI's webcam simulation made the real loop feel like a breeze. Highly recommended!",
      author: "Marcus Chen",
      role: "Graduate Software Engineer",
      avatar: "MC"
    }
  ];

  const faqs = [
    {
      q: "How does the platform evaluate my answers during the mock interview?",
      a: "Our backend utilizes highly advanced NLP models and key phrase assessment algorithms to grade your responses. It checks for technical accuracy, industry terminology, structured pacing (such as STAR method), and overall completeness, delivering a score and a detailed professional reference answer."
    },
    {
      q: "Is my webcam data saved or analyzed on your server?",
      a: "No. The webcam support runs completely in your local browser sandbox to replicate interview pressure and build confidence. Your camera feed is never sent to our servers or saved."
    },
    {
      q: "Can I generate resumes for different job descriptions?",
      a: "Absolutely! You can build multiple distinct resumes, tailor each to specific roles (e.g. Backend vs PM), and run separate ATS scores to check keyword matching before applying."
    },
    {
      q: "What roles are supported in the interview generator?",
      a: "We offer highly optimized question sets for Software Engineers, Frontend, Backend, Full Stack, Data Scientists, Product Managers, UI/UX Designers, and DevOps Engineers from Fresher up to Senior levels."
    }
  ];

  const pricing = [
    {
      name: "Starter",
      price: "$0",
      desc: "For university students and freshers exploring the tech market.",
      features: [
        "1 Resume builder template",
        "2 Free ATS resume analyses",
        "3 AI Custom question batches",
        "1 Simulated mock interview"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Pro Coach",
      price: "$19",
      period: "/mo",
      desc: "The ultimate pack for active job seekers targeting mid-to-senior tiers.",
      features: [
        "Unlimited professional templates",
        "Instant, unlimited AI ATS audits",
        "Unlimited custom role simulations",
        "Full dashboard progress charts",
        "Advanced STAR model suggestions"
      ],
      cta: "Go Pro Coach",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/mo",
      desc: "For bootcamps and team coaches assisting multiple candidates.",
      features: [
        "Everything in Pro Coach",
        "Custom workspace administrative panel",
        "Batch invite and user audit logs",
        "Priority assessment throughput",
        "Dedicated account strategist"
      ],
      cta: "Contact Enterprise",
      popular: false
    }
  ];

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden text-slate-100">

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-full tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            Empowered by Advanced NLP & Assessment Engines
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            Crush Your Tech Loop with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-500 to-blue-400">
              AI Interview Preparation
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
            The complete high-fidelity system for developers and PMs. Generate custom question tracks, simulate live webcam loops, and audit your resume score in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to={user ? "/dashboard" : "/auth?signup=true"}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-semibold text-white rounded-2xl shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:brightness-110 active:scale-95 transition-all duration-300"
            >
              Start Free Preparation
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features-showcase"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/80 border border-slate-800 text-slate-300 font-semibold rounded-2xl hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all duration-300"
            >
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Hero Interactive UI Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 relative rounded-3xl overflow-hidden glass-panel p-3 sm:p-5 max-w-5xl mx-auto shadow-2xl shadow-purple-500/5"
        >
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4 text-xs text-slate-500 px-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span>careerai.platform/mock-interview-simulation</span>
            <div className="w-10" />
          </div>

          {/* Simulated Screen Inside */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800">
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-2xs font-semibold rounded uppercase">Question 1 (Technical)</span>
                <h3 className="text-lg font-bold text-white mt-2">What happens behind the scenes when you type a URL into a web browser and hit Enter?</h3>
                <p className="text-sm text-slate-400 mt-2">Explain DNS lookup, TCP handshakes, TLS/SSL negotiations, and request/response lifecycles.</p>
              </div>
              <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/60">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-400">
                  <Sparkles className="h-4 w-4" /> AI Perfect Reference Answer Draft:
                </div>
                <p className="text-xs text-slate-400 line-clamp-3">
                  First, the browser checks local caches (browser, OS, router). If missing, it initiates a recursive DNS query. Once the IP address is fetched, it opens a TCP socket connection using a 3-way handshake...
                </p>
              </div>
            </div>

            {/* Sidebar simulator */}
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2.5">
                  <span className="text-xs font-semibold text-slate-300">Live Feedback</span>
                  <span className="text-xs text-emerald-400 font-bold">● Active Sandbox</span>
                </div>
                <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 text-slate-600 relative overflow-hidden">
                  <Video className="h-8 w-8 text-purple-500/40 animate-pulse" />
                  <span className="absolute bottom-2 left-2 text-[10px] bg-slate-950/80 px-1.5 py-0.5 text-slate-400 rounded">Interactive Webcam Feed</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs flex justify-between">
                    <span className="text-slate-500">Communication Score</span>
                    <span className="text-slate-300 font-bold">85%</span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[85%]" />
                  </div>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-slate-900">
                <span className="text-2xs text-slate-500 font-mono">ATS Audited Compatibility: 94%</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Showcase Grid Section */}
      <section id="features-showcase" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed for Modern Tech Roles
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Skip generic advice. Practice with structured AI agents calibrated specifically for software developers, product managers, UI/UX, and cloud engineering requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="group relative rounded-2xl glass-card-interactive p-6"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-tr ${feat.color} text-white shadow-lg mb-6 group-hover:scale-105 transition-all`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Kickstart your recruitment with no-risk free simulations, and scale your prep as you receive interview callbacks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricing.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                tier.popular
                  ? "bg-white/5 border border-purple-500/50 shadow-xl shadow-purple-500/10 ring-1 ring-purple-500/30 backdrop-blur-xl"
                  : "glass-card-interactive"
              }`}
            >
              {tier.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-2xs font-bold uppercase rounded-full tracking-wider">
                  Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-xs text-slate-400 mb-6">{tier.desc}</p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-white">{tier.price}</span>
                  {tier.period && <span className="text-slate-400 text-sm">{tier.period}</span>}
                </div>

                <div className="border-t border-slate-800/80 pt-6 mb-8">
                  <ul className="space-y-4 text-sm text-slate-300">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2.5">
                        <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                to="/auth?signup=true"
                className={`w-full text-center py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  tier.popular
                    ? "bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white shadow-lg hover:brightness-110"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Backed by Top Software Talent
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Read how other candidates optimized their STAR delivery, polished their portfolios, and passed high-bar panel interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="glass-card-interactive rounded-2xl p-6 relative flex flex-col justify-between"
            >
              <p className="text-slate-300 italic text-sm leading-relaxed mb-6">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{test.author}</h4>
                  <p className="text-xs text-slate-500">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-slate-900">
        <h2 className="text-3xl font-extrabold text-center text-white mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="glass-panel rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  id={`btn-faq-${idx}`}
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-white font-semibold hover:bg-slate-900/40"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  {isOpen ? <Minus className="h-4 w-4 text-purple-400" /> : <Plus className="h-4 w-4 text-slate-500" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner bottom */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mb-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-purple-500/20 p-8 sm:p-12 text-center space-y-6">
          <div className="absolute top-0 right-0 p-4">
            <Award className="h-10 w-10 text-purple-400/20" />
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
            Ready to Ace Your Tech Interviews?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Create an account in 30 seconds. Build your resume, request AI feedback score analysis, and begin practicing mock interviews with dynamic feedback.
          </p>
          <div className="pt-2">
            <Link
              to="/auth?signup=true"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 font-bold text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Get Started for Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

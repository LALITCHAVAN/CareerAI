import { Link } from "react-router-dom";
import { Briefcase, Github, Linkedin, Twitter, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-linear-to-tr from-pink-500 to-purple-600 p-1.5 rounded-lg text-white">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white">
                Career<span className="text-purple-400">AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Unlock your career potential with advanced AI interview simulation, state-of-the-art ATS resume auditing, and custom generated question banks. Built for high-velocity tech professionals.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="hover:text-white transition-colors"><Github className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Links: Platform */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/resume" className="hover:text-slate-200 transition-colors">Resume Audit</Link></li>
              <li><Link to="/interview" className="hover:text-slate-200 transition-colors">Mock Simulator</Link></li>
              <li><Link to="/questions" className="hover:text-slate-200 transition-colors">Dynamic Question Gen</Link></li>
              <li><Link to="/analytics" className="hover:text-slate-200 transition-colors">Career Insights</Link></li>
            </ul>
          </div>

          {/* Links: Resources */}
          <div>
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-slate-200 transition-colors">ATS Optimization Guide</a></li>
              <li><a href="#" className="hover:text-slate-200 transition-colors">System Design Cheat-sheet</a></li>
              <li><a href="#" className="hover:text-slate-200 transition-colors">STAR Methodology</a></li>
              <li><a href="#" className="hover:text-slate-200 transition-colors">SaaS Security Protocols</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} CareerAI Platform. All rights reserved. Handcrafted by a Software Engineer.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Powered by</span>
            <span className="text-slate-400">Node.js, React & NLP Assessment Engines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

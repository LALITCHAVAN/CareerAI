import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.js";
import { 
  FileText, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  Download, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw, 
  Check, 
  AlertCircle,
  Linkedin,
  Github,
  Globe,
  Award,
  BookOpen,
  Briefcase
} from "lucide-react";
import { jsPDF } from "jspdf";
import { Resume } from "../types.js";

type FormStep = "personal" | "experience" | "education" | "projects" | "skills" | "extras";

export default function ResumeBuilder() {
  const { user } = useAuth();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [draftResume, setDraftResume] = useState<Resume | null>(null);
  const [activeStep, setActiveStep] = useState<FormStep>("personal");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  // Temporary item inputs
  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");
  const [newAchievement, setNewAchievement] = useState("");

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
        if (data.resumes && data.resumes.length > 0) {
          setActiveResume(data.resumes[0]);
          setDraftResume(JSON.parse(JSON.stringify(data.resumes[0])));
        } else {
          // Initialize a blank resume for the user
          createNewResume();
        }
      }
    } catch (e) {
      console.error("Fetch resumes error:", e);
    } finally {
      setLoading(false);
    }
  };

  const createNewResume = async () => {
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "My Tailored Resume",
          template: "modern",
          personalInfo: { fullName: user?.name || "", email: user?.email || "", phone: "", location: "", title: "", summary: "" },
          education: [],
          experience: [],
          projects: [],
          skills: [],
          certifications: [],
          achievements: [],
          socialLinks: { linkedin: "", github: "", portfolio: "" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResumes([data.resume, ...resumes]);
        setActiveResume(data.resume);
        setDraftResume(JSON.parse(JSON.stringify(data.resume)));
      }
    } catch (e) {
      console.error("Create resume error:", e);
    }
  };

  const handleUpdateField = (section: string, field: string, value: any) => {
    if (!draftResume) return;

    let updatedResume = { ...draftResume };
    if (section === "personalInfo") {
      updatedResume.personalInfo = { ...updatedResume.personalInfo, [field]: value };
    } else if (section === "socialLinks") {
      updatedResume.socialLinks = { ...updatedResume.socialLinks, [field]: value };
    } else {
      updatedResume = { ...updatedResume, [section]: value };
    }

    setDraftResume(updatedResume);
  };

  // Debounced/Triggered auto-saving simulator
  const triggerAutoSave = async (resumeToSave: Resume) => {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/resumes/${resumeToSave.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resumeToSave)
      });
      if (res.ok) {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } else {
        setSaveStatus("error");
      }
    } catch (e) {
      setSaveStatus("error");
    }
  };

  const handleSaveExplicitly = async () => {
    if (!draftResume) return;
    setSaving(true);
    setActiveResume(draftResume);
    await triggerAutoSave(draftResume);
    setSaving(false);
  };

  const handleApplyChanges = async () => {
    if (!draftResume) return;
    setSaving(true);
    setActiveResume(draftResume);
    await triggerAutoSave(draftResume);
    setSaving(false);
  };

  const hasChanges = draftResume && activeResume && JSON.stringify(draftResume) !== JSON.stringify(activeResume);

  // List adding/deleting operations
  const addListArrayItem = (field: "skills" | "certifications" | "achievements", value: string, setter: (s: string) => void) => {
    if (!draftResume || !value.trim()) return;
    const current = draftResume[field] || [];
    if (current.includes(value.trim())) return;
    handleUpdateField(field, "", [...current, value.trim()]);
    setter("");
  };

  const removeListArrayItem = (field: "skills" | "certifications" | "achievements", idx: number) => {
    if (!draftResume) return;
    const current = draftResume[field] || [];
    const updated = current.filter((_, i) => i !== idx);
    handleUpdateField(field, "", updated);
  };

  // Dynamic Multi-item sections helper
  const addExperience = () => {
    if (!draftResume) return;
    const current = draftResume.experience || [];
    const newItem = { company: "", position: "", location: "", startDate: "", endDate: "", description: "", isCurrent: false };
    handleUpdateField("experience", "", [...current, newItem]);
  };

  const updateExperienceItem = (index: number, field: string, value: any) => {
    if (!draftResume) return;
    const current = [...(draftResume.experience || [])];
    current[index] = { ...current[index], [field]: value };
    handleUpdateField("experience", "", current);
  };

  const removeExperienceItem = (index: number) => {
    if (!draftResume) return;
    const current = draftResume.experience || [];
    handleUpdateField("experience", "", current.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    if (!draftResume) return;
    const current = draftResume.education || [];
    const newItem = { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" };
    handleUpdateField("education", "", [...current, newItem]);
  };

  const updateEducationItem = (index: number, field: string, value: any) => {
    if (!draftResume) return;
    const current = [...(draftResume.education || [])];
    current[index] = { ...current[index], [field]: value };
    handleUpdateField("education", "", current);
  };

  const removeEducationItem = (index: number) => {
    if (!draftResume) return;
    const current = draftResume.education || [];
    handleUpdateField("education", "", current.filter((_, i) => i !== index));
  };

  const addProject = () => {
    if (!draftResume) return;
    const current = draftResume.projects || [];
    const newItem = { title: "", technologies: "", link: "", description: "" };
    handleUpdateField("projects", "", [...current, newItem]);
  };

  const updateProjectItem = (index: number, field: string, value: any) => {
    if (!draftResume) return;
    const current = [...(draftResume.projects || [])];
    current[index] = { ...current[index], [field]: value };
    handleUpdateField("projects", "", current);
  };

  const removeProjectItem = (index: number) => {
    if (!draftResume) return;
    const current = draftResume.projects || [];
    handleUpdateField("projects", "", current.filter((_, i) => i !== index));
  };

  // Run Gemini ATS analysis
  const handleAnalyzeResume = async () => {
    if (!draftResume) return;
    setAnalyzing(true);
    try {
      setActiveResume(draftResume);
      await triggerAutoSave(draftResume);

      const res = await fetch(`/api/resumes/${draftResume.id}/analyze`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setActiveResume(data.resume);
        setDraftResume(JSON.parse(JSON.stringify(data.resume)));
        // Refresh local items
        setResumes(resumes.map(r => r.id === data.resume.id ? data.resume : r));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  // Export PDF using pure vector coordinates via jsPDF
  const exportResumeToPDF = () => {
    if (!draftResume) return;

    const doc = new jsPDF("p", "mm", "a4");
    const p = draftResume.personalInfo;
    const s = draftResume.socialLinks;

    let y = 20;

    // Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(p.fullName || "Full Name", 20, y);
    
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(p.title || "Professional Title", 20, y);

    // Contact Coordinates
    y += 7;
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105); // slate-600
    const contacts = [
      p.email,
      p.phone,
      p.location,
      s.linkedin ? "LinkedIn" : "",
      s.github ? "GitHub" : ""
    ].filter(Boolean).join("  |  ");
    doc.text(contacts, 20, y);

    // Divider Line
    y += 4;
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.4);
    doc.line(20, y, 190, y);

    // Professional Summary
    if (p.summary) {
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("PROFESSIONAL SUMMARY", 20, y);

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(51, 65, 85); // slate-700
      
      const splitSummary = doc.splitTextToSize(p.summary, 170);
      doc.text(splitSummary, 20, y);
      y += (splitSummary.length * 4.5);
    }

    // Work Experience
    if (activeResume.experience && activeResume.experience.length > 0) {
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("WORK EXPERIENCE", 20, y);

      activeResume.experience.forEach((exp) => {
        y += 5.5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(`${exp.position} - ${exp.company}`, 20, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(100, 116, 139);
        const dateStr = `${exp.startDate} - ${exp.isCurrent ? "Present" : exp.endDate} | ${exp.location || ""}`;
        doc.text(dateStr, 20, y + 4);

        y += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const splitDesc = doc.splitTextToSize(exp.description || "", 170);
        doc.text(splitDesc, 20, y);
        y += (splitDesc.length * 4.2) + 2;
      });
    }

    // Projects
    if (activeResume.projects && activeResume.projects.length > 0) {
      y += 4;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("PROJECTS", 20, y);

      activeResume.projects.forEach((proj) => {
        y += 5.5;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(15, 23, 42);
        doc.text(proj.title || "Project Title", 20, y);

        if (proj.technologies) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(99, 102, 241); // indigo-500
          doc.text(`Technologies: ${proj.technologies}`, 20, y + 4);
          y += 4;
        }

        y += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        const splitDesc = doc.splitTextToSize(proj.description || "", 170);
        doc.text(splitDesc, 20, y);
        y += (splitDesc.length * 4.2) + 2;
      });
    }

    // Skills, Certs & Awards Row
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text("SKILLS & ACCOMPLISHMENTS", 20, y);

    if (activeResume.skills && activeResume.skills.length > 0) {
      y += 5.5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Core Competencies:", 20, y);

      doc.setFont("helvetica", "normal");
      doc.text(activeResume.skills.join(", "), 55, y);
    }

    if (activeResume.certifications && activeResume.certifications.length > 0) {
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Certifications:", 20, y);

      doc.setFont("helvetica", "normal");
      doc.text(draftResume.certifications.join(", "), 55, y);
    }

    if (draftResume.achievements && draftResume.achievements.length > 0) {
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Achievements:", 20, y);

      doc.setFont("helvetica", "normal");
      doc.text(draftResume.achievements.join(", "), 55, y);
    }

    doc.save(`${draftResume.name || "career_resume"}.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-4">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium animate-pulse">Initializing portfolio resume builder...</span>
      </div>
    );
  }

  if (!activeResume || !draftResume) return null;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-100 flex flex-col lg:flex-row border-t border-slate-900">
      
      {/* LEFT: Multi-Step Editor Panel */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-slate-900 flex flex-col justify-between max-h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">Resume Architect</h1>
              <p className="text-2xs sm:text-xs text-slate-500">Edit fields, change styles, and audit compatibility with AI.</p>
            </div>
            
            {/* Save Status indicators */}
            <div className="flex items-center gap-2">
              <span className="text-2xs text-slate-500 font-mono flex items-center gap-1">
                {saveStatus === "saving" && <RefreshCw className="h-3 w-3 animate-spin text-purple-400" />}
                {saveStatus === "success" && <Check className="h-3 w-3 text-emerald-400" />}
                {saveStatus === "error" && <AlertCircle className="h-3 w-3 text-rose-400" />}
                {saveStatus === "saving" ? "Auto-saving..." : saveStatus === "success" ? "Saved" : saveStatus === "error" ? "Save Failed" : "Synced"}
              </span>
              <button
                id="btn-manual-save"
                onClick={handleApplyChanges}
                className={`p-1.5 rounded-lg border transition ${
                  hasChanges
                    ? "bg-purple-600/20 border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white cursor-pointer"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
                title={hasChanges ? "Apply Changes & Save" : "No Unsaved Changes"}
              >
                <Save className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form Step Buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-900 scrollbar-none">
            {[
              { id: "personal", label: "Contact" },
              { id: "experience", label: "Experience" },
              { id: "education", label: "Education" },
              { id: "projects", label: "Projects" },
              { id: "skills", label: "Skills" },
              { id: "extras", label: "Awards & Socials" }
            ].map((step) => (
              <button
                key={step.id}
                id={`btn-step-${step.id}`}
                onClick={() => setActiveStep(step.id as FormStep)}
                className={`px-3 py-1.5 rounded-lg text-2xs sm:text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                  activeStep === step.id
                    ? "bg-purple-500/15 text-purple-400 border border-purple-500/20"
                    : "text-slate-400 hover:bg-slate-900/60"
                }`}
              >
                {step.label}
              </button>
            ))}
          </div>

          {/* Draft Notification Banner */}
          {hasChanges && (
            <div className="bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl p-3 text-2xs flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                Draft has unsaved modifications. Click "Apply & Preview" to sync with the live canvas!
              </span>
              <button
                id="btn-apply-changes-inline"
                onClick={handleApplyChanges}
                className="px-2.5 py-1 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600 transition text-[10px] whitespace-nowrap cursor-pointer shadow-md"
              >
                Apply Now
              </button>
            </div>
          )}

          {/* Dynamic Form Step Content */}
          <div className="space-y-4 pt-2">
            
            {/* Step: Personal info */}
            {activeStep === "personal" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-slate-400 uppercase">Full Name</label>
                    <input
                      type="text"
                      value={draftResume.personalInfo.fullName}
                      onChange={(e) => handleUpdateField("personalInfo", "fullName", e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-slate-400 uppercase">Target Title</label>
                    <input
                      type="text"
                      value={draftResume.personalInfo.title}
                      onChange={(e) => handleUpdateField("personalInfo", "title", e.target.value)}
                      placeholder="Senior Full Stack Engineer"
                      className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-slate-400 uppercase">Email</label>
                    <input
                      type="email"
                      value={draftResume.personalInfo.email}
                      onChange={(e) => handleUpdateField("personalInfo", "email", e.target.value)}
                      placeholder="name@company.com"
                      className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-slate-400 uppercase">Phone</label>
                    <input
                      type="text"
                      value={draftResume.personalInfo.phone}
                      onChange={(e) => handleUpdateField("personalInfo", "phone", e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-2xs font-semibold text-slate-400 uppercase">Location</label>
                    <input
                      type="text"
                      value={draftResume.personalInfo.location}
                      onChange={(e) => handleUpdateField("personalInfo", "location", e.target.value)}
                      placeholder="San Francisco, CA"
                      className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-semibold text-slate-400 uppercase">Professional Summary</label>
                  <textarea
                    rows={4}
                    value={draftResume.personalInfo.summary}
                    onChange={(e) => handleUpdateField("personalInfo", "summary", e.target.value)}
                    placeholder="Describe your primary technical stacks, key career milestones, and professional drivers."
                    className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Step: Experience list */}
            {activeStep === "experience" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <h3 className="text-xs font-bold text-slate-300">Work Experience Track</h3>
                  <button
                    id="btn-add-experience"
                    onClick={addExperience}
                    className="flex items-center gap-1 px-2.5 py-1 text-2xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Role
                  </button>
                </div>

                {(!draftResume.experience || draftResume.experience.length === 0) ? (
                  <div className="py-6 text-center text-xs text-slate-600">No employment slots added yet. Click above to add!</div>
                ) : (
                  <div className="space-y-6">
                    {draftResume.experience.map((exp, idx) => (
                      <div key={idx} className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4 relative">
                        <button
                          id={`btn-remove-exp-${idx}`}
                          onClick={() => removeExperienceItem(idx)}
                          className="absolute top-4 right-4 p-1 bg-slate-950 text-rose-500 hover:text-rose-400 hover:bg-slate-900 rounded border border-slate-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Company Name</label>
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => updateExperienceItem(idx, "company", e.target.value)}
                              placeholder="Google"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Position Title</label>
                            <input
                              type="text"
                              value={exp.position}
                              onChange={(e) => updateExperienceItem(idx, "position", e.target.value)}
                              placeholder="Frontend Developer"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Start Date</label>
                            <input
                              type="text"
                              value={exp.startDate}
                              onChange={(e) => updateExperienceItem(idx, "startDate", e.target.value)}
                              placeholder="Jan 2024"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">End Date</label>
                            <input
                              type="text"
                              disabled={exp.isCurrent}
                              value={exp.endDate}
                              onChange={(e) => updateExperienceItem(idx, "endDate", e.target.value)}
                              placeholder="Dec 2025"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white disabled:opacity-50"
                            />
                          </div>
                          <div className="space-y-1 flex items-end">
                            <label className="flex items-center gap-2 cursor-pointer pb-2 text-xs text-slate-400 select-none">
                              <input
                                type="checkbox"
                                checked={exp.isCurrent}
                                onChange={(e) => updateExperienceItem(idx, "isCurrent", e.target.checked)}
                                className="accent-purple-500 h-4 w-4 rounded"
                              />
                              <span>I currently work here</span>
                            </label>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-3xs font-semibold text-slate-500 uppercase">Role Description</label>
                          <textarea
                            rows={3}
                            value={exp.description}
                            onChange={(e) => updateExperienceItem(idx, "description", e.target.value)}
                            placeholder="Detail core software architectures delivered, team scales managed, and specific quantitative impact metrics."
                            className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Education list */}
            {activeStep === "education" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <h3 className="text-xs font-bold text-slate-300">Academic History</h3>
                  <button
                    id="btn-add-education"
                    onClick={addEducation}
                    className="flex items-center gap-1 px-2.5 py-1 text-2xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Academic Slot
                  </button>
                </div>

                {(!draftResume.education || draftResume.education.length === 0) ? (
                  <div className="py-6 text-center text-xs text-slate-600">No education fields added yet. Click above to add!</div>
                ) : (
                  <div className="space-y-6">
                    {draftResume.education.map((edu, idx) => (
                      <div key={idx} className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4 relative">
                        <button
                          id={`btn-remove-edu-${idx}`}
                          onClick={() => removeEducationItem(idx)}
                          className="absolute top-4 right-4 p-1 bg-slate-950 text-rose-500 hover:text-rose-400 hover:bg-slate-900 rounded border border-slate-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">School / University</label>
                            <input
                              type="text"
                              value={edu.school}
                              onChange={(e) => updateEducationItem(idx, "school", e.target.value)}
                              placeholder="Stanford University"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Degree Earned</label>
                            <input
                              type="text"
                              value={edu.degree}
                              onChange={(e) => updateEducationItem(idx, "degree", e.target.value)}
                              placeholder="Bachelor of Science"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Field of Study</label>
                            <input
                              type="text"
                              value={edu.fieldOfStudy}
                              onChange={(e) => updateEducationItem(idx, "fieldOfStudy", e.target.value)}
                              placeholder="Computer Science & Systems"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Graduation Date</label>
                            <input
                              type="text"
                              value={edu.endDate}
                              onChange={(e) => updateEducationItem(idx, "endDate", e.target.value)}
                              placeholder="May 2023"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Projects list */}
            {activeStep === "projects" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-slate-900">
                  <h3 className="text-xs font-bold text-slate-300">Software Projects</h3>
                  <button
                    id="btn-add-project"
                    onClick={addProject}
                    className="flex items-center gap-1 px-2.5 py-1 text-2xs font-bold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 rounded-lg transition"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Project
                  </button>
                </div>

                {(!draftResume.projects || draftResume.projects.length === 0) ? (
                  <div className="py-6 text-center text-xs text-slate-600">No project slots added yet. Click above to add!</div>
                ) : (
                  <div className="space-y-6">
                    {draftResume.projects.map((proj, idx) => (
                      <div key={idx} className="bg-slate-900/20 border border-slate-900 rounded-xl p-4 space-y-4 relative">
                        <button
                          id={`btn-remove-proj-${idx}`}
                          onClick={() => removeProjectItem(idx)}
                          className="absolute top-4 right-4 p-1 bg-slate-950 text-rose-500 hover:text-rose-400 hover:bg-slate-900 rounded border border-slate-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Project Name</label>
                            <input
                              type="text"
                              value={proj.title}
                              onChange={(e) => updateProjectItem(idx, "title", e.target.value)}
                              placeholder="Decentralized Storage App"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs font-semibold text-slate-500 uppercase">Project Link (Optional)</label>
                            <input
                              type="text"
                              value={proj.link}
                              onChange={(e) => updateProjectItem(idx, "link", e.target.value)}
                              placeholder="https://github.com/my-profile/repo"
                              className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-3xs font-semibold text-slate-500 uppercase">Key Technologies Used</label>
                          <input
                            type="text"
                            value={proj.technologies}
                            onChange={(e) => updateProjectItem(idx, "technologies", e.target.value)}
                            placeholder="React, TypeScript, Tailwind, Node, Redis"
                            className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-3xs font-semibold text-slate-500 uppercase">Project Context & Accomplishments</label>
                          <textarea
                            rows={3}
                            value={proj.description}
                            onChange={(e) => updateProjectItem(idx, "description", e.target.value)}
                            placeholder="Explain the technical problem solved, architecture utilized, and quantitative benchmarks achieved."
                            className="w-full text-xs bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-white leading-relaxed"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Skills tags */}
            {activeStep === "skills" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-300">Technical Skill Competencies</h3>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          addListArrayItem("skills", newSkill, setNewSkill);
                        }
                      }}
                      placeholder="e.g. AWS Core Solutions Architect"
                      className="flex-1 text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                    />
                    <button
                      id="btn-add-skill"
                      onClick={() => addListArrayItem("skills", newSkill, setNewSkill)}
                      className="px-4 bg-purple-500 hover:bg-purple-600 rounded-xl text-xs font-bold text-white shadow-md active:scale-95"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(!draftResume.skills || draftResume.skills.length === 0) ? (
                      <span className="text-slate-600 text-xs">No skills listed yet. Insert above to generate keyword vectors.</span>
                    ) : (
                      draftResume.skills.map((skill, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-slate-300 text-xs rounded-xl border border-slate-800">
                          {skill}
                          <button
                            id={`btn-remove-skill-${i}`}
                            onClick={() => removeListArrayItem("skills", i)}
                            className="text-slate-500 hover:text-slate-200"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step: Social links & certificates */}
            {activeStep === "extras" && (
              <div className="space-y-6">
                
                {/* Social Links */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-slate-300">Social Portfolio Coordinates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-3xs font-semibold text-slate-500 uppercase">LinkedIn Link</label>
                      <input
                        type="text"
                        value={draftResume.socialLinks.linkedin}
                        onChange={(e) => handleUpdateField("socialLinks", "linkedin", e.target.value)}
                        placeholder="linkedin.com/in/jane-doe"
                        className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs font-semibold text-slate-500 uppercase">GitHub Link</label>
                      <input
                        type="text"
                        value={draftResume.socialLinks.github}
                        onChange={(e) => handleUpdateField("socialLinks", "github", e.target.value)}
                        placeholder="github.com/jane-doe"
                        className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-3xs font-semibold text-slate-500 uppercase">Custom Portfolio</label>
                      <input
                        type="text"
                        value={draftResume.socialLinks.portfolio}
                        onChange={(e) => handleUpdateField("socialLinks", "portfolio", e.target.value)}
                        placeholder="janedoe.dev"
                        className="w-full text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Certifications and Awards */}
                <div className="space-y-4 border-t border-slate-900 pt-4">
                  <h3 className="text-xs font-bold text-slate-300">Industry Certifications</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCert}
                      onChange={(e) => setNewCert(e.target.value)}
                      placeholder="e.g. AWS Certified Developer Associate"
                      className="flex-1 text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                    />
                    <button
                      id="btn-add-cert"
                      onClick={() => addListArrayItem("certifications", newCert, setNewCert)}
                      className="px-4 bg-purple-500 hover:bg-purple-600 rounded-xl text-xs font-bold text-white shadow-md active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {draftResume.certifications?.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-slate-300 text-xs rounded-xl border border-slate-800">
                        {c}
                        <button
                          id={`btn-remove-cert-${i}`}
                          onClick={() => removeListArrayItem("certifications", i)}
                          className="text-slate-500 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 border-t border-slate-900 pt-4">
                  <h3 className="text-xs font-bold text-slate-300">Key Achievements</h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="e.g. 1st Place out of 300 in HackTech 2025"
                      className="flex-1 text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-white focus:outline-none"
                    />
                    <button
                      id="btn-add-achievement"
                      onClick={() => addListArrayItem("achievements", newAchievement, setNewAchievement)}
                      className="px-4 bg-purple-500 hover:bg-purple-600 rounded-xl text-xs font-bold text-white shadow-md active:scale-95"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {draftResume.achievements?.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-slate-300 text-xs rounded-xl border border-slate-800">
                        {a}
                        <button
                          id={`btn-remove-achievement-${i}`}
                          onClick={() => removeListArrayItem("achievements", i)}
                          className="text-slate-500 hover:text-white"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Footer controls */}
        <div className="border-t border-slate-900 pt-6 mt-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              id="btn-apply-changes-footer"
              onClick={handleApplyChanges}
              disabled={saving || !hasChanges}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold active:scale-95 transition ${
                hasChanges
                  ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/25 cursor-pointer"
                  : "bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed"
              }`}
            >
              <Save className="h-4 w-4" />
              {saving ? "Applying..." : "Apply & Preview"}
            </button>

            <button
              id="btn-analyze-resume"
              onClick={handleAnalyzeResume}
              disabled={analyzing}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-xs font-bold text-white shadow-lg disabled:opacity-50 hover:brightness-110 active:scale-95 transition"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Auditing Score...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI ATS Audit
                </>
              )}
            </button>
          </div>

          <button
            id="btn-export-pdf"
            onClick={exportResumeToPDF}
            className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-bold active:scale-95 transition"
          >
            <Download className="h-4 w-4" />
            Export Vector PDF
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview & AI Audit Results split panels */}
      <div className="w-full lg:w-1/2 bg-slate-950/40 p-4 sm:p-6 lg:p-8 flex flex-col justify-between max-h-[calc(100vh-4rem)] overflow-y-auto space-y-6">
        
        {/* Visual Template Picker Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-900">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Document Canvas</h3>
          <div className="flex items-center gap-1.5">
            {[
              { id: "modern", name: "Classic" },
              { id: "mono", name: "Tech Mono" },
              { id: "bold", name: "Crimson" }
            ].map((t) => (
              <button
                key={t.id}
                id={`btn-tpl-${t.id}`}
                onClick={() => handleUpdateField("template", "", t.id)}
                className={`px-3 py-1 rounded-lg text-3xs font-semibold border transition ${
                  draftResume.template === t.id
                    ? "bg-purple-500/10 border-purple-500/40 text-purple-400 cursor-pointer"
                    : "border-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* ATS Score and missing keywords analysis (if evaluated) */}
        {activeResume.scoreAnalysis && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">ATS Alignment Audit</span>
                  <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-3xs font-semibold rounded uppercase">Verified Audit</span>
                </div>
                <p className="text-2xs text-slate-400 max-w-sm">{activeResume.scoreAnalysis.feedback}</p>
              </div>

              <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                <svg className="absolute transform -rotate-90 w-full h-full">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-slate-800" strokeWidth="4" fill="transparent" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-purple-500" strokeWidth="4" fill="transparent"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * activeResume.scoreAnalysis.score) / 100}
                  />
                </svg>
                <span className="text-base font-black text-white">{activeResume.scoreAnalysis.score}</span>
              </div>
            </div>

            {/* Keyword gaps */}
            {activeResume.scoreAnalysis.missingKeywords?.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-900 pt-3">
                <h4 className="text-3xs font-bold text-slate-400 uppercase tracking-wide">Detected Missing Keywords:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeResume.scoreAnalysis.missingKeywords.map((kw, i) => (
                    <span key={i} className="text-2xs text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/10">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {activeResume.scoreAnalysis.improvementSuggestions?.length > 0 && (
              <div className="space-y-1.5 border-t border-slate-900 pt-3">
                <h4 className="text-3xs font-bold text-slate-400 uppercase tracking-wide">ATS Growth Recommendations:</h4>
                <ul className="space-y-1 text-2xs text-slate-400 list-disc list-inside">
                  {activeResume.scoreAnalysis.improvementSuggestions.map((sug, i) => (
                    <li key={i}>{sug}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Live CSS Document preview */}
        <div 
          id="resume-canvas-preview" 
          className={`bg-white text-slate-900 p-8 rounded-3xl shadow-xl min-h-[640px] select-none ${
            activeResume.template === "mono" 
              ? "font-mono text-xs text-slate-800" 
              : activeResume.template === "bold" 
                ? "font-sans border-t-8 border-rose-600" 
                : "font-sans"
          }`}
        >
          {/* Document Header */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none">
                  {activeResume.personalInfo.fullName || "Jane Doe"}
                </h2>
                <p className={`text-xs sm:text-sm font-medium mt-1.5 ${activeResume.template === "bold" ? "text-rose-600 font-bold" : "text-indigo-600"}`}>
                  {activeResume.personalInfo.title || "Target Job Title"}
                </p>
              </div>

              {/* Social Link Badges */}
              <div className="flex flex-col items-end gap-1 text-[10px] text-slate-500">
                {activeResume.socialLinks.linkedin && <span className="flex items-center gap-1"><Linkedin className="h-2.5 w-2.5" /> {activeResume.socialLinks.linkedin}</span>}
                {activeResume.socialLinks.github && <span className="flex items-center gap-1"><Github className="h-2.5 w-2.5" /> {activeResume.socialLinks.github}</span>}
                {activeResume.socialLinks.portfolio && <span className="flex items-center gap-1"><Globe className="h-2.5 w-2.5" /> {activeResume.socialLinks.portfolio}</span>}
              </div>
            </div>

            {/* Contact coordinates bar */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-500 pt-1 border-b border-slate-100 pb-2">
              {activeResume.personalInfo.email && <span>Email: {activeResume.personalInfo.email}</span>}
              {activeResume.personalInfo.phone && <span>Phone: {activeResume.personalInfo.phone}</span>}
              {activeResume.personalInfo.location && <span>Loc: {activeResume.personalInfo.location}</span>}
            </div>
          </div>

          {/* Core Summary */}
          {activeResume.personalInfo.summary && (
            <div className="mt-6 space-y-1.5 text-xs text-slate-700 leading-relaxed">
              <h3 className={`text-[10px] font-bold tracking-wider uppercase ${activeResume.template === "bold" ? "text-rose-600" : "text-slate-400"}`}>Summary</h3>
              <p>{activeResume.personalInfo.summary}</p>
            </div>
          )}

          {/* Work Experience rendering */}
          {activeResume.experience && activeResume.experience.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className={`text-[10px] font-bold tracking-wider uppercase border-b border-slate-100 pb-1 ${activeResume.template === "bold" ? "text-rose-600 border-rose-100" : "text-slate-400"}`}>
                Work History
              </h3>
              
              <div className="space-y-4">
                {activeResume.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{exp.position || "Title Position"}</span>
                      <span>{exp.company || "Company"}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{exp.startDate} - {exp.isCurrent ? "Present" : exp.endDate}</span>
                      <span>{exp.location}</span>
                    </div>
                    <p className="text-2xs text-slate-600 leading-relaxed pl-1 whitespace-pre-wrap">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects rendering */}
          {activeResume.projects && activeResume.projects.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className={`text-[10px] font-bold tracking-wider uppercase border-b border-slate-100 pb-1 ${activeResume.template === "bold" ? "text-rose-600 border-rose-100" : "text-slate-400"}`}>
                Projects
              </h3>
              
              <div className="space-y-4">
                {activeResume.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{proj.title || "Project Title"}</span>
                      {proj.link && <span className="text-2xs text-indigo-500 font-normal">{proj.link}</span>}
                    </div>
                    {proj.technologies && (
                      <div className="text-[10px] text-indigo-500 font-medium">Stack: {proj.technologies}</div>
                    )}
                    <p className="text-2xs text-slate-600 leading-relaxed pl-1">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education & Accomplishments block */}
          {(activeResume.education?.length > 0 || activeResume.skills?.length > 0) && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              
              {/* Left col: Education list */}
              {activeResume.education?.length > 0 && (
                <div className="space-y-2">
                  <h4 className={`text-[10px] font-bold tracking-wider uppercase ${activeResume.template === "bold" ? "text-rose-600" : "text-slate-400"}`}>Education</h4>
                  {activeResume.education.map((edu, idx) => (
                    <div key={idx} className="text-xs">
                      <div className="font-bold text-slate-900">{edu.degree}</div>
                      <div className="text-[10px] text-slate-500">{edu.fieldOfStudy}</div>
                      <div className="text-[10px] text-slate-400">{edu.school} | {edu.endDate}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Right col: Skills tags */}
              {activeResume.skills?.length > 0 && (
                <div className="space-y-2">
                  <h4 className={`text-[10px] font-bold tracking-wider uppercase ${activeResume.template === "bold" ? "text-rose-600" : "text-slate-400"}`}>Key Expertise</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeResume.skills.map((skill, i) => (
                      <span key={i} className="text-2xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

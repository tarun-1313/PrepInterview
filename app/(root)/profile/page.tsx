import Image from "next/image";
import { redirect } from "next/navigation";

import { db } from "@/firebase/admin";
import { getCurrentUser, signOut } from "@/lib/actions/auth.action";
import { Button } from "@/components/ui/button";
import {
  User as UserIcon,
  Briefcase,
  FileText,
  BarChart3,
  History,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  GraduationCap,
} from "lucide-react";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const updateProfile = async (formData: FormData) => {
  "use server";

  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const updates: any = {};

  // Personal Information
  if (formData.has("name")) updates.name = formData.get("name")?.toString().trim();
  if (formData.has("profileURL")) updates.profileURL = formData.get("profileURL")?.toString().trim();
  if (formData.has("phone")) updates.phone = formData.get("phone")?.toString().trim();
  if (formData.has("location")) updates.location = formData.get("location")?.toString().trim();
  if (formData.has("linkedin")) updates.linkedin = formData.get("linkedin")?.toString().trim();
  if (formData.has("github")) updates.github = formData.get("github")?.toString().trim();
  if (formData.has("portfolio")) updates.portfolio = formData.get("portfolio")?.toString().trim();
  if (formData.has("education")) updates.education = formData.get("education")?.toString().trim();
  if (formData.has("experience")) updates.experience = formData.get("experience")?.toString().trim();

  // Career & Interview Preferences
  if (formData.has("preferredRole")) updates.preferredRole = formData.get("preferredRole")?.toString().trim();
  if (formData.has("interviewLanguage")) updates.interviewLanguage = formData.get("interviewLanguage")?.toString().trim();
  
  const interviewTypes = formData.getAll("preferredInterviewType").map(t => t.toString());
  if (interviewTypes.length > 0) updates.preferredInterviewType = interviewTypes;

  const techStack = formData.get("preferredTechStack")?.toString().split(",").map(s => s.trim()).filter(Boolean);
  if (techStack) updates.preferredTechStack = techStack;

  // Settings & Theme
  if (formData.has("theme")) updates.theme = formData.get("theme")?.toString();
  if (formData.has("emailNotifications")) {
    updates.notificationPreferences = { 
      ...user.notificationPreferences,
      email: formData.get("emailNotifications") === "on" 
    };
  }

  await db.collection("users").doc(user.id).update(updates);
};

const handleLogout = async () => {
  "use server";
  await signOut();
  redirect("/sign-in");
};

const ProfilePage = async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const avatarInitial =
    user.name && user.name.length > 0
      ? user.name.charAt(0).toUpperCase()
      : user.email.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col min-h-screen bg-dark-100 text-white animate-fade-in-up">
      {/* Top Header / User Badge */}
      <header className="sticky top-0 z-50 w-full px-6 py-4 flex items-center justify-between glass-card rounded-none border-x-0 border-t-0 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all group">
            <div className="p-2 bg-white/5 rounded-lg border border-white/10 group-hover:border-blue-500/50 group-hover:bg-blue-500/10 transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="hidden sm:inline">Back to Dashboard</span>
          </Link>
          <div className="h-8 w-px bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-4">
            <div className="avatar-ring w-10 h-10 flex items-center justify-center overflow-hidden">
              <div className="w-full h-full rounded-full bg-dark-200 flex items-center justify-center text-sm font-bold">
                {user.profileURL ? (
                  <Image src={user.profileURL} alt="Avatar" width={40} height={40} className="object-cover" />
                ) : (
                  avatarInitial
                )}
              </div>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">{user.name}</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role || "Candidate"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle initialTheme={user.theme || "dark"} />
          <form action={handleLogout}>
            <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-red-500 transition-all duration-300 group ml-2">
              <LogOut size={14} className="group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
              <span className="group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">Logout</span>
            </button>
          </form>
        </div>
      </header>

      <div className="flex flex-1 w-full max-w-[1400px] mx-auto p-6 gap-8">
        {/* Left Sidebar */}
        <aside className="w-64 hidden lg:flex flex-col gap-2 sticky top-24 self-start">
          <nav className="flex flex-col gap-1.5">
            {[
              { id: "personal", label: "Personal", icon: UserIcon },
              { id: "career", label: "Career", icon: Briefcase },
              { id: "documents", label: "Documents", icon: FileText },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "history", label: "History", icon: History },
              { id: "settings", label: "Settings", icon: Settings },
              { id: "support", label: "Support", icon: HelpCircle },
              { id: "privacy", label: "Privacy", icon: Shield },
            ].map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`glass-sidebar-item ${item.id === "personal" ? "active" : ""}`}
              >
                <item.icon size={18} />
                <span className="text-sm font-medium tracking-wide">{item.label}</span>
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-10 pb-20">
          <form action={updateProfile} className="flex flex-col gap-10">
            {/* Personal Information Card */}
            <section id="personal" className="glass-card p-8 flex flex-col gap-8 scroll-mt-28">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                  <UserIcon size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Personal Information</h2>
                  <p className="text-sm text-gray-500">Identity and contact details</p>
                </div>
              </div>

              <div className="flex flex-col xl:flex-row gap-10">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="avatar-ring w-32 h-32 p-1.5">
                      <div className="w-full h-full rounded-full bg-dark-300 overflow-hidden flex items-center justify-center text-4xl font-bold border-4 border-dark-100">
                        {user.profileURL ? (
                          <Image src={user.profileURL} alt="Profile" width={128} height={128} className="object-cover" />
                        ) : (
                          avatarInitial
                        )}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer backdrop-blur-sm">
                      <div className="bg-white/10 p-2 rounded-full border border-white/20">
                        <Settings size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">Candidate ID: {user.id.slice(-8).toUpperCase()}</p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-1.5">
                    <label className="futuristic-label">Full Name</label>
                    <input name="name" defaultValue={user.name} className="futuristic-input glow-underline" placeholder="e.g. John Doe" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="futuristic-label">Email Address</label>
                    <input defaultValue={user.email} disabled className="futuristic-input opacity-50 cursor-not-allowed" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="futuristic-label">Phone Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input name="phone" defaultValue={user.phone} className="futuristic-input pl-11 glow-underline" placeholder="+1 (555) 000-0000" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="futuristic-label">Location</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input name="location" defaultValue={user.location} className="futuristic-input pl-11 glow-underline" placeholder="City, Country" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="space-y-1.5">
                  <label className="futuristic-label">LinkedIn</label>
                  <div className="relative">
                    <Linkedin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input name="linkedin" defaultValue={user.linkedin} className="futuristic-input pl-11 text-xs" placeholder="linkedin.com/in/..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="futuristic-label">GitHub</label>
                  <div className="relative">
                    <Github size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white" />
                    <input name="github" defaultValue={user.github} className="futuristic-input pl-11 text-xs" placeholder="github.com/..." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="futuristic-label">Portfolio</label>
                  <div className="relative">
                    <Globe size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input name="portfolio" defaultValue={user.portfolio} className="futuristic-input pl-11 text-xs" placeholder="yourportfolio.com" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-white/5 pt-8">
                <div className="space-y-1.5">
                  <label className="futuristic-label">Education</label>
                  <div className="relative">
                    <GraduationCap size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input name="education" defaultValue={user.education} className="futuristic-input pl-11" placeholder="University, Degree" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="futuristic-label">Experience Level</label>
                  <select name="experience" defaultValue={user.experience || "Fresher"} className="futuristic-input appearance-none cursor-pointer">
                    <option value="Fresher" className="bg-dark-200">Fresher (Entry Level)</option>
                    <option value="1-3 yrs" className="bg-dark-200">1–3 Years (Junior)</option>
                    <option value="3+ yrs" className="bg-dark-200">3+ Years (Senior)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Career Preferences Card */}
            <section id="career" className="glass-card p-8 flex flex-col gap-8 scroll-mt-28">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Career Preferences</h2>
                  <p className="text-sm text-gray-500">Target roles and interview focus</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-1.5">
                  <label className="futuristic-label">Target Job Role</label>
                  <input name="preferredRole" defaultValue={user.preferredRole} className="futuristic-input glow-underline" placeholder="e.g. Senior Frontend Engineer" />
                </div>
                <div className="space-y-1.5">
                  <label className="futuristic-label">Interview Language</label>
                  <select name="interviewLanguage" defaultValue={user.interviewLanguage || "English"} className="futuristic-input appearance-none cursor-pointer">
                    <option value="English" className="bg-dark-200">English (Global Standard)</option>
                    <option value="Hindi" className="bg-dark-200">Hindi (Native Support)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <label className="futuristic-label">Preferred Interview Types</label>
                <div className="flex flex-wrap gap-6">
                  {["HR", "Technical", "Behavioral"].map((type) => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        name="preferredInterviewType" 
                        value={type} 
                        defaultChecked={user.preferredInterviewType?.includes(type as any)}
                        className="custom-checkbox"
                      />
                      <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors tracking-wide">{type} Interview</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="futuristic-label">Preferred Tech Stack</label>
                <input 
                  name="preferredTechStack" 
                  defaultValue={user.preferredTechStack?.join(", ")} 
                  className="futuristic-input" 
                  placeholder="e.g. React, Next.js, TypeScript, Node.js (Comma separated)" 
                />
              </div>
            </section>

            {/* Sticky Save Bar */}
            <div className="sticky bottom-6 z-40 px-4">
              <div className="glass-card bg-black/40 backdrop-blur-2xl border-white/10 p-4 flex items-center justify-between shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="hidden sm:block">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Unsaved Changes</p>
                  <p className="text-[10px] text-gray-600">Update your profile for better AI matching</p>
                </div>
                <button type="submit" className="btn-gradient w-full sm:w-auto flex items-center justify-center gap-2">
                  <Shield size={18} />
                  <span>Save All Settings</span>
                </button>
              </div>
            </div>
          </form>

          {/* Resume & Documents Card */}
          <section id="documents" className="glass-card p-8 flex flex-col gap-8 scroll-mt-28">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-400">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Resume & Documents</h2>
                <p className="text-sm text-gray-500">Centralized storage for applications</p>
              </div>
            </div>

            <div className="group relative overflow-hidden p-12 border-2 border-dashed border-white/10 rounded-3xl bg-white/2 hover:bg-white/4 hover:border-blue-500/50 transition-all duration-500 cursor-pointer text-center">
              <div className="absolute inset-0 bg-linear-to-tr from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <FileText size={32} className="text-gray-400 group-hover:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Upload Latest Resume</h3>
                  <p className="text-sm text-gray-500">Drop PDF or DOCX files (Max 5MB)</p>
                </div>
              </div>
            </div>

            {user.resumeScore && (
              <div className="glass-card p-6 border-white/5 bg-white/1 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                      <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - user.resumeScore/100)} className="text-green-500 drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </svg>
                    <span className="absolute text-sm font-bold">{user.resumeScore}%</span>
                  </div>
                  <div>
                    <h4 className="font-bold">Resume Quality Score</h4>
                    <p className="text-xs text-gray-500">Based on FAANG compliance standards</p>
                  </div>
                </div>
                <button className="text-xs font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">Re-analyze</button>
              </div>
            )}
          </section>

          {/* Analytics Card */}
          <section id="analytics" className="glass-card p-8 flex flex-col gap-8 scroll-mt-28">
            <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                <BarChart3 size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Interview Progress</h2>
                <p className="text-sm text-gray-500">Performance tracking and AI insights</p>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Mock", value: user.totalInterviews || 0, sub: "Attempts", color: "blue" },
                { label: "Success Rate", value: user.interviewsPassed ? `${Math.round((user.interviewsPassed / (user.totalInterviews || 1)) * 100)}%` : "0%", sub: "Passed", color: "green" },
                { label: "Confidence", value: `${user.confidenceScore || 0}%`, sub: "AI Assessment", color: "purple" },
                { label: "Skill Level", value: user.experience === "3+ yrs" ? "Senior" : "Entry", sub: "Calculated", color: "orange" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-6 border-white/5 bg-white/1 hover:bg-white/3 group transition-all">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 group-hover:text-gray-400">{stat.label}</p>
                  <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] text-gray-600 uppercase font-bold mt-2">{stat.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Settings & Privacy - Compact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section id="settings" className="glass-card p-8 scroll-mt-28">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Settings size={20} className="text-gray-400" />
                    <h3 className="text-lg font-bold">Quick Settings</h3>
                  </div>
                  <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Active</span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/1">
                    <span className="text-sm text-gray-300">Email Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="emailNotifications" 
                        defaultChecked={user.notificationPreferences?.email} 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/1">
                    <span className="text-sm text-gray-300">Profile Visibility</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-dark-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              </section>

            <section id="privacy" className="glass-card p-8 border-red-500/10 hover:border-red-500/30 transition-colors scroll-mt-28">
              <div className="flex items-center gap-3 mb-6">
                <Shield size={20} className="text-red-500" />
                <h3 className="text-lg font-bold">Security & Data</h3>
              </div>
              <div className="flex flex-col gap-3">
                <button className="w-full py-3 px-4 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all">Delete Account Permanently</button>
                <button className="w-full py-3 px-4 rounded-xl border border-white/10 text-gray-400 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">Download Archive (.zip)</button>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );

};

export default ProfilePage;

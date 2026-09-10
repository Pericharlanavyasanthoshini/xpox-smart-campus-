import React from "react";
import {
  ShieldAlert,
  Clock,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Zap,
  Building,
  GraduationCap,
  Lock,
} from "lucide-react";

interface LandingProps {
  navigate: (route: string) => void;
  onQuickLogin: (role: "student" | "admin") => void;
}

export const Landing: React.FC<LandingProps> = ({ navigate, onQuickLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-950 text-white">
        {/* Subtle decorative grid */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Modern Campus Infrastructure
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
            SMART CAMPUS
            <span className="block text-2xl sm:text-4xl lg:text-5xl mt-2 font-bold bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300 bg-clip-text text-transparent">
              Report. Track. Resolve.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed mb-10">
            One simple platform to report campus problems, track complaints in real time, and create a better college experience for students and staff.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              id="btn-hero-login"
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Sign In to Portal
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="btn-hero-register"
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-xs transition-all"
            >
              Student Registration
            </button>
          </div>

          {/* Demo 1-Click Credentials Banner */}
          <div className="mt-12 max-w-xl mx-auto p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-left">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Demo Credentials (Preloaded)
              </span>
              <span className="text-[11px] text-slate-400">Click to instantly login</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                id="btn-demo-login-student"
                onClick={() => onQuickLogin("student")}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    Student Account
                  </span>
                  <span className="text-[10px] text-indigo-300 font-normal group-hover:underline">1-Click</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300 font-mono">student@example.com</p>
                <p className="text-[10px] text-slate-400 font-mono">student123</p>
              </button>

              <button
                id="btn-demo-login-admin"
                onClick={() => onQuickLogin("admin")}
                className="p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-left group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-purple-400" />
                    Admin Account
                  </span>
                  <span className="text-[10px] text-purple-300 font-normal group-hover:underline">1-Click</span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300 font-mono">admin@smartcampus.com</p>
                <p className="text-[10px] text-slate-400 font-mono">admin123</p>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              Engineered For Modern Colleges
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              A Complete Resolution Workflow
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              Replace outdated paper logs and chaotic messaging groups with an automated, auditable tracking system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Easy Complaint Reporting</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Categorized dropdowns for electricity, laboratories, Wi-Fi, and hostels with intuitive block locations.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Real-Time Tracking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Step-by-step progress timeline from submission to review, technical assignment, and final resolution.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Priority Management</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Rule-based urgency classification ensures hazardous electrical and water supply failures receive priority dispatch.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Transparent Resolution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Detailed administrative remarks, maintenance notes, and direct student notifications keep everyone accountable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works: 01 Report, 02 Track, 03 Resolve */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2">
              Simple 3-Step Process
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How It Works
            </p>
            <p className="mt-3 text-slate-600 text-sm">
              Designed for speed and clarity across both student and facility teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 01 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
              <div className="text-4xl font-black text-indigo-600/20 mb-3 font-mono">01</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Report</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students submit issues with campus block location, problem category, and brief description in under 60 seconds.
              </p>
            </div>

            {/* Step 02 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
              <div className="text-4xl font-black text-indigo-600/20 mb-3 font-mono">02</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Track</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow dynamic live status updates, priority escalations, and technician assignments right on the student dashboard.
              </p>
            </div>

            {/* Step 03 */}
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-xs relative">
              <div className="text-4xl font-black text-indigo-600/20 mb-3 font-mono">03</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Resolve</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Administration verifies facility fixes, posts closure remarks, and notifies students automatically upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs">
              SC
            </div>
            <div>
              <p className="font-bold text-white text-sm">SMART CAMPUS</p>
              <p className="text-xs text-slate-500">Report. Track. Resolve.</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center sm:text-right">
            <p>© 2026 Smart Campus Platform. All rights reserved.</p>
            <p className="mt-1 text-[11px] text-slate-600">Built with Node.js, Express & React</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

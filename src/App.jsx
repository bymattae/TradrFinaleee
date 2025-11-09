import React, { useMemo, useState, memo } from "react";
import { createClient } from "@supabase/supabase-js";

// =============================
// CONFIG (UI-first / Preview)
// =============================
const PREVIEW_MODE = true; // keep true for now; swap to real auth later
const SUPABASE_URL = "https://nclmskfpkqnqsqpjimnt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbG1za2Zwa3FucXNxcGppbW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTQwOTcsImV4cCI6MjA3ODI5MDA5N30.RIaMYi0uTzmsXFSWWupUCnJ0NwbwCrpXjVyFUFOOQDw";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================
// UI PRIMITIVES
// =============================
function cn(...a) {
  return a.filter(Boolean).join(" ");
}

const Input = memo(function Input(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-full bg-zinc-900/70 text-white placeholder-zinc-500",
        "border border-white/10 focus:border-emerald-400 focus:ring-emerald-400/20 outline-none",
        "px-5 py-3 text-base transition-all duration-150",
        props.className || ""
      )}
    />
  );
});

const Field = memo(function Field({ label, children }) {
  return (
    <div className="block">
      <div className="mb-1.5 text-sm font-medium text-zinc-300">{label}</div>
      {children}
    </div>
  );
});

const Pill = memo(function Pill({ active, children, onClick, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-full border text-xs px-3 py-1 transition",
        disabled && "opacity-50 cursor-not-allowed",
        active ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
});

// =============================
// AUTH FORMS
// =============================
function AuthTabs({ authTab, setAuthTab }) {
  return (
    <div className="mb-4 grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10">
      {[
        { key: "login", label: "Log in" },
        { key: "signup", label: "Sign up" },
      ].map((t) => (
        <button
          key={t.key}
          onClick={() => setAuthTab(t.key)}
          className={cn(
            "h-10 rounded-lg text-sm font-medium",
            authTab === t.key ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function LoginForm({ loginForm, setLoginForm, onSubmit }) {
  // spacing matches signup step fields
  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md text-left">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Login to your Tradr 🚀</h2>
        <p className="text-sm text-zinc-400 mt-1">Enter your email to log-in and use Tradr</p>
      </div>
      <div className="space-y-6">
        <Field label="Email">
          <Input
            type="email"
            placeholder="you@tradr.co"
            value={loginForm.email}
            onChange={(e) => setLoginForm((s) => ({ ...s, email: e.target.value }))}
            required
            autoComplete="email"
          />
        </Field>
        <Field label="Password">
          <Input
            type="password"
            placeholder="••••••••"
            value={loginForm.password}
            onChange={(e) => setLoginForm((s) => ({ ...s, password: e.target.value }))}
            required
            minLength={6}
            autoComplete="current-password"
          />
        </Field>
      </div>
      <button type="submit" className="mt-1 w-full rounded-full bg-white text-black font-semibold px-5 py-3 hover:opacity-90 transition transform active:translate-y-[1px]">
        Continue
      </button>
    </form>
  );
}

function SignupStepper({ signup, setSignup, signupStep, setSignupStep, onFinish }) {
  function NextBtn({ disabled, onClick, children }) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "mt-1 w-full rounded-full bg-white text-black font-semibold px-5 py-3 transition transform active:translate-y-[1px]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {children || "Continue"}
      </button>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-8">
        <h2 className="text-2xl font-semibold mb-1">Create your Tradr 📈</h2>
        <p className="text-sm text-zinc-400 mb-4">It only takes 10 seconds to sign up!</p>

        {signupStep === 0 && (
          <div className="mt-6 space-y-6">
            <Field label="Email">
              <Input
                type="email"
                placeholder="you@tradr.co"
                value={signup.email}
                onChange={(e) => setSignup((s) => ({ ...s, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </Field>
            <NextBtn onClick={() => setSignupStep(1)} disabled={!signup.email || !signup.email.includes("@")} />
          </div>
        )}

        {signupStep === 1 && (
          <div className="space-y-6">
            <Field label="First name">
              <Input
                type="text"
                placeholder="First name"
                value={signup.firstName}
                onChange={(e) => setSignup((s) => ({ ...s, firstName: e.target.value }))}
                required
                autoComplete="given-name"
              />
            </Field>
            <Field label="Last name">
              <Input
                type="text"
                placeholder="Last name"
                value={signup.lastName}
                onChange={(e) => setSignup((s) => ({ ...s, lastName: e.target.value }))}
                required
                autoComplete="family-name"
              />
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignupStep(0)} className="flex-1 rounded-full border border-white/10 px-5 py-3 text-sm">Back</button>
              <NextBtn onClick={() => setSignupStep(2)} disabled={!signup.firstName || !signup.lastName} />
            </div>
          </div>
        )}

        {signupStep === 2 && (
          <div className="space-y-6">
            <Field label="Password">
              <Input
                type="password"
                placeholder="Create a password"
                value={signup.password}
                onChange={(e) => setSignup((s) => ({ ...s, password: e.target.value }))}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignupStep(1)} className="flex-1 rounded-full border border-white/10 px-5 py-3 text-sm">Back</button>
              <NextBtn onClick={() => setSignupStep(3)} disabled={signup.password.length < 6} />
            </div>
          </div>
        )}

        {signupStep === 3 && (
          <div className="space-y-6">
            <Field label="What's your level?">
              <div className="grid grid-cols-3 gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSignup((s) => ({ ...s, experience: lvl }))}
                    className={cn(
                      "rounded-2xl border px-3 py-3 text-sm",
                      signup.experience === lvl
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    )}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignupStep(2)} className="flex-1 rounded-full border border-white/10 px-5 py-3 text-sm">Back</button>
              <NextBtn onClick={() => setSignupStep(4)} disabled={!signup.experience} />
            </div>
          </div>
        )}

        {signupStep === 4 && (
          <div className="space-y-6">
            <Field label="How long have you been trading?">
              <select
                className="w-full rounded-full bg-zinc-900/70 text-white border border-white/10 px-5 py-3 text-base"
                value={signup.duration}
                onChange={(e) => setSignup((s) => ({ ...s, duration: e.target.value }))}
              >
                <option value="">Select an option</option>
                <option value="<3 months">Less than 3 months</option>
                <option value="3-12 months">3–12 months</option>
                <option value="1-3 years">1–3 years</option>
                <option value=">3 years">More than 3 years</option>
              </select>
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignupStep(3)} className="flex-1 rounded-full border border-white/10 px-5 py-3 text-sm">Back</button>
              <NextBtn onClick={onFinish} disabled={!signup.duration || !signup.email || signup.password.length < 6}>Create account</NextBtn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================
// APP SHELL (topbar + layout)
// =============================
function AppShell({ tabs, active, setActive, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const MenuItem = ({ t }) => (
    <button
      key={t.key}
      onClick={() => {
        if (!t.soon) setActive(t.key);
        setMobileOpen(false);
      }}
      className={cn(
        "rounded-full px-3 py-1.5 transition-all duration-150 flex items-center gap-2 w-full text-left",
        t.key === active && !t.soon
          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
          : "border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10",
        t.soon && "opacity-50 cursor-not-allowed"
      )}
      title={t.soon ? "This feature is coming soon" : undefined}
    >
      <span className="flex-1">{t.label}</span>
      {t.soon && (
        <span className="text-[10px] leading-none px-2 py-1 rounded-full border border-white/15 bg-white/5">Soon</span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#0a0f1a] to-[#030507] text-white">
      <header className="sticky top-0 z-20 backdrop-blur-md bg-black/40 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
          <div className="text-3xl font-bold tracking-tight select-none">tradr</div>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            {tabs.map((t) => (
              <MenuItem key={t.key} t={t} />
            ))}
          </nav>

          {/* Mobile: 3-dots button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="sm:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/5 text-zinc-200"
            aria-label="Open menu"
          >
            <span className="block w-1 h-1 rounded-full bg-current" />
            <span className="block w-1 h-1 rounded-full bg-current mx-1" />
            <span className="block w-1 h-1 rounded-full bg-current" />
          </button>

          <button onClick={onLogout} className="hidden sm:inline-flex rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-zinc-300">Log out</button>
        </div>
      </header>

      {/* Mobile sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 sm:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-72 bg-[#0b1220] border-l border-white/10 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-bold">tradr</div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full border border-white/10 text-zinc-300"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {tabs.map((t) => (
                <MenuItem key={t.key} t={t} />
              ))}
            </div>
            <div className="mt-auto pt-3">
              <button onClick={() => { setMobileOpen(false); onLogout(); }} className="w-full rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 text-sm text-zinc-300">Log out</button>
            </div>
          </aside>
        </div>
      )}

      <main className="mx-auto max-w-md px-5 py-6">{children}</main>

      <footer className="mt-8 pb-8 text-center text-xs text-zinc-500">#tradr - Made with 💙 for Traders</footer>
    </div>
  );
}

// =============================
// MAIN APP
// =============================
export default function TradrApp() {
  const [session, setSession] = useState(PREVIEW_MODE ? { user: { id: "preview" } } : null);

  // Auth state
  const [authTab, setAuthTab] = useState("login");
  const [signupStep, setSignupStep] = useState(0);
  const [signup, setSignup] = useState({ email: "", firstName: "", lastName: "", password: "", experience: "", duration: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // Tabs
  const tabs = useMemo(() => [
    { key: "home", label: "Home" },
    { key: "calc", label: "Calculator" },
    { key: "calendar", label: "Calendar", soon: true },
    { key: "analysis", label: "Analysis", soon: true },
  ], []);
  const [active, setActive] = useState("home");

  // Greeting name
  const [firstName, setFirstName] = useState("Trader");
  function deriveName(email) {
    if (!email) return "Trader";
    const raw = email.split("@")[0];
    if (!raw) return "Trader";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  // Calculator state (keep strings to avoid unfocus)
  const [balanceStr, setBalanceStr] = useState("5000");
  const [riskPctStr, setRiskPctStr] = useState("1");
  const [stopPipsStr, setStopPipsStr] = useState("20");
  const balance = parseFloat(balanceStr) || 0;
  const riskPct = parseFloat(riskPctStr) || 0;
  const stopPips = parseFloat(stopPipsStr) || 0;
  const PIP_VALUE_PER_LOT = 10; // standard for most USD-quoted pairs
  const riskAmount = balance * (riskPct / 100);
  const lots = stopPips > 0 ? riskAmount / (stopPips * PIP_VALUE_PER_LOT) : 0;

  // Feature request
  const [featureRequest, setFeatureRequest] = useState("");

  // Preview handlers
  function previewLogin(e) {
    e?.preventDefault?.();
    setSession({ user: { id: "preview" } });
    setFirstName(deriveName(loginForm.email));
    setActive("home");
  }
  function previewSignupFinish() {
    setSession({ user: { id: "preview" } });
    setFirstName(signup.firstName ? signup.firstName : deriveName(signup.email));
    setActive("home");
  }
  function handleLogout() {
    setSession(null);
    setAuthTab("login");
  }
  function handleFeatureSubmit(e) {
    e.preventDefault();
    setFeatureRequest("");
    alert("✅ Feature request captured (preview)");
  }

  // ===== Gate: Auth vs App =====
  if (!session) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#0a0f1a] to-[#030507] text-white flex items-center justify-center px-6">
        <div className="pointer-events-none absolute -top-20 -left-40 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="w-full max-w-md relative">
          <div className="text-left mb-5">
            <h1 className="text-3xl font-extrabold tracking-tight">tradr</h1>
          </div>
          <AuthTabs authTab={authTab} setAuthTab={setAuthTab} />
          {authTab === "login" ? (
            <LoginForm loginForm={loginForm} setLoginForm={setLoginForm} onSubmit={previewLogin} />
          ) : (
            <SignupStepper
              signup={signup}
              setSignup={setSignup}
              signupStep={signupStep}
              setSignupStep={setSignupStep}
              onFinish={previewSignupFinish}
            />
          )}
        </div>
      </div>
    );
  }

  // ===== Logged-in App =====
  return (
    <AppShell tabs={tabs} active={active} setActive={setActive} onLogout={handleLogout}>
      {active === "home" && (
        <div className="space-y-8">
          {/* Welcome box */}
          <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 p-7 md:p-8 shadow-[0_0_40px_rgba(16,185,129,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-zinc-400">Welcome back,</div>
                <div className="text-2xl font-bold text-white">{firstName}</div>
              </div>
              <div className="hidden sm:block text-3xl">🤝</div>
            </div>
          </div>

          {/* Directory cards */}
          <div className="grid gap-3">
            <div
              className="rounded-xl bg-gradient-to-r from-[#111827] to-[#0b1220] border border-white/10 p-4 hover:border-emerald-400/30 transition cursor-pointer"
              onClick={() => setActive("calc")}
            >
              <h3 className="font-semibold text-lg text-white">📊 Calculator</h3>
              <p className="text-xs text-zinc-400 mt-1">Calculate your lot size</p>
            </div>
            <div className="rounded-xl bg-[#0b1220]/60 border border-white/10 p-4 opacity-70 cursor-not-allowed" title="This feature is coming soon">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                📅 Calendar <span className="text-[10px] leading-none px-2 py-1 rounded-full border border-white/15 bg-white/5">Coming soon</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Economic events, powered by AI</p>
            </div>
            <div className="rounded-xl bg-[#0b1220]/60 border border-white/10 p-4 opacity-70 cursor-not-allowed" title="This feature is coming soon">
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                📈 Analysis <span className="text-[10px] leading-none px-2 py-1 rounded-full border border-white/15 bg-white/5">Coming soon</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">Insights, powered by AI</p>
            </div>
          </div>

          {/* Feature request */}
          <form onSubmit={handleFeatureSubmit} className="rounded-2xl border border-white/10 bg-[#0b1220]/60 p-5 backdrop-blur-md">
            <h4 className="text-sm font-semibold mb-2 text-white">💡 Request a Feature</h4>
            <textarea
              className="w-full rounded-xl bg-zinc-900/70 text-white border border-white/10 px-3 py-2 text-sm focus:border-emerald-400 outline-none"
              rows={3}
              placeholder="What would you like to see next?"
              value={featureRequest}
              onChange={(e) => setFeatureRequest(e.target.value)}
            />
            <button type="submit" className="mt-3 w-full rounded-full bg-white text-black font-semibold px-5 py-3 hover:opacity-90 transition transform active:translate-y-[1px]">Submit Request</button>
          </form>
        </div>
      )}

      {active === "calc" && (
        <div className="grid grid-cols-1 gap-5 sm:gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#0b1220]/70 p-5 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Balance (USD)"><Input type="text" inputMode="decimal" value={balanceStr} onChange={(e) => setBalanceStr(e.target.value)} /></Field>
              <Field label="Risk %"><Input type="text" inputMode="decimal" value={riskPctStr} onChange={(e) => setRiskPctStr(e.target.value)} /></Field>
              <Field label="Stop (pips)"><Input type="text" inputMode="decimal" value={stopPipsStr} onChange={(e) => setStopPipsStr(e.target.value)} /></Field>
            </div>
            <div className="mt-6 rounded-2xl bg-[#05080f] border border-white/10 p-5 text-center">
              <div className="text-xs uppercase tracking-wide text-zinc-400">Lot Size</div>
              <div className="mt-1 text-4xl font-bold text-emerald-400">{new Intl.NumberFormat(undefined, { maximumFractionDigits: 3 }).format(lots)}</div>
            </div>
          </div>
        </div>
      )}

      {active !== "calc" && active !== "home" && (
        <div className="rounded-2xl border border-white/10 bg-[#0b1220]/70 p-6 text-center text-sm text-zinc-300">
          <p className="font-semibold text-white">{tabs.find((t) => t.key === active)?.label}</p>
          <p className="mt-1 text-zinc-400">This feature is coming soon 🚧</p>
        </div>
      )}
    </AppShell>
  );
}

// Tradr App - Home + FX Calculator + Supabase Auth (Fintech-Style UI)
// Restores full App Shell (top bar, tabs, logo) after login/sign-up
// Keeps: multi-step sign-up, DEV bypass, pseudo-session for email-confirm flows

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://nclmskfpkqnqsqpjimnt.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbG1za2Zwa3FucXNxcGppbW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTQwOTcsImV4cCI6MjA3ODI5MDA5N30.RIaMYi0uTzmsXFSWWupUCnJ0NwbwCrpXjVyFUFOOQDw";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DEV_BYPASS = (() => {
  try {
    return new URLSearchParams(window.location.search).has("dev");
  } catch {
    return false;
  }
})();

function cn(...a) {
  return a.filter(Boolean).join(" ");
}

function Input(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg bg-zinc-900/70 text-white placeholder-zinc-500",
        "border border-white/10 focus:border-emerald-400 focus:ring-emerald-400/20 outline-none",
        "px-4 py-2.5 text-sm transition-all duration-150",
        props.className || ""
      )}
    />
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1.5 text-sm font-medium text-zinc-300">{label}</div>
      {children}
    </label>
  );
}

function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border text-xs px-3 py-1 transition",
        active ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

export default function TradrApp() {
  // ===== Global state =====
  const [session, setSession] = useState(null); // real or pseudo
  const [authTab, setAuthTab] = useState("login");
  const [signupStep, setSignupStep] = useState(0);
  const [signup, setSignup] = useState({ email: "", password: "", experience: "", duration: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // App nav + screens
  const tabs = [
    { key: "home", label: "Home" },
    { key: "calc", label: "Calculator" },
    { key: "calendar", label: "Calendar 🔒", soon: true },
    { key: "analysis", label: "Analysis 🔒", soon: true },
  ];
  const [active, setActive] = useState("home");

  // Calculator state
  const [balance, setBalance] = useState(5000);
  const [riskPct, setRiskPct] = useState(1);
  const [stopPips, setStopPips] = useState(20);
  const PIP_VALUE_PER_LOT = 10; // standard FX
  const riskAmount = balance * (riskPct / 100);
  const lots = stopPips > 0 ? riskAmount / (stopPips * PIP_VALUE_PER_LOT) : 0;

  // Feature requests
  const [featureRequest, setFeatureRequest] = useState("");

  // ===== Auth lifecycle =====
  useEffect(() => {
    if (DEV_BYPASS) {
      const raw = localStorage.getItem("tradr_dev_session");
      if (raw) setSession(JSON.parse(raw));
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) => setSession(sess));
    return () => sub.subscription.unsubscribe();
  }, []);

  function setDevSession(next) {
    localStorage.setItem("tradr_dev_session", JSON.stringify(next));
    setSession(next);
  }

  // ===== Auth actions =====
  async function handleLogin(e) {
    e.preventDefault();
    if (DEV_BYPASS) {
      const fake = { user: { id: `dev-${Date.now()}`, email: loginForm.email || "dev@tradr.co" }, dev: true };
      setDevSession(fake);
      setActive("home");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginForm.email, password: loginForm.password });
    if (error) return alert(error.message);
    setSession(data.session);
    setActive("home");
  }

  async function completeSignup() {
    if (DEV_BYPASS) {
      const fake = { user: { id: `dev-${Date.now()}`, email: signup.email || "dev@tradr.co", user_metadata: { experience: signup.experience, duration: signup.duration } }, dev: true };
      setDevSession(fake);
      setActive("home");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: { data: { experience: signup.experience, duration: signup.duration } },
    });
    if (error) return alert(error.message);

    // If confirmations ON: user exists but no session; allow in with pseudo-session
    if (!data.session && data.user) {
      setSession({ user: data.user, pendingEmailVerify: true });
      setActive("home");
      return;
    }
    setSession(data.session);
    setActive("home");
  }

  async function handleLogout() {
    if (DEV_BYPASS) {
      localStorage.removeItem("tradr_dev_session");
      setSession(null);
      return;
    }
    await supabase.auth.signOut();
    setSession(null);
  }

  async function handleFeatureSubmit(e) {
    e.preventDefault();
    if (!session?.user) return alert("Please sign in first");

    if (DEV_BYPASS) {
      const list = JSON.parse(localStorage.getItem("tradr_feature_requests") || "[]");
      list.push({ id: Date.now(), user_id: session.user.id, message: featureRequest });
      localStorage.setItem("tradr_feature_requests", JSON.stringify(list));
      setFeatureRequest("");
      alert("✅ (DEV) Feature saved locally.");
      return;
    }

    const { error } = await supabase.from("feature_requests").insert({ user_id: session.user.id, message: featureRequest });
    if (error) return alert(error.message);
    setFeatureRequest("");
    alert("✅ Feature request submitted.");
  }

  // ===== Auth views =====
  function AuthTabs() {
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

  function LoginForm() {
    return (
      <form onSubmit={handleLogin} className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md text-left">
        <div className="text-left mb-2">
          <h2 className="text-xl font-semibold">Welcome back</h2>
          <p className="text-xs text-zinc-400">Log in to continue to your tools.</p>
        </div>
        <Field label="Email">
          <Input type="email" placeholder="you@tradr.co" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required minLength={6} />
        </Field>
        <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold px-4 py-2.5">
          {DEV_BYPASS ? "Continue (Dev)" : "Log in"}
        </button>
      </form>
    );
  }

  function SignupStepper() {
    const steps = ["Email", "Password", "Experience", "Duration"];
    const StepDots = () => (
      <div className="flex items-center justify-center gap-2 mb-4">
        {steps.map((_, i) => (
          <span key={i} className={cn("h-2 w-2 rounded-full", i === signupStep ? "bg-emerald-400" : "bg-white/15")} />
        ))}
      </div>
    );

    function NextBtn({ disabled, onClick, children }) {
      return (
        <button type="button" onClick={onClick} disabled={disabled} className={cn("w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold px-4 py-2.5 transition", disabled && "opacity-50 cursor-not-allowed")}>{children || "Next"}</button>
      );
    }

    return (
      <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md text-left">
        <div className="text-left mb-1">
          <h2 className="text-xl font-semibold">Create your account</h2>
          <p className="text-xs text-zinc-400">{steps[signupStep]} • Step {signupStep + 1} of {steps.length}</p>
        </div>
        <StepDots />

        {signupStep === 0 && (
          <>
            <Field label="Email">
              <Input type="email" placeholder="you@tradr.co" value={signup.email} onChange={(e) => setSignup({ ...signup, email: e.target.value })} required />
            </Field>
            <NextBtn onClick={() => setSignupStep(1)} disabled={!signup.email || !signup.email.includes("@")} />
          </>
        )}

        {signupStep === 1 && (
          <>
            <Field label="Password">
              <Input type="password" placeholder="Create a strong password" value={signup.password} onChange={(e) => setSignup({ ...signup, password: e.target.value })} required minLength={6} />
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignupStep(0)} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm">Back</button>
              <NextBtn onClick={() => setSignupStep(2)} disabled={signup.password.length < 6} />
            </div>
          </>
        )}

        {signupStep === 2 && (
          <>
            <Field label="What's your level?">
              <div className="flex flex-wrap gap-2">
                {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                  <Pill key={lvl} active={signup.experience === lvl} onClick={() => setSignup({ ...signup, experience: lvl })}>{lvl}</Pill>
                ))}
              </div>
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignupStep(1)} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm">Back</button>
              <NextBtn onClick={() => setSignupStep(3)} disabled={!signup.experience} />
            </div>
          </>
        )}

        {signupStep === 3 && (
          <>
            <Field label="How long have you been trading?">
              <select className="w-full rounded-lg bg-zinc-900/70 text-white border border-white/10 px-3 py-2.5 text-sm" value={signup.duration} onChange={(e) => setSignup({ ...signup, duration: e.target.value })}>
                <option value="">Select an option</option>
                <option value="<3 months">Less than 3 months</option>
                <option value="3-12 months">3–12 months</option>
                <option value="1-3 years">1–3 years</option>
                <option value=">3 years">More than 3 years</option>
              </select>
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSignupStep(2)} className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm">Back</button>
              <NextBtn onClick={completeSignup} disabled={!signup.duration || !signup.email || signup.password.length < 6}>{DEV_BYPASS ? "Finish (Dev)" : "Create Account"}</NextBtn>
            </div>
          </>
        )}
      </div>
    );
  }

  // ===== App Shell =====
  function AppShell({ children }) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-[#030507] text-white">
        <header className="sticky top-0 z-20 backdrop-blur-md bg-black/40 border-b border-white/10">
          <div className="mx-auto max-w-6xl px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold tracking-tight text-white select-none">tradr</div>
              {DEV_BYPASS && (
                <span className="text-[10px] uppercase tracking-wide bg-yellow-400/20 text-yellow-300 border border-yellow-300/30 px-2 py-0.5 rounded-full">DEV</span>
              )}
              {session?.pendingEmailVerify && (
                <span className="text-[10px] uppercase tracking-wide bg-amber-400/20 text-amber-300 border border-amber-300/30 px-2 py-0.5 rounded-full ml-2">Verify email</span>
              )}
            </div>
            <nav className="flex items-center gap-2 text-sm">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => !t.soon && setActive(t.key)}
                  className={cn(
                    "rounded-full px-3 py-1.5 transition-all duration-150",
                    t.key === active && !t.soon
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                      : "border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10",
                    t.soon && "opacity-50 cursor-not-allowed"
                  )}
                  title={t.soon ? "This feature is coming soon" : undefined}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <button onClick={handleLogout} className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-zinc-300">Log out</button>
          </div>
        </header>

        <main className="mx-auto max-w-md px-5 py-6">{children}</main>

        <footer className="mt-8 pb-8 text-center text-xs text-zinc-500">#tradr — Made with 💙 for Traders</footer>
      </div>
    );
  }

  // ===== Gate =====
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-[#030507] text-white flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-extrabold mb-4 tracking-tight text-center">tradr</h1>
          <AuthTabs />
          {authTab === "login" ? <LoginForm /> : <SignupStepper />}
        </div>
      </div>
    );
  }

  // ===== Logged-in app =====
  return (
    <AppShell>
      {active === "home" && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Welcome 👋</h2>
            <p className="text-zinc-400 text-sm">Choose a tool to get started.</p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl bg-gradient-to-r from-[#111827] to-[#0b1220] border border-white/10 p-4 hover:border-emerald-400/30 transition cursor-pointer" onClick={() => setActive("calc")}>
              <h3 className="font-semibold text-lg text-white">📊 Calculator</h3>
              <p className="text-xs text-zinc-400 mt-1">Smart position sizing and risk control.</p>
            </div>
            <div className="rounded-xl bg-[#0b1220]/60 border border-white/10 p-4 opacity-70 cursor-not-allowed">
              <h3 className="font-semibold text-lg text-white">📅 Calendar 🔒</h3>
              <p className="text-xs text-zinc-400 mt-1">Economic events (Coming Soon)</p>
            </div>
            <div className="rounded-xl bg-[#0b1220]/60 border border-white/10 p-4 opacity-70 cursor-not-allowed">
              <h3 className="font-semibold text-lg text-white">📈 Analysis 🔒</h3>
              <p className="text-xs text-zinc-400 mt-1">Insights & analytics (Coming Soon)</p>
            </div>
          </div>

          <form onSubmit={handleFeatureSubmit} className="rounded-2xl border border-white/10 bg-[#0b1220]/60 p-5 backdrop-blur-md">
            <h4 className="text-sm font-semibold mb-2 text-white">💡 Request a Feature</h4>
            <textarea className="w-full rounded-xl bg-zinc-900/70 text-white border border-white/10 px-3 py-2 text-sm focus:border-emerald-400 outline-none" rows="3" placeholder={DEV_BYPASS ? "(DEV) Saved locally — will submit to DB later" : "What would you like to see next?"} value={featureRequest} onChange={(e) => setFeatureRequest(e.target.value)} />
            <button type="submit" className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-semibold px-4 py-2 hover:opacity-90 transition">Submit Request</button>
          </form>
        </div>
      )}

      {active === "calc" && (
        <div className="grid grid-cols-1 gap-5 sm:gap-6">
          <div className="rounded-2xl border border-white/10 bg-[#0b1220]/70 p-5 shadow-xl backdrop-blur-md">
            <div className="grid grid-cols-1 gap-4">
              <Field label="Balance (USD)"><Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(parseFloat(e.target.value) || 0)} /></Field>
              <Field label="Risk %">
                <Input type="number" step="0.01" value={riskPct} onChange={(e) => setRiskPct(parseFloat(e.target.value) || 0)} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[0.5, 1, 1.5, 2, 3, 5].map((r) => (
                    <Pill key={r} active={riskPct === r} onClick={() => setRiskPct(r)}>{r}%</Pill>
                  ))}
                </div>
              </Field>
              <Field label="Stop (pips)"><Input type="number" step="0.1" value={stopPips} onChange={(e) => setStopPips(parseFloat(e.target.value) || 0)} /></Field>
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

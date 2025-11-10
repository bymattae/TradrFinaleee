import React, { useState, useEffect, useMemo, memo } from "react";
import { createClient } from "@supabase/supabase-js";

// =============================
// Supabase
// =============================
const PREVIEW_MODE = false;
const SUPABASE_URL = "https://nclmskfpkqnqsqpjimnt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbG1za2Zwa3FucXNxcGppbW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MTQwOTcsImV4cCI6MjA3ODI5MDA5N30.RIaMYi0uTzmsXFSWWupUCnJ0NwbwCrpXjVyFUFOOQDw";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============================
// Utils & base components
// =============================
function cn(...a) {
  return a.filter(Boolean).join(" ");
}

const Input = memo(function Input({ className, onClick, onMouseDown, onTouchStart, ...props }) {
  return (
    <input
      {...props}
      autoComplete="off"
      className={cn(
        "w-full rounded-full bg-zinc-900/70 text-white placeholder-zinc-500",
        "border border-white/10 focus:border-emerald-400 outline-none",
        "px-5 py-3 text-base transition-all duration-150",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onMouseDown?.(e);
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        onTouchStart?.(e);
      }}
    />
  );
});

const Field = memo(function Field({ label, children }) {
  return (
    <label className="block">
      {label && <div className="mb-1.5 text-sm font-medium text-zinc-300">{label}</div>}
      {children}
    </label>
  );
});

const Pill = memo(function Pill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
      }}
      className={cn(
        "rounded-full border text-xs px-3 py-1 transition",
        active
          ? "border-emerald-400/40 bg-emerald-500/10"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
});

// =============================
// Top App Shell (desktop pills + mobile menu)
// =============================
function AppShell({ tabs, active, setActive, onLogout, children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

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

          {/* Mobile: 3-dots */}
          <div className="sm:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/10 bg-white/5 text-zinc-200"
              aria-label="Open menu"
            >
              <span className="block w-1 h-1 rounded-full bg-current" />
              <span className="block w-1 h-1 rounded-full bg-current mx-1" />
              <span className="block w-1 h-1 rounded-full bg-current" />
            </button>
            <button
              onClick={onLogout}
              className="rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 text-sm text-zinc-300"
            >
              Log out
            </button>
          </div>

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
// Auth UI (Revolut style, tabs)
// =============================
function AuthTabs({ authTab, setAuthTab }) {
  return (
    <div className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 w-full mb-6">
      {[
        { k: "login", label: "Login" },
        { k: "signup", label: "Sign up" },
      ].map((t) => (
        <button
          key={t.k}
          onClick={() => setAuthTab(t.k)}
          className={cn(
            "flex-1 rounded-full px-5 py-2 text-sm",
            authTab === t.k ? "bg-white text-black font-semibold" : "text-zinc-300"
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function LoginForm({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <div className="text-2xl font-bold mb-1">Login to your Tradr 🚀</div>
        <div className="text-sm text-zinc-400 mb-4">Enter your email to log-in and use Tradr</div>
        <Field label="Email">
          <Input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder="you@email.com"
            required
          />
        </Field>
      </div>
      <Field label="Password">
        <Input
          type="password"
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
          placeholder="••••••••"
          required
        />
      </Field>
      <button type="submit" className="w-full rounded-full bg-white text-black font-semibold px-5 py-3">Continue</button>
    </form>
  );
}

function SignupForm({ value, onChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div>
        <div className="text-2xl font-bold mb-1">Create your Tradr 📈</div>
        <div className="text-sm text-zinc-400 mb-4">It only takes 10 seconds to sign up!</div>
        <Field label="Email">
          <Input
            type="email"
            value={value.email}
            onChange={(e) => onChange({ ...value, email: e.target.value })}
            placeholder="you@email.com"
            required
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <Input
            value={value.firstName}
            onChange={(e) => onChange({ ...value, firstName: e.target.value })}
            placeholder="Alex"
            required
          />
        </Field>
        <Field label="Last name">
          <Input
            value={value.lastName}
            onChange={(e) => onChange({ ...value, lastName: e.target.value })}
            placeholder="Doe"
            required
          />
        </Field>
      </div>
      <Field label="Password">
        <Input
          type="password"
          value={value.password}
          onChange={(e) => onChange({ ...value, password: e.target.value })}
          placeholder="••••••••"
          required
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Level">
          <select
            className="w-full rounded-full bg-zinc-900/70 text-white border border-white/10 px-5 py-3"
            value={value.experience}
            onChange={(e) => onChange({ ...value, experience: e.target.value })}
            required
          >
            <option value="">Select</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </Field>
        <Field label="Trading since">
          <select
            className="w-full rounded-full bg-zinc-900/70 text-white border border-white/10 px-5 py-3"
            value={value.duration}
            onChange={(e) => onChange({ ...value, duration: e.target.value })}
            required
          >
            <option value="">Select</option>
            <option>Under 6 months</option>
            <option>6–12 months</option>
            <option>1–2 years</option>
            <option>2+ years</option>
          </select>
        </Field>
      </div>
      <button type="submit" className="w-full rounded-full bg-white text-black font-semibold px-5 py-3">Create account</button>
    </form>
  );
}

// =============================
// Calculator (focus-safe, memoized)
// =============================
const Calculator = memo(function Calculator() {
  const [balanceStr, setBalanceStr] = useState("5000");
  const [riskPctStr, setRiskPctStr] = useState("1");
  const [stopPipsStr, setStopPipsStr] = useState("20");

  const balance = parseFloat(balanceStr) || 0;
  const riskPct = parseFloat(riskPctStr) || 0;
  const stopPips = parseFloat(stopPipsStr) || 0;
  const PIP_VALUE_PER_LOT = 10; // majors approx
  const riskAmount = balance * (riskPct / 100);
  const lots = stopPips > 0 ? riskAmount / (stopPips * PIP_VALUE_PER_LOT) : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
        <div className="text-xl font-semibold mb-1">Calculator</div>
        <div className="text-sm text-zinc-400">Calculate your lot size</div>
      </div>

      <div className="space-y-5">
        <Field label="Balance (USD)">
          <Input type="text" inputMode="decimal" value={balanceStr} onChange={(e) => setBalanceStr(e.target.value.replace(/[^0-9.]/g, ""))} />
        </Field>
        <Field label="Risk %">
          <div className="flex items-center gap-2">
            <Input type="text" inputMode="decimal" value={riskPctStr} onChange={(e) => setRiskPctStr(e.target.value.replace(/[^0-9.]/g, ""))} />
            <div className="flex items-center gap-2">
              {[0.5, 1, 1.5, 2].map((p) => (
                <Pill key={p} onClick={() => setRiskPctStr(String(p))} active={Number(riskPctStr) === p}>
                  {p}%
                </Pill>
              ))}
            </div>
          </div>
        </Field>
        <Field label="Stop (pips)">
          <Input type="text" inputMode="decimal" value={stopPipsStr} onChange={(e) => setStopPipsStr(e.target.value.replace(/[^0-9.]/g, ""))} />
        </Field>
      </div>

      <div className="rounded-2xl bg-[#05080f] border border-white/10 p-5 text-center">
        <div className="text-xs uppercase tracking-wide text-zinc-400">Lot Size</div>
        <div className="mt-1 text-4xl font-bold text-emerald-400">{new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(Math.max(0, lots))}</div>
      </div>
    </div>
  );
});

// =============================
// Main App
// =============================
export default function TradrApp() {
  // ----- Auth state
  const [session, setSession] = useState(PREVIEW_MODE ? { user: { id: "preview" } } : null);
  const [authTab, setAuthTab] = useState("login");

  // ----- Forms
  const [signup, setSignup] = useState({ email: "", firstName: "", lastName: "", password: "", experience: "", duration: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  // ----- App state
  const [active, setActive] = useState("home");
  const [firstName, setFirstName] = useState("Trader");
  const [featureRequest, setFeatureRequest] = useState("");

  // ----- Auth bootstrap & profile name
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session ?? null);
      if (session?.user?.id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", session.user.id)
          .single();
        setFirstName(prof?.first_name || (session.user.email ? session.user.email.split("@")[0] : "Trader"));
      }
    };
    init();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_evt, session) => {
      setSession(session ?? null);
      if (session?.user?.id) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", session.user.id)
          .single();
        setFirstName(prof?.first_name || (session.user.email ? session.user.email.split("@")[0] : "Trader"));
        setActive("home");
      } else {
        setAuthTab("login");
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // ----- Real login/signup
  async function doLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email: loginForm.email,
      password: loginForm.password,
    });
    if (error) alert("Login failed: " + error.message);
  }

  async function doSignup() {
    const { error } = await supabase.auth.signUp({
      email: signup.email,
      password: signup.password,
      options: {
        data: {
          first_name: signup.firstName,
          last_name: signup.lastName,
          experience: signup.experience,
          duration: signup.duration,
        },
      },
    });
    if (error) {
      alert("Signup failed: " + error.message);
      return;
    }
    const sess = (await supabase.auth.getSession()).data.session;
    if (sess?.user?.id) {
      await supabase.from("profiles").upsert({
        id: sess.user.id,
        first_name: signup.firstName,
        last_name: signup.lastName,
        experience: signup.experience,
        duration: signup.duration,
      });
    } else {
      alert("Check your email to confirm your account, then log in.");
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      setFirstName("Trader");
      setAuthTab("login");
      setActive("home");
    }
  }

  // =============================
  // Tabs data
  // =============================
  const tabs = useMemo(
    () => [
      { key: "home", label: "Home" },
      { key: "calc", label: "Calculator" },
      { key: "calendar", label: "Calendar", soon: true },
      { key: "analysis", label: "Analysis", soon: true },
    ],
    []
  );

  // =============================
  // Views
  // =============================
  function Home() {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-5">
          <div className="text-xl font-semibold">Welcome back, {firstName}</div>
        </div>

        <div className="grid gap-3">
          <div className="rounded-xl bg-gradient-to-r from-[#111827] to-[#0b1220] border border-white/10 p-4 hover:border-emerald-400/30 transition cursor-pointer" onClick={() => setActive("calc")}>
            <h3 className="font-semibold text-lg text-white">📊 Calculator</h3>
            <div className="text-sm text-zinc-400">Calculate your lot size</div>
          </div>
          <div className="rounded-xl bg-[#0b1220]/60 border border-white/10 p-4 opacity-70 cursor-not-allowed" title="This feature is coming soon">
            <h3 className="font-semibold text-lg text-white flex items-center gap-1">📅 Calendar</h3>
            <span className="text-[10px] leading-none px-2 py-1 rounded-full border border-white/15 bg-white/5">Coming soon</span>
            <div className="text-sm text-zinc-400">Economic events, powered by AI</div>
          </div>
          <div className="rounded-xl bg-[#0b1220]/60 border border-white/10 p-4 opacity-70 cursor-not-allowed" title="This feature is coming soon">
            <h3 className="font-semibold text-lg text-white flex items-center gap-1">📈 Analysis</h3>
            <span className="text-[10px] leading-none px-2 py-1 rounded-full border border-white/15 bg-white/5">Coming soon</span>
            <div className="text-sm text-zinc-400">Insights, powered by AI</div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!featureRequest.trim()) return;
            alert("Thanks! Feature request submitted.");
            setFeatureRequest("");
          }}
          className="rounded-2xl border border-white/10 bg-[#0b1220]/60 p-5"
        >
          <h4 className="text-sm font-semibold mb-2 text-white">💡 Request a Feature</h4>
          <textarea
            className="w-full rounded-xl bg-zinc-900/70 text-white border border-white/10 px-3 py-2 text-sm focus:border-emerald-400 outline-none"
            rows={3}
            placeholder="What would you like to see next?"
            value={featureRequest}
            onChange={(e) => setFeatureRequest(e.target.value)}
          />
          <button type="submit" className="mt-3 w-full rounded-full bg-white text-black font-semibold px-5 py-3 hover:opacity-90 transition active:translate-y-px">Submit Request</button>
        </form>
      </div>
    );
  }

  // =============================
  // Render gate: AUTH vs APP
  // =============================
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0f1a] to-[#030507] text-white">
        <div className="mx-auto max-w-md px-5 py-8">
          <div className="text-3xl font-bold mb-6">tradr</div>
          <AuthTabs authTab={authTab} setAuthTab={setAuthTab} />
          {authTab === "login" ? (
            <LoginForm value={loginForm} onChange={setLoginForm} onSubmit={doLogin} />
          ) : (
            <SignupForm value={signup} onChange={setSignup} onSubmit={doSignup} />
          )}
        </div>
        <footer className="mt-8 pb-8 text-center text-xs text-zinc-500">#tradr - Made with 💙 for Traders</footer>
      </div>
    );
  }

  // Logged-in app
  return (
    <AppShell tabs={tabs} active={active} setActive={setActive} onLogout={handleLogout}>
      {active === "home" && <Home />}
      {active === "calc" && <Calculator />}
      {active !== "home" && active !== "calc" && <Home />}
    </AppShell>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileCheck2, LineChart, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";
import { consumePostAuthRedirect, sanitizeReturnPath } from "@/lib/authRedirect";

const highlights = [
  {
    icon: FileCheck2,
    title: "Structured analysis",
    description: "See your strongest matches and the skill gaps that matter most.",
  },
  {
    icon: LineChart,
    title: "Track progress",
    description: "Compare resume versions and follow your improvement history.",
  },
  {
    icon: ShieldCheck,
    title: "Private workspace",
    description: "Keep your saved analyses and profile details in one place.",
  },
];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("mode") === "signup");
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loadingState, setLoadingState] = useState<"idle" | "form" | "reset">("idle");
  const { signIn, signUp, requestPasswordReset, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const loading = loadingState !== "idle";

  useEffect(() => {
    setIsSignUp(searchParams.get("mode") === "signup");
    setIsForgot(false);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const fromState = (location.state as { from?: string } | null)?.from;
      const from = searchParams.get("oauth") === "callback"
        ? consumePostAuthRedirect()
        : sanitizeReturnPath(fromState);
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state, searchParams]);

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoadingState("reset");

    const { error } = await requestPasswordReset(email);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a password reset link to your inbox." });
      setIsForgot(false);
    }

    setLoadingState("idle");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoadingState("form");

    if (isSignUp) {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Check your email to confirm your account." });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      }
    }

    setLoadingState("idle");
  };

  const handleToggleAuthMode = () => {
    setIsSignUp((current) => !current);
    setPassword("");
    setDisplayName("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-100/80 via-transparent to-transparent dark:from-sky-950/25" />
        <div className="absolute right-[-120px] top-[-80px] h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20" />
        <div className="absolute left-[-80px] bottom-[-60px] h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-900/20" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => (isForgot ? setIsForgot(false) : navigate("/"))}
            className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {isForgot ? "Back to login" : "Back to home"}
          </button>

          <div className="grid flex-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <section className="hidden lg:block">
              <div className="max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-card px-3 py-1 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-800/60 dark:text-blue-300">
                  <Sparkles className="h-4 w-4" />
                  Smart resume matching workspace
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                  Present your skills with a calm, clear, professional workflow.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground xl:text-lg">
                  Sign in to review match scores, uncover missing requirements, and build a focused path to the roles you want next.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100/70 text-sky-600 dark:bg-sky-950/40">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">What you can do after login</p>
                      <p className="mt-1 text-xl font-semibold text-foreground">Analyze, compare, and improve with confidence</p>
                    </div>
                    <div className="rounded-2xl bg-foreground px-4 py-3 text-right text-background">
                      <p className="text-xs uppercase tracking-[0.2em] text-background/70">Flow</p>
                      <p className="mt-1 text-sm font-medium">Upload to insight</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mx-auto w-full max-w-lg">
              <div className="rounded-[32px] border border-border bg-card p-6 shadow-xl shadow-slate-900/10 sm:p-8">
                <div className="mb-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">Skill Set Go</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    {isForgot ? "Reset your password" : isSignUp ? "Create your account" : "Welcome back"}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {isForgot
                      ? "Enter your email address and we will send you a secure password reset link."
                      : isSignUp
                        ? "Create your workspace to save analyses, compare results, and follow a clear learning path."
                        : "Log in to continue reviewing your resume insights and saved job matches."}
                  </p>
                </div>

                {isForgot ? (
                  <form onSubmit={handleForgotPassword} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-foreground">Email address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        required
                        className="h-12 rounded-2xl border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:border-sky-400 focus-visible:ring-sky-200"
                      />
                    </div>
                    <Button type="submit" variant="signal" className="h-12 w-full rounded-2xl" disabled={loading}>
                      {loading ? "Sending..." : "Send reset link"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsForgot(false)}
                      className="w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Return to sign in
                    </button>
                  </form>
                ) : (
                  <>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      {isSignUp && (
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-foreground">Display name</Label>
                          <Input
                            id="name"
                            value={displayName}
                            onChange={(event) => setDisplayName(event.target.value)}
                            placeholder="Your name"
                            className="h-12 rounded-2xl border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:border-sky-400 focus-visible:ring-sky-200"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="auth-email" className="text-sm font-medium text-foreground">Email address</Label>
                        <Input
                          id="auth-email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@example.com"
                          required
                          className="h-12 rounded-2xl border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:border-sky-400 focus-visible:ring-sky-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <Label htmlFor="password" className="text-sm font-medium text-foreground">Password</Label>
                          {!isSignUp && (
                            <button
                              type="button"
                              onClick={() => setIsForgot(true)}
                              className="text-xs font-medium text-sky-700 transition-colors hover:text-sky-800 dark:text-sky-300"
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <PasswordInput
                          id="password"
                          value={password}
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder="********"
                          required
                          minLength={6}
                          showStrength={isSignUp}
                          className="h-12 rounded-2xl border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:border-sky-400 focus-visible:ring-sky-200"
                        />
                      </div>

                      <Button type="submit" variant="signal" className="h-12 w-full rounded-2xl" disabled={loading}>
                        {loading ? "Please wait..." : isSignUp ? "Create account" : "Log in"}
                      </Button>
                    </form>

                    <div className="mt-6 space-y-5">
                      <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">Email sign-in is active</p>
                            <p className="text-sm leading-6 text-muted-foreground">
                              Use email login and password reset for the most reliable flow in this project.
                            </p>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={handleToggleAuthMode}
                        className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <span className="font-semibold text-sky-700">{isSignUp ? "Log in" : "Sign up"}</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

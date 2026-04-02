import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileCheck2, LineChart, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    setIsSignUp(searchParams.get("mode") === "signup");
    setIsForgot(false);
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: string } | null)?.from || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleForgotPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent a password reset link to your inbox." });
      setIsForgot(false);
    }

    setLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

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

    setLoading(false);
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
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-card px-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">or continue with</span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-12 w-full gap-3 rounded-2xl border-border bg-card text-foreground hover:bg-secondary"
                        onClick={async () => {
                          const { error } = await lovable.auth.signInWithOAuth("google", {
                            redirect_uri: window.location.origin,
                          });
                          if (error) {
                            toast({ title: "Google sign-in failed", description: String(error), variant: "destructive" });
                          }
                        }}
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                      </Button>

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

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/hooks/use-toast";

const recoveryHighlights = [
  {
    icon: ShieldCheck,
    title: "Protected flow",
    description: "Your reset link is checked before any new password is submitted.",
  },
  {
    icon: RefreshCw,
    title: "Fast recovery",
    description: "Complete the update in one step and return to login quickly.",
  },
  {
    icon: Sparkles,
    title: "Same workspace",
    description: "All of your saved progress stays ready once you sign back in.",
  },
];

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now log in with your new password." });
      navigate("/auth");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-sky-100/80 via-transparent to-transparent dark:from-sky-950/25" />
        <div className="absolute right-[-120px] top-[-80px] h-72 w-72 rounded-full bg-blue-200/40 blur-3xl dark:bg-blue-900/20" />
        <div className="absolute left-[-80px] bottom-[-60px] h-72 w-72 rounded-full bg-cyan-100/50 blur-3xl dark:bg-cyan-900/20" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/auth")}
            className="mb-6 inline-flex items-center gap-2 self-start rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </button>

          <div className="grid flex-1 gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <section className="hidden lg:block">
              <div className="max-w-xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-card px-3 py-1 text-sm font-medium text-blue-700 shadow-sm dark:border-blue-800/60 dark:text-blue-300">
                  <LockKeyhole className="h-4 w-4" />
                  Secure account recovery
                </div>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground xl:text-5xl">
                  Reset access quickly and get back to your workspace.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground xl:text-lg">
                  Choose a new password to continue managing analyses, history, and your learning path in one place.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {recoveryHighlights.map((item) => (
                    <div key={item.title} className="rounded-3xl border border-border bg-card p-5 shadow-sm">
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100/70 text-sky-600 dark:bg-sky-950/40">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <h2 className="text-sm font-semibold text-foreground">{item.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="mx-auto w-full max-w-lg">
              <div className="rounded-[32px] border border-border bg-card p-6 shadow-xl shadow-slate-900/10 sm:p-8">
                <div className="mb-8">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-background">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">Account recovery</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Set a new password</h1>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Enter a strong password below. Once updated, you can sign in again with your new credentials.
                  </p>
                </div>

                {!ready ? (
                  <>
                    <div className="rounded-3xl border border-border bg-secondary/40 p-5 text-sm leading-6 text-muted-foreground">
                      Validating your reset link. If this takes too long, request a new reset email and try again.
                    </div>
                    <div className="mt-4">
                      <Button type="button" variant="outline" className="w-full rounded-2xl" onClick={() => navigate("/auth")}>
                        Back to login
                      </Button>
                    </div>
                  </>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-foreground">New password</Label>
                      <PasswordInput
                        id="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="********"
                        required
                        minLength={6}
                        showStrength
                        className="h-12 rounded-2xl border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:border-sky-400 focus-visible:ring-sky-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm" className="text-sm font-medium text-foreground">Confirm password</Label>
                      <PasswordInput
                        id="confirm"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        placeholder="********"
                        required
                        minLength={6}
                        className="h-12 rounded-2xl border-border bg-secondary/40 text-foreground placeholder:text-muted-foreground focus:border-sky-400 focus-visible:ring-sky-200"
                      />
                    </div>
                    <Button type="submit" variant="signal" className="h-12 w-full rounded-2xl" disabled={loading}>
                      {loading ? "Updating..." : "Update password"}
                    </Button>
                  </form>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

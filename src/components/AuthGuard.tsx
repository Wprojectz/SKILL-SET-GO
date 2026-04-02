import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Sparkles, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const FullScreenMessage = ({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <div className="w-full max-w-md rounded-2xl border border-border bg-card/90 p-8 text-center shadow-xl">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  </div>
);

export const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <FullScreenMessage
        icon={Sparkles}
        title="Checking your session"
        description="We are confirming your authentication state before loading the app."
      />
    );
  }

  if (requireAuth && !user) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{ from: `${location.pathname}${location.search}${location.hash}` }}
      />
    );
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AuthRequiredMessage = () => (
  <FullScreenMessage
    icon={ShieldAlert}
    title="Sign in required"
    description="Please sign in to access your saved analyses, profile, and dashboard tools."
    action={
      <Button asChild variant="signal">
        <a href="/auth">Go to Login</a>
      </Button>
    }
  />
);

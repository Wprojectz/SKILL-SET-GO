import type { ReactNode } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const LoadingState = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex h-64 items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="font-body text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

export const ErrorState = ({
  title = "Something went wrong",
  description,
  onRetry,
  action,
}: {
  title?: string;
  description: string;
  onRetry?: () => void;
  action?: ReactNode;
}) => (
  <div className="rounded-2xl border border-destructive/20 bg-card p-8 text-center">
    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
      <AlertTriangle className="h-6 w-6 text-destructive" />
    </div>
    <h3 className="font-heading text-xl font-bold text-foreground">{title}</h3>
    <p className="mx-auto mt-2 max-w-md font-body text-sm leading-relaxed text-muted-foreground">{description}</p>
    <div className="mt-6 flex justify-center gap-3">
      {onRetry && (
        <Button variant="signal" onClick={onRetry}>
          Try Again
        </Button>
      )}
      {action}
    </div>
  </div>
);

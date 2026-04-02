import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<React.ComponentProps<"input">, "type"> {
  showStrength?: boolean;
}

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score, label: "Fair", color: "bg-[hsl(var(--signal-yellow))]" };
  if (score <= 3) return { score, label: "Good", color: "bg-[hsl(var(--accent))]" };
  return { score, label: "Strong", color: "bg-[hsl(var(--accent))]" };
}

const PasswordInput = ({ showStrength = false, className, value, ...props }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const pwd = typeof value === "string" ? value : "";
  const strength = getStrength(pwd);

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={visible ? "text" : "password"}
          className={cn("pr-10", className)}
          value={value}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {showStrength && pwd.length > 0 && (
        <div className="space-y-1">
          <div className="flex gap-1 h-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-full transition-colors",
                  i <= strength.score ? strength.color : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Password strength: <span className="font-medium text-foreground">{strength.label}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;

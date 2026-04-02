import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Settings, Sun, Moon, Shield, Trash2, KeyRound } from "lucide-react";

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handlePasswordUpdate = async () => {
    if (updating) return;

    if (newPassword.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters required.", variant: "destructive" });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please enter the same password in both fields.", variant: "destructive" });
      return;
    }

    setUpdating(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Password updated successfully!" });
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteHistory = async () => {
    if (!user || deleting) return;

    const shouldDelete = window.confirm("Delete all saved analysis history? This action cannot be undone.");
    if (!shouldDelete) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from("analysis_history")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Analysis history deleted" });
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        {/* Appearance */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2 mb-4">
            <Settings className="h-4 w-4 text-primary" /> Appearance
          </h3>
          <div className="flex items-center justify-between rounded-xl bg-secondary/30 border border-border/50 px-5 py-4">
            <div>
              <p className="font-body text-sm font-medium text-foreground">Theme</p>
              <p className="font-body text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2 font-body text-sm text-foreground hover:bg-secondary transition-colors"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-aqua" /> Security
          </h3>
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-foreground flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Change Password
            </Label>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="bg-secondary/50 border-border"
              />
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-secondary/50 border-border"
              />
              <Button variant="signal" onClick={handlePasswordUpdate} disabled={updating}>
                {updating ? "Updating..." : "Update"}
              </Button>
            </div>
            <p className="font-body text-xs text-muted-foreground">
              Use at least 6 characters and confirm the same password before updating.
            </p>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <h3 className="font-heading text-base font-semibold text-foreground flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-muted-red" /> Data Management
          </h3>
          <div className="flex items-center justify-between rounded-xl bg-muted-red/5 border border-muted-red/20 px-5 py-4">
            <div>
              <p className="font-body text-sm font-medium text-foreground">Delete Analysis History</p>
              <p className="font-body text-xs text-muted-foreground">Permanently remove all your past analyses</p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteHistory}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-1" /> {deleting ? "Deleting..." : "Delete All"}
            </Button>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-heading text-base font-semibold text-foreground mb-4">Account</h3>
          <div className="flex items-center justify-between rounded-xl bg-secondary/30 border border-border/50 px-5 py-4">
            <div>
              <p className="font-body text-sm font-medium text-foreground">{user?.email}</p>
              <p className="font-body text-xs text-muted-foreground">Signed in account</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void handleSignOut();
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { ErrorState, LoadingState } from "@/components/PageState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Calendar, Save, FileSearch, Target, TrendingUp } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, avgMatch: 0, avgAts: 0 });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    const [profileResponse, statsResponse] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url").eq("user_id", user.id).maybeSingle(),
      supabase.from("analysis_history").select("match_percentage, ats_score").eq("user_id", user.id),
    ]);

    if (profileResponse.error) {
      setError(profileResponse.error.message);
      setLoading(false);
      return;
    }

    if (statsResponse.error) {
      setError(statsResponse.error.message);
      setLoading(false);
      return;
    }

    setDisplayName(profileResponse.data?.display_name || "");
    setAvatarUrl(profileResponse.data?.avatar_url || "");

    if (statsResponse.data && statsResponse.data.length > 0) {
      setStats({
        total: statsResponse.data.length,
        avgMatch: Math.round(statsResponse.data.reduce((sum, item) => sum + item.match_percentage, 0) / statsResponse.data.length),
        avgAts: Math.round(statsResponse.data.reduce((sum, item) => sum + item.ats_score, 0) / statsResponse.data.length),
      });
    } else {
      setStats({ total: 0, avgMatch: 0, avgAts: 0 });
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const payload = {
      user_id: user.id,
      display_name: displayName.trim() || user.email?.split("@")[0] || null,
      avatar_url: avatarUrl.trim() || null,
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
      setDisplayName(payload.display_name || "");
      setAvatarUrl(payload.avatar_url || "");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingState message="Loading your profile..." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState
          title="Could not load your profile"
          description={error}
          onRetry={() => {
            void loadProfile();
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent font-heading text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
              {displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground">{displayName || "Set your name"}</h2>
              <p className="flex items-center gap-1.5 font-body text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {user?.email}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 font-body text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Joined {new Date(user?.created_at || "").toLocaleDateString(undefined, { month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: FileSearch, label: "Analyses", value: stats.total, color: "text-primary", border: "border-primary/20", background: "bg-primary/5" },
            { icon: Target, label: "Avg Match", value: `${stats.avgMatch}%`, color: "text-aqua", border: "border-aqua/20", background: "bg-aqua/5" },
            { icon: TrendingUp, label: "Avg ATS", value: `${stats.avgAts}/100`, color: "text-accent", border: "border-accent/20", background: "bg-accent/5" },
          ].map((stat) => (
            <div key={stat.label} className={`flex items-center gap-3 rounded-xl border ${stat.border} ${stat.background} p-4`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <div>
                <p className="font-body text-xs text-muted-foreground">{stat.label}</p>
                <p className="font-heading text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-5 rounded-2xl border border-border bg-card p-6">
          <h3 className="flex items-center gap-2 font-heading text-base font-semibold text-foreground">
            <User className="h-4 w-4 text-primary" /> Edit Profile
          </h3>
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-foreground">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              className="border-border bg-secondary/50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl" className="text-foreground">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(event) => setAvatarUrl(event.target.value)}
              placeholder="https://example.com/avatar.png"
              className="border-border bg-secondary/50"
            />
          </div>
          <Button variant="signal" onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;

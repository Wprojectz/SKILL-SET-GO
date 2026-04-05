import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ProfileSummary = {
  displayName: string;
  avatarUrl: string;
};

const getFallbackName = (email?: string | null) => email?.split("@")[0] || "User";

export function useProfileSummary() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileSummary>({
    displayName: getFallbackName(user?.email),
    avatarUrl: "",
  });

  const loadProfileSummary = useCallback(async () => {
    if (!user) {
      setProfile({ displayName: "User", avatarUrl: "" });
      return;
    }

    const fallbackName = getFallbackName(user.email);
    const { data, error } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      setProfile({ displayName: fallbackName, avatarUrl: "" });
      return;
    }

    setProfile({
      displayName: data?.display_name || fallbackName,
      avatarUrl: data?.avatar_url || "",
    });
  }, [user]);

  useEffect(() => {
    void loadProfileSummary();
  }, [loadProfileSummary]);

  return profile;
}

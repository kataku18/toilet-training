import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { storage } from "@/lib/storage";
import type { UserProfile, Gender, EquippedItems } from "@/types";

const DEFAULT_PROFILE: UserProfile = {
  nickname: "",
  gender: "unset",
  ageMonths: 24,
  avatarId: "avatar_bear",
  equippedItems: { hat: null, outfit: null, accessory: null },
  isTimelineEnabled: false,
  isOnboardingComplete: false,
  createdAt: new Date().toISOString(),
};

interface ProfileContextValue {
  profile: UserProfile;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateEquippedItems: (items: Partial<EquippedItems>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  resetProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const saved = await storage.load<UserProfile>(storage.keys.PROFILE);
      if (saved) {
        setProfile(saved);
      }
    } catch (error) {
      console.error("[Profile] Failed to load:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      storage.save(storage.keys.PROFILE, next);
      return next;
    });
  }, []);

  const updateEquippedItems = useCallback(async (items: Partial<EquippedItems>) => {
    setProfile((prev) => {
      const next = {
        ...prev,
        equippedItems: { ...prev.equippedItems, ...items },
      };
      storage.save(storage.keys.PROFILE, next);
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    setProfile((prev) => {
      const next = { ...prev, isOnboardingComplete: true };
      storage.save(storage.keys.PROFILE, next);
      return next;
    });
  }, []);

  const resetProfile = useCallback(async () => {
    const fresh = { ...DEFAULT_PROFILE, createdAt: new Date().toISOString() };
    setProfile(fresh);
    await storage.save(storage.keys.PROFILE, fresh);
  }, []);

  return (
    <ProfileContext.Provider
      value={{
        profile,
        isLoading,
        updateProfile,
        updateEquippedItems,
        completeOnboarding,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return ctx;
}

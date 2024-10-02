import { useState } from "react";
import {
  UserProfile,
  createUserProfile,
  updateUserProfile,
} from "@/app/lib/definition/user_profile_definition";

export type UserProfileManager = {
  currentProfile: UserProfile | null;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setCurrentProfile: (profile: UserProfile) => void;
  resetProfile: () => void;
  updateField: <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => void;
};

export const createUserProfileManager = (): UserProfileManager => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (currentProfile) {
      const updatedProfile = updateUserProfile(currentProfile, updates);
      setCurrentProfile(updatedProfile);
    }
  };

  const resetProfile = () => {
    setCurrentProfile(null);
  };

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    if (currentProfile) {
      const updatedProfile = {
        ...currentProfile,
        [field]: value,
      };
      setCurrentProfile(updatedProfile);
    }
  };

  return {
    currentProfile,
    updateProfile,
    setCurrentProfile,
    resetProfile,
    updateField,
  };
};

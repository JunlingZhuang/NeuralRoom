import { useState } from "react";
import {
  UserProfile,
  createUserProfile,
  updateUserProfile,
} from "@/app/lib/definition/user_profile_definition";

export type UserProfileManager = {
  currentProfile: UserProfile;
  createDefaultProfile: () => void;
  updateWholeCurrentProfile: (updates: Partial<UserProfile>) => void;
  setCurrentProfile: (profile: UserProfile) => void;
  resetProfile: () => void;
  updateCurrentUserProfileField: <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K]
  ) => void;
};

export const createUserProfileManager = (): UserProfileManager => {
  const defaultProfile = createUserProfile("", null, null, null, "", "", "");

  const [currentProfile, setCurrentProfile] =
    useState<UserProfile>(defaultProfile);

  const createDefaultProfile = () => {
    const defaultProfile = createUserProfile("", null, null, null, "", "", "");
    console.log("Create Default Profile", defaultProfile);
    setCurrentProfile(defaultProfile);
  };

  const updateWholeCurrentProfile = (updates: Partial<UserProfile>) => {
    const updatedProfile = updateUserProfile(currentProfile, updates);
    setCurrentProfile(updatedProfile);
  };

  const resetProfile = () => {
    setCurrentProfile(defaultProfile);
  };

  const updateCurrentUserProfileField = <K extends keyof UserProfile>(
    field: K,
    value: UserProfile[K]
  ) => {
    const updatedProfile = {
      ...currentProfile,
      [field]: value,
    };
    console.log(`Update Current User Profile Field: ${field}: ${value}`);
    setCurrentProfile(updatedProfile);
  };

  return {
    currentProfile,
    createDefaultProfile,
    updateWholeCurrentProfile,
    setCurrentProfile,
    resetProfile,
    updateCurrentUserProfileField,
  };
};

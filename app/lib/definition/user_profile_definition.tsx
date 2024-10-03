export type UserProfile = {
  userPersona: string;
  bedroomNum: number | null;
  bathroomNum: number | null;
  livingRoomNum: number | null;
  primaryPrompt: string;
  famliyInfoPrompt: string;
  socialInfoPrompt: string;
};

export const createUserProfile = (
  userPersona: string,
  bedroomNum: number | null,
  bathroomNum: number | null,
  livingRoomNum: number | null,
  primaryPrompt: string,
  famliyInfoPrompt: string,
  socialInfoPrompt: string
): UserProfile => {
  return {
    userPersona,
    bedroomNum,
    bathroomNum,
    livingRoomNum,
    primaryPrompt,
    famliyInfoPrompt,
    socialInfoPrompt,
  };
};

// update user profile
export const updateUserProfile = (
  userProfile: UserProfile,
  updates: Partial<UserProfile>
): UserProfile => {
  return {
    ...userProfile,
    ...updates,
  };
};

// define user profile props
export type UserProfileDefinitionProps = {
  userProfile: UserProfile;
};

export type UserProfilePersonaOptionProps = {
  key: string;
  label: string;
};

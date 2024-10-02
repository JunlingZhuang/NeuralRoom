export type UserProfile = {
  userPersona: string;
  bedroomNum: number;
  bathroomNum: number;
  livingRoomNum: number;
  primaryPrompt: string;
  famliyInfoPrompt: string;
  socialInfoPrompt: string;
  printProfile: () => void;
};

export const createUserProfile = (
  userPersona: string,
  bedroomNum: number,
  bathroomNum: number,
  livingRoomNum: number,
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
    printProfile: function () {
      console.log("User Profile:");
      console.log(`Persona: ${this.userPersona}`);
      console.log(`Bedrooms: ${this.bedroomNum}`);
      console.log(`Bathrooms: ${this.bathroomNum}`);
      console.log(`Living Rooms: ${this.livingRoomNum}`);
    },
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
    printProfile: function () {
      console.log("User Profi+   le:");
      console.log(`Persona: ${this.userPersona}`);
      console.log(`Bedrooms: ${this.bedroomNum}`);
      console.log(`Bathrooms: ${this.bathroomNum}`);
      console.log(`Living Rooms: ${this.livingRoomNum}`);
    },
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

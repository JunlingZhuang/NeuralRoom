export type UserProfile = {
  userPersona: string;
  bedroomNum: number;
  bathroomNum: number;
  livingRoomNum: number;
  description1: string;
  description2: string;
  description3: string;
  printProfile: () => void;
};

// 初始化函数
export const createUserProfile = (
  userPersona: string,
  bedroomNum: number,
  bathroomNum: number,
  livingRoomNum: number,
  description1: string,
  description2: string,
  description3: string
): UserProfile => {
  return {
    userPersona,
    bedroomNum,
    bathroomNum,
    livingRoomNum,
    description1,
    description2,
    description3,
    printProfile: function () {
      console.log("User Profile:");
      console.log(`Persona: ${this.userPersona}`);
      console.log(`Bedrooms: ${this.bedroomNum}`);
      console.log(`Bathrooms: ${this.bathroomNum}`);
      console.log(`Living Rooms: ${this.livingRoomNum}`);
      console.log(`Description 1: ${this.description1}`);
      console.log(`Description 2: ${this.description2}`);
      console.log(`Description 3: ${this.description3}`);
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
      console.log(`Description 1: ${this.description1}`);
      console.log(`Description 2: ${this.description2}`);
      console.log(`Description 3: ${this.description3}`);
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
}


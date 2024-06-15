// types/userProfile.ts
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

// 更新函数
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

// 定义组件属性类型
export type UserProfileDefinitionProps = {
  userProfile: UserProfile;
};

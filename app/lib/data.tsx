import { UserProfilePersonaOptionProps } from "@/app/lib/definition/user_profile_definition";

//store fetech data function

//1.fetch node data

//2.fetch edge data

//3.send the data to backend and get

//

// export const fetchUserProfilePersonaOptions = async () => {
//   const response = await fetch("initial_data/user-persona-options.json");
//   if (!response.ok) {
//     throw new Error("Network response for UserProfilePersona list was not ok");
//   }
//   return await response.json();
// };

export async function fetchUserProfilePersonaOptions(): Promise<
  UserProfilePersonaOptionProps[]
> {
  const response = await fetch("initial_data/user-persona-options.json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
}

// data.tsx
export const generate3DModel = async (boxSize: {
  length: number;
  width: number;
  height: number;
}) => {
  try {
    return "test.fbx";
  } catch (error) {
    console.error("Error generating 3D model:", error);
    throw error;
  }
};

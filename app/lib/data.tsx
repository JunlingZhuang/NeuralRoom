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

export async function getColorAndProgramNameDict() {
  const response = await fetch("dict/program_dict.json");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const programColorAndNameDict = await response.json();
  return programColorAndNameDict;
}

export async function fetchSampleNodehData() {
  const nodeResponse = await fetch("initial_data/node.json");
  if (!nodeResponse.ok) {
    throw new Error("Network response was not ok");
  }
  return await nodeResponse.json();
}

export async function fetchSampleEdgeData() {
  const edgeResponse = await fetch("initial_data/edge.json");
  if (!edgeResponse.ok) {
    throw new Error("Network response was not ok");
  }
  return await edgeResponse.json();
}

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

export const generate3DModel_Backend = async (
  formalizedGraph: any,
  boxSize: {
    length: number;
    width: number;
    height: number;
  }
) => {
  try {
    const { nodesData, edgesData } = formalizedGraph;
    // create the request body
    const requestBody = {
      nodes: nodesData,
      edges: edgesData,
      length: boxSize.length,
      height: boxSize.height,
      width: boxSize.width,
    };

    const response = await fetch("api/generate_backend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // change the request body to a JSON string
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Successfully get model from backend, the model is", data);
    return data.model_data;
  } catch (error) {
    console.error("Error generating 3D model:", error);
    throw error;
  }
};

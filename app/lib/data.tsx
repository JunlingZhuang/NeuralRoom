import { UserProfile,UserProfilePersonaOptionProps } from "@/app/lib/definition/user_profile_definition";


export async function fetchSamplePrompts() {
  const response = await fetch("initial_data/samplePrompts.json");
  if (!response.ok) {
    throw new Error("Network fetchSamplePrompts response was not ok");
  }
  const samplePrompts = await response.json();
  return samplePrompts;
}

export async function getColorAndProgramNameDict() {
  const response = await fetch("dict/program_dict.json");
  if (!response.ok) {
    throw new Error("Network getColorAndProgramNameDict response was not ok");
  }
  const programColorAndNameDict = await response.json();
  return programColorAndNameDict;
}

export async function fetchSampleNodehData() {
  const nodeResponse = await fetch("initial_data/node.json");
  if (!nodeResponse.ok) {
    throw new Error("Network fetchSampleNodehData response was not ok");
  }
  return await nodeResponse.json();
}

export async function fetchSampleEdgeData() {
  const edgeResponse = await fetch("initial_data/edge.json");
  if (!edgeResponse.ok) {
    throw new Error("Network fetchSampleEdgeData response was not ok");
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
    console.log(
      "Successfully get model from backend, the model is",
      data.model_data
    );
    return data.model_data;
  } catch (error) {
    console.error("Error generating 3D model:", error);
    throw error;
  }
};

export const generateGraph_Backend = async (primaryPrompt: string) => {
  try {
    const response = await fetch("/api/text2graph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: primaryPrompt }), // Sending the textarea value as JSON
    });

    if (response.ok) {
      const generatedGraphdata = await response.json();
      console.log("Backend graph:", generatedGraphdata);
      // Use fetchLLMGraphData to process the received data and update the graph
      return generatedGraphdata;
    } else {
      console.error("Failed to send data to the backend.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};


// change input
export const generateProfileGraph_Backend = async (userProfile: UserProfile) => {
  try {
    const response = await fetch("/api/profile2graph", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userProfile), // Sending the textarea value as JSON
    });

    if (response.ok) {
      const generatedGraphdata = await response.json();
      console.log("Backend graph:", generatedGraphdata);
      // Use fetchLLMGraphData to process the received data and update the graph
      return generatedGraphdata;
    } else {
      console.error("Failed to send data to the backend.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
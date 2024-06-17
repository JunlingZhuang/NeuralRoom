import { ModelManager } from "@/app/lib/class/modelManager";
import { GraphManager } from "@/app/lib/class/graphManager";

// type GenerationContextProps = {
//   modelManager: ModelManager;
//   graphManager: GraphManager;
// };
export type GenerationManager = {
  modelManager: ModelManager;
  graphManager: GraphManager;
};

export const createGenerationManager = (
  modelManager: ModelManager,
  graphManager: GraphManager
): GenerationManager => {
  return {
    modelManager,
    graphManager,
  };
};

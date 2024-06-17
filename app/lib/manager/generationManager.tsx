import { ModelManager } from "@/app/lib/manager/modelManager";
import { GraphManager } from "@/app/lib/manager/graphManager";

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

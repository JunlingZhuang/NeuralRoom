// import { ModelManager } from "@/app/lib/manager/modelManager";
// import { GraphManager } from "@/app/lib/manager/graphManager";
// import { fetchSamplePrompts } from "@/app/lib/data";
// // type GenerationContextProps = {
// //   modelManager: ModelManager;
// //   graphManager: GraphManager;
// // };

// export type GenerationManager = {
//   modelManager: ModelManager;
//   graphManager: GraphManager;
//   getSamplePrompts: () => void;
// };

// export const createGenerationManager = (
//   modelManager: ModelManager,
//   graphManager: GraphManager
// ): GenerationManager => {
//   const getSamplePrompts = async () => {
//     const samplePrompts = await fetchSamplePrompts();
//     return samplePrompts;
//   };
//   return {
//     getSamplePrompts,
//     modelManager,
//     graphManager,
//   };
// };

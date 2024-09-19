"use client";

import React, { createContext, useContext, ReactNode, useState } from "react";
import {
  ModelManager,
  createModelManager,
} from "@/app/lib/manager/modelManager";
import {
  GraphManager,
  createGraphManager,
} from "@/app/lib/manager/graphManager";
import { fetchSamplePrompts } from "@/app/lib/data";

type GenerationManager = {
  modelManager: ModelManager;
  graphManager: GraphManager;
  getSamplePrompts: () => Promise<string[]>;
};

const getSamplePrompts = async () => {
  try {
    const prompts = await fetchSamplePrompts();
    const promptList = prompts.map((prompt: { prompt: string }) => prompt.prompt);
    return promptList;
  } catch (error) {
    console.error("Error fetching sample prompts:", error);
    return [];
  }
};

const GenerationManagerContext = createContext<GenerationManager | undefined>(
  undefined
);

export const GenerationManagerProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const initialBoundingBoxSize = { length: 10, width: 5, height: 3 };
  const initialFloorNum = 1;
  const initialBottomCenterPoint = { x: 0, y: 0, z: 0 };
  const initialModel = null;

  const modelManager = createModelManager(
    initialModel,
    initialBoundingBoxSize,
    initialFloorNum,
    initialBottomCenterPoint
  );

  const graphManager = createGraphManager();

  const generationManager = { modelManager, graphManager, getSamplePrompts };

  return (
    <GenerationManagerContext.Provider value={generationManager}>
      {children}
    </GenerationManagerContext.Provider>
  );
};

export const useGenerationManager = (): GenerationManager => {
  const context = useContext(GenerationManagerContext);
  if (context === undefined) {
    throw new Error(
      "useGenerationManager must be used within a GenerationManagerProvider"
    );
  }
  return context;
};
